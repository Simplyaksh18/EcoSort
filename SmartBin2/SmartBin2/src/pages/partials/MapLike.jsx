import React from 'react'
import { Pill } from '../../components/Primitives'
import { percentToLabel } from '../../lib/utils'

export default function MapLike({ bins }){
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Bhubaneswar Map Overview</h3><Pill label="Demo" tone="info" /></div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bins.map(b=>(
          <div key={b.id} className="rounded-2xl border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{b.location}</div>
                <div className="text-xs text-gray-500">{b.lat?.toFixed?.(4)}, {b.lon?.toFixed?.(4)}</div>
              </div>
              <Pill label={b.type} tone="info" />
            </div>
            <div className="mt-3 text-xs text-gray-600 flex items-center justify-between">
              <span>Filled</span><span className="font-semibold">{percentToLabel(b.fill)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}