import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GameScene } from './GameScene'
export default function GameCanvas({onInteract}:{onInteract:()=>void}) {
  const host=useRef<HTMLDivElement>(null)
  const callback=useRef(onInteract); callback.current=onInteract
  useEffect(()=>{
    if(!host.current) return
    const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current,width:900,height:480,backgroundColor:'#173d35',pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[]})
    game.scene.add('GameScene',new GameScene(()=>callback.current()),true)
    return ()=>game.destroy(true)
  },[])
  return <div className="game-canvas" ref={host}/>
}
