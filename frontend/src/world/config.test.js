import { describe, expect, it } from 'vitest'
import {
  BANK_DISTRICT,
  BUDGET_TOWN,
  DISTRICT_GAP_ANGLES,
  HOME,
  LEMONADE,
  PARTY_HOUSE,
  PATHS,
  RING,
  ROYAL_APPROACH,
  SPROUT,
  STORE,
  distanceToPaths,
  isClearOfModuleGates,
  isClearOfPaths,
  ringPoint,
} from './config.js'

describe('world path separation', () => {
  it('reserves a clear buffer around the ring road', () => {
    const roadCenter = ringPoint(90)
    expect(distanceToPaths(roadCenter)).toBeLessThan(0)
    expect(isClearOfPaths(roadCenter, 0.1)).toBe(false)
  })

  it('keeps substantial space between every major district', () => {
    const districts = [HOME, STORE, LEMONADE, BUDGET_TOWN, BANK_DISTRICT, SPROUT, PARTY_HOUSE]
    const distances = districts.flatMap((point, i) =>
      districts.slice(i + 1).map((other) => Math.hypot(point[0] - other[0], point[1] - other[1])),
    )
    expect(Math.min(...distances)).toBeGreaterThan(14)
    expect(DISTRICT_GAP_ANGLES).toHaveLength(9)
  })

  it('places the finale outside the road instead of on top of it', () => {
    const radialDistance = Math.hypot(
      PARTY_HOUSE[0] - RING.c[0],
      PARTY_HOUSE[1] - RING.c[1],
    )
    expect(radialDistance).toBeGreaterThan(RING.r + 7)
  })

  it('keeps every module gateway free of decorative scenery', () => {
    expect(isClearOfModuleGates(ringPoint(110))).toBe(false)
    expect(isClearOfModuleGates(ringPoint(120.5))).toBe(true)
  })

  it('builds a symmetrical two-sided royal finale approach', () => {
    expect(PATHS.royalPartyLeft.at(-1)).toEqual(ROYAL_APPROACH.entrance)
    expect(PATHS.royalPartyRight.at(-1)).toEqual(ROYAL_APPROACH.entrance)

    const leftRadius = Math.hypot(
      ROYAL_APPROACH.leftGate[0] - RING.c[0],
      ROYAL_APPROACH.leftGate[1] - RING.c[1],
    )
    const rightRadius = Math.hypot(
      ROYAL_APPROACH.rightGate[0] - RING.c[0],
      ROYAL_APPROACH.rightGate[1] - RING.c[1],
    )
    expect(leftRadius).toBeCloseTo(rightRadius, 6)

    const distanceToHouse = Math.hypot(
      ROYAL_APPROACH.entrance[0] - PARTY_HOUSE[0],
      ROYAL_APPROACH.entrance[1] - PARTY_HOUSE[1],
    )
    expect(distanceToHouse).toBeGreaterThanOrEqual(2.65)
  })

  it('keeps all path coordinates finite', () => {
    Object.values(PATHS).flat().flat().forEach((coordinate) => {
      expect(Number.isFinite(coordinate)).toBe(true)
    })
  })
})
