"""
Smart Waste Segregation and Recycling System Backend - Ultra Simple Version
SIH 2025 - Problem Statement ID: 25046

This version uses only built-in Python libraries to avoid installation issues.
No external dependencies except FastAPI basics.

Author: Backend Developer
Framework: FastAPI with minimal dependencies
Database: In-memory dictionary + simple CSV reading
Security: Basic authentication, input validation
"""

import os
import logging
import time
import csv
import random
import hashlib
import hmac
import base64
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List, Union
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# ==================== CONFIGURATION ====================

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# API Configuration
API_TITLE = "Smart Waste Management System API"
API_DESCRIPTION = "Backend API for IoT-based waste segregation and recycling system - Ultra Simple Version"
API_VERSION = "2.0.0"

# Rate limiting configuration
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 3600  # 1 hour

# Data file configuration
HISTORICAL_DATA_FILE = "daily_waste_data.csv"

# ==================== LOGGING SETUP ====================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== SIMPLE CSV READER ====================

def read_csv_simple(filename: str) -> List[Dict]:
    """Simple CSV reader using built-in csv module."""
    data = []
    try:
        with open(filename, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                data.append({
                    'date': row['date'],
                    'total_organic_kg': float(row['total_organic_kg']),
                    'total_recyclable_kg': float(row['total_recyclable_kg']),
                    'total_hazardous_kg': float(row['total_hazardous_kg'])
                })
        logger.info(f"Successfully read {len(data)} rows from {filename}")
        return data
    except FileNotFoundError:
        logger.warning(f"File {filename} not found")
        return []
    except Exception as e:
        logger.error(f"Error reading CSV: {e}")
        return []

# ==================== SIMPLIFIED JWT HANDLING ====================

class SimpleJWT:
    """Ultra simple JWT implementation using only built-in libraries."""
    
    @staticmethod
    def encode(payload: dict, secret: str) -> str:
        """Create a simple JWT token using HMAC."""
        try:
            header = {"alg": "HS256", "typ": "JWT"}
            
            # Encode header and payload
            header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
            payload_encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
            
            # Create signature
            message = f"{header_encoded}.{payload_encoded}"
            signature = hmac.new(
                secret.encode(),
                message.encode(),
                hashlib.sha256
            ).digest()
            signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')
            
            return f"{message}.{signature_encoded}"
        except Exception as e:
            logger.error(f"JWT encoding error: {e}")
            return ""
    
    @staticmethod
    def decode(token: str, secret: str) -> dict:
        """Decode and verify a simple JWT token."""
        try:
            parts = token.split('.')
            if len(parts) != 3:
                raise ValueError("Invalid token format")
            
            header_encoded, payload_encoded, signature_encoded = parts
            
            # Verify signature
            message = f"{header_encoded}.{payload_encoded}"
            expected_signature = hmac.new(
                secret.encode(),
                message.encode(),
                hashlib.sha256
            ).digest()
            expected_signature_encoded = base64.urlsafe_b64encode(expected_signature).decode().rstrip('=')
            
            if not hmac.compare_digest(signature_encoded, expected_signature_encoded):
                raise ValueError("Invalid signature")
            
            # Decode payload
            payload_json = base64.urlsafe_b64decode(payload_encoded + '==').decode()
            payload = json.loads(payload_json)
            
            # Check expiration
            if 'exp' in payload and payload['exp'] < time.time():
                raise ValueError("Token has expired")
            
            return payload
            
        except Exception as e:
            raise ValueError(f"Token validation failed: {e}")

# ==================== DATA MODELS ====================

class WasteBinData(BaseModel):
    """Pydantic model for validating IoT device data from waste bins."""
    bin_id: str = Field(..., min_length=3, max_length=50)
    organic_level: float = Field(..., ge=0.0, le=100.0)
    recyclable_level: float = Field(..., ge=0.0, le=100.0)
    hazardous_level: float = Field(..., ge=0.0, le=100.0)

    class Config:
        schema_extra = {
            "example": {
                "bin_id": "BIN-001-ALPHA",
                "organic_level": 75.5,
                "recyclable_level": 45.2,
                "hazardous_level": 12.8
            }
        }

class BinStatus(BaseModel):
    """Response model for bin status queries."""
    bin_id: str
    organic_level: float
    recyclable_level: float
    hazardous_level: float
    last_updated: datetime
    status: str
    alerts: List[str] = []

class APIResponse(BaseModel):
    """Standard API response model."""
    success: bool
    message: str
    data: Optional[Dict] = None
    timestamp: datetime

# ==================== SECURITY CLASSES ====================

class SecurityBearer(HTTPBearer):
    """Simple JWT token validation."""
    
    def __init__(self, auto_error: bool = True):
        super(SecurityBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: Optional[HTTPAuthorizationCredentials] = await super(SecurityBearer, self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme. Bearer token required."
                )
            
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid token or expired token."
                )
            return credentials.credentials
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code."
            )

    def verify_jwt(self, token: str) -> bool:
        """Verify JWT token validity."""
        try:
            payload = SimpleJWT.decode(token, SECRET_KEY)
            return payload.get("sub") is not None
        except Exception as e:
            logger.warning(f"Token verification failed: {e}")
            return False

