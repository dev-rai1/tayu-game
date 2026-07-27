import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve(process.cwd(), 'src/world/Environment.jsx'), 'utf8')

describe('visible sky clouds', () => {
  it('keeps clouds higher but within the normal gameplay camera horizon', () => {
    const altitudes = [...source.matchAll(/<SkyCloud x=\{[^}]+\} y=\{([^}]+)\}/g)].map((match) => Number(match[1]))
    expect(altitudes.length).toBeGreaterThanOrEqual(10)
    expect(Math.min(...altitudes)).toBeGreaterThanOrEqual(11.5)
    expect(Math.max(...altitudes)).toBeLessThanOrEqual(14)
  })

  it('renders clouds without scene fog or lighting dimming them', () => {
    expect(source).toContain('fog={false}')
    expect(source).toContain('toneMapped={false}')
  })
})
