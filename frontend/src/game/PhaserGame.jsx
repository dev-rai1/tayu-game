import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import TownScene, { WORLD_W, WORLD_H } from './townScene.js'

// Mounts a single Phaser game and bridges it to React.
//  props.avatar  -> injected into the scene registry
//  props.stage   -> current life stage (for building gating visuals)
//  props.paused  -> halts movement (modal open)
//  props.onNear(building|null), props.onInteract(id) -> scene events
// Exposes a ref API for the mobile controls: { joystick(vec), interact() }.
export default function PhaserGame({ avatar, stage, paused, onNear, onInteract, controlsRef }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const cbRef = useRef({ onNear, onInteract })
  cbRef.current = { onNear, onInteract }

  // Create the game once.
  useEffect(() => {
    if (gameRef.current || !containerRef.current) return
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#1b3326',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
      },
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: [TownScene],
    })
    gameRef.current = game
    game.registry.set('avatar', avatar)
    game.registry.set('stage', stage)
    game.registry.set('paused', paused)

    game.events.on('near', (b) => cbRef.current.onNear?.(b))
    game.events.on('interact', (id) => cbRef.current.onInteract?.(id))

    // Expose mobile-control hooks
    if (controlsRef) {
      controlsRef.current = {
        joystick: (vec) => game.scene.getScene('TownScene')?.setJoystick(vec),
        interact: () => game.scene.getScene('TownScene')?.triggerInteract(),
      }
    }

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push reactive props into the registry.
  useEffect(() => { gameRef.current?.registry.set('paused', paused) }, [paused])
  useEffect(() => { gameRef.current?.registry.set('stage', stage) }, [stage])
  useEffect(() => { gameRef.current?.registry.set('avatar', avatar) }, [avatar])

  return <div ref={containerRef} className="absolute inset-0" data-world-w={WORLD_W} data-world-h={WORLD_H} />
}
