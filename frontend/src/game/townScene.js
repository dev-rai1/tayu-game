import Phaser from 'phaser'

// MoneyVille - a top-down walkable town. Buildings are "roadblocks": walk up
// and press E to interact. The scene talks to React via the Phaser registry
// (inputs: avatar, stage, paused) and game events (output: 'interact').

export const WORLD_W = 1600
export const WORLD_H = 1100
const SPEED = 230

// Functional roadblocks map to the existing Stage 1/2/3 activities.
// `stage` = which life stage this building belongs to (gates access).
// `soon` buildings show the future vision but aren't built yet.
export const BUILDINGS = [
  { id: 'bank', label: 'Allowance Bank', emoji: '🏦', x: 420, y: 300, w: 200, h: 150, color: 0x3b5bdb, stage: 1 },
  { id: 'business', label: 'Business District', emoji: '🎨', x: 1150, y: 300, w: 220, h: 160, color: 0xe8590c, stage: 2 },
  { id: 'job', label: 'Job Market', emoji: '💼', x: 780, y: 820, w: 220, h: 160, color: 0x2b8a3e, stage: 3 },
  { id: 'stocks', label: 'Stock Exchange', emoji: '📈', x: 1280, y: 760, w: 180, h: 140, color: 0x9c36b5, soon: true },
  { id: 'shop', label: 'Fashion Boutique', emoji: '👗', x: 230, y: 800, w: 180, h: 140, color: 0xc2255c, soon: true },
  { id: 'club', label: 'Nightclub', emoji: '🌃', x: 820, y: 140, w: 180, h: 130, color: 0x1864ab, soon: true },
  { id: 'homes', label: 'Housing District', emoji: '🏠', x: 1360, y: 470, w: 170, h: 140, color: 0x5c940d, soon: true },
]

export default class TownScene extends Phaser.Scene {
  constructor() {
    super('TownScene')
  }

  create() {
    const avatar = this.registry.get('avatar') || { color: '#fbbf24', icon: '🙂', name: 'You' }

    // --- Ground: grass + a simple grid + plaza ---
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H)
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x223a2a).setDepth(-10)

    const grid = this.add.grid(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 64, 64, 0x2b4a36, 1, 0x2f5440, 0.5)
    grid.setDepth(-9)

    // Central plaza + fountain (decorative social hub)
    this.add.rectangle(780, 500, 360, 280, 0x3a5a44).setDepth(-8)
    this.add.circle(780, 500, 46, 0x4dabf7).setDepth(-7)
    this.add.circle(780, 500, 30, 0x74c0fc).setDepth(-7)
    this.add.text(780, 500, '⛲', { fontSize: '40px' }).setOrigin(0.5).setDepth(-6)
    this.add.text(780, 420, 'Town Square', { fontSize: '16px', color: '#cde' }).setOrigin(0.5).setDepth(-6)

    // --- Buildings (static physics bodies) ---
    this.buildings = []
    const solids = this.physics.add.staticGroup()
    BUILDINGS.forEach((b) => {
      // shadow for faux-depth
      this.add.rectangle(b.x + 6, b.y + 10, b.w, b.h, 0x000000, 0.25).setDepth(b.y - 1)
      const rect = this.add.rectangle(b.x, b.y, b.w, b.h, b.color).setDepth(b.y)
      rect.setStrokeStyle(4, 0xffffff, b.soon ? 0.25 : 0.6)
      // roof strip
      this.add.rectangle(b.x, b.y - b.h / 2 + 14, b.w, 28, 0xffffff, 0.12).setDepth(b.y)
      this.add.text(b.x, b.y - 14, b.emoji, { fontSize: '46px' }).setOrigin(0.5).setDepth(b.y)
      const labelText = this.add.text(b.x, b.y + b.h / 2 - 16, b.label, {
        fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#0008', padding: { x: 6, y: 2 },
      }).setOrigin(0.5).setDepth(b.y)
      solids.add(rect)
      this.buildings.push({ ...b, rect, labelText })
    })

    // --- Player ---
    const colorInt = Phaser.Display.Color.HexStringToColor(avatar.color || '#fbbf24').color
    const g = this.add.graphics()
    g.fillStyle(0x000000, 0.25); g.fillEllipse(20, 36, 30, 12) // shadow
    g.fillStyle(colorInt, 1); g.fillCircle(20, 18, 16)
    g.lineStyle(3, 0xffffff, 1); g.strokeCircle(20, 18, 16)
    g.generateTexture('player', 40, 44); g.destroy()

    this.player = this.physics.add.sprite(780, 600, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(28, 28).setOffset(6, 8)
    this.face = this.add.text(780, 596, avatar.icon || '🙂', { fontSize: '20px' }).setOrigin(0.5)
    this.nameTag = this.add.text(780, 568, avatar.name || 'You', {
      fontSize: '13px', color: '#fff', backgroundColor: '#0006', padding: { x: 4, y: 1 },
    }).setOrigin(0.5)

    this.physics.add.collider(this.player, solids)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1)

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')
    this.eKey = this.input.keyboard.addKey('E')
    // Event-driven interact (fires once per real keypress; robust vs. frame polling)
    this.eKey.on('down', () => {
      if (this.registry.get('paused')) return
      if (this.nearId) this.game.events.emit('interact', this.nearId)
    })

    this.nearId = null

    // Dev-only handle for testing/debugging (stripped from production builds).
    if (import.meta.env.DEV) window.__tayuScene = this
  }

  // Called by React (PhaserGame) to inject joystick direction on mobile.
  setJoystick(vec) {
    this.joy = vec // { x, y } in [-1,1] or null
  }

  // Called by React when the mobile INTERACT button is tapped.
  triggerInteract() {
    if (this.nearId) this.game.events.emit('interact', this.nearId)
  }

  update() {
    if (!this.player) return
    const paused = this.registry.get('paused')
    const body = this.player.body

    if (paused) {
      body.setVelocity(0, 0)
    } else {
      let vx = 0, vy = 0
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1
      if (this.joy) { vx += this.joy.x; vy += this.joy.y }
      const len = Math.hypot(vx, vy) || 1
      body.setVelocity((vx / len) * SPEED, (vy / len) * SPEED)
    }

    // keep face + nametag glued to the player
    this.face.setPosition(this.player.x, this.player.y - 4)
    this.nameTag.setPosition(this.player.x, this.player.y - 32)
    this.face.setDepth(this.player.y + 1)
    this.player.setDepth(this.player.y)
    this.nameTag.setDepth(this.player.y + 1)

    // nearest interactable building
    let near = null
    let best = Infinity
    for (const b of this.buildings) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y)
      const range = Math.max(b.w, b.h) / 2 + 60
      if (d < range && d < best) { best = d; near = b }
    }
    const nearId = near?.id ?? null
    if (nearId !== this.nearId) {
      this.nearId = nearId
      this.game.events.emit('near', near ? { id: near.id, label: near.label, soon: !!near.soon, stage: near.stage } : null)
    }

  }
}
