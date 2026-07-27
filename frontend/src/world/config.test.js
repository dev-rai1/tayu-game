import { describe, expect, it } from 'vitest'
import {
  PARTY_HOUSE,
  PATHS,
  RING,
  distanceToPaths,
  isClearOfPaths,
  ringPoint,
} from './config.js'

describe('world path separation', () => {
  it('reserves a clear buffer around the ring road', () => {
    const roadCenter = ringPoint(90)
    expect(distanceToPaths(roadCenter)).toBeLessThan(0)
    expect(isClearOfPaths(roadCenter, 0.1)).toBe(false)
  })

  it('places the finale outside the road instead of on top of it', () => {
    const radialDistance = Math.hypot(
      PARTY_HOUSE[0] - RING.c[0],
      PARTY_HOUSE[1] - RING.c[1],
    )
    expect(radialDistance).toBeGreaterThan(RING.r + 7)
  })

  it('ends the finale path at the entrance, before the building footprint', () => {
    const entrance = PATHS.spurParty.at(-1)
    const distanceToHouse = Math.hypot(
      entrance[0] - PARTY_HOUSE[0],
      entrance[1] - PARTY_HOUSE[1],
    )
    expect(distanceToHouse).toBeGreaterThanOrEqual(2.65)
  })

  it('keeps all path coordinates finite', () => {
    Object.values(PATHS).flat().flat().forEach((coordinate) => {
      expect(Number.isFinite(coordinate)).toBe(true)
    })
  })
})