# ==================== RATE LIMITING ====================

class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, identifier: str, limit: int = RATE_LIMIT_REQUESTS, window: int = RATE_LIMIT_WINDOW) -> bool:
        """Check if request is within rate limit."""
        now = time.time()
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Clean old requests outside the window
        self.requests[identifier] = [req_time for req_time in self.requests[identifier] if now - req_time < window]
        
        # Check if under limit
        if len(self.requests[identifier]) < limit:
            self.requests[identifier].append(now)
            return True
        
        return False

# ==================== DATABASE (MOCK) ====================

class WasteDatabase:
    """Mock database implementation using in-memory dictionary."""
    
    def __init__(self):
        self.bins: Dict[str, Dict] = {}
        logger.info("Initialized mock waste management database")
    
    def store_bin_data(self, data: WasteBinData) -> bool:
        """Store bin data with timestamp and status calculation."""
        try:
            timestamp = datetime.now()
            status = self._calculate_bin_status(data)
            alerts = self._generate_alerts(data)
            
            self.bins[data.bin_id] = {
                "bin_id": data.bin_id,
                "organic_level": data.organic_level,
                "recyclable_level": data.recyclable_level,
                "hazardous_level": data.hazardous_level,
                "last_updated": timestamp,
                "status": status,
                "alerts": alerts
            }
            
            logger.info(f"Stored data for bin {data.bin_id} with status: {status}")
            return True
        
        except Exception as e:
            logger.error(f"Error storing bin data: {e}")
            return False
    
    def get_bin_status(self, bin_id: str) -> Optional[Dict]:
        """Retrieve current status for a specific bin."""
        return self.bins.get(bin_id)
    
    def get_all_bins(self) -> Dict[str, Dict]:
        """Retrieve all bin data."""
        return self.bins
    
    def _calculate_bin_status(self, data: WasteBinData) -> str:
        """Calculate overall bin status based on fill levels."""
        max_level = max(data.organic_level, data.recyclable_level, data.hazardous_level)
        
        if max_level >= 90:
            return "CRITICAL"
        elif max_level >= 80:
            return "HIGH"
        elif max_level >= 60:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_alerts(self, data: WasteBinData) -> List[str]:
        """Generate alerts based on fill levels."""
        alerts = []
        
        if data.organic_level >= 80:
            alerts.append(f"Organic waste level critical: {data.organic_level}%")
        if data.recyclable_level >= 80:
            alerts.append(f"Recyclable waste level critical: {data.recyclable_level}%")
        if data.hazardous_level >= 80:
            alerts.append(f"Hazardous waste level critical: {data.hazardous_level}%")
            
        return alerts

# ==================== HISTORICAL DATA MANAGER ====================

class HistoricalDataManager:
    """Manages historical waste collection data from CSV files."""
    
    def __init__(self, csv_file_path: str = HISTORICAL_DATA_FILE):
        self.csv_file_path = csv_file_path
        logger.info(f"Initialized historical data manager: {csv_file_path}")
    
    def read_historical_data(self) -> List[Dict]:
        """Read historical data from CSV file (September 1-12, 2025)."""
        return read_csv_simple(self.csv_file_path)
    
    def generate_current_day_data(self) -> Dict:
        """Generate realistic current-day waste data for September 13th, 2025."""
        current_data = {
            "date": "2025-09-13",
            "total_organic_kg": round(random.uniform(85.0, 155.0), 1),
            "total_recyclable_kg": round(random.uniform(55.0, 105.0), 1),
            "total_hazardous_kg": round(random.uniform(18.0, 35.0), 1)
        }
        logger.info(f"Generated dynamic data for September 13th, 2025")
        return current_data
    
    def get_dashboard_data(self) -> List[Dict]:
        """Get combined September data."""
        try:
            # Read historical data (September 1-12)
            historical_data = self.read_historical_data()
            
            # Generate dynamic current day data (September 13th)
            current_day_data = self.generate_current_day_data()
            
            # Combine historical and current data
            combined_data = historical_data + [current_day_data]
            
            logger.info(f"Prepared September dashboard data with {len(combined_data)} total data points")
            return combined_data
            
        except Exception as e:
            logger.error(f"Error preparing dashboard data: {e}")
            return []

# ==================== NOTIFICATION SYSTEM ====================

class NotificationManager:
    """Handles notifications to municipal servers when bins are full."""
    
    @staticmethod
    def check_and_notify(data: WasteBinData) -> List[str]:
        """Check fill levels and send notifications if thresholds exceeded."""
        notifications = []
        threshold = 80.0
        
        if data.organic_level > threshold:
            message = f"🚨 ALERT: Bin {data.bin_id} - Organic waste level is {data.organic_level}% (exceeds {threshold}%)"
            print(message)
            logger.warning(message)
            notifications.append(message)
        
        if data.recyclable_level > threshold:
            message = f"🚨 ALERT: Bin {data.bin_id} - Recyclable waste level is {data.recyclable_level}% (exceeds {threshold}%)"
            print(message)
            logger.warning(message)
            notifications.append(message)
        
        if data.hazardous_level > threshold:
            message = f"🚨 CRITICAL ALERT: Bin {data.bin_id} - Hazardous waste level is {data.hazardous_level}% (exceeds {threshold}%)"
            print(message)
            logger.critical(message)
            notifications.append(message)
        
        return notifications

# ==================== GLOBAL INSTANCES ====================

# Initialize core components
database = WasteDatabase()
historical_data_manager = HistoricalDataManager()
rate_limiter = RateLimiter()
security = SecurityBearer()
notification_manager = NotificationManager()

# ==================== APPLICATION LIFESPAN ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Startup
    logger.info("🚀 Smart Waste Management System API starting up...")
    logger.info(f"API Documentation available at: http://127.0.0.1:8000/docs")
    logger.info(f"Alternative docs available at: http://127.0.0.1:8000/redoc")
    logger.info("📅 Data scope: September 2025 (Sept 1-12 historical + Sept 13 dynamic)")
    
    # Check if historical data file exists
    if os.path.exists(HISTORICAL_DATA_FILE):
        logger.info(f"✅ September historical data file found: {HISTORICAL_DATA_FILE}")
    else:
        logger.warning(f"⚠️ Historical data file not found: {HISTORICAL_DATA_FILE}")
    
    yield
    
    # Shutdown
    logger.info("📴 Smart Waste Management System API shutting down...")

