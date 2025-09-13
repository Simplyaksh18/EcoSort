import React from 'react'
import { Pill } from '../components/Primitives'

export default function Drivers({ drivers }){
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Drivers</h3><Pill label={`${drivers.length} total`} tone="info"/></div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="py-2 pr-4">ID</th><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Phone</th><th className="py-2 pr-4">Status</th></tr></thead>
          <tbody>
            {drivers.map(d=>(
              <tr key={d.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{d.id}</td>
                <td className="py-3 pr-4">{d.name}</td>
                <td className="py-3 pr-4">{d.phone}</td>
                <td className="py-3 pr-4"><Pill label={d.status} tone={d.status==='Available'?'success':'warn'}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}