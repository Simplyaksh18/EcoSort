import React, { useMemo } from 'react'

function dailyData(seed){
  const collected = 100000 + ((seed * 137) % 5000)  // kg/day
  const recycled = Math.round(collected * (0.60 + (seed % 8) / 100)) // 60-68%
  return { collected, recycled }
}

export default function Insights(){
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = useMemo(()=>{
    const arr = []
    for(let i=0;i<startDay;i++) arr.push(null)
    for(let d=1; d<=daysInMonth; d++) arr.push(d)
    while(arr.length % 7 !== 0) arr.push(null)
    return arr
  },[startDay, daysInMonth])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Insights — Bhubaneswar ({now.toLocaleString('default',{month:'long'})} {year})</h3>
          <span className="text-xs text-gray-500">Future days are faded and disabled</span>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>(<div key={w} className="py-2">{w}</div>))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((d,i)=>{
            if(!d) return <div key={i} className="h-20 rounded-xl bg-gray-50"/>;
            const isFuture = d > today
            const s = d + month * 100 + year
            const { collected, recycled } = dailyData(s)

            return (
              <div key={i} className={`relative group h-20 rounded-xl border bg-white transition ${isFuture ? 'opacity-40 pointer-events-none' : 'hover:shadow-sm'}`}>
                <div className="absolute top-1 left-2 text-xs text-gray-500">{d}</div>
                <div className="absolute bottom-2 left-2 right-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`${isFuture ? 'bg-gray-300' : 'bg-green-500'} h-2`} style={{ width: `${Math.min(100, Math.round((recycled/collected)*100))}%` }} />
                </div>
                {!isFuture && (
                  <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition bg-white border rounded-xl px-3 py-2 shadow-lg text-[11px] whitespace-nowrap">
                    <div className="font-medium text-gray-900">Day {d}</div>
                    <div className="text-gray-600 mt-0.5">Collected: <b>{(collected/1000).toFixed(1)} t</b></div>
                    <div className="text-gray-600">Recycled: <b>{(recycled/1000).toFixed(1)} t</b></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}