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
  STOP_ANGLES,
  STORE,
  TAX_DISTRICT,
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
    const districts = [HOME, STORE, LEMONADE, BUDGET_TOWN, BANK_DISTRICT, TAX_DISTRICT, SPROUT, PARTY_HOUSE]
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

  it('ends the normal road at Money Garden and uses one gold Finale path', () => {
    const finalModuleGate = ringPoint(STOP_ANGLES.garden)
    expect(PATHS.ring.at(-1)).toEqual(finalModuleGate)
    expect(ROYAL_APPROACH.gate).toEqual(finalModuleGate)
    expect(PATHS.royalParty[0]).toEqual(finalModuleGate)
    expect(PATHS.royalParty.at(-1)).toEqual(ROYAL_APPROACH.entrance)
    expect(PATHS.royalParty.length).toBeGreaterThanOrEqual(7)
    expect(PATHS.royalPartyLeft).toBeUndefined()
    expect(PATHS.royalPartyRight).toBeUndefined()
  })

  it('restores a short entrance path for every town module', () => {
    expect(Object.keys(PATHS).sort()).toEqual([
      'ring',
      'royalParty',
      'spurAllowance',
      'spurBank',
      'spurBudget',
      'spurGarden',
      'spurJars',
      'spurLemonade',
      'spurMarket',
      'spurTax',
    ])
    Object.entries(PATHS)
      .filter(([name]) => name.startsWith('spur'))
      .forEach(([, points]) => expect(points).toHaveLength(2))
  })

  it('uses support landmarks instead of decorative center houses', () => {
    expect(CENTER_BUILDINGS.map((building) => building.type)).toEqual(['rest', 'help', 'water', 'calm'])
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
