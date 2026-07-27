import { describe, expect, it } from 'vitest'
import {
  COMPANIES,
  COMPANY_IDS,
  COMPANY_PATH_TARGET,
  companyFacingAngle,
} from './moneyGarden.js'

describe('Money Garden storefront layout', () => {
  it('faces all three companies toward the entrance path', () => {
    COMPANY_IDS.forEach((id) => {
      const [x, z] = COMPANIES[id].pos
      const angle = companyFacingAngle([x, z])
      const targetX = COMPANY_PATH_TARGET[0] - x
      const targetZ = COMPANY_PATH_TARGET[1] - z
      const targetLength = Math.hypot(targetX, targetZ)
      const alignment = Math.sin(angle) * (targetX / targetLength)
        + Math.cos(angle) * (targetZ / targetLength)

      expect(alignment).toBeCloseTo(1, 6)
    })
  })
})
