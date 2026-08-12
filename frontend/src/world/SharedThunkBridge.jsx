import { useEffect, useRef } from 'react'
import { useGame } from './store.js'
import { playVaultThunk } from '../services/sfx.js'

export function SharedThunkBridge() {
  const lastVault = useRef(Number(useGame.getState().bk?.vault || 0))

  useEffect(() => {
    const unsubscribe = useGame.subscribe((state) => {
      const vault = Number(state.bk?.vault || 0)
      if (vault > lastVault.current) playVaultThunk()
      lastVault.current = vault
    })
    return unsubscribe
  }, [])

  return null
}
