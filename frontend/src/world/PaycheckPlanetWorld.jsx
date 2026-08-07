import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import { TAX_DISTRICT } from './config.js'
import { playerPos, useGame } from './store.js'
import { labelTexture } from './textures.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import {
  TAX_CASES,
  TAX_INTRO_STEPS,
  TOTAL_TAX_STEPS,
  filingStepFor,
  taxResultSummary,
  taxReturnMath,
} from '../scenarios/paycheckPlanet.js'
import {
  PAYCHECK_MODE_EVENT,
  deactivatePaycheckWorld,
  isPaycheckWorldActive,
} from './paycheckMode.js'
import './taxWorkbench.css'

export const TAX_ENTRY = [TAX_DISTRICT[0], TAX_DISTRICT[1] + 3.3]
const STATION_Z = 3.9
const PATH_START_Z = 1.35

const money = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`

const emptyWork = () => ({
  wagesFound: false,
  withheldFound: false,
  deductionApplied: false,
  firstBracketDone: false,
  secondBracketDone: false,
  creditApplied: false,
  compared: false,
  reviewW2: false,
  reviewMath: false,
  reviewResult: false,
  signed: false,
})

function worldPoint(x, z, y = 1.1) {
  return { x: TAX_DISTRICT[0] + x, y, z: TAX_DISTRICT[1] + z }
}

function pushCoins(from, to, count, prefix = 'tax') {
  const batch = {
    id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from,
    to,
    count,
  }
  useGame.setState((state) => ({ coinBatches: [...state.coinBatches, batch] }))
}

function AnimatedStation({ x, label, sublabel, accent = '#1464f0', onActivate }) {
  const group = useRef()
  const time = useRef(Math.random() * 5)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    time.current += delta
    if (!group.current) return
    group.current.position.y = 0.1 + Math.sin(time.current * 3) * 0.06
    group.current.rotation.y = Math.sin(time.current * 1.05) * 0.025
  })

  const activate = (event) => {
    event?.stopPropagation?.()
    onActivate?.()
  }

  return (
    <group ref={group} position={[x, 0, STATION_Z]}>
      <RoundedBox
        args={[2.1, 0.34, 1.55]}
        radius={0.17}
        smoothness={3}
        position={[0, 0.2, 0]}
        onClick={activate}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ''
        }}
      >
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={hovered ? 0.9 : 0.42} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.27, 0.27, 0.1, 18]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.45} metalness={0.25} />
      </mesh>
      <Billboard position={[0, 1.46, 0]}>
        <mesh>
          <planeGeometry args={[2.42, 0.68]} />
          <meshBasicMaterial map={labelTexture(label, { bg: '#071748', color: '#ffffff', accent })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      {sublabel && (
        <Billboard position={[0, 0.98, 0]}>
          <mesh>
            <planeGeometry args={[2.36, 0.55]} />
            <meshBasicMaterial map={labelTexture(sublabel, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

function ChoicePath({ x, accent = '#ff8a3d' }) {
  const dz = STATION_Z - PATH_START_Z
  const length = Math.hypot(x, dz)
  const angle = Math.atan2(x, dz)
  return (
    <mesh position={[x / 2, 0.052, (STATION_Z + PATH_START_Z) / 2]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
      <planeGeometry args={[0.42, length]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} transparent opacity={0.72} />
    </mesh>
  )
}

function CelebrationBurst({ active }) {
  const group = useRef()
  useFrame((_, delta) => {
    if (!group.current || !active) return
    group.current.rotation.y += delta * 0.65
  })
  if (!active) return null
  return (
    <group ref={group} position={[0, 4.7, 2.2]}>
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 2 + (i % 4) * 0.27
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 2) * 0.7, Math.sin(angle) * radius]} rotation={[Math.PI / 2, angle, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 14]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.75} metalness={0.35} />
          </mesh>
        )
      })}
    </group>
  )
}

function TaxMachineAnimation({ active, stepNumber, complete }) {
  const scanner = useRef()
  const paper = useRef()
  const stamp = useRef()
  const scale = useRef()
  const envelope = useRef()
  const clock = useRef(0)

  useFrame((_, delta) => {
    if (!active) return
    clock.current += delta
    const t = clock.current
    if (scanner.current) scanner.current.rotation.y = t * 1.4
    if (paper.current) {
      paper.current.position.z = 1.6 + Math.sin(t * 2.2) * 0.45
      paper.current.position.y = 1.45 + Math.sin(t * 3.4) * 0.08
    }
    if (stamp.current) stamp.current.position.y = 2.25 + Math.abs(Math.sin(t * 2.8)) * 0.42
    if (scale.current) scale.current.rotation.z = Math.sin(t * 1.8) * 0.08
    if (envelope.current) {
      envelope.current.position.y = 2.2 + Math.sin(t * 2.4) * 0.12
      envelope.current.rotation.y = Math.sin(t * 1.5) * 0.18
    }
  })

  return (
    <group position={[0, 0, 2.7]}>
      <RoundedBox args={[5.6, 0.42, 2]} radius={0.18} smoothness={3} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#0d245f" roughness={0.65} />
      </RoundedBox>
      <group ref={scanner} visible={stepNumber <= 2 && !complete} position={[-1.55, 1.15, 0]}>
        <RoundedBox args={[1.6, 1.15, 1.15]} radius={0.15} smoothness={3}>
          <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={0.25} />
        </RoundedBox>
      </group>
      <group ref={paper} visible={stepNumber <= 3 && !complete} position={[0, 1.45, 1.6]} rotation={[-0.25, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.35, 1.72, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.45, 0.05]}>
          <boxGeometry args={[0.9, 0.09, 0.02]} />
          <meshStandardMaterial color="#1464f0" />
        </mesh>
        <mesh position={[0, 0.12, 0.05]}>
          <boxGeometry args={[0.72, 0.07, 0.02]} />
          <meshStandardMaterial color="#00b37f" />
        </mesh>
      </group>
      <group ref={stamp} visible={(stepNumber === 2 || stepNumber === 4) && !complete} position={[1.55, 2.25, 0]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.4, 0.58, 18]} />
          <meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={0.2} />
        </mesh>
      </group>
      <group ref={scale} visible={stepNumber === 5 && !complete} position={[0, 1.7, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 0.14, 0.16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.35} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.15, 0.32, 1.55, 16]} />
          <meshStandardMaterial color="#071748" />
        </mesh>
      </group>
      <group ref={envelope} visible={(stepNumber === 6 || complete)} position={[0, 2.2, 0]}>
        <mesh rotation={[0, 0, -0.08]}>
          <boxGeometry args={[1.9, 1.1, 0.12]} />
          <meshStandardMaterial color={complete ? '#00dca0' : '#fff3c4'} emissive={complete ? '#00dca0' : '#000000'} emissiveIntensity={complete ? 0.25 : 0} />
        </mesh>
      </group>
    </group>
  )
}

function ModuleBoard({ headline, line }) {
  return (
    <group>
      <Billboard position={[0, 5.05, 0.72]}>
        <mesh>
          <planeGeometry args={[6.1, 0.95]} />
          <meshBasicMaterial map={labelTexture(headline, { bg: '#00dca0', color: '#071748', accent: '#ffd700' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>
      {line && (
        <Billboard position={[0, 4.48, 0.76]}>
          <mesh>
            <planeGeometry args={[5.95, 0.66]} />
            <meshBasicMaterial map={labelTexture(line, { bg: '#ffffff', color: '#071748', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}

function ProgressDots({ stepNumber }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Tax filing step ${stepNumber} of ${TOTAL_TAX_STEPS}`}>
      {Array.from({ length: TOTAL_TAX_STEPS }, (_, index) => (
        <span key={index} className={`h-2.5 rounded-full transition-all ${index + 1 === stepNumber ? 'w-8 bg-electric' : index + 1 < stepNumber ? 'w-3 bg-teal' : 'w-3 bg-navy/15'}`} />
      ))}
    </div>
  )
}

function W2Scanner({ taxCase, work, onAction }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
      <div className="tax-paper-float relative overflow-hidden rounded-3xl border-2 border-navy/10 bg-white p-5 shadow-lg">
        <div className="tax-scan-line absolute inset-x-0 h-1 bg-electric/60" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3 border-b-2 border-navy/10 pb-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-electric">Practice document</div>
            <div className="font-display text-2xl font-black">W-2 Wage Statement</div>
          </div>
          <div className="rounded-xl bg-navy px-3 py-2 text-xs font-black text-white">SAMPLE</div>
        </div>
        <p className="mt-3 text-sm font-semibold text-navy/65">Tap the two boxes you would copy onto a tax return. The scanner will send them to your workspace.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onAction('wagesFound', 'w2_box_1')} className={`min-h-[108px] rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${work.wagesFound ? 'tax-pop border-teal bg-teal/10' : 'border-electric/25 bg-[#eef8ff] hover:border-electric'}`}>
            <span className="block text-[11px] font-black uppercase tracking-wide text-navy/45">Box 1</span>
            <span className="mt-1 block text-sm font-extrabold">Wages, tips, other compensation</span>
            <span className="mt-2 block font-display text-2xl font-black">{money(taxCase.wages)}</span>
            <span className="mt-1 block text-xs font-bold text-teal">{work.wagesFound ? '✓ Sent to return' : 'Tap to scan'}</span>
          </button>
          <button type="button" onClick={() => onAction('withheldFound', 'w2_box_2')} className={`min-h-[108px] rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${work.withheldFound ? 'tax-pop border-teal bg-teal/10' : 'border-electric/25 bg-[#eef8ff] hover:border-electric'}`}>
            <span className="block text-[11px] font-black uppercase tracking-wide text-navy/45">Box 2</span>
            <span className="mt-1 block text-sm font-extrabold">Federal income tax withheld</span>
            <span className="mt-2 block font-display text-2xl font-black">{money(taxCase.withheld)}</span>
            <span className="mt-1 block text-xs font-bold text-teal">{work.withheldFound ? '✓ Sent to return' : 'Tap to scan'}</span>
          </button>
        </div>
      </div>
      <div className="rounded-3xl bg-navy p-5 text-white shadow-lg">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-teal">Your return workspace</div>
        <div className="mt-4 space-y-3">
          <div className={`rounded-2xl border p-4 transition ${work.wagesFound ? 'border-teal/70 bg-teal/10' : 'border-white/15 bg-white/5'}`}>
            <div className="text-xs font-bold text-white/55">WAGES</div>
            <div className="mt-1 font-display text-2xl font-black">{work.wagesFound ? money(taxCase.wages) : '—'}</div>
          </div>
          <div className={`rounded-2xl border p-4 transition ${work.withheldFound ? 'border-teal/70 bg-teal/10' : 'border-white/15 bg-white/5'}`}>
            <div className="text-xs font-bold text-white/55">FEDERAL TAX WITHHELD</div>
            <div className="mt-1 font-display text-2xl font-black">{work.withheldFound ? money(taxCase.withheld) : '—'}</div>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-white/70">You are copying information from a document, just like a real filing workflow.</p>
      </div>
    </div>
  )
}

function DeductionWorkbench({ math, work, onAction }) {
  return (
    <div className="rounded-3xl border-2 border-navy/10 bg-[#fffaf0] p-5 shadow-lg">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <div className="text-xs font-black text-navy/45">WAGES</div>
          <div className="font-display text-3xl font-black">{money(math.wages)}</div>
        </div>
        <div className="text-center font-display text-3xl font-black text-navy/35">−</div>
        <button type="button" onClick={() => onAction('deductionApplied', 'apply_deduction')} className={`tax-stamp-button min-h-[100px] rounded-2xl border-2 p-4 text-center transition active:scale-[0.97] ${work.deductionApplied ? 'border-teal bg-teal/10' : 'border-[#ff8a3d]/35 bg-white hover:border-[#ff8a3d]'}`}>
          <div className="text-xs font-black text-[#c95f14]">PRACTICE DEDUCTION</div>
          <div className="font-display text-3xl font-black">{money(math.deduction)}</div>
          <div className="mt-1 text-xs font-extrabold">{work.deductionApplied ? '✓ STAMPED' : 'PRESS TO APPLY'}</div>
        </button>
        <div className="text-center font-display text-3xl font-black text-navy/35">=</div>
        <div className={`rounded-2xl p-4 text-center shadow-sm transition ${work.deductionApplied ? 'tax-pop bg-teal text-navy' : 'bg-white text-navy/35'}`}>
          <div className="text-xs font-black">TAXABLE INCOME</div>
          <div className="font-display text-3xl font-black">{work.deductionApplied ? money(math.taxableIncome) : '?'}</div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-navy/65">The deduction reduces the amount of income that goes into the tax brackets.</p>
    </div>
  )
}

function BracketMachine({ math, work, onAction }) {
  const firstTax = Math.round(math.firstBracketIncome * 0.10)
  const secondTax = Math.round(math.secondBracketIncome * 0.12)
  const needsSecond = math.secondBracketIncome > 0
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button type="button" onClick={() => onAction('firstBracketDone', 'run_10_percent_bracket')} className={`relative overflow-hidden rounded-3xl border-2 p-5 text-left transition active:scale-[0.98] ${work.firstBracketDone ? 'border-teal bg-teal/10' : 'border-electric/25 bg-white hover:border-electric'}`}>
        {work.firstBracketDone && <div className="tax-coin-flow absolute right-5 top-5 text-3xl" aria-hidden="true">● ● ●</div>}
        <div className="text-xs font-black uppercase tracking-[0.14em] text-electric">Bracket lane 1</div>
        <div className="mt-1 font-display text-3xl font-black">10%</div>
        <p className="mt-2 font-semibold text-navy/70">Send the first {money(math.firstBracketIncome)} of taxable income through this lane.</p>
        <div className="mt-4 rounded-2xl bg-navy p-4 text-white">
          {money(math.firstBracketIncome)} × 10% = <strong className="text-sun">{work.firstBracketDone ? money(firstTax) : 'run lane'}</strong>
        </div>
      </button>
      <button type="button" disabled={!needsSecond || !work.firstBracketDone} onClick={() => onAction('secondBracketDone', 'run_12_percent_bracket')} className={`relative overflow-hidden rounded-3xl border-2 p-5 text-left transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${work.secondBracketDone || !needsSecond ? 'border-teal bg-teal/10' : 'border-brandpurple/25 bg-white hover:border-brandpurple'}`}>
        {work.secondBracketDone && <div className="tax-coin-flow absolute right-5 top-5 text-3xl" aria-hidden="true">● ●</div>}
        <div className="text-xs font-black uppercase tracking-[0.14em] text-brandpurple">Bracket lane 2</div>
        <div className="mt-1 font-display text-3xl font-black">12%</div>
        <p className="mt-2 font-semibold text-navy/70">{needsSecond ? `Only the next ${money(math.secondBracketIncome)} goes through this lane.` : 'There is no income left for this bracket in this case.'}</p>
        <div className="mt-4 rounded-2xl bg-navy p-4 text-white">
          {money(math.secondBracketIncome)} × 12% = <strong className="text-sun">{!needsSecond ? '$0' : work.secondBracketDone ? money(secondTax) : 'locked'}</strong>
        </div>
      </button>
      <div className={`md:col-span-2 rounded-3xl border-2 p-5 text-center transition ${work.firstBracketDone && (!needsSecond || work.secondBracketDone) ? 'tax-pop border-teal bg-teal/10' : 'border-navy/10 bg-white'}`}>
        <div className="text-xs font-black uppercase tracking-[0.14em] text-navy/45">Tax before credits</div>
        <div className="mt-1 font-display text-4xl font-black">{work.firstBracketDone && (!needsSecond || work.secondBracketDone) ? money(math.taxBeforeCredits) : 'Run the bracket lanes'}</div>
      </div>
    </div>
  )
}

function CreditStation({ math, work, onAction }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-navy/10 bg-white p-6 shadow-lg">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-3xl bg-navy p-5 text-center text-white">
          <div className="text-xs font-black text-white/55">TAX BEFORE CREDIT</div>
          <div className="font-display text-4xl font-black">{money(math.taxBeforeCredits)}</div>
        </div>
        <button type="button" onClick={() => onAction('creditApplied', 'apply_tax_credit')} className={`tax-credit-token relative z-10 grid min-h-[120px] min-w-[120px] place-items-center rounded-full border-4 border-dashed font-black shadow-xl transition active:scale-90 ${work.creditApplied ? 'tax-credit-slide border-teal bg-teal text-navy' : 'border-[#ff8a3d] bg-sun text-navy'}`}>
          <span><span className="block text-xs">CREDIT</span><span className="font-display text-2xl">−{money(math.credit)}</span><span className="mt-1 block text-[10px]">{work.creditApplied ? 'APPLIED ✓' : 'TAP ME'}</span></span>
        </button>
        <div className={`rounded-3xl p-5 text-center transition ${work.creditApplied ? 'tax-pop bg-teal text-navy' : 'bg-navy/5 text-navy/35'}`}>
          <div className="text-xs font-black">FINAL TAX</div>
          <div className="font-display text-4xl font-black">{work.creditApplied ? money(math.finalTax) : '?'}</div>
        </div>
      </div>
      <p className="mt-5 text-center text-sm font-semibold text-navy/65">A tax credit comes off the tax itself after the bracket calculation.</p>
    </div>
  )
}

function ReconcileScale({ math, work, onAction }) {
  const result = math.refund > 0 ? `${money(math.refund)} refund` : math.amountDue > 0 ? `${money(math.amountDue)} amount due` : '$0 even'
  return (
    <div className="rounded-3xl border-2 border-navy/10 bg-[#eef8ff] p-6 shadow-lg">
      <div className={`tax-balance mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] items-end gap-4 ${work.compared ? (math.refund >= math.amountDue ? 'tax-balance-left' : 'tax-balance-right') : ''}`}>
        <div className="rounded-3xl bg-electric p-5 text-center text-white shadow-lg">
          <div className="text-xs font-black text-white/65">ALREADY WITHHELD</div>
          <div className="font-display text-4xl font-black">{money(math.withheld)}</div>
        </div>
        <div className="pb-4 font-display text-3xl font-black text-navy/35">VS</div>
        <div className="rounded-3xl bg-navy p-5 text-center text-white shadow-lg">
          <div className="text-xs font-black text-white/65">FINAL TAX</div>
          <div className="font-display text-4xl font-black">{money(math.finalTax)}</div>
        </div>
      </div>
      <button type="button" onClick={() => onAction('compared', 'compare_withholding_to_tax')} className="mx-auto mt-5 block min-h-[54px] w-full max-w-md rounded-2xl bg-electric px-6 font-extrabold text-white active:scale-[0.99]">
        {work.compared ? 'Compared ✓' : 'Compare the two totals'}
      </button>
      {work.compared && (
        <div className="tax-pop mx-auto mt-5 max-w-xl rounded-3xl bg-teal p-5 text-center text-navy shadow-lg">
          <div className="text-xs font-black uppercase tracking-[0.16em]">Practice return result</div>
          <div className="mt-1 font-display text-4xl font-black">{result}</div>
          <p className="mt-2 font-semibold">{math.refund > 0 ? 'More was withheld than the final tax, so the difference comes back.' : math.amountDue > 0 ? 'The final tax is larger than withholding, so the difference is still due.' : 'Withholding exactly matches final tax.'}</p>
        </div>
      )}
    </div>
  )
}

function FilingDesk({ math, work, onReview, onSign }) {
  const rows = [
    ['reviewW2', 'W-2 copied', `${money(math.wages)} wages · ${money(math.withheld)} withheld`],
    ['reviewMath', 'Tax math checked', `${money(math.taxableIncome)} taxable · ${money(math.finalTax)} final tax`],
    ['reviewResult', 'Refund / due checked', math.refund > 0 ? `${money(math.refund)} refund` : math.amountDue > 0 ? `${money(math.amountDue)} amount due` : '$0 even'],
  ]
  const ready = work.reviewW2 && work.reviewMath && work.reviewResult
  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border-2 border-navy/10 bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-navy/10 pb-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.15em] text-electric">Practice tax return</div>
            <div className="font-display text-2xl font-black">Final review</div>
          </div>
          <div className="rounded-xl bg-sun px-3 py-2 text-xs font-black text-navy">NOT REAL TAX FILING</div>
        </div>
        <div className="mt-4 space-y-3">
          {rows.map(([key, label, detail]) => (
            <button key={key} type="button" onClick={() => onReview(key)} className={`w-full rounded-2xl border-2 p-4 text-left transition active:scale-[0.99] ${work[key] ? 'border-teal bg-teal/10' : 'border-navy/10 hover:border-electric'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-navy/60">{detail}</div>
                </div>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-black ${work[key] ? 'bg-teal text-navy' : 'bg-navy/10 text-navy/35'}`}>{work[key] ? '✓' : '○'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-navy p-5 text-white shadow-lg">
        <div className="text-xs font-black uppercase tracking-[0.15em] text-teal">E-file station</div>
        <div className="tax-envelope mt-5 rounded-2xl border-2 border-dashed border-sun/70 bg-white/10 p-5 text-center">
          <div className="text-5xl" aria-hidden="true">✉</div>
          <div className="mt-2 font-display text-xl font-black">Practice return packet</div>
        </div>
        <button type="button" disabled={!ready || work.signed} onClick={onSign} className="mt-5 min-h-[56px] w-full rounded-2xl bg-teal px-5 text-lg font-black text-navy transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
          {work.signed ? 'Sending practice return…' : ready ? 'Sign & file practice return' : 'Check all 3 items first'}
        </button>
        {work.signed && <div className="tax-envelope-fly mt-3 text-center text-sm font-extrabold text-teal">Packet sent to the practice filing desk →</div>}
      </div>
    </div>
  )
}

function TaxStepWorkspace({ taxCase, stepNumber, work, onAction, onReview, onSign, onNext }) {
  const math = taxReturnMath(taxCase)
  const meta = filingStepFor(taxCase, stepNumber)
  const [hintOpen, setHintOpen] = useState(false)

  useEffect(() => setHintOpen(false), [stepNumber])

  const ready = stepNumber === 1
    ? work.wagesFound && work.withheldFound
    : stepNumber === 2
      ? work.deductionApplied
      : stepNumber === 3
        ? work.firstBracketDone && (math.secondBracketIncome === 0 || work.secondBracketDone)
        : stepNumber === 4
          ? work.creditApplied
          : stepNumber === 5
            ? work.compared
            : false

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-electric">{meta.eyebrow}</div>
          <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">{meta.title}</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold text-navy/65">Do the action on the workbench. There are no A/B/C quiz answers.</p>
        </div>
        <ProgressDots stepNumber={stepNumber} />
      </div>

      <div className="mt-5">
        {stepNumber === 1 && <W2Scanner taxCase={taxCase} work={work} onAction={onAction} />}
        {stepNumber === 2 && <DeductionWorkbench math={math} work={work} onAction={onAction} />}
        {stepNumber === 3 && <BracketMachine math={math} work={work} onAction={onAction} />}
        {stepNumber === 4 && <CreditStation math={math} work={work} onAction={onAction} />}
        {stepNumber === 5 && <ReconcileScale math={math} work={work} onAction={onAction} />}
        {stepNumber === 6 && <FilingDesk math={math} work={work} onReview={onReview} onSign={onSign} />}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setHintOpen((value) => !value)} className="min-h-[44px] rounded-xl border-2 border-electric/20 bg-electric/5 px-4 text-sm font-extrabold text-electric active:scale-[0.99]">
          {hintOpen ? 'Hide hint' : 'Need a hint?'}
        </button>
        {stepNumber < 6 && (
          <button type="button" disabled={!ready} onClick={onNext} className="min-h-[50px] rounded-xl bg-electric px-6 font-extrabold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">
            {ready ? 'Continue to next filing step' : 'Finish the workbench action first'}
          </button>
        )}
      </div>

      {hintOpen && (
        <div className="tax-pop mt-3 rounded-2xl border border-electric/20 bg-[#eef8ff] p-4 text-sm font-semibold leading-relaxed text-navy/75" role="note">
          <strong className="text-electric">Hint:</strong> {meta.hint}
        </div>
      )}
    </>
  )
}

function TaxWorkbenchPanel({ phase, taxCase, stepNumber, work, onStart, onChooseCase, onAction, onReview, onSign, onNext, onFinish }) {
  if (typeof document === 'undefined') return null
  const math = taxReturnMath(taxCase)
  const isComplete = phase === 'complete'

  return createPortal(
    <div data-tax-workbench="true" className="fixed inset-0 z-[1000] overflow-y-auto bg-navy/30 p-3 backdrop-blur-[2px] sm:p-5">
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center py-2 sm:py-5">
        <section role="dialog" aria-modal="true" aria-label={isComplete ? 'Module 5 complete' : 'Interactive tax filing workbench'} className="tax-workbench-enter w-full rounded-[2rem] border-2 border-white/40 bg-[#fffdf8] p-4 text-navy shadow-2xl sm:p-6">
          {phase === 'intro' && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Module 5 · Tax Filing Lab</div>
                  <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Work through a tax return</h1>
                </div>
                <div className="rounded-2xl bg-teal/15 px-4 py-2 text-sm font-black text-[#08785e]">Hands-on simulation</div>
              </div>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-navy/70 sm:text-lg">Instead of taking a quiz, you will scan a W-2, stamp in a deduction, run income through tax brackets, apply a credit, balance withholding against tax, and send a practice return.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {TAX_INTRO_STEPS.map((line, index) => (
                  <div key={line} className="rounded-2xl border border-navy/10 bg-white p-3 shadow-sm">
                    <span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full bg-electric font-black text-white">{index + 1}</span>
                    <span className="text-sm font-semibold leading-snug">{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-sun/50 bg-sun/15 p-3 text-sm font-semibold">Practice values are intentionally simplified and are not current real-world tax rules.</div>
              <button type="button" onClick={onStart} className="mt-5 min-h-[56px] w-full rounded-2xl bg-electric px-5 text-lg font-black text-white active:scale-[0.99]">Enter the filing workbench</button>
            </>
          )}

          {phase === 'case' && (
            <>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Choose a practice folder</div>
              <h2 className="mt-1 font-display text-3xl font-black">Open one W-2 folder</h2>
              <p className="mt-2 font-semibold text-navy/65">This only changes the numbers in your simulation. It is not a quiz question.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {TAX_CASES.map((item) => (
                  <button key={item.id} type="button" onClick={() => onChooseCase(item)} className="tax-folder min-h-[180px] rounded-3xl border-2 border-electric/20 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-electric hover:shadow-lg active:scale-[0.98]">
                    <div className="text-4xl" aria-hidden="true">📁</div>
                    <div className="mt-3 text-xs font-black uppercase tracking-wide text-electric">{item.label}</div>
                    <div className="mt-2 font-display text-2xl font-black">{money(item.wages)} wages</div>
                    <div className="text-sm font-bold text-navy/60">{money(item.withheld)} already withheld</div>
                    <div className="mt-3 text-xs font-semibold text-navy/50">{item.note}</div>
                    <div className="mt-3 text-sm font-black text-teal">Open folder →</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'steps' && taxCase && (
            <TaxStepWorkspace taxCase={taxCase} stepNumber={stepNumber} work={work} onAction={onAction} onReview={onReview} onSign={onSign} onNext={onNext} />
          )}

          {isComplete && taxCase && (
            <div className="text-center">
              <div className="tax-complete-pulse mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal text-4xl font-black text-navy">✓</div>
              <div className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-teal">Module 5 complete</div>
              <h2 className="mt-1 font-display text-4xl font-black">Practice return filed</h2>
              <p className="mt-2 font-extrabold text-electric">{taxResultSummary(taxCase)}</p>
              <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-2 rounded-3xl bg-[#eef8ff] p-4 text-left text-sm sm:grid-cols-3">
                <div><span className="block text-navy/45">Wages</span><strong>{money(math.wages)}</strong></div>
                <div><span className="block text-navy/45">Taxable income</span><strong>{money(math.taxableIncome)}</strong></div>
                <div><span className="block text-navy/45">Final tax</span><strong>{money(math.finalTax)}</strong></div>
                <div><span className="block text-navy/45">Withheld</span><strong>{money(math.withheld)}</strong></div>
                <div><span className="block text-navy/45">Refund</span><strong>{money(math.refund)}</strong></div>
                <div><span className="block text-navy/45">Amount due</span><strong>{money(math.amountDue)}</strong></div>
              </div>
              <p className="mx-auto mt-4 max-w-2xl font-semibold leading-relaxed text-navy/65">You completed the workflow by doing the filing actions, not by choosing multiple-choice answers.</p>
              <button type="button" onClick={onFinish} className="mt-5 min-h-[56px] w-full max-w-md rounded-2xl bg-electric px-5 text-lg font-black text-white active:scale-[0.99]">Finish Module 5</button>
            </div>
          )}
        </section>
      </div>
    </div>,
    document.body,
  )
}

export function PaycheckPlanetWorld() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const [phase, setPhase] = useState('intro')
  const [taxCase, setTaxCase] = useState(null)
  const [stepNumber, setStepNumber] = useState(1)
  const [work, setWork] = useState(() => emptyWork())
  const loadedSessionRef = useRef(false)

  const currentStep = useMemo(() => (taxCase ? filingStepFor(taxCase, stepNumber) : null), [stepNumber, taxCase])

  const restoreOrStart = useCallback(() => {
    const profile = loadProfile() || {}
    const saved = profile.taxLabProgress
    const savedCase = TAX_CASES.find((item) => item.id === saved?.caseId) || null

    if (saved && !saved.completed && savedCase) {
      setTaxCase(savedCase)
      setStepNumber(Math.max(1, Math.min(TOTAL_TAX_STEPS, Number(saved.stepNumber || 1))))
      setPhase(saved.phase === 'steps' ? 'steps' : 'case')
      setWork(emptyWork())
      return
    }

    setPhase('intro')
    setTaxCase(null)
    setStepNumber(1)
    setWork(emptyWork())
  }, [])

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!active) {
      loadedSessionRef.current = false
      return
    }
    if (loadedSessionRef.current) return
    loadedSessionRef.current = true
    restoreOrStart()
    recordLearningEvent({ moduleName: 'tax', type: 'module_start', outcome: 'started', detail: 'interactive_tax_workbench' }).catch(() => {})
  }, [active, restoreOrStart])

  useEffect(() => {
    if (!active || !loadedSessionRef.current || phase === 'complete') return
    saveProfile({
      taxLabProgress: {
        phase,
        caseId: taxCase?.id || null,
        stepNumber,
        completed: false,
      },
    })
  }, [active, phase, stepNumber, taxCase?.id])

  const startReturn = useCallback(() => {
    setPhase('case')
    setWork(emptyWork())
  }, [])

  const chooseCase = useCallback((selected) => {
    if (!selected) return
    setTaxCase(selected)
    setStepNumber(1)
    setWork(emptyWork())
    setPhase('steps')
    pushCoins(worldPoint(selected.x, STATION_Z), { x: playerPos.x, y: 1.1, z: playerPos.z }, 8, 'w2-folder')
    recordLearningEvent({ moduleName: 'tax', type: 'w2_case_choice', outcome: selected.id, detail: `wages=${selected.wages};withheld=${selected.withheld}` }).catch(() => {})
  }, [])

  const recordInteraction = useCallback((outcome) => {
    recordLearningEvent({ moduleName: 'tax', type: 'tax_workbench_action', outcome, detail: `step=${stepNumber};case=${taxCase?.id || 'none'}` }).catch(() => {})
  }, [stepNumber, taxCase?.id])

  const doAction = useCallback((key, outcome) => {
    setWork((state) => (state[key] ? state : { ...state, [key]: true }))
    recordInteraction(outcome)
    if (key === 'firstBracketDone' || key === 'secondBracketDone' || key === 'creditApplied' || key === 'compared') {
      pushCoins(worldPoint(0, STATION_Z, 1.25), { x: playerPos.x, y: 1.1, z: playerPos.z }, 5, `tax-${key}`)
    }
  }, [recordInteraction])

  const doReview = useCallback((key) => {
    setWork((state) => ({ ...state, [key]: !state[key] }))
    recordInteraction(key)
  }, [recordInteraction])

  const signReturn = useCallback(() => {
    setWork((state) => ({ ...state, signed: true }))
    recordInteraction('sign_and_file')
  }, [recordInteraction])

  const finishReturn = useCallback(() => {
    if (!taxCase) return
    const profile = loadProfile() || {}
    const result = taxReturnMath(taxCase)
    saveProfile({
      badges: [...new Set([...(profile.badges || []), 'tax'])],
      taxLab: {
        caseId: taxCase.id,
        wages: result.wages,
        withheld: result.withheld,
        deduction: result.deduction,
        taxableIncome: result.taxableIncome,
        taxBeforeCredits: result.taxBeforeCredits,
        credit: result.credit,
        finalTax: result.finalTax,
        refund: result.refund,
        amountDue: result.amountDue,
        stepsCompleted: TOTAL_TAX_STEPS,
        completedAt: new Date().toISOString(),
      },
      taxLabProgress: {
        phase: 'complete',
        caseId: taxCase.id,
        stepNumber: TOTAL_TAX_STEPS,
        completed: true,
      },
    })
    setPhase('complete')
    pushCoins(worldPoint(0, STATION_Z, 1.7), { x: playerPos.x, y: 1.1, z: playerPos.z }, 14, 'tax-complete')
    recordLearningEvent({ moduleName: 'tax', type: 'module_complete', outcome: 'completed', detail: `interactive_tax_filing;case=${taxCase.id};finalTax=${result.finalTax};refund=${result.refund};due=${result.amountDue}` }).catch(() => {})
  }, [taxCase])

  useEffect(() => {
    if (!active || phase !== 'steps' || stepNumber !== TOTAL_TAX_STEPS || !work.signed) return undefined
    const timer = setTimeout(finishReturn, 1250)
    return () => clearTimeout(timer)
  }, [active, finishReturn, phase, stepNumber, work.signed])

  const nextStep = useCallback(() => {
    setStepNumber((value) => Math.min(TOTAL_TAX_STEPS, value + 1))
  }, [])

  const finishModule = useCallback(() => {
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    deactivatePaycheckWorld()
  }, [])

  const stations = phase === 'case'
    ? TAX_CASES.map((item) => ({ id: item.id, x: item.x, label: item.label, sublabel: `${money(item.wages)} WAGES`, action: () => chooseCase(item) }))
    : []

  const boardHeadline = !active
    ? 'PAYCHECK PLANET · TAX FILING LAB'
    : phase === 'intro' ? 'MODULE 5 · INTERACTIVE TAX WORKBENCH'
      : phase === 'case' ? 'OPEN A PRACTICE W-2 FOLDER'
        : phase === 'steps' ? `FILING STEP ${stepNumber} OF ${TOTAL_TAX_STEPS}`
          : 'PRACTICE RETURN FILED'

  const boardLine = !active
    ? 'SCAN · CALCULATE · APPLY · COMPARE · FILE'
    : phase === 'intro' ? 'Hands-on filing simulation'
      : phase === 'case' ? 'Three folders · three different tax outcomes'
        : phase === 'steps' && currentStep ? currentStep.title.toUpperCase()
          : taxResultSummary(taxCase)

  return (
    <group position={[TAX_DISTRICT[0], 0, TAX_DISTRICT[1]]}>
      <mesh position={[0, 0.025, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 32]} />
        <meshStandardMaterial color="#fff0dc" roughness={1} />
      </mesh>
      <mesh position={[0, 0.032, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.4, 5.9, 32]} />
        <meshStandardMaterial color="#ff8a3d" roughness={1} />
      </mesh>

      <RoundedBox args={[6.2, 4.2, 3.6]} radius={0.28} smoothness={4} position={[0, 2.1, -0.8]} castShadow>
        <meshPhysicalMaterial color="#ffb36f" roughness={0.5} clearcoat={0.35} />
      </RoundedBox>
      <RoundedBox args={[6.7, 0.7, 4.1]} radius={0.22} smoothness={4} position={[0, 4.35, -0.8]} castShadow>
        <meshStandardMaterial color="#071748" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.55, 2.55, 0.18]} radius={0.12} smoothness={3} position={[0, 1.35, 1.04]} castShadow>
        <meshStandardMaterial color="#1464f0" emissive="#1464f0" emissiveIntensity={active ? 0.42 : 0.12} />
      </RoundedBox>
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 2.25, 1.03]}>
          <planeGeometry args={[1.35, 1.35]} />
          <meshStandardMaterial color="#d8f3ff" emissive="#9bdfff" emissiveIntensity={0.18} />
        </mesh>
      ))}

      <Billboard position={[0, 6.15, 0]}>
        <mesh>
          <planeGeometry args={[6.8, 1.55]} />
          <meshBasicMaterial map={labelTexture('PAYCHECK PLANET · TAX LAB', { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} />
        </mesh>
      </Billboard>

      <ModuleBoard headline={boardHeadline} line={boardLine} />
      <TaxMachineAnimation active={active} stepNumber={stepNumber} complete={phase === 'complete'} />

      {active && stations.map((station, index) => <ChoicePath key={`path-${station.id}-${index}`} x={station.x} />)}
      {active && stations.map((station) => (
        <AnimatedStation key={station.id} x={station.x} label={station.label} sublabel={station.sublabel} accent="#ff8a3d" onActivate={station.action} />
      ))}

      {active && (
        <TaxWorkbenchPanel
          phase={phase}
          taxCase={taxCase}
          stepNumber={stepNumber}
          work={work}
          onStart={startReturn}
          onChooseCase={chooseCase}
          onAction={doAction}
          onReview={doReview}
          onSign={signReturn}
          onNext={nextStep}
          onFinish={finishModule}
        />
      )}

      <CelebrationBurst active={active && phase === 'complete'} />
    </group>
  )
}
