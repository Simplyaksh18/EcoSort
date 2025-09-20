import React from 'react'
import { motion } from 'framer-motion'
import { classNames } from '../lib/utils'

export function Progress({ value }){
  const tone = value >= 90 ? 'bg-red-500' : value >= 80 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
      <motion.div
        className={classNames('h-3', tone)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}

export function Pill({ label, tone='success' }){
  const map = {
    success:'bg-green-100 text-green-800',
    warn:'bg-yellow-100 text-yellow-800',
    danger:'bg-red-100 text-red-800',
    info:'bg-sky-100 text-sky-800'
  }
  return <span className={classNames('px-2.5 py-1 text-xs font-medium rounded-full border', map[tone])}>{label}</span>
}

export function StatCard({ title, value, sub, trend, intent='success' }){
  const ring = intent==='danger'?'ring-red-200':intent==='warn'?'ring-yellow-200':'ring-green-200'
  return (
    <div className={classNames('bg-white rounded-2xl p-5 shadow-sm ring-1', ring, 'hover:shadow-md transition-shadow')}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        {trend && <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800">{`${trend.sign}${trend.value}%`}</span>}
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </div>
  )
}