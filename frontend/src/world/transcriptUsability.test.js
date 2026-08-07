import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')
const storeSource = source('world/Store.jsx')
const avatarPageSource = source('pages/AvatarCreate.jsx')
const avatarOptionsSource = source('components/AvatarCustomizer.jsx')

describe('elementary transcript usability regressions', () => {
  it('lets touch users select store items and checkout directly', () => {
    expect(storeSource).toContain('onClick={(event) => openTappedItem(item, event)}')
    expect(storeSource).toContain('onClick={tapCheckout}')
    expect(storeSource).toContain('CHECKOUT • TAP OR PRESS E')
  })

  it('keeps market need/want categories hidden until the player decides', () => {
    expect(storeSource).not.toContain("const choiceType = isWant ? 'WANT' : 'NEED'")
    expect(storeSource).toContain('Keep the category hidden so the player has to decide whether the item is a need or a want.')
    expect(storeSource).toContain('cardTexture(item.name.toUpperCase(), `$${item.price}`)')
  })

  it('keeps quick-start actions above optional customization on small screens', () => {
    expect(avatarPageSource).toContain('className="card order-2 flex flex-col')
    expect(avatarPageSource).toContain('className="card order-3 !p-4')
    expect(avatarPageSource).toContain('Surprise Me & Enter')
    expect(avatarPageSource).toContain('Every appearance choice is optional')
  })

  it('collapses sensitive and detailed appearance choices', () => {
    expect(avatarOptionsSource).toContain('<details')
    expect(avatarOptionsSource).toContain('More character options')
    expect(avatarOptionsSource).toContain('Character shape')
    expect(avatarOptionsSource).not.toContain('title="Gender"')
    expect(avatarOptionsSource).not.toContain('title="Body Type"')
  })
})
