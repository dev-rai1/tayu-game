import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RING } from './config.js'
import {
  MAX_CAMERA_DISTANCE,
  PLAYER_SAFE_RADIUS,
  WORLD_EDGE_MARGIN,
  WORLD_GROUND_RADIUS,
  clampToPlayableIsland,
} from './WorldSafety.jsx'

const source = (name) => readFileSync(resolve(process.cwd(), 'src/world', name), 'utf8')

describe('world edge and viewport safety', () => {
  it('keeps points inside the playable island unchanged', () => {
    const point = [RING.c[0] + 12, RING.c[1] - 8]
    expect(clampToPlayableIsland(...point)).toEqual(point)
  })

  it('clamps the old rectangular corner positions onto circular ground', () => {
    const [x, z] = clampToPlayableIsland(RING.c[0] + 80, RING.c[1] + 80)
    const distance = Math.hypot(x - RING.c[0], z - RING.c[1])
    expect(distance).toBeCloseTo(PLAYER_SAFE_RADIUS, 5)
  })

  it('reserves enough ground for the farthest camera orbit', () => {
    expect(PLAYER_SAFE_RADIUS + MAX_CAMERA_DISTANCE + WORLD_EDGE_MARGIN).toBe(WORLD_GROUND_RADIUS)
  })

  it('mounts both the world-edge and viewport guards after the player', () => {
    const gameWorld = source('GameWorld.jsx')
    expect(gameWorld).toContain('<CanvasViewportGuard />')
    expect(gameWorld).toContain('<WorldBoundaryGuard />')
    expect(gameWorld.indexOf('<WorldBoundaryGuard />')).toBeGreaterThan(gameWorld.indexOf('<Player avatar={avatar} />'))
  })

  it('uses dynamic viewport units and a full-size canvas', () => {
    const css = source('worldDeclutter.css')
    expect(css).toContain('height: 100dvh')
    expect(css).toContain('.tayu-world-canvas canvas')
    expect(css).toContain('height: 100% !important')
  })
})
