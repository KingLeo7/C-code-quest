import Phaser from 'phaser'
export class GameScene extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Container
  private pressedKeys = new Set<string>()
  private quest!: Phaser.GameObjects.Rectangle
  private onInteract?: () => void
  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.isUiTarget(event.target)) return

    const key = event.key.toLowerCase()
    if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's', 'e', ' '].includes(key)) return

    event.preventDefault()
    this.pressedKeys.add(key)
    if ((key === 'e' || key === ' ') && !event.repeat) this.tryInteract()
  }
  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys.delete(event.key.toLowerCase())
  }
  constructor(onInteract?: () => void) { super('GameScene'); this.onInteract = onInteract }
  create() {
    const { width, height } = this.scale
    const g = this.add.graphics()
    g.fillGradientStyle(0x173d35,0x173d35,0x28654a,0x28654a,1); g.fillRect(0,0,width,height)
    // Pixel-art ground tiles
    for(let y=0;y<height;y+=32) for(let x=0;x<width;x+=32) {
      g.fillStyle(((x+y)/32)%2===0?0x36734e:0x326b49,1); g.fillRect(x,y,30,30)
      g.fillStyle(0x244e3b,0.45); g.fillRect(x+27,y+27,3,3)
    }
    // Decorative trees
    for(const [x,y] of [[70,90],[width-70,100],[120,height-75],[width-150, height-80],[width/2-180,80],[width/2+180,height-90]] as number[][]) {
      this.add.rectangle(x,y+16,14,28,0x70452c)
      this.add.rectangle(x,y-5,42,38,0x1d573a).setStrokeStyle(3,0x143d2b)
      this.add.rectangle(x-8,y-10,12,10,0x347b4a)
    }
    this.add.rectangle(width/2,height/2+45,220,90,0x6e5538).setStrokeStyle(5,0xd8b36c)
    this.add.text(width/2,height/2+12,'QUEST STONE',{fontFamily:'monospace',fontSize:'13px',color:'#fff2c6'}).setOrigin(.5)
    this.quest=this.add.rectangle(width/2,height/2+45,220,90,0xffffff,0).setInteractive()
    this.quest.on('pointerdown',()=>this.onInteract?.())
    // Hero made from crisp geometric pixel-art shapes
    const body=this.add.rectangle(0,5,22,25,0x3c83d5).setStrokeStyle(2,0x142b4a)
    const head=this.add.rectangle(0,-13,20,18,0xf1bd86).setStrokeStyle(2,0x573b2b)
    const hair=this.add.rectangle(0,-22,22,7,0x38251d)
    const eye=this.add.rectangle(5,-13,3,3,0x172033)
    const feet=this.add.rectangle(-6,19,8,7,0x51362a)
    const feet2=this.add.rectangle(6,19,8,7,0x51362a)
    this.hero=this.add.container(width/2,height/2-70,[body,head,hair,eye,feet,feet2]).setDepth(5)
    this.add.text(16,14,'MOVE: WASD / ARROWS     INTERACT: E / SPACE',{fontFamily:'monospace',fontSize:'11px',color:'#e6ffd8',backgroundColor:'#173326',padding:{x:8,y:6}}).setScrollFactor(0)
    if(this.input.keyboard) {
      this.input.keyboard.clearCaptures()
    }
    this.game.canvas.tabIndex=0
    this.game.canvas.addEventListener('pointerdown',()=>this.game.canvas.focus())
    window.addEventListener('keydown',this.handleKeyDown)
    window.addEventListener('keyup',this.handleKeyUp)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      window.removeEventListener('keydown',this.handleKeyDown)
      window.removeEventListener('keyup',this.handleKeyUp)
      this.pressedKeys.clear()
    })
    this.tweens.add({targets:this.hero,y:this.hero.y-4,duration:650,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})
  }
  update() {
    if(!this.hero) return
    const speed=2.8
    const k=this.pressedKeys
    if(k.has('arrowleft')||k.has('a')) this.hero.x-=speed
    if(k.has('arrowright')||k.has('d')) this.hero.x+=speed
    if(k.has('arrowup')||k.has('w')) this.hero.y-=speed
    if(k.has('arrowdown')||k.has('s')) this.hero.y+=speed
    this.hero.x=Phaser.Math.Clamp(this.hero.x,24,this.scale.width-24)
    this.hero.y=Phaser.Math.Clamp(this.hero.y,45,this.scale.height-24)
  }
  private isUiTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false
    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)
  }
  private tryInteract() {
    if (Phaser.Math.Distance.Between(this.hero.x,this.hero.y,this.scale.width/2,this.scale.height/2+45)<150) {
      this.onInteract?.()
    }
  }
}
