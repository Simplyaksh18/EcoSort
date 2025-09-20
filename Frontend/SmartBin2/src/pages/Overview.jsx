import React from 'react'
import { StatCard } from '../components/Primitives'
import ChartsPanel from './partials/ChartsPanel'

export default function Overview({ bins, series }){
  const activeDevices = bins.length
  const alerts = bins.filter(b=>b.fill>=80).length
  const totalProcessed = 100 * 30
  const recyclingRate = series[series.length-1]?.rate ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Active Devices" value={activeDevices} sub="Online smart bins" trend={{sign:'+',value:2}}/>
        <StatCard title="Recycling Rate" value={`${recyclingRate}%`} sub="This month (Bhubaneswar)" trend={{sign:'+',value:3}}/>
        <StatCard title="Open Alerts" value={alerts} sub=">= 80% full" intent={alerts?(alerts>1?'warn':'success'):'success'}/>
        <StatCard title="Waste Processed" value={`${totalProcessed} t/mo`} sub="Est. monthly (demo)"/>
      </div>
      <ChartsPanel series={series} bins={bins}/>
    </div>
  )
}