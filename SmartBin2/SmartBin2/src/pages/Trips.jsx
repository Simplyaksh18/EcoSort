import React from 'react'
import { Pill } from '../components/Primitives'

export default function Trips({ trips }){
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Trips</h3><Pill label={`${trips.length} total`} tone="info"/></div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="py-2 pr-4">Trip ID</th><th className="py-2 pr-4">Bin</th><th className="py-2 pr-4">Driver</th><th className="py-2 pr-4">Station</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Created</th></tr></thead>
          <tbody>
            {trips.map(t=>(
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{t.id}</td>
                <td className="py-3 pr-4">{t.binId} • {t.location}</td>
                <td className="py-3 pr-4">{t.driver?.name} ({t.driverId})</td>
                <td className="py-3 pr-4">{t.station?.name} ({t.stationId})</td>
                <td className="py-3 pr-4"><Pill label={t.status} tone={t.status==='Assigned'?'warn':'success'}/></td>
                <td className="py-3 pr-4 text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}