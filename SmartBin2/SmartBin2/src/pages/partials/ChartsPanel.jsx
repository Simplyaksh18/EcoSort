import React, { useMemo } from 'react'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from 'recharts'
import { Pill } from '../../components/Primitives'
import { brand } from '../../lib/brand'

export default function ChartsPanel({ series, bins }){
  const distribution = useMemo(()=>{
    const buckets=[{label:'0-20%',count:0},{label:'20-40%',count:0},{label:'40-60%',count:0},{label:'60-80%',count:0},{label:'80-100%',count:0}]
    bins.forEach(b=>{ const i = b.fill>=80?4:b.fill>=60?3:b.fill>=40?2:b.fill>=20?1:0; buckets[i].count+=1 })
    return buckets
  },[bins])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Recycling Rate Over Time (Bhubaneswar)</h3><Pill label="Goal ≥ 70%" tone="info" /></div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis unit="%" domain={[0,100]} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="rate" name="Recycling %" stroke={brand.green} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Bin Fullness Distribution</h3><Pill label={`${bins.length} bins`} tone="info" /></div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip /><Legend />
              <Bar dataKey="count" name="# of Bins" fill={brand.greenMid} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}