import React from "react";
import { Pill } from "../components/Primitives";

export default function Stations({ stations = {} }) {
  return (
    <div className="space-y-6">
      {Object.entries(stations).map(([type, arr]) => (
        <div
          key={type}
          className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{type} Stations</h3>
            <Pill label={`${arr.length}`} tone="info" />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {arr.map((s) => (
              <div key={s.id} className="rounded-2xl border p-4">
                <div className="text-sm font-semibold text-gray-900">
                  {s.name}
                </div>
                <div className="text-xs text-gray-500">{s.id}</div>
                <div className="mt-2 text-xs text-gray-600">
                  Capacity: {s.capacityKg} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
