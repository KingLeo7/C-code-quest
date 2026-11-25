import { useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import GameCanvas from './game/GameCanvas'
import { questions, type Question } from './questions'
import { supabase } from './supabase'
import './reset.css'

const API=import.meta.env.VITE_API_URL || 'http://localhost:4000'
type Save={guestId:string;xp:number;coins:number;completed:string[];world:number}
const fresh=():Save=>({guestId:crypto.randomUUID(),xp:0,coins:30,completed:[],world:0})
const worlds=['Variable Village','Logic Mountains','Loop Forest','Array Dungeon','Pointer Kingdom']
const defaults:Record<string,string>={a1:questions.find(q=>q.id==='a1')!.starter!,p1:questions.find(q=>q.id==='p1')!.starter!}
export default function App(){
 const [save,setSave]=useState<Save>(()=>{try{return JSON.parse(localStorage.getItem('ccq-save')||'null')||fresh()}catch{return fresh()}})
 const [active,setActive]=useState<Question|null>(null)
 const [answer,setAnswer]=useState('')
 const [code,setCode]=useState('')
 const [result,setResult]=useState('')
 const [busy,setBusy]=useState(false)
 const [showGuide,setShowGuide]=useState(false)
 const [showResetConfirm,setShowResetConfirm]=useState(false)
 const [cloudReady,setCloudReady]=useState(!supabase)
 const [toast,setToast]=useState('')
 const currentWorld=worlds[save.world]||worlds[0]
 const worldQuestions=useMemo(()=>questions.filter(q=>q.world===currentWorld),[currentWorld])
 useEffect(()=>{
   let alive=true
   async function initCloud(){
     if(!supabase){setCloudReady(true);return}
     const {data:{session}}=await supabase.auth.getSession()
     let userId=session?.user.id
     if(!userId){
       const {data,error}=await supabase.auth.signInAnonymously()
       if(error){console.error('Supabase anonymous sign-in failed:',error.message);setCloudReady(true);return}
       userId=data.user?.id
     }
     if(userId&&alive){
       setSave(s=>({...s,guestId:userId!}))
       const {data}=await supabase.from('guest_progress').select('*').eq('guest_id',userId).maybeSingle()
       if(data&&alive)setSave(s=>({...s,guestId:userId!,xp:data.xp,coins:data.coins,completed:data.completed||[],world:data.world||0}))
     }
     if(alive)setCloudReady(true)
   }
   initCloud()
   return ()=>{alive=false}
 },[])
 useEffect(()=>{localStorage.setItem('ccq-save',JSON.stringify(save)); if(cloudReady) syncSave(save)},[save,cloudReady])
 async function syncSave(s:Save){
   if(!supabase||!cloudReady)return
   await supabase.from('guest_progress').upsert({guest_id:s.guestId,xp:s.xp,coins:s.coins,completed:s.completed,world:s.world,updated_at:new Date().toISOString()},{onConflict:'guest_id'})
 }
 function openQuestion(q:Question){setActive(q);setAnswer('');setResult('');setCode(q.starter||'');}
 function complete(q:Question){
   if(save.completed.includes(q.id)){setResult('Already completed! Explore another challenge.');return}
   setSave(s=>({...s,xp:s.xp+q.points,coins:s.coins+Math.ceil(q.points/2),completed:[...s.completed,q.id]}))
   setResult(`MISSION COMPLETE! +${q.points} XP · +${Math.ceil(q.points/2)} coins`)
   setToast('✨ Quest completed!')
 }
 async function submit(){
   if(!active)return
   if(active.type==='mcq'||active.type==='output'||active.type==='debug'){
     const normalized=(v:string)=>v.trim().replace(/\s+/g,' ')
     const ok=active.type==='debug'?answer.trim()==='==':normalized(answer)===normalized(active.answer||'')
     if(ok)complete(active);else setResult('Not quite. Try again, or use a hint.');return
   }
   setBusy(true);setResult('Compiling your C program...')
   try{
     const r=await fetch(`${API}/api/compile`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:code,tests:active.tests})})
     const data=await r.json()
     if(!r.ok)throw new Error(data.error||'Compilation service error')
     if(data.passed){complete(active)}else setResult(data.message||'Some tests failed. Check the compiler output and try again.')
   }catch(e){setResult(e instanceof Error?e.message:'Could not reach compiler API')}
   finally{setBusy(false)}
 }
 function unlockNext(){
   const next=Math.min(save.world+1,worlds.length-1)
   setSave(s=>({...s,world:next}))
 }
 function resetGame(){
   setSave(s=>({...s,xp:0,coins:30,completed:[],world:0}))
   setActive(null)
   setAnswer('')
   setCode('')
   setResult('')
   setShowResetConfirm(false)
   setToast('Game progress reset.')
 }
 const worldComplete=worldQuestions.length>0&&worldQuestions.every(q=>save.completed.includes(q.id))
 return <main className="app-shell">
  <header className="topbar"><div className="brand"><span className="brand-mark">C</span><div><b>C CODE QUEST</b><small>THINK · CODE · CONQUER</small></div></div><div className="stats"><span>⭐ {save.xp} XP</span><span>🪙 {save.coins}</span><span>❤️ 3 LIVES</span></div></header>
  <section className="hero-row"><div><p className="eyebrow">THE KINGDOM NEEDS A CODER</p><h1>Welcome, Adventurer!</h1><p className="sub">Explore the worlds. Solve C challenges. Unlock the kingdom.</p></div><button className="ghost" onClick={()=>setShowGuide(v=>!v)}>How to play</button></section>
  {showGuide&&<div className="guide">Move with <b>WASD / arrow keys</b>. Walk to the glowing quest stone and press <b>E</b>. Solve a challenge to earn XP and coins. Guest progress is saved in this browser and optionally synced to Supabase.</div>}
  <section className="game-layout">
   <div className="game-panel"><div className="panel-head"><span>🗺️ WORLD EXPLORER</span><span className="online">● SAVE ACTIVE</span></div><GameCanvas onInteract={()=>openQuestion(worldQuestions.find(q=>!save.completed.includes(q.id))||worldQuestions[0]||questions[0])}/><div className="world-footer"><div><small>CURRENT WORLD</small><b>{currentWorld}</b></div><div><small>MISSIONS</small><b>{worldQuestions.filter(q=>save.completed.includes(q.id)).length}/{worldQuestions.length}</b></div><button className="primary small" onClick={()=>openQuestion(worldQuestions.find(q=>!save.completed.includes(q.id))||worldQuestions[0]||questions[0])}>Open quest →</button></div></div>
   <aside className="side-panel"><div className="panel-head">🏆 YOUR JOURNEY</div><div className="progress-wrap"><div className="progress-label"><span>Kingdom progress</span><b>{Math.round(save.completed.length/questions.length*100)}%</b></div><div className="progress"><i style={{width:`${save.completed.length/questions.length*100}%`}}/></div></div>
    {worlds.map((w,i)=><button key={w} className={`world-row ${i===save.world?'selected':''} ${i>save.world?'locked':''}`} onClick={()=>i<=save.world&&setSave(s=>({...s,world:i}))}><span className="world-icon">{['🌱','⛰️','🌲','🏰','🔮'][i]}</span><span><b>{w}</b><small>{i>save.world?'🔒 Locked':i===save.world?'CURRENT WORLD': 'Unlocked'}</small></span><span>{i<save.world?'✓':i===save.world?'▶':'🔒'}</span></button>)}
    <div className="achievement"><span>🎖️</span><div><b>First Steps</b><small>{save.completed.length? 'You have started your quest!':'Complete your first mission'}</small></div></div>
    <button className="reset-game" type="button" onClick={()=>setShowResetConfirm(true)}>Reset Game</button>
   </aside>
  </section>
  <section className="challenge-list"><div className="section-title"><div><p className="eyebrow">YOUR NEXT ADVENTURE</p><h2>Available missions</h2></div><span>{questions.length} starter challenges</span></div><div className="mission-grid">{worldQuestions.map(q=><button className="mission-card" key={q.id} onClick={()=>openQuestion(q)}><div className="mission-top"><span>{q.type==='mcq'?'❓':q.type==='output'?'🖥️':q.type==='debug'?'🛠️':'⌨️'}</span><small>{q.difficulty}</small></div><b>{q.title}</b><p>{q.prompt}</p><div className="mission-bottom"><span>⭐ {q.points} XP</span><span>{save.completed.includes(q.id)?'✓ COMPLETED':'START QUEST →'}</span></div></button>)}</div>
  {worldComplete&&save.world<worlds.length-1&&<button className="primary unlock" onClick={unlockNext}>World cleared! Unlock next world →</button>}
  </section>
  {active&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setActive(null)}}><section className="challenge-modal"><div className="modal-head"><div><p className="eyebrow">{active.world} · {active.difficulty}</p><h2>{active.title}</h2></div><button className="close" onClick={()=>setActive(null)}>✕</button></div><p className="question-prompt">{active.prompt}</p>
   {active.code&&<pre className="code-sample"><code>{active.code}</code></pre>}
   {active.type==='mcq'&&<div className="option-grid">{active.options?.map(o=><button className={`option ${answer===o?'chosen':''}`} key={o} onClick={()=>setAnswer(o)}>{o}</button>)}</div>}
   {active.type==='output'&&<input className="answer-input" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Enter the program output"/>}
   {active.type==='debug'&&<input className="answer-input" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Enter the correct operator (e.g. ==)"/>}
   {active.type==='coding'&&<div className="editor-wrap"><Editor height="270px" language="c" theme="vs-dark" value={code} onChange={v=>setCode(v||'')} options={{fontSize:14,minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true}}/></div>}
   {active.type==='coding'&&<button className="ghost run" disabled={busy} onClick={()=>{setResult('');fetch(`${API}/api/health`).then(()=>setResult('Compiler API reachable. Submit to run your tests.')).catch(()=>setResult('Compiler API is not reachable. Check server configuration.'))}}>Check compiler connection</button>}
   <div className="modal-actions"><button className="ghost" onClick={()=>setResult(`💡 Hint: ${active.explanation}`)}>💡 Hint</button><button className="primary" disabled={busy||!answer&&active.type!=='coding'} onClick={submit}>{busy?'Running…':active.type==='coding'?'Run & Submit':'Submit answer'}</button></div>
   {result&&<div className={`result ${result.startsWith('MISSION')?'success':''}`}>{result}</div>}
   <div className="reward-note">Reward: ⭐ {active.points} XP · 🪙 {Math.ceil(active.points/2)} coins</div>
  </section></div>}
  {showResetConfirm&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowResetConfirm(false)}}><section className="challenge-modal reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description"><div className="modal-head"><div><p className="eyebrow">START OVER</p><h2 id="reset-title">Reset your game?</h2></div><button className="close" aria-label="Cancel reset" onClick={()=>setShowResetConfirm(false)}>✕</button></div><p id="reset-description" className="question-prompt">This clears your completed missions, XP, coins, and unlocked worlds. This cannot be undone.</p><div className="modal-actions"><button className="ghost" onClick={()=>setShowResetConfirm(false)}>Cancel</button><button className="reset-confirm" onClick={resetGame}>Reset Progress</button></div></section></div>}
  {toast&&<div className="toast" onAnimationEnd={()=>setToast('')}>{toast}</div>}
  <footer> C CODE QUEST · A little code. A big adventure. </footer>
 </main>
}