# ==================== FASTAPI APPLICATION ====================

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "IoT Data",
            "description": "Endpoints for IoT device data collection and processing"
        },
        {
            "name": "Bin Status",
            "description": "Endpoints for retrieving bin status and monitoring"
        },
        {
            "name": "Dashboard",
            "description": "Endpoints for September 2025 dashboard data and analytics"
        },
        {
            "name": "System",
            "description": "System health and information endpoints"
        }
    ]
)

# ==================== MIDDLEWARE CONFIGURATION ====================

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",  # Vite dev server
        "http://localhost:5173",  # Alternative
        "http://127.0.0.1:5500",  # Live Server (if using)
        "http://localhost:5500"   # Alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def logging_and_rate_limit_middleware(request: Request, call_next):
    """Log all requests for monitoring and debugging."""
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"

    # Rate limiting check
    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        response = JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
        process_time = time.time() - start_time
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s (Rate Limited)")
        return response

    # Process request
    response = await call_next(request)

    # Log after request is processed
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")

    return response

# Add the combined middleware
app.middleware("http")(logging_and_rate_limit_middleware)


# ==================== API ENDPOINTS ====================

@app.get("/api/bins", tags=["Bin Status"])
async def get_bins():
    """Get all bins data."""
    return [
        {
            "id": "BIN-BBSR-001",
            "location": "Master Canteen Square",
            "lat": 20.27,
            "lon": 85.84,
            "fill": 78,
            "type": "Recyclable",
            "updated": "09:05",
        },
        {
            "id": "BIN-BBSR-002",
            "location": "Saheed Nagar Market",
            "lat": 20.2962,
            "lon": 85.849,
            "fill": 83,
            "type": "Organic",
            "updated": "09:12",
        },
        {
            "id": "BIN-BBSR-003",
            "location": "Rasulgarh Square",
            "lat": 20.3005,
            "lon": 85.8535,
            "fill": 65,
            "type": "Recyclable",
            "updated": "09:07",
        },
        {
            "id": "BIN-BBSR-004",
            "location": "Jaydev Vihar",
            "lat": 20.3058,
            "lon": 85.82,
            "fill": 72,
            "type": "Recyclable",
            "updated": "09:02",
        },
        {
            "id": "BIN-BBSR-005",
            "location": "Kharvel Nagar",
            "lat": 20.2735,
            "lon": 85.842,
            "fill": 58,
            "type": "Organic",
            "updated": "08:59",
        },
        {
            "id": "BIN-BBSR-006",
            "location": "Chandrasekharpur - Infocity",
            "lat": 20.317,
            "lon": 85.8235,
            "fill": 91,
            "type": "Hazardous",
            "updated": "09:10",
        },
        {
            "id": "BIN-BBSR-007",
            "location": "Patia Big Bazaar",
            "lat": 20.3187,
            "lon": 85.8269,
            "fill": 68,
            "type": "Recyclable",
            "updated": "09:11",
        },
        {
            "id": "BIN-BBSR-008",
            "location": "Khandagiri Square",
            "lat": 20.2625,
            "lon": 85.7805,
            "fill": 86,
            "type": "Organic",
            "updated": "09:14",
        },
        {
            "id": "BIN-BBSR-009",
            "location": "Ekamra Kanan Gate",
            "lat": 20.2968,
            "lon": 85.8197,
            "fill": 41,
            "type": "Organic",
            "updated": "08:49",
        },
        {
            "id": "BIN-BBSR-010",
            "location": "Unit 1 Market",
            "lat": 20.2665,
            "lon": 85.8393,
            "fill": 74,
            "type": "Recyclable",
            "updated": "09:03",
        },
        {
            "id": "BIN-BBSR-011",
            "location": "Old Town — Lingaraj",
            "lat": 20.2414,
            "lon": 85.8399,
            "fill": 67,
            "type": "Organic",
            "updated": "09:08",
        },
        {
            "id": "BIN-BBSR-012",
            "location": "Railway Station (Platform Road)",
            "lat": 20.269,
            "lon": 85.8445,
            "fill": 92,
            "type": "Hazardous",
            "updated": "09:15",
        },
    ]

@app.get("/api/drivers", tags=["Bin Status"])
async def get_drivers():
    """Get all drivers data."""
    return [
        {
            "id": "DRV-BBSR-01",
            "name": "Prakash Mohanty",
            "phone": "+91 94370 10001",
            "lat": 20.28,
            "lon": 85.84,
            "status": "Available",
        },
        {
            "id": "DRV-BBSR-02",
            "name": "Ananya Sahu",
            "phone": "+91 98530 10002",
            "lat": 20.3,
            "lon": 85.83,
            "status": "Available",
        },
        {
            "id": "DRV-BBSR-03",
            "name": "Bikash Swain",
            "phone": "+91 99370 10003",
            "lat": 20.32,
            "lon": 85.82,
            "status": "On Trip",
        },
        {
            "id": "DRV-BBSR-04",
            "name": "Sabita Das",
            "phone": "+91 98610 10004",
            "lat": 20.26,
            "lon": 85.79,
            "status": "Available",
        },
        {
            "id": "DRV-BBSR-05",
            "name": "Amit Patra",
            "phone": "+91 93480 10005",
            "lat": 20.31,
            "lon": 85.84,
            "status": "Available",
        },
    ]

@app.get("/api/stations", tags=["Bin Status"])
async def get_stations():
    """Get all stations data."""
    return {
        "Recyclable": [
            {
                "id": "REC-BBSR-1",
                "name": "BMC MRF — Chandrasekharpur",
                "lat": 20.3178,
                "lon": 85.825,
                "capacityKg": 12000,
            },
            {
                "id": "REC-BBSR-2",
                "name": "Khurda MRF — Industrial Area",
                "lat": 20.154,
                "lon": 85.666,
                "capacityKg": 20000,
            },
        ],
        "Organic": [
            {
                "id": "ORG-BBSR-1",
                "name": "BMC Compost Yard — Palasuni",
                "lat": 20.2995,
                "lon": 85.8695,
                "capacityKg": 10000,
            },
            {
                "id": "ORG-BBSR-2",
                "name": "Community Compost — Unit 6",
                "lat": 20.2652,
                "lon": 85.8258,
                "capacityKg": 6000,
            },
        ],
        "Hazardous": [
            {
                "id": "HAZ-BBSR-1",
                "name": "Authorized Hazardous Facility — Khurda",
                "lat": 20.121,
                "lon": 85.674,
                "capacityKg": 15000,
            },
        ],
    }

@app.get("/api/trips", tags=["Bin Status"])
async def get_trips():
    """Get all trips data."""
    return []

@app.post("/api/dispatch", tags=["Bin Status"])
async def dispatch_trip(request: Request):
    """Dispatch a trip."""
    data = await request.json()
    binId = data.get("binId")
    driverId = data.get("driverId")
    stationId = data.get("stationId")
    return {
        "id": "TRP-001",
        "binId": binId,
        "location": "Test Location",
        "driverId": driverId,
        "driver": {"id": driverId, "name": "Test Driver"},
        "stationId": stationId,
        "station": {"id": stationId, "name": "Test Station"},
        "status": "Assigned",
        "createdAt": 1638360000000,
    }

@app.patch("/api/trips/{trip_id}", tags=["Bin Status"])
async def update_trip(trip_id: str, request: Request):
    """Update a trip."""
    data = await request.json()
    return {
        "id": trip_id,
        "status": data.get("status", "Assigned"),
    }

@app.get("/", tags=["System"])
async def root():
    """Root endpoint providing API information."""
    return APIResponse(
        success=True,
        message="Smart Waste Management System API is operational",
        data={
            "version": API_VERSION,
            "docs_url": "/docs",
            "status": "healthy",
            "total_bins": len(database.bins),
            "data_scope": "September 2025 (Sept 1-12 historical + Sept 13 dynamic)",
            "historical_data_available": os.path.exists(HISTORICAL_DATA_FILE)
        },
        timestamp=datetime.now()
    )

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring services."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": API_VERSION,
        "database_status": "connected",
        "total_bins_monitored": len(database.bins),
        "historical_data_file": HISTORICAL_DATA_FILE,
        "historical_data_exists": os.path.exists(HISTORICAL_DATA_FILE),
        "data_scope": "September 2025 only",
        "september_data_range": "2025-09-01 to 2025-09-12 (historical) + 2025-09-13 (dynamic)"
    }

@app.post("/data", tags=["IoT Data"], response_model=APIResponse)
async def receive_iot_data(
    bin_data: WasteBinData,
    request: Request
):
    """Receive and process IoT device data from waste bins."""
    try:
        # Log incoming request
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Received IoT data from {client_ip} for bin {bin_data.bin_id}")
        
        # Store data in database
        if not database.store_bin_data(bin_data):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store bin data"
            )
        
        # Check for notifications
        notifications = notification_manager.check_and_notify(bin_data)
        
        # Get current status
        current_status = database.get_bin_status(bin_data.bin_id)
        
        if not current_status:
            logger.error(f"Bin status not found after storing data for bin {bin_data.bin_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve bin status after storing data for bin {bin_data.bin_id}"
            )

        response_data = {
            "bin_id": bin_data.bin_id,
            "status": current_status["status"],
            "notifications_sent": len(notifications),
            "alerts": notifications,
            "received_at": current_status["last_updated"].isoformat()
        }
        
        return APIResponse(
            success=True,
            message=f"Data received and processed successfully for bin {bin_data.bin_id}",
            data=response_data,
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing IoT data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while processing data"
        )

@app.get("/status/{bin_id}", tags=["Bin Status"], response_model=BinStatus)
async def get_bin_status(bin_id: str):
    """Retrieve current status and fill levels for a specific waste bin."""
    try:
        bin_status = database.get_bin_status(bin_id)
        
        if not bin_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bin with ID '{bin_id}' not found"
            )
        
        return BinStatus(**bin_status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving bin status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving bin status"
        )

@app.get("/status", tags=["Bin Status"])
async def get_all_bins_status():
    """Retrieve status information for all monitored bins."""
    try:
        all_bins = database.get_all_bins()
        
        if not all_bins:
            return {
                "message": "No bins currently monitored",
                "total_bins": 0,
                "bins": []
            }
        
        # Categorize bins by status
        status_summary = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        bins_with_alerts = []
        
        for bin_data in all_bins.values():
            status_summary[bin_data["status"]] += 1
            if bin_data["alerts"]:
                bins_with_alerts.append(bin_data["bin_id"])
        
        return {
            "total_bins": len(all_bins),
            "status_summary": status_summary,
            "bins_with_alerts": bins_with_alerts,
            "bins": list(all_bins.values()),
            "last_updated": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving all bins status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving bins status"
        )

# ==================== SEPTEMBER DASHBOARD ENDPOINT ====================

@app.get("/dashboard/data", tags=["Dashboard"])
async def get_dashboard_data():
    """Get September 2025 dashboard data."""
    try:
        logger.info("Processing September 2025 dashboard data request")
        
        # Get combined September data
        dashboard_data = historical_data_manager.get_dashboard_data()
        
        if not dashboard_data:
            # If no data available, return sample September 13th data
            logger.warning("No September historical data available, returning sample Sept 13th data")
            dashboard_data = [{
                "date": "2025-09-13",
                "total_organic_kg": round(random.uniform(85.0, 155.0), 1),
                "total_recyclable_kg": round(random.uniform(55.0, 105.0), 1),
                "total_hazardous_kg": round(random.uniform(18.0, 35.0), 1)
            }]
        
        # Calculate summary statistics
        total_data_points = len(dashboard_data)
        total_organic = sum(item["total_organic_kg"] for item in dashboard_data)
        total_recyclable = sum(item["total_recyclable_kg"] for item in dashboard_data)
        total_hazardous = sum(item["total_hazardous_kg"] for item in dashboard_data)
        
        response_data = {
            "data": dashboard_data,
            "summary": {
                "total_data_points": total_data_points,
                "historical_data_points": total_data_points - 1,
                "dynamic_data_points": 1,
                "month": "September 2025",
                "date_range": {
                    "start": "2025-09-01",
                    "end": "2025-09-13"
                },
                "totals": {
                    "total_organic_kg": round(total_organic, 1),
                    "total_recyclable_kg": round(total_recyclable, 1),
                    "total_hazardous_kg": round(total_hazardous, 1),
                    "grand_total_kg": round(total_organic + total_recyclable + total_hazardous, 1)
                },
                "averages": {
                    "avg_organic_kg": round(total_organic / total_data_points, 1) if total_data_points > 0 else 0,
                    "avg_recyclable_kg": round(total_recyclable / total_data_points, 1) if total_data_points > 0 else 0,
                    "avg_hazardous_kg": round(total_hazardous / total_data_points, 1) if total_data_points > 0 else 0
                }
            },
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "data_source": HISTORICAL_DATA_FILE,
                "scope": "September 2025 only",
                "historical_dates": "2025-09-01 to 2025-09-12",
                "dynamic_dates": "2025-09-13",
                "includes_current_day": True
            }
        }
        
        logger.info(f"Successfully prepared September dashboard data with {total_data_points} data points")
        return response_data
        
    except Exception as e:
        logger.error(f"Error preparing September dashboard data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error while preparing September dashboard data: {str(e)}"
        )

# ==================== JWT TOKEN UTILITIES ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token with expiration."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire.timestamp()})
    encoded_jwt = SimpleJWT.encode(to_encode, SECRET_KEY)
    return encoded_jwt

@app.post("/auth/token", tags=["System"])
async def create_token():
    """Create a JWT token for testing protected endpoints."""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "test_user"},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

# ==================== PROTECTED ENDPOINTS ====================

@app.get("/admin/bins", dependencies=[Depends(security)], tags=["System"])
async def admin_get_bins():
    """Protected endpoint for administrative access to all bin data."""
    return {
        "message": "Administrative access granted",
        "data": database.get_all_bins(),
        "timestamp": datetime.now()
    }

@app.get("/admin/dashboard", dependencies=[Depends(security)], tags=["System"])
async def admin_get_dashboard():
    """Protected endpoint for administrative access to September dashboard data."""
    try:
        dashboard_data = historical_data_manager.get_dashboard_data()
        
        analytics = {
            "september_analysis": {
                "peak_collection_days": [],
                "low_collection_days": [],
                "collection_pattern": "September 2025 analysis"
            }
        }
        
        if dashboard_data:
            for item in dashboard_data:
                total_daily = item["total_organic_kg"] + item["total_recyclable_kg"] + item["total_hazardous_kg"]
                if total_daily > 200:
                    analytics["september_analysis"]["peak_collection_days"].append({
                        "date": item["date"],
                        "total_kg": round(total_daily, 1)
                    })
                elif total_daily < 100:
                    analytics["september_analysis"]["low_collection_days"].append({
                        "date": item["date"],
                        "total_kg": round(total_daily, 1)
                    })
        
        return {
            "message": "Administrative September dashboard access granted",
            "dashboard_data": dashboard_data,
            "analytics": analytics,
            "bins_status": database.get_all_bins(),
            "data_scope": "September 2025 (Sept 1-12 historical + Sept 13 dynamic)",
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error in admin September dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while preparing admin September dashboard"
        )

# ==================== ERROR HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler with detailed logging."""
    logger.error(f"HTTP {exc.status_code} error on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unhandled errors."""
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )

# ==================== MAIN APPLICATION RUNNER ====================

if __name__ == "__main__":
    """Run the FastAPI application using Uvicorn server."""
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )