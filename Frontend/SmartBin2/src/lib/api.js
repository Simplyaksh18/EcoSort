const base = '/api'

export async function getBins(){ const r = await fetch(`${base}/bins`); return r.json() }
export async function getDrivers(){ const r = await fetch(`${base}/drivers`); return r.json() }
export async function getStations(){ const r = await fetch(`${base}/stations`); return r.json() }
export async function getTrips(){ const r = await fetch(`${base}/trips`); return r.json() }

export async function dispatchTruck({ binId, driverId, stationId }){
  const r = await fetch(`${base}/dispatch`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({binId,driverId,stationId})
  })
  if(!r.ok) throw new Error('Dispatch failed')
  return r.json()
}
export async function updateTrip(id,payload){
  const r = await fetch(`${base}/trips/${id}`,{
    method:'PATCH',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  if(!r.ok) throw new Error('Update failed')
  return r.json()
}