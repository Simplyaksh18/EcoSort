import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview.jsx";
import Bins from "./pages/Bins.jsx";
import Alerts from "./pages/Alerts.jsx";
import Drivers from "./pages/Drivers.jsx";
import Stations from "./pages/Stations.jsx";
import Trips from "./pages/Trips.jsx";
import Insights from "./pages/Insights.jsx";
import Queries from "./pages/Queries.jsx";
import DriverAssignModal from "./components/DriverAssignModal.jsx";
import Toaster from "./components/Toaster.jsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import { brand } from "./lib/brand";
import {
  getBins,
  getDrivers,
  getStations,
  getTrips,
  dispatchTruck,
} from "./lib/api";

function SignIn({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email && password) onSuccess({ email });
      else setError("Enter credentials to continue.");
      setLoading(false);
    }, 600);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl ring-1 ring-green-100 p-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-green-600 text-white font-bold flex items-center justify-center">
            SW
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Admin Sign In
            </h2>
            <p className="text-sm text-gray-500">Municipality access only</p>
          </div>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bmc.gov.in"
              className="mt-1 w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="text-[11px] text-gray-500 text-center">
            Hint: any email/password works in this demo.
          </div>
        </form>
      </div>
    </div>
  );
}

function Layout({ children, onSignOut }) {
  return (
    <div
      className="min-h-screen flex flex-col bg-[--bg]"
      style={{ ["--bg"]: brand.bg }}
    >
      {/* Header */}
      <Header onSignOut={onSignOut} />

      {/* Main content (this grows) */}
      <div className="flex-1">
        <div className="flex gap-6 px-4 sm:px-6 lg:px-8 py-6">
          <Sidebar />

          <main className="flex-1 min-w-0">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>

      {/* Footer (sticks to bottom) */}
      <footer className="text-xs text-gray-500 text-center py-4">
        © {new Date().getFullYear()} EcoSort – Smart Waste Segregation System |
        Built by Team Arcane👩‍💻
      </footer>
    </div>
  );
}

function DashboardShell({ onSignOut }) {
  const [bins, setBins] = useState(null);
  const [drivers, setDrivers] = useState(null);
  const [stations, setStations] = useState(null);
  const [trips, setTrips] = useState(null);
  const [series] = useState([
    { month: "Apr", rate: 62, recycledKg: 65000, totalKg: 105000 },
    { month: "May", rate: 64, recycledKg: 66000, totalKg: 103000 },
    { month: "Jun", rate: 66, recycledKg: 68000, totalKg: 103000 },
    { month: "Jul", rate: 67, recycledKg: 69000, totalKg: 103000 },
    { month: "Aug", rate: 69, recycledKg: 71000, totalKg: 103000 },
    { month: "Sep", rate: 71, recycledKg: 72000, totalKg: 101000 },
  ]);
  const [assignTarget, setAssignTarget] = useState(null);

  const [toasts, setToasts] = useState([]);
  const pushToast = (title, desc) => {
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, desc }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  React.useEffect(() => {
    (async () => {
      const [b, d, s, t] = await Promise.all([
        getBins(),
        getDrivers(),
        getStations(),
        getTrips(),
      ]);
      setBins(b);
      setDrivers(d);
      setStations(s);
      setTrips(t);
    })();
  }, []);

  React.useEffect(() => {
    const id = setInterval(async () => {
      const [b, t, d] = await Promise.all([
        getBins(),
        getTrips(),
        getDrivers(),
      ]);
      setBins(b);
      setTrips(t);
      setDrivers(d);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const handleAssign = async (driverId, stationId) => {
    try {
      await dispatchTruck({ binId: assignTarget.id, driverId, stationId });
    } catch (err) {
      pushToast("Dispatch failed", err?.message || "Server error");
      return; // keep modal open for retry
    }
    const loc = assignTarget.location;
    setAssignTarget(null);
    const [b, d, t] = await Promise.all([getBins(), getDrivers(), getTrips()]);
    setBins(b);
    setDrivers(d);
    setTrips(t);
    pushToast("Driver assigned", `Truck dispatched for ${loc}`);
  };

  return (
    <Layout onSignOut={onSignOut}>
      <Routes>
        <Route
          path="/overview"
          element={<Overview bins={bins} series={series} />}
        />
        <Route
          path="/bins"
          element={
            <Bins bins={bins} onClickDispatch={(b) => setAssignTarget(b)} />
          }
        />
        <Route
          path="/alerts"
          element={
            <Alerts bins={bins} onDispatch={(b) => setAssignTarget(b)} />
          }
        />
        <Route path="/drivers" element={<Drivers drivers={drivers} />} />
        <Route path="/stations" element={<Stations stations={stations} />} />
        <Route path="/trips" element={<Trips trips={trips} />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/queries" element={<Queries />} />
        <Route path="*" element={<Overview bins={bins} series={series} />} />
      </Routes>
      {assignTarget && (
        <DriverAssignModal
          bin={assignTarget}
          onClose={() => setAssignTarget(null)}
          drivers={drivers}
          stations={stations}
          onAssign={handleAssign}
        />
      )}
      <Toaster toasts={toasts} remove={removeToast} />
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const raw = localStorage.getItem("sw-admin");
    if (raw) setUser(JSON.parse(raw));
  }, []);
  React.useEffect(() => {
    if (user) localStorage.setItem("sw-admin", JSON.stringify(user));
    else localStorage.removeItem("sw-admin");
  }, [user]);

  return !user ? (
    <SignIn
      onSuccess={(u) => {
        setUser(u);
        navigate("/overview");
      }}
    />
  ) : (
    <DashboardShell
      onSignOut={() => {
        setUser(null);
        navigate("/");
      }}
    />
  );
}
