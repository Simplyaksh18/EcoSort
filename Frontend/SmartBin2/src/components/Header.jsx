import React from 'react'

export default function Header({ onSignOut }){
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold">SW</div>
        <div>
          <h1 className="text-xl font-semibold text-green-400">Ecosort – Admin</h1>
          <p className="text-xs text-gray-500">Municipality Control Panel</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSignOut} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Sign out</button>
      </div>
    </div>
  )
}