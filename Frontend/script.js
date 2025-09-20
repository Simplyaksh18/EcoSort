/**
 * Smart Waste Management System - Frontend JavaScript
 * SIH 2025 - Problem Statement ID: 25046
 *
 * This script connects to the FastAPI backend and displays waste collection data
 * from the /dashboard/data endpoint.
 *
 * Author: Frontend Developer
 * Backend API: FastAPI with September 2025 waste data
 */

// Configuration
const API_BASE_URL = "http://127.0.0.1:8000";
const DASHBOARD_ENDPOINT = "/dashboard/data";

// Global variables to store data
let dashboardData = null;
let isLoading = false;

// Utility Functions
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div class="loading-spinner">🔄 Loading data...</div>';
    element.className = "loading";
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("loading");
  }
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
            <div class="error-message">
                <h3>❌ Error Loading Data</h3>
                <p>${message}</p>
                <button onclick="fetchDashboardData()" class="retry-btn">Retry</button>
            </div>
        `;
    element.className = "error";
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(number) {
  return Number(number).toLocaleString("en-US", { maximumFractionDigits: 1 });
}

// API Functions
async function fetchDashboardData() {
  if (isLoading) return;

  isLoading = true;
  console.log("📡 Fetching dashboard data from backend...");

  // Show loading state
  showLoading("dashboard-content");
  showLoading("summary-stats");

  try {
    const response = await fetch(`${API_BASE_URL}${DASHBOARD_ENDPOINT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors", // Add this line to enable CORS requests
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Successfully fetched dashboard data:", data);

    dashboardData = data;
    displayDashboardData(data);
    updateConnectionStatus("connected");
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);

    let errorMessage = "Failed to connect to backend server.";

    if (error.message.includes("fetch")) {
      errorMessage = `
                Backend server not reachable at ${API_BASE_URL}. 
                Please ensure your FastAPI backend is running on port 8000.
                <br><br>
                <strong>To start backend:</strong><br>
                <code>python main.py</code>
            `;
    } else if (error.message.includes("404")) {
      errorMessage =
        "Dashboard endpoint not found. Please check your backend API.";
    } else if (error.message.includes("500")) {
      errorMessage = "Internal server error. Please check your backend logs.";
    }

    showError("dashboard-content", errorMessage);
    showError("summary-stats", "Unable to load summary statistics.");
    updateConnectionStatus("disconnected");
  } finally {
    isLoading = false;
    hideLoading("dashboard-content");
    hideLoading("summary-stats");
  }
}

// Display Functions
function displayDashboardData(responseData) {
  console.log("📊 Displaying dashboard data...");

  if (!responseData || !responseData.data) {
    showError(
      "dashboard-content",
      "Invalid data format received from backend."
    );
    return;
  }

  // Display summary statistics
  displaySummaryStats(responseData.summary);

  // Display daily waste data
  displayDailyData(responseData.data);

  // Display metadata
  displayMetadata(responseData.metadata);

  // Create visualizations
  createWasteChart(responseData.data);

  console.log("✅ Dashboard data displayed successfully");
}

function displaySummaryStats(summary) {
  const summaryElement = document.getElementById("summary-stats");
  if (!summaryElement || !summary) return;

  const summaryHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${summary.total_data_points || 0}</div>
                <div class="stat-label">Total Days</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${formatNumber(
                  summary.totals?.total_organic_kg || 0
                )} kg</div>
                <div class="stat-label">Total Organic Waste</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${formatNumber(
                  summary.totals?.total_recyclable_kg || 0
                )} kg</div>
                <div class="stat-label">Total Recyclable Waste</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${formatNumber(
                  summary.totals?.total_hazardous_kg || 0
                )} kg</div>
                <div class="stat-label">Total Hazardous Waste</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${formatNumber(
                  summary.totals?.grand_total_kg || 0
                )} kg</div>
                <div class="stat-label">Grand Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${formatNumber(
                  summary.totals?.grand_total_kg / summary.total_data_points ||
                    0
                )} kg</div>
                <div class="stat-label">Daily Average</div>
            </div>
        </div>
    `;

  summaryElement.innerHTML = summaryHTML;
}

function displayDailyData(dailyData) {
  const dailyElement = document.getElementById("daily-data");
  if (!dailyElement || !Array.isArray(dailyData)) return;

  let tableHTML = `
        <div class="data-table-container">
            <h3>📅 Daily Waste Collection Data - September 2025</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Organic (kg)</th>
                        <th>Recyclable (kg)</th>
                        <th>Hazardous (kg)</th>
                        <th>Total (kg)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

  dailyData.forEach((day, index) => {
    const total =
      day.total_organic_kg + day.total_recyclable_kg + day.total_hazardous_kg;
    const isToday = day.date === "2025-09-13";
    const isCollectionDay = total < 100;

    let status = "Normal";
    let statusClass = "status-normal";

    if (isToday) {
      status = "Today (Dynamic)";
      statusClass = "status-today";
    } else if (isCollectionDay) {
      status = "Collection Day";
      statusClass = "status-collection";
    } else if (total > 200) {
      status = "High Volume";
      statusClass = "status-high";
    }

    tableHTML += `
            <tr class="${isToday ? "today-row" : ""} ${
      isCollectionDay ? "collection-row" : ""
    }">
                <td class="date-cell">${formatDate(day.date)}</td>
                <td class="number-cell">${formatNumber(
                  day.total_organic_kg
                )}</td>
                <td class="number-cell">${formatNumber(
                  day.total_recyclable_kg
                )}</td>
                <td class="number-cell">${formatNumber(
                  day.total_hazardous_kg
                )}</td>
                <td class="number-cell total-cell">${formatNumber(total)}</td>
                <td class="status-cell ${statusClass}">${status}</td>
            </tr>
        `;
  });

  tableHTML += `
                </tbody>
            </table>
        </div>
    `;

  dailyElement.innerHTML = tableHTML;
}

function displayMetadata(metadata) {
  const metadataElement = document.getElementById("metadata-info");
  if (!metadataElement || !metadata) return;

  const metadataHTML = `
        <div class="metadata-container">
            <h3>ℹ️ Data Information</h3>
            <div class="metadata-grid">
                <div class="metadata-item">
                    <strong>Data Scope:</strong> ${metadata.scope || "N/A"}
                </div>
                <div class="metadata-item">
                    <strong>Historical Period:</strong> ${
                      metadata.historical_dates || "N/A"
                    }
                </div>
                <div class="metadata-item">
                    <strong>Dynamic Data:</strong> ${
                      metadata.dynamic_dates || "N/A"
                    }
                </div>
                <div class="metadata-item">
                    <strong>Data Source:</strong> ${
                      metadata.data_source || "N/A"
                    }
                </div>
                <div class="metadata-item">
                    <strong>Generated At:</strong> ${
                      formatDate(metadata.generated_at) || "N/A"
                    }
                </div>
            </div>
        </div>
    `;

  metadataElement.innerHTML = metadataHTML;
}

function createWasteChart(dailyData) {
  const chartElement = document.getElementById("waste-chart");
  if (!chartElement || !Array.isArray(dailyData)) return;

  // Create a simple bar chart using CSS
  let chartHTML = `
        <div class="chart-container">
            <h3>📊 Daily Waste Collection Trends</h3>
            <div class="chart-bars">
    `;

  const maxTotal = Math.max(
    ...dailyData.map(
      (day) =>
        day.total_organic_kg + day.total_recyclable_kg + day.total_hazardous_kg
    )
  );

  dailyData.forEach((day, index) => {
    const total =
      day.total_organic_kg + day.total_recyclable_kg + day.total_hazardous_kg;
    const heightPercent = (total / maxTotal) * 100;
    const isToday = day.date === "2025-09-13";

    chartHTML += `
            <div class="chart-bar-container">
                <div class="chart-bar ${isToday ? "today-bar" : ""}" 
                     style="height: ${heightPercent}%"
                     title="${formatDate(day.date)}: ${formatNumber(total)} kg">
                </div>
                <div class="chart-label">${day.date.split("-")[2]}</div>
            </div>
        `;
  });

  chartHTML += `
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <div class="legend-color today-color"></div>
                    <span>Today (Dynamic)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color historical-color"></div>
                    <span>Historical Data</span>
                </div>
            </div>
        </div>
    `;

  chartElement.innerHTML = chartHTML;
}

function updateConnectionStatus(status) {
  const statusElement = document.getElementById("connection-status");
  if (!statusElement) return;

  const statusConfig = {
    connected: {
      text: "Backend Connected",
      class: "status-connected",
      icon: "🟢",
    },
    disconnected: {
      text: "Backend Disconnected",
      class: "status-disconnected",
      icon: "🔴",
    },
    connecting: {
      text: "Connecting...",
      class: "status-connecting",
      icon: "🟡",
    },
  };

  const config = statusConfig[status] || statusConfig.disconnected;

  statusElement.innerHTML = `
        <span class="${config.class}">
            ${config.icon} ${config.text}
        </span>
    `;
  statusElement.className = config.class;
}

// Utility Functions for User Interaction
function refreshData() {
  console.log("🔄 Manual refresh triggered");
  fetchDashboardData();
}

function downloadData() {
  if (!dashboardData) {
    alert("No data available to download. Please load data first.");
    return;
  }

  const dataStr = JSON.stringify(dashboardData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `waste_management_data_${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log("💾 Data downloaded successfully");
}

function exportToCSV() {
  if (!dashboardData || !dashboardData.data) {
    alert("No data available to export. Please load data first.");
    return;
  }

  let csvContent =
    "Date,Organic (kg),Recyclable (kg),Hazardous (kg),Total (kg)\n";

  dashboardData.data.forEach((day) => {
    const total =
      day.total_organic_kg + day.total_recyclable_kg + day.total_hazardous_kg;
    csvContent += `${day.date},${day.total_organic_kg},${day.total_recyclable_kg},${day.total_hazardous_kg},${total}\n`;
  });

  const csvBlob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(csvBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `waste_management_data_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log("📊 Data exported to CSV successfully");
}

// Health Check Function
async function checkBackendHealth() {
  try {
    updateConnectionStatus("connecting");
    const response = await fetch(`${API_BASE_URL}/health`);

    if (response.ok) {
      const healthData = await response.json();
      console.log("💚 Backend health check passed:", healthData);
      updateConnectionStatus("connected");
      return true;
    } else {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error("💔 Backend health check failed:", error);
    updateConnectionStatus("disconnected");
    return false;
  }
}

// Initialize Application
async function initializeApp() {
  console.log("🚀 Initializing Smart Waste Management Dashboard...");

  // Check if backend is healthy
  const isHealthy = await checkBackendHealth();

  if (isHealthy) {
    // Fetch initial data
    await fetchDashboardData();

    // Set up auto-refresh every 30 seconds for dynamic data
    setInterval(() => {
      if (document.visibilityState === "visible") {
        console.log("🔄 Auto-refreshing data...");
        fetchDashboardData();
      }
    }, 30000);

    console.log("✅ Application initialized successfully");
  } else {
    showError(
      "dashboard-content",
      `
            Cannot connect to backend server at ${API_BASE_URL}.
            <br><br>
            <strong>Please ensure:</strong><br>
            1. FastAPI backend is running: <code>python main.py</code><br>
            2. Backend is accessible at ${API_BASE_URL}<br>
            3. CORS is enabled for this domain
        `
    );
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM loaded, starting application...");
  initializeApp();
});

// Handle page visibility changes
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && dashboardData) {
    console.log("👁️ Page became visible, refreshing data...");
    fetchDashboardData();
  }
});

// Export functions for global access
window.refreshData = refreshData;
window.downloadData = downloadData;
window.exportToCSV = exportToCSV;
window.checkBackendHealth = checkBackendHealth;
window.fetchDashboardData = fetchDashboardData; // Expose for the retry button

// Global error handler
window.addEventListener("error", function (event) {
  console.error("💥 Global error caught:", event.error);
});

console.log("📜 Smart Waste Management Dashboard script loaded successfully!");
