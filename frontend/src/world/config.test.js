import { describe, expect, it } from 'vitest'
import {
  BANK_DISTRICT,
  BUDGET_TOWN,
  CENTER_BUILDINGS,
  DISTRICT_GAP_ANGLES,
  HOME,
  LEMONADE,
  PARTY_HOUSE,
  PATHS,
  RING,
  ROYAL_APPROACH,
  SCENERY_ZONES,
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
    expect(DISTRICT_GAP_ANGLES).toHaveLength(13)
    expect(new Set(SCENERY_ZONES.map((zone) => zone.theme)).size).toBe(SCENERY_ZONES.length)
    expect(Math.min(...DISTRICT_GAP_ANGLES)).toBeLessThan(-150)
    expect(Math.max(...DISTRICT_GAP_ANGLES)).toBeGreaterThan(150)
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

  it('starts the short finale crown immediately after the last module', () => {
    expect(ROYAL_APPROACH.leftGate).toEqual(ringPoint(2))
    expect(PATHS.royalPartyLeft.length).toBeGreaterThanOrEqual(6)
    expect(PATHS.royalPartyRight.length).toBeGreaterThanOrEqual(6)
  })

  it('keeps all center buildings outside every walking path', () => {
    CENTER_BUILDINGS.forEach(({ x, z, r }) => {
      expect(isClearOfPaths([x, z], r)).toBe(true)
    })
  })

  it('keeps all path coordinates finite', () => {
    Object.values(PATHS).flat().flat().forEach((coordinate) => {
      expect(Number.isFinite(coordinate)).toBe(true)
    })
  })
})
