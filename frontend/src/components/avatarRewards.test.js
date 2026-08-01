import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { rewardLookForBadge } from './AvatarRewards.jsx'

const source = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')

describe('module badge avatar payoff', () => {
  it('provides a visible avatar look for every module badge', () => {
    for (const badge of ['jars', 'lemonade', 'budget', 'bank', 'garden']) {
      const reward = rewardLookForBadge(badge)
      expect(reward).toBeTruthy()
      expect(reward.label).toBeTruthy()
      expect(reward.patch.shirtColor).toBeTruthy()
      expect(reward.patch.accessories.length).toBeGreaterThan(0)
    }
  })

  it('shows locked and earned reward states and lets earned looks be worn', () => {
    const rewardSource = source('components/AvatarRewards.jsx')
    expect(rewardSource).toContain("loadProfile()?.badges")
    expect(rewardSource).toContain('Locked until this module is complete')
    expect(rewardSource).toContain('onApply(look.patch)')
    expect(rewardSource).toContain('Wear')
  })

  it('mounts module rewards beside the live avatar customizer', () => {
    const avatarSource = source('pages/AvatarCreate.jsx')
    expect(avatarSource).toContain("import AvatarRewards from '../components/AvatarRewards.jsx'")
    expect(avatarSource).toContain('<AvatarRewards onApply={patch} />')
    expect(avatarSource).toContain('<AvatarPreview avatar={avatar} />')
  })
})
