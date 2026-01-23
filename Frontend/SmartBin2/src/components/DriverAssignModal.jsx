import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { distKm } from "../lib/utils";

export default function DriverAssignModal({
  bin,
  onClose,
  drivers,
  stations,
  onAssign,
}) {
  const available = drivers.filter((d) => d.status === "Available");
  const typeKey =
    bin.type === "Recyclable"
      ? "Recyclable"
      : bin.type === "Organic"
        ? "Organic"
        : bin.type === "Hazardous"
          ? "Hazardous"
          : "Recyclable";
  const stationList = stations[typeKey] || [];

  const sortedDrivers = useMemo(
    () => [...available].sort((a, b) => distKm(bin, a) - distKm(bin, b)),
    [available, bin],
  );
  const sortedStations = useMemo(
    () => [...stationList].sort((a, b) => distKm(bin, a) - distKm(bin, b)),
    [stationList, bin],
  );

  const [selectedDriver, setSelectedDriver] = useState(
    sortedDrivers[0]?.id || null,
  );
  const [selectedStation, setSelectedStation] = useState(
    sortedStations[0]?.id || null,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl ring-1 ring-green-100 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Driver & Station
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {bin.id} • {bin.location} • {bin.type} • {bin.fill}%
            </p>
          </div>
          <button
            className="text-sm px-3 py-1.5 rounded-lg border"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border rounded-xl p-4">
            <div className="text-sm font-medium mb-2">Available Drivers</div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {sortedDrivers.map((d) => (
                <label
                  key={d.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="driver"
                    className="accent-green-600"
                    checked={selectedDriver === d.id}
                    onChange={() => setSelectedDriver(d.id)}
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {d.name}{" "}
                      <span className="text-gray-400 text-xs">({d.id})</span>
                    </div>
                    <div className="text-xs text-gray-500">{d.phone}</div>
                  </div>
                </label>
              ))}
              {!sortedDrivers.length && (
                <div className="text-xs text-gray-500">
                  No available drivers right now.
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-sm font-medium mb-2">
              Nearby {typeKey} Stations
            </div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {sortedStations.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="station"
                    className="accent-green-600"
                    checked={selectedStation === s.id}
                    onChange={() => setSelectedStation(s.id)}
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {s.name}{" "}
                      <span className="text-gray-400 text-xs">({s.id})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Capacity {s.capacityKg} kg
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            disabled={!selectedDriver || !selectedStation}
            onClick={() => {
              if (!selectedDriver || !selectedStation || !bin?.id) return;
              onAssign(selectedDriver, selectedStation);
            }}
          >
            Assign
          </button>
        </div>
      </motion.div>
    </div>
  );
}
