import { useMemo, useState } from 'react'
import { useGame } from './store.js'
import { BOND_STEPS, TAX_STEPS } from '../scenarios/bondTaxFlow.js'

const money = (s='') => Number(String(s).replace(/[^0-9.\-]/g,''))
const accent = { 6:'#f4b942', 7:'#d86b45' }

function Feedback({ card, act }) {
  const btn = card?.buttons?.[0]
  if (!card || !/^(bondfb|taxfb)/.test(String(card.id))) return null
  return <div className="pointer-events-auto absolute left-1/2 top-[112px] z-[345] w-[min(92vw,36rem)] -translate-x-1/2 rounded-[28px] border-2 border-white/70 bg-[#fffdf7]/95 p-5 shadow-2xl backdrop-blur-xl">
    <div className="text-xs font-black uppercase tracking-[.18em] text-navy/50">Coach feedback</div>
    <div className="mt-2 text-lg font-extrabold leading-snug text-navy">{card.text}</div>
    <button onClick={()=>act(btn?.act)} className="mt-4 min-h-[48px] rounded-2xl border-2 border-navy/15 bg-white px-5 font-extrabold text-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95">{btn?.label || 'Continue'}</button>
  </div>
}

function NumericChallenge({ step, onPick, unit='' }) {
  const correctIndex = step.choices.findIndex(c=>c.correct)
  const expected = money(step.choices[correctIndex]?.label)
  const [value,setValue] = useState('')
  const [shake,setShake] = useState(false)
  const submit=()=>{ const n=Number(value); if(!Number.isFinite(n)) return; if(Math.abs(n-expected) < Math.max(.011,Math.abs(expected)*.003)) onPick(correctIndex); else {setShake(true);setTimeout(()=>setShake(false),420); const wrong=step.choices.findIndex((c,i)=>i!==correctIndex); onPick(wrong<0?0:wrong)} }
  return <div className={`mt-5 rounded-[24px] border-2 border-navy/10 bg-white/80 p-5 ${shake?'animate-pulse':''}`}>
    <div className="text-sm font-extrabold text-navy/60">Work it out, then type the number.</div>
    <div className="mt-3 flex items-center gap-3">
      <input autoFocus inputMode="decimal" value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Type your answer" className="min-w-0 flex-1 rounded-2xl border-2 border-navy/15 bg-[#fffaf0] px-4 py-4 text-2xl font-black text-navy outline-none transition focus:border-[#f4b942] focus:ring-4 focus:ring-[#f4b942]/15" />
      {unit&&<span className="text-xl font-black text-navy/50">{unit}</span>}
      <button onClick={submit} className="rounded-2xl border-2 border-navy/15 bg-navy px-5 py-4 font-black text-white shadow-lg active:scale-95">Check</button>
    </div>
  </div>
}

function DragChoice({ step, onPick }) {
  const [over,setOver] = useState(false)
  const drop=(e)=>{e.preventDefault();setOver(false);const i=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(i))onPick(i)}
  return <div className="mt-5 grid gap-4 md:grid-cols-[1fr_.8fr]">
    <div className="grid gap-2">
      {step.choices.map((c,i)=><div key={c.label} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',String(i))} className="cursor-grab rounded-2xl border-2 border-navy/10 bg-[#fffaf0] px-4 py-3 font-bold text-navy shadow-sm transition hover:-translate-y-0.5 hover:rotate-[.3deg] hover:shadow-md active:cursor-grabbing">↕ {c.label}</div>)}
    </div>
    <div onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={drop} className={`grid min-h-[150px] place-items-center rounded-[26px] border-[3px] border-dashed p-5 text-center transition ${over?'scale-[1.02] border-[#f4b942] bg-[#fff0bd]':'border-navy/20 bg-white/55'}`}>
      <div><div className="text-4xl">🧺</div><div className="mt-2 font-black text-navy">Drag your answer here</div><div className="text-xs font-bold text-navy/45">All cards use the same neutral color — no answer hint.</div></div>
    </div>
  </div>
}

function AllocationChallenge({ onPick }) {
  const [t,setT]=useState(100),[m,setM]=useState(100),[c,setC]=useState(100)
  const total=t+m+c
  const correct=150+90+60
  const check=()=>onPick(t===150&&m===90&&c===60?0:1)
  const row=(label,val,set,color)=><div className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3"><b className="text-sm text-navy">{label}</b><input type="range" min="0" max="300" step="10" value={val} onChange={e=>set(Number(e.target.value))} style={{accentColor:color}}/><span className="rounded-xl bg-white px-2 py-1 text-center font-black text-navy">${val}</span></div>
  return <div className="mt-5 rounded-[26px] border-2 border-navy/10 bg-[#fffaf0]/90 p-5"><div className="mb-4 flex items-center justify-between"><b className="text-navy">Build a $300 bond mix</b><span className={`rounded-full px-3 py-1 text-sm font-black ${total===correct?'bg-teal/20 text-navy':'bg-orange-100 text-orange-800'}`}>Total ${total}</span></div><div className="grid gap-4">{row('Treasury',t,setT,'#4267b2')}{row('Municipal',m,setM,'#2c9a72')}{row('Corporate',c,setC,'#d9763f')}</div><button onClick={check} disabled={total!==300} className="mt-5 rounded-2xl bg-navy px-5 py-3 font-black text-white disabled:opacity-35">Lock portfolio</button></div>
}

function TaxSort({ onPick }) {
  const [muni,setMuni]=useState(null),[corp,setCorp]=useState(null)
  const Card=({name,amt,set})=><div className="rounded-2xl border-2 border-navy/10 bg-white p-3 shadow-sm"><b className="text-navy">{name}</b><div className="text-2xl font-black text-navy">${amt}</div><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={()=>set('taxable')} className={`rounded-xl border-2 p-2 text-xs font-black ${set===null?'':''}`}>TAXABLE</button><button onClick={()=>set('excluded')} className="rounded-xl border-2 p-2 text-xs font-black">EXCLUDED</button></div></div>
  return <div className="mt-5 rounded-[26px] border-2 border-navy/10 bg-[#f9f5ec] p-5"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-3"><b>Municipal interest</b><div className="text-2xl font-black">$40</div><div className="mt-2 flex gap-2"><button onClick={()=>setMuni('taxable')} className={`flex-1 rounded-xl border-2 p-2 text-xs font-black ${muni==='taxable'?'border-navy bg-navy text-white':'border-navy/15'}`}>TAXABLE</button><button onClick={()=>setMuni('excluded')} className={`flex-1 rounded-xl border-2 p-2 text-xs font-black ${muni==='excluded'?'border-navy bg-navy text-white':'border-navy/15'}`}>EXCLUDED</button></div></div><div className="rounded-2xl bg-white p-3"><b>Corporate interest</b><div className="text-2xl font-black">$20</div><div className="mt-2 flex gap-2"><button onClick={()=>setCorp('taxable')} className={`flex-1 rounded-xl border-2 p-2 text-xs font-black ${corp==='taxable'?'border-navy bg-navy text-white':'border-navy/15'}`}>TAXABLE</button><button onClick={()=>setCorp('excluded')} className={`flex-1 rounded-xl border-2 p-2 text-xs font-black ${corp==='excluded'?'border-navy bg-navy text-white':'border-navy/15'}`}>EXCLUDED</button></div></div></div><button onClick={()=>onPick(muni==='excluded'&&corp==='taxable'?0:1)} disabled={!muni||!corp} className="mt-4 rounded-2xl bg-navy px-5 py-3 font-black text-white disabled:opacity-35">Send to return</button></div>
}

function ChallengeArt({week,step}) {
  const mode=week===6?'bond':'tax'
  return <div className={`relative mb-4 h-20 overflow-hidden rounded-[22px] ${week===6?'bg-gradient-to-r from-[#263b64] via-[#8d7132] to-[#263b64]':'bg-gradient-to-r from-[#743b2f] via-[#d7a86e] to-[#6f332b]'}`}>
    <div className="absolute inset-0 opacity-25" style={{backgroundImage:'linear-gradient(90deg,transparent 49%,rgba(255,255,255,.35) 50%,transparent 51%)',backgroundSize:'32px 100%',animation:'lateSlide 4s linear infinite'}} />
    {week===6?<><div className="absolute left-5 top-4 text-4xl animate-bounce">🪙</div><div className="absolute left-1/3 top-5 text-3xl animate-pulse">📜</div><div className="absolute right-8 top-4 text-4xl" style={{animation:'lateFloat 2.8s ease-in-out infinite'}}>🏛️</div></>:<><div className="absolute left-5 top-4 text-4xl" style={{animation:'lateFloat 2.2s ease-in-out infinite'}}>📄</div><div className="absolute left-1/3 top-4 text-4xl animate-pulse">🧮</div><div className="absolute right-8 top-4 text-4xl" style={{animation:'lateStamp 2.7s ease-in-out infinite'}}>✅</div></>}
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-white">{mode} challenge {step+1}</div>
  </div>
}

export function LateGameChallengePanel(){
  const week=useGame(s=>s.week), bondStep=useGame(s=>s.bondStep), taxStep=useGame(s=>s.taxStep), cards=useGame(s=>s.cards), dialog=useGame(s=>s.dialog), bondAct=useGame(s=>s.bondAct), taxAct=useGame(s=>s.taxAct), cardAct=useGame(s=>s.cardAct)
  const card=cards[0]
  const isLate=week===6||week===7
  const [instance,setInstance]=useState(0)
  const stepIndex=week===6?bondStep:taxStep
  const steps=week===6?BOND_STEPS:TAX_STEPS
  const step=steps[stepIndex]
  const action=week===6?bondAct:taxAct
  const prefix=week===6?'bond':'tax'
  const pick=(i)=>{setInstance(x=>x+1);action(`${prefix}.pick:${i}`)}
  if(!isLate||dialog||!card)return null
  if(/^(bondfb|taxfb)/.test(String(card.id)))return <Feedback card={card} act={cardAct}/>
  if(!step)return null
  if(step.done)return <div className="pointer-events-auto absolute left-1/2 top-[108px] z-[345] w-[min(92vw,38rem)] -translate-x-1/2 rounded-[30px] border-2 border-white/70 bg-[#fffdf7]/95 p-6 text-center shadow-2xl"><div className="text-5xl">🎉</div><h3 className="mt-2 text-2xl font-black text-navy">{week===6?'Bond Street complete':'Tax return complete'}</h3><p className="mt-2 font-bold text-navy/65">{step.text}</p><button onClick={()=>action(`${prefix}.finish`)} className="mt-4 rounded-2xl bg-navy px-6 py-3 font-black text-white">{step.continue||'Finish'}</button></div>
  const numeric = week===6?[2,3,9,11].includes(stepIndex):[1,2,5,6,8,10,11].includes(stepIndex)
  return <div key={`${week}-${stepIndex}-${instance}`} className="pointer-events-auto absolute left-1/2 top-[92px] z-[340] max-h-[calc(100vh-110px)] w-[min(94vw,44rem)] -translate-x-1/2 overflow-y-auto rounded-[32px] border-2 border-white/70 p-5 shadow-2xl backdrop-blur-xl" style={{background:week===6?'linear-gradient(145deg,rgba(255,250,232,.97),rgba(238,244,255,.96))':'linear-gradient(145deg,rgba(255,247,235,.97),rgba(255,238,230,.96))',boxShadow:`0 24px 80px ${accent[week]}33`}}>
    <style>{`@keyframes lateSlide{to{background-position:64px 0}}@keyframes lateFloat{50%{transform:translateY(-9px) rotate(5deg)}}@keyframes lateStamp{50%{transform:translateY(7px) rotate(-7deg) scale(.92)}}`}</style>
    <ChallengeArt week={week} step={stepIndex}/><div className="flex items-start justify-between gap-4"><div><div className="text-[11px] font-black uppercase tracking-[.2em]" style={{color:accent[week]}}>{step.speaker}</div><h3 className="mt-1 text-xl font-black leading-snug text-navy">{step.text}</h3></div><div className="shrink-0 rounded-full bg-navy/5 px-3 py-1 text-xs font-black text-navy/50">{stepIndex+1}/{steps.length}</div></div>
    {week===6&&stepIndex===10?<AllocationChallenge onPick={pick}/>:week===7&&stepIndex===4?<TaxSort onPick={pick}/>:numeric?<NumericChallenge step={step} onPick={pick}/>:<DragChoice step={step} onPick={pick}/>} 
  </div>
}
