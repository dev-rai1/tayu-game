// marketplaceLogic.js
// Catalog + trade validation for the Stage 2 marketplace.

export const MARKETPLACE_ITEMS = [
  { id: 'fancy_stand', name: 'Fancy Lemonade Stand', rarity: 'Common', points: 25, benefit: 'Aesthetics only; morale boost' },
  { id: 'efficiency_boost', name: 'Efficiency Boost', rarity: 'Uncommon', points: 75, benefit: '+10% revenue next week' },
  { id: 'professional_logo', name: 'Professional Logo', rarity: 'Rare', points: 150, benefit: 'Unlock higher pricing tiers' },
  { id: 'diamond_avatar', name: 'Diamond Avatar Skin', rarity: 'Legendary', points: 500, benefit: 'Rare cosmetic; social status' },
]

export const itemById = (id) => MARKETPLACE_ITEMS.find((i) => i.id === id)

/** Can a player afford + buy an item? */
export function canBuy(player, itemId) {
  const item = itemById(itemId)
  if (!item) return { ok: false, reason: 'unknown_item' }
  if ((player.points ?? 0) < item.points) return { ok: false, reason: 'insufficient_points' }
  return { ok: true, item }
}

/**
 * Validate a peer trade: both players must own the item they're offering.
 * Returns { ok, reason }.
 */
export function validateTrade({ playerA, itemA, playerB, itemB }) {
  if (!itemById(itemA) || !itemById(itemB)) return { ok: false, reason: 'unknown_item' }
  if (!playerA.inventory?.includes(itemA)) return { ok: false, reason: 'A_missing_item' }
  if (!playerB.inventory?.includes(itemB)) return { ok: false, reason: 'B_missing_item' }
  return { ok: true }
}

/** Pure swap - returns new inventories without mutating inputs. */
export function executeTrade({ playerA, itemA, playerB, itemB }) {
  const aInv = playerA.inventory.filter((i) => i !== itemA).concat(itemB)
  const bInv = playerB.inventory.filter((i) => i !== itemB).concat(itemA)
  return { aInventory: aInv, bInventory: bInv }
}
