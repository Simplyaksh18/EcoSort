/**
 * Backend Integration Script for Existing Frontend
 * Add this code to your existing JavaScript file or create a new one
 *
 * This script will connect your existing frontend to the FastAPI backend
 */

// Backend Configuration
const BACKEND_URL = "http://127.0.0.1:8000";
const DASHBOARD_ENDPOINT = "/dashboard/data";

// Global variables
let wasteData = null;
let isDataLoaded = false;

/**
 * Fetch dashboard data from FastAPI backend
 */
async function fetchWasteData() {
  try {
    console.log("🔌 Connecting to backend at:", BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}${DASHBOARD_ENDPOINT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors", // Important for cross-origin requests
    });

    if (!response.ok) {
      throw new Error(
        `Backend Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("✅ Successfully fetched waste data:", data);

    wasteData = data;
    isDataLoaded = true;

    // Call your existing functions to update the UI
    updateDashboard(data);

    return data;
  } catch (error) {
    console.error("❌ Error fetching waste data:", error);

    // Show error in UI
    showBackendError(error.message);

    // Return mock data for testing if backend is not available
    return getMockData();
  }
}

/**
 * Update your existing dashboard with real backend data
 * Modify this function to match your existing HTML structure
 */
function updateDashboard(backendData) {
  console.log("📊 Updating dashboard with backend data...");

  if (!backendData || !backendData.data) {
    console.error("Invalid data structure received");
    return;
  }

  // Update summary statistics (modify selectors to match your HTML)
  updateSummaryStats(backendData.summary);

  // Update daily data (modify to match your existing charts/tables)
  updateWasteChart(backendData.data);

  // Update any status indicators
  updateDataStatus("connected", backendData.metadata);
}

/**
 * Update summary statistics
 * Modify the selectors to match your existing HTML elements
 */
function updateSummaryStats(summary) {
  if (!summary) return;

  // Example - modify these selectors to match your existing HTML
  const elements = {
    totalDays: document.querySelector(
      '#total-days, .total-days, [data-stat="days"]',
    ),
    totalOrganic: document.querySelector(
      '#total-organic, .total-organic, [data-stat="organic"]',
    ),
    totalRecyclable: document.querySelector(
      '#total-recyclable, .total-recyclable, [data-stat="recyclable"]',
    ),
    totalHazardous: document.querySelector(
      '#total-hazardous, .total-hazardous, [data-stat="hazardous"]',
    ),
    grandTotal: document.querySelector(
      '#grand-total, .grand-total, [data-stat="total"]',
    ),
    dailyAverage: document.querySelector(
      '#daily-average, .daily-average, [data-stat="average"]',
    ),
  };

  // Update the elements if they exist
  if (elements.totalDays)
    elements.totalDays.textContent = summary.total_data_points || 0;
  if (elements.totalOrganic)
    elements.totalOrganic.textContent = `${(
      summary.totals?.total_organic_kg || 0
    ).toFixed(1)} kg`;
  if (elements.totalRecyclable)
    elements.totalRecyclable.textContent = `${(
      summary.totals?.total_recyclable_kg || 0
    ).toFixed(1)} kg`;
  if (elements.totalHazardous)
    elements.totalHazardous.textContent = `${(
      summary.totals?.total_hazardous_kg || 0
    ).toFixed(1)} kg`;
  if (elements.grandTotal)
    elements.grandTotal.textContent = `${(
      summary.totals?.grand_total_kg || 0
    ).toFixed(1)} kg`;
  if (elements.dailyAverage)
    elements.dailyAverage.textContent = `${(
      (summary.totals?.grand_total_kg || 0) / (summary.total_data_points || 1)
    ).toFixed(1)} kg`;

  console.log("📈 Summary statistics updated");
}

/**
 * Update waste chart/visualization
 * Modify this to work with your existing chart library or visualization
 */
function updateWasteChart(dailyData) {
  if (!Array.isArray(dailyData)) return;

  console.log("📊 Updating waste chart with", dailyData.length, "data points");

  // If you're using Chart.js, modify this section
  if (typeof Chart !== "undefined" && window.wasteChart) {
    updateChartJS(dailyData);
  }
  // If you're using D3.js, modify this section
  else if (typeof d3 !== "undefined") {
    updateD3Chart(dailyData);
  }
  // If you're using a custom chart, modify this section
  else {
    updateCustomChart(dailyData);
  }
}

/**
 * Update Chart.js chart (if you're using Chart.js)
 */
function updateChartJS(dailyData) {
  if (!window.wasteChart) return;

  const labels = dailyData.map((day) => day.date);
  const organicData = dailyData.map((day) => day.total_organic_kg);
  const recyclableData = dailyData.map((day) => day.total_recyclable_kg);
  const hazardousData = dailyData.map((day) => day.total_hazardous_kg);

  window.wasteChart.data.labels = labels;
  window.wasteChart.data.datasets[0].data = organicData;
  window.wasteChart.data.datasets[1].data = recyclableData;
  window.wasteChart.data.datasets[2].data = hazardousData;

  window.wasteChart.update();
  console.log("📊 Chart.js updated");
}

/**
 * Update D3.js visualization (if you're using D3.js)
 */
function updateD3Chart(dailyData) {
  // Add your D3.js update code here
  console.log("📊 D3.js chart update - implement based on your existing code");
}

/**
 * Update custom chart/table (modify to match your existing implementation)
 */
function updateCustomChart(dailyData) {
  // Find your existing chart container
  const chartContainer = document.querySelector(
    "#chart-container, .chart-container, .waste-chart",
  );

  if (!chartContainer) {
    console.log(
      "📊 No chart container found, data available in wasteData variable",
    );
    return;
  }

  // Example: Create a simple table if no specific chart library is used
  let html = `
        <table class="waste-data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Organic (kg)</th>
                    <th>Recyclable (kg)</th>
                    <th>Hazardous (kg)</th>
                    <th>Total (kg)</th>
                </tr>
            </thead>
            <tbody>
    `;

  dailyData.forEach((day) => {
    const total =
      day.total_organic_kg + day.total_recyclable_kg + day.total_hazardous_kg;
    const isToday = day.date === "2025-09-13";

    html += `
            <tr class="${isToday ? "today-row" : ""}">
                <td>${day.date}</td>
                <td>${day.total_organic_kg.toFixed(1)}</td>
                <td>${day.total_recyclable_kg.toFixed(1)}</td>
                <td>${day.total_hazardous_kg.toFixed(1)}</td>
                <td><strong>${total.toFixed(1)}</strong></td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  chartContainer.innerHTML = html;
}

/**
 * Show backend connection error
 */
function showBackendError(message) {
  console.error("🚨 Backend Error:", message);

  // Find error display element (modify selector to match your HTML)
  const errorElement = document.querySelector(
    "#error-message, .error-message, .alert",
  );

  if (errorElement) {
    errorElement.innerHTML = `
            <div class="alert alert-warning">
                <h4>⚠️ Backend Connection Issue</h4>
                <p>${message}</p>
                <p><strong>Solutions:</strong></p>
                <ul>
                    <li>Make sure your FastAPI backend is running: <code>python main.py</code></li>
                    <li>Check that backend is accessible at: <a href="${BACKEND_URL}" target="_blank">${BACKEND_URL}</a></li>
                    <li>Verify CORS is enabled in your backend</li>
                </ul>
                <button onclick="retryBackendConnection()" class="btn btn-primary">🔄 Retry Connection</button>
            </div>
        `;
    errorElement.style.display = "block";
  }
}

/**
 * Update data status indicator
 */
function updateDataStatus(status, metadata) {
  const statusElement = document.querySelector(
    "#data-status, .data-status, .connection-status",
  );

  if (!statusElement) return;

  const statusConfig = {
    connected: { text: "🟢 Backend Connected", class: "status-success" },
    disconnected: { text: "🔴 Backend Disconnected", class: "status-error" },
    loading: { text: "🟡 Loading...", class: "status-loading" },
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  statusElement.textContent = config.text;
  statusElement.className = `data-status ${config.class}`;

  if (metadata) {
    statusElement.title = `Last updated: ${new Date(
      metadata.generated_at,
    ).toLocaleString()}`;
  }
}

/**
 * Get mock data for testing when backend is not available
 */
function getMockData() {
  return {
    data: [
      {
        date: "2025-09-01",
        total_organic_kg: 111.1,
        total_recyclable_kg: 100.2,
        total_hazardous_kg: 22.5,
      },
      {
        date: "2025-09-02",
        total_organic_kg: 88.7,
        total_recyclable_kg: 103.5,
        total_hazardous_kg: 24.1,
      },
      {
        date: "2025-09-13",
        total_organic_kg: 127.3,
        total_recyclable_kg: 78.9,
        total_hazardous_kg: 24.1,
      },
    ],
    summary: {
      total_data_points: 3,
      totals: {
        total_organic_kg: 327.1,
        total_recyclable_kg: 282.6,
        total_hazardous_kg: 70.7,
        grand_total_kg: 680.4,
      },
    },
    metadata: { scope: "Mock Data", generated_at: new Date().toISOString() },
  };
}

/**
 * Retry backend connection
 */
function retryBackendConnection() {
  console.log("🔄 Retrying backend connection...");
  fetchWasteData();
}

/**
 * Auto-refresh data every 30 seconds for dynamic September 13th data
 */
function startAutoRefresh() {
  setInterval(() => {
    if (document.visibilityState === "visible" && isDataLoaded) {
      console.log("🔄 Auto-refreshing waste data...");
      fetchWasteData();
    }
  }, 30000); // 30 seconds
}

/**
 * Initialize backend integration
 * Call this function when your existing page loads
 */
function initializeBackendIntegration() {
  console.log("🚀 Initializing backend integration...");

  updateDataStatus("loading");

  // Fetch initial data
  fetchWasteData();

  // Start auto-refresh
  startAutoRefresh();

  console.log("✅ Backend integration initialized");
}

// Export functions for global access
window.fetchWasteData = fetchWasteData;
window.retryBackendConnection = retryBackendConnection;
window.wasteData = null;

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeBackendIntegration);
} else {
  initializeBackendIntegration();
}
