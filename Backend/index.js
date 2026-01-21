import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  app.use(
    cors({
      origin: "https://simplyaksh18.github.io",
    }),
  );
  app.use(cors());
  app.use(express.json());

  let bins = [
    {
      id: "BIN-BBSR-001",
      location: "Master Canteen Square",
      lat: 20.27,
      lon: 85.84,
      fill: 78,
      type: "Recyclable",
      updated: "09:05",
    },
    {
      id: "BIN-BBSR-002",
      location: "Saheed Nagar Market",
      lat: 20.2962,
      lon: 85.849,
      fill: 83,
      type: "Organic",
      updated: "09:12",
    },
    {
      id: "BIN-BBSR-003",
      location: "Rasulgarh Square",
      lat: 20.3005,
      lon: 85.8535,
      fill: 65,
      type: "Recyclable",
      updated: "09:07",
    },
    {
      id: "BIN-BBSR-004",
      location: "Jaydev Vihar",
      lat: 20.3058,
      lon: 85.82,
      fill: 72,
      type: "Recyclable",
      updated: "09:02",
    },
    {
      id: "BIN-BBSR-005",
      location: "Kharvel Nagar",
      lat: 20.2735,
      lon: 85.842,
      fill: 58,
      type: "Organic",
      updated: "08:59",
    },
    {
      id: "BIN-BBSR-006",
      location: "Chandrasekharpur - Infocity",
      lat: 20.317,
      lon: 85.8235,
      fill: 91,
      type: "Hazardous",
      updated: "09:10",
    },
    {
      id: "BIN-BBSR-007",
      location: "Patia Big Bazaar",
      lat: 20.3187,
      lon: 85.8269,
      fill: 68,
      type: "Recyclable",
      updated: "09:11",
    },
    {
      id: "BIN-BBSR-008",
      location: "Khandagiri Square",
      lat: 20.2625,
      lon: 85.7805,
      fill: 86,
      type: "Organic",
      updated: "09:14",
    },
    {
      id: "BIN-BBSR-009",
      location: "Ekamra Kanan Gate",
      lat: 20.2968,
      lon: 85.8197,
      fill: 41,
      type: "Organic",
      updated: "08:49",
    },
    {
      id: "BIN-BBSR-010",
      location: "Unit 1 Market",
      lat: 20.2665,
      lon: 85.8393,
      fill: 74,
      type: "Recyclable",
      updated: "09:03",
    },
    {
      id: "BIN-BBSR-011",
      location: "Old Town — Lingaraj",
      lat: 20.2414,
      lon: 85.8399,
      fill: 67,
      type: "Organic",
      updated: "09:08",
    },
    {
      id: "BIN-BBSR-012",
      location: "Railway Station (Platform Road)",
      lat: 20.269,
      lon: 85.8445,
      fill: 92,
      type: "Hazardous",
      updated: "09:15",
    },
  ];
  let drivers = [
    {
      id: "DRV-BBSR-01",
      name: "Prakash Mohanty",
      phone: "+91 94370 10001",
      lat: 20.28,
      lon: 85.84,
      status: "Available",
    },
    {
      id: "DRV-BBSR-02",
      name: "Ananya Sahu",
      phone: "+91 98530 10002",
      lat: 20.3,
      lon: 85.83,
      status: "Available",
    },
    {
      id: "DRV-BBSR-03",
      name: "Bikash Swain",
      phone: "+91 99370 10003",
      lat: 20.32,
      lon: 85.82,
      status: "On Trip",
    },
    {
      id: "DRV-BBSR-04",
      name: "Sabita Das",
      phone: "+91 98610 10004",
      lat: 20.26,
      lon: 85.79,
      status: "Available",
    },
    {
      id: "DRV-BBSR-05",
      name: "Amit Patra",
      phone: "+91 93480 10005",
      lat: 20.31,
      lon: 85.84,
      status: "Available",
    },
  ];
  const stations = {
    Recyclable: [
      {
        id: "REC-BBSR-1",
        name: "BMC MRF — Chandrasekharpur",
        lat: 20.3178,
        lon: 85.825,
        capacityKg: 12000,
      },
      {
        id: "REC-BBSR-2",
        name: "Khurda MRF — Industrial Area",
        lat: 20.154,
        lon: 85.666,
        capacityKg: 20000,
      },
    ],
    Organic: [
      {
        id: "ORG-BBSR-1",
        name: "BMC Compost Yard — Palasuni",
        lat: 20.2995,
        lon: 85.8695,
        capacityKg: 10000,
      },
      {
        id: "ORG-BBSR-2",
        name: "Community Compost — Unit 6",
        lat: 20.2652,
        lon: 85.8258,
        capacityKg: 6000,
      },
    ],
    Hazardous: [
      {
        id: "HAZ-BBSR-1",
        name: "Authorized Hazardous Facility — Khurda",
        lat: 20.121,
        lon: 85.674,
        capacityKg: 15000,
      },
    ],
  };
  let trips = [];

  app.get("/api/bins", (req, res) => res.json(bins));
  app.get("/api/drivers", (req, res) => res.json(drivers));
  app.get("/api/stations", (req, res) => res.json(stations));
  app.get("/api/trips", (req, res) => res.json(trips));

  app.post("/api/dispatch", (req, res) => {
    const { binId, driverId, stationId } = req.body || {};
    const bin = bins.find((b) => b.id === binId);
    const driver = drivers.find((d) => d.id === driverId);
    const station = Object.values(stations)
      .flat()
      .find((s) => s.id === stationId);
    if (!bin || !driver || !station)
      return res.status(400).json({ error: "Invalid bin/driver/station" });
    if (driver.status !== "Available")
      return res.status(409).json({ error: "Driver not available" });

    driver.status = "On Trip";
    const trip = {
      id: "TRP-" + (trips.length + 1).toString().padStart(3, "0"),
      binId: bin.id,
      location: bin.location,
      driverId: driver.id,
      driver,
      stationId: station.id,
      station,
      status: "Assigned",
      createdAt: Date.now(),
    };
    trips.unshift(trip);
    bin.fill = Math.max(0, bin.fill - 60);
    bin.updated = new Date().toTimeString().slice(0, 5);
    res.json(trip);
  });

  app.patch("/api/trips/:id", (req, res) => {
    const { id } = req.params;
    const trip = trips.find((t) => t.id === id);
    if (!trip) return res.status(404).json({ error: "Not found" });
    const { status } = req.body || {};
    if (status) trip.status = status;
    if (status === "Completed") {
      const driver = drivers.find((d) => d.id === trip.driverId);
      if (driver) driver.status = "Available";
    }
    res.json(trip);
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Backend running on port http://localhost:${PORT}`);
  });
}

createServer();
