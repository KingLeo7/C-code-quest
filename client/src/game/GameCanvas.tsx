import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GameScene } from './GameScene'
import './controls.css'
export default function GameCanvas({onInteract}:{onInteract:()=>void}) {
  const host=useRef<HTMLDivElement>(null)
  const sceneRef=useRef<GameScene|null>(null)
  const callback=useRef(onInteract); callback.current=onInteract
  useEffect(()=>{
    if(!host.current) return
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current,width:900,height:480,backgroundColor:'#173d35',pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[]})
    const scene=new GameScene(()=>callback.current())
    sceneRef.current=scene
    game.scene.add('GameScene',scene,true)
    return ()=>{sceneRef.current=null;game.destroy(true)}
  },[])
  function hold(direction:'up'|'down'|'left'|'right',pressed:boolean){
    sceneRef.current?.setDirection(direction,pressed)
  }
  function directionButton(direction:'up'|'down'|'left'|'right',label:string,glyph:string){
    return <button type="button" aria-label={label} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);hold(direction,true)}} onPointerUp={event=>{hold(direction,false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>hold(direction,false)} onLostPointerCapture={()=>hold(direction,false)}>{glyph}</button>
  }
  return <div className="game-canvas">
    <div ref={host}/>
    <div className="game-controls" aria-label="World movement controls">
      {directionButton('left','Move left','←')}
      {directionButton('up','Move up','↑')}
      {directionButton('down','Move down','↓')}
      {directionButton('right','Move right','→')}
    </div>
  </div>
}
