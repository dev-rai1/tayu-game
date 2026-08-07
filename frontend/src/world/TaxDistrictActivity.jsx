import { useEffect, useMemo, useRef, useState } from 'react'
import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CharacterMesh } from './CharacterMesh.jsx'
import { labelTexture } from './textures.js'
import { PAYCHECK_MODE_EVENT, isPaycheckWorldActive } from './paycheckMode.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_POINTS, taxStationForStep, toTaxLocal } from './taxDistrictLayout.js'

function FloatingBubble({ text, accent = '#00dca0' }) {
  if (!text) return null
  return (
    <Billboard position={[0, 3.45, 0]}>
      <mesh>
        <planeGeometry args={[3.3, 0.72]} />
        <meshBasicMaterial map={labelTexture(text, { bg: '#ffffff', color: '#071748', accent })} transparent toneMapped={false} depthTest={false} />
      </mesh>
    </Billboard>
  )
}

function MovingHelper({ name, route, bubble, avatar, paperColor = '#fff8dc', speed = 0.22 }) {
  const root = useRef()
  const person = useRef()
  const paper = useRef()
  const segment = useRef(0)
  const progress = useRef(0)
  const pause = useRef(0)
  const localRoute = useMemo(() => route.map((point) => toTaxLocal(point)), [route])

  useFrame((_, delta) => {
    if (!root.current || localRoute.length < 2) return
    if (pause.current > 0) {
      pause.current -= delta
      if (person.current) person.current.rotation.z = Math.sin(Date.now() / 190) * 0.022
      return
    }
    const from = localRoute[segment.current % localRoute.length]
    const to = localRoute[(segment.current + 1) % localRoute.length]
    progress.current = Math.min(1, progress.current + delta * speed)
    const t = progress.current
    root.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      Math.abs(Math.sin(t * Math.PI * 8)) * 0.028,
      from[2] + (to[2] - from[2]) * t,
    )
    root.current.rotation.y = Math.atan2(to[0] - from[0], to[2] - from[2])
    if (paper.current) paper.current.rotation.z = Math.sin(Date.now() / 210) * 0.11
    if (t >= 1) {
      segment.current = (segment.current + 1) % localRoute.length
      progress.current = 0
      pause.current = 0.65
    }
  })

  if (!localRoute.length) return null
  return (
    <group ref={root} position={localRoute[0]}>
      <CharacterMesh ref={person} avatar={avatar} />
      <group ref={paper} position={[0.4, 1.14, 0.22]} rotation={[0.12, 0.08, -0.22]}>
        <mesh><boxGeometry args={[0.38, 0.5, 0.04]} /><meshStandardMaterial color={paperColor} /></mesh>
        <mesh position={[0, 0.12, 0.024]}><boxGeometry args={[0.24, 0.025, 0.012]} /><meshStandardMaterial color="#1464f0" /></mesh>
        <mesh position={[0, 0.03, 0.024]}><boxGeometry args={[0.2, 0.02, 0.012]} /><meshStandardMaterial color="#00b37f" /></mesh>
      </group>
      <Billboard position={[0, 2.72, 0]}>
        <mesh><planeGeometry args={[2.55, 0.55]} /><meshBasicMaterial map={labelTexture(name, { bg: '#071748', color: '#ffffff', accent: '#ff8a3d' })} transparent toneMapped={false} depthTest={false} /></mesh>
      </Billboard>
      <FloatingBubble text={bubble} />
    </group>
  )
}

function PaperConveyor({ active, pointA, pointB }) {
  const papers = useRef([])
  useFrame((_, delta) => {
    if (!active) return
    papers.current.forEach((paper, index) => {
      if (!paper) return
      paper.userData.t = ((paper.userData.t || index * 0.22) + delta * 0.11) % 1
      const t = paper.userData.t
      paper.position.set(
        pointA[0] + (pointB[0] - pointA[0]) * t,
        1.0 + Math.sin(t * Math.PI) * 0.35,
        pointA[2] + (pointB[2] - pointA[2]) * t,
      )
      paper.rotation.y = t * Math.PI * 2
    })
  })
  if (!active) return null
  return (
    <group>
      {[0, 1, 2].map((index) => (
        <mesh key={index} ref={(node) => { papers.current[index] = node }}>
          <boxGeometry args={[0.42, 0.04, 0.56]} />
          <meshStandardMaterial color={index === 1 ? '#e8f6ff' : '#fff8dc'} />
        </mesh>
      ))}
    </group>
  )
}

export function TaxDistrictActivity() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const phase = useTaxLab((state) => state.phase)
  const stepNumber = useTaxLab((state) => state.stepNumber)
  const work = useTaxLab((state) => state.work)

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  if (!active) return null

  const currentStation = taxStationForStep(stepNumber)
  const currentPoint = currentStation?.point || TAX_POINTS.guide
  const nextPoint = taxStationForStep(Math.min(6, stepNumber + 1))?.point || TAX_POINTS.filing

  const intakeBubble = phase === 'intro'
    ? 'Maya can get you started.'
    : phase === 'case'
      ? 'I am bringing fresh W-2 folders to the line.'
      : stepNumber === 1 && !work.selectedW2Fields.length
        ? 'Look for the federal boxes, not every number.'
        : 'I will carry the folder to your next station.'

  const reviewerBubble = phase === 'steps' && stepNumber === 3
    ? 'Nia is checking your bracket split.'
    : phase === 'steps' && stepNumber === 5
      ? 'Compare the two totals before deciding refund or due.'
      : phase === 'complete'
        ? 'Return accepted. Nice review work!'
        : 'I check the work after each station.'

  return (
    <group>
      <MovingHelper
        name="Owen · intake runner"
        route={phase === 'case'
          ? [TAX_POINTS.guide, TAX_POINTS.clientLeft, TAX_POINTS.clientMiddle, TAX_POINTS.clientRight]
          : [TAX_POINTS.guide, currentPoint, nextPoint]}
        bubble={intakeBubble}
        avatar={{ gender: 'male', bodyType: 'athletic', skinTone: 'deep_brown', hairStyle: 'short', hairColor: 'black', shirtColor: 'orange', pantsColor: 'navy', topStyle: 'tee', bottomStyle: 'pants' }}
        paperColor="#e8f6ff"
        speed={0.25}
      />
      <MovingHelper
        name="Priya · review helper"
        route={[TAX_POINTS.filing, TAX_POINTS.reconcile, currentPoint, TAX_POINTS.filing]}
        bubble={reviewerBubble}
        avatar={{ gender: 'female', bodyType: 'average', skinTone: 'medium_brown', hairStyle: 'long', hairColor: 'black', shirtColor: 'pink', pantsColor: 'black', topStyle: 'tee', bottomStyle: 'pants' }}
        paperColor="#fff0f6"
        speed={0.2}
      />
      <PaperConveyor
        active={phase === 'steps'}
        pointA={toTaxLocal(currentPoint)}
        pointB={toTaxLocal(nextPoint)}
      />
    </group>
  )
}
