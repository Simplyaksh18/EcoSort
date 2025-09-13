import React from 'react'
import { Progress, Pill } from '../components/Primitives'
import MapLike from './partials/MapLike'
import { classNames, percentToLabel } from '../lib/utils'

export default function Bins({ bins, onClickDispatch }){
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Live Bins by Location (Bhubaneswar)</h3><Pill label={`${bins.length} devices`} tone="info"/></div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Bin ID</th><th className="py-2 pr-4">Location</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Fill</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Action</th><th className="py-2 pr-4">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {bins.map(b=>{
                const tone = b.fill>=90?'danger':b.fill>=80?'warn':'success'
                const autoEnabled = (b.type==='Organic'||b.type==='Hazardous') && b.fill>=80
                const enabled = autoEnabled || b.fill>=90 || (b.fill>=80 && b.type==='Recyclable')
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{b.id}</td>
                    <td className="py-3 pr-4">{b.location}</td>
                    <td className="py-3 pr-4">{b.type}</td>
                    <td className="py-3 pr-4 w-64"><div className="flex items-center gap-3"><Progress value={b.fill}/><span className="w-12 text-right font-medium">{percentToLabel(b.fill)}</span></div></td>
                    <td className="py-3 pr-4"><Pill label={b.fill>=90?'Collect Now':b.fill>=80?'Alert':'OK'} tone={tone}/></td>
                    <td className="py-3 pr-4"><button className={classNames('text-sm px-3 py-1.5 rounded-lg', enabled?'bg-green-600 text-white hover:bg-green-700':'bg-gray-200 text-gray-500 cursor-not-allowed')} disabled={!enabled} onClick={()=>enabled&&onClickDispatch(b)}>Dispatch Truck</button></td>
                    <td className="py-3 pr-4 text-gray-600">{b.updated}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <MapLike bins={bins}/>
    </div>
  )
}