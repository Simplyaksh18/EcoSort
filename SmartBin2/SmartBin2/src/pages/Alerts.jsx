import React from 'react'
import { Pill } from '../components/Primitives'
import { classNames } from '../lib/utils'

export default function Alerts({ bins, onDispatch }){
  const alerts = bins.filter(b=>b.fill>=80)
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Alerts (≥80%)</h3><Pill label={`${alerts.length}`} tone={alerts.length?'danger':'success'}/></div>
      <div className="mt-4 space-y-3">
        {alerts.map(a=>{
          const autoEnabled = (a.type==='Organic'||a.type==='Hazardous') && a.fill>=80
          const enabled = autoEnabled || a.fill>=90 || (a.fill>=80 && a.type==='Recyclable')
          return (
            <div key={a.id} className="p-3 rounded-xl border flex items-center justify-between">
              <div><div className="text-sm font-medium text-gray-900">{a.location}</div><div className="text-xs text-gray-500">{a.id} • {a.type}</div></div>
              <div className="flex items-center gap-3">
                <Pill label={`${a.fill}%`} tone={a.fill>=90?'danger':'warn'}/>
                <button className={classNames('text-sm px-3 py-1.5 rounded-lg', enabled?'bg-green-600 text-white hover:bg-green-700':'bg-gray-200 text-gray-500 cursor-not-allowed')} disabled={!enabled} onClick={()=>enabled&&onDispatch(a)}>Dispatch Truck</button>
              </div>
            </div>
          )
        })}
        {!alerts.length && <div className="text-sm text-gray-500">No alerts right now. 🎉</div>}
      </div>
    </div>
  )
}