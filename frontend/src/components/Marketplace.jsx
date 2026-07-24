import { MARKETPLACE_ITEMS, canBuy } from '../utils/marketplaceLogic.js'
import { useGameState } from '../hooks/useGameState.jsx'

const STARS = { Common: '★☆☆☆', Uncommon: '★★☆☆', Rare: '★★★☆', Legendary: '★★★★' }

// Buy items with points; peer-to-peer trades wire through useSocket (TODO).
export default function Marketplace({ onClose }) {
  const { state, dispatch } = useGameState()

  const buy = (itemId) => {
    const res = canBuy(state, itemId)
    if (!res.ok) return
    dispatch({ type: 'ADD_POINTS', amount: -res.item.points })
    dispatch({ type: 'SET_INVENTORY', inventory: [...state.inventory, itemId] })
  }

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Marketplace</h2>
        <span className="text-highlight">Your Points: {state.points} 💰</span>
        {onClose && <button className="btn-secondary" onClick={onClose}>Exit</button>}
      </div>

      <ul className="flex flex-col gap-2">
        {MARKETPLACE_ITEMS.map((item) => {
          const owned = state.inventory.includes(item.id)
          const affordable = state.points >= item.points
          return (
            <li key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
              <span>
                <span className="font-bold">{item.name}</span>{' '}
                <span className="text-xs text-white/50">{STARS[item.rarity]} {item.rarity}</span>
                <br />
                <span className="text-sm text-white/60">{item.benefit}</span>
              </span>
              <button
                className="btn-primary disabled:opacity-40"
                disabled={owned || !affordable}
                onClick={() => buy(item.id)}
              >
                {owned ? 'Owned' : `${item.points} pts`}
              </button>
            </li>
          )
        })}
      </ul>
      {/* TODO: "Browse other players' offers" peer-trade UI via socket */}
    </section>
  )
}
