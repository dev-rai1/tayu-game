import { useEffect, useState } from 'react'

// Subscribes to leaderboard snapshots broadcast every ~3s by the server.
// `socketOn` is the `on` fn returned by useSocket.

export function useLeaderboard(socketOn) {
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    if (!socketOn) return
    const off = socketOn('leaderboard_update', (rows) => {
      // rows: [{ name, netWorth, stage, rank }] sorted desc by netWorth
      setLeaderboard(Array.isArray(rows) ? rows : [])
    })
    return off
  }, [socketOn])

  return leaderboard
}
