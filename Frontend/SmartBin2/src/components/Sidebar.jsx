import React from 'react'
import { NavLink } from 'react-router-dom'
import { classNames } from '../lib/utils'

export default function Sidebar(){
  const Item = ({to,label}) => (
    <NavLink to={to} className={({isActive})=>classNames('block px-3 py-2 rounded-xl text-sm font-medium', isActive?'bg-green-600 text-white':'text-gray-700 hover:bg-green-50')}>
      {label}
    </NavLink>
  )
  return (
    <div className="w-full lg:w-60 shrink-0">
      <div className="sticky top-4 space-y-2">
        <Item to="/overview" label="Overview" />
        <Item to="/bins" label="Bins" />
        <Item to="/alerts" label="Alerts" />
        <Item to="/drivers" label="Drivers" />
        <Item to="/stations" label="Stations" />
        <Item to="/trips" label="Trips" />
        <Item to="/insights" label="Insights" />
        <Item to="/queries" label="Queries" />
      </div>
    </div>
  )
}