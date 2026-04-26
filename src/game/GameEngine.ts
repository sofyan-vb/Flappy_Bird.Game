export enum GameState { mainMenu, playing, gameOver }
export enum GameTheme { classic, night, desert }

export interface ThemeColors {
  sky: string; pipe: string; pipeStroke: string; grass: string; dirt: string;
}

export const themes: Record<GameTheme, ThemeColors> = {
  [GameTheme.classic]: { sky: '#58C2FF', pipe: '#73BF2E', pipeStroke: '#000000', grass: '#73BF2E', dirt: '#DED895' },
  [GameTheme.night]: { sky: '#0B0B1A', pipe: '#0B0B1A', pipeStroke: '#00FFFF', grass: '#120024', dirt: '#050510' },
  [GameTheme.desert]: { sky: '#FFE082', pipe: '#4CAF50', pipeStroke: '#1B5E20', grass: '#FFB300', dirt: '#FF8F00' },
};

import { Bird } from './components/Bird';
import { Ground } from './components/Ground';
import { PipeManager } from './components/PipeManager';
import { SoundManager } from './SoundManager';
import { SettingsManager } from './components/SettingsManager';

export class GameEngine {
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;
  width: number; height: number;
  gameState: GameState = GameState.mainMenu;
  score: number = 0;
  onScoreChange?: (score: number) => void;
  onStateChange?: (state: GameState) => void;
  gameSpeed: number = 250.0; pipeSpawnInterval: number = 1.5;
  currentTheme: GameTheme = GameTheme.classic;
  themeColors: ThemeColors = themes[GameTheme.classic];
  bird: Bird; ground: Ground; pipeManager: PipeManager; soundManager: SoundManager;
  lastTime: number = 0; animationFrameId: number = 0;

  settingsManager!: SettingsManager;
  private lastTapTime: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')!;
    this.width = width; this.height = height;
    this.bird = new Bird(this); this.ground = new Ground(this);
    this.pipeManager = new PipeManager(this); this.soundManager = new SoundManager();
    this.ground.onGameResize(width, height); this.bird.onGameResize(width, height);
    this.setTheme(GameTheme.classic);

    this.settingsManager = new SettingsManager(this);

 
    this.soundManager.playMenuBGM();

    const handleInput = (e: MouseEvent | TouchEvent) => {
      this.onTap();
    };

    this.canvas.addEventListener('mousedown', handleInput);
    this.canvas.addEventListener('touchstart', handleInput, { passive: true });
  }

  setTheme(theme: GameTheme) { this.currentTheme = theme; this.themeColors = themes[theme]; }
  
  applyPhysics() {
    const ratio = this.gameSpeed / 250.0;
    if (this.settingsManager && this.settingsManager.isMoonGravity) {
      this.bird.gravity = 600 * ratio; 
      this.bird.jumpVelocity = -350 * ratio; 
    } else {
      this.bird.gravity = 1500 * ratio; 
      this.bird.jumpVelocity = -500 * ratio;
    }
  }

  startWithDifficulty(speed: number, interval: number) {
    this.soundManager.init(); 
    this.gameSpeed = speed; 
    this.pipeSpawnInterval = interval;
    this.startGame();
  }

  startGame() {
    this.soundManager.stopMenuBGM(); 
    if (this.settingsManager && this.settingsManager.isOpen()) {
       this.settingsManager.toggleMenu(); 
    }
    this.applyPhysics();
    this.setState(GameState.playing); this.score = 0; this.notifyScore();
    this.bird.reset(); this.pipeManager.reset();
  }

  goToMainMenu() { 
    this.setState(GameState.mainMenu); this.bird.reset(); this.pipeManager.reset(); 
    this.soundManager.playMenuBGM(); 
  }
  
  gameOver() { 
    if (this.gameState === GameState.gameOver) return; 
    this.soundManager.playHit(); this.setState(GameState.gameOver); 
  }
  
  increaseScore() { this.score++; this.soundManager.playScore(); this.notifyScore(); }
  setState(state: GameState) { this.gameState = state; if (this.onStateChange) this.onStateChange(state); }
  notifyScore() { if (this.onScoreChange) this.onScoreChange(this.score); }

  onTap() {
    const now = performance.now();
    if (now - this.lastTapTime < 50) return;
    this.lastTapTime = now;

    
    this.soundManager.init();

    if (this.settingsManager && this.settingsManager.isOpen()) return; 

    if (this.gameState === GameState.playing) { 
      this.bird.jump(); this.soundManager.playFlap(); 
    }
  }

  start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - this.lastTime) / 1000; this.lastTime = time;
      this.update(dt); this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() { if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId); }

  update(dt: number) {
    if (dt > 0.1) dt = 0.1;
    this.pipeManager.update(dt); this.ground.update(dt); this.bird.update(dt);
  }

  render() {
    if (this.currentTheme === GameTheme.classic) {
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      skyGrad.addColorStop(0, '#58C2FF'); skyGrad.addColorStop(1, '#9BE2FF');
      this.ctx.fillStyle = skyGrad; this.ctx.fillRect(0, 0, this.width, this.height);

      const sunX = this.width * 0.25; const sunY = this.height * 0.25;
      const sunGlow = this.ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 60);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)'); sunGlow.addColorStop(0.3, 'rgba(255, 235, 59, 0.8)'); sunGlow.addColorStop(1, 'rgba(255, 235, 59, 0)');
      this.ctx.fillStyle = sunGlow; this.ctx.beginPath(); this.ctx.arc(sunX, sunY, 60, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.fillStyle = '#FFF59D'; this.ctx.beginPath(); this.ctx.arc(sunX, sunY, 20, 0, Math.PI * 2); this.ctx.fill();
      
      this._renderClassicClouds(this.ctx);

      const waterY = this.height - Ground.groundHeight - 25;
      this.ctx.fillStyle = '#29B6F6'; this.ctx.fillRect(0, waterY, this.width, this.height - waterY);
      this.ctx.fillStyle = '#FFFFFF'; this.ctx.fillRect(0, waterY, this.width, 3);

    } else if (this.currentTheme === GameTheme.desert) {
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      skyGrad.addColorStop(0, '#FF8A65'); skyGrad.addColorStop(1, '#FFE082');
      this.ctx.fillStyle = skyGrad; this.ctx.fillRect(0, 0, this.width, this.height);

      const dSunX = this.width * 0.75; const dSunY = this.height * 0.3;
      const dSunGlow = this.ctx.createRadialGradient(dSunX, dSunY, 20, dSunX, dSunY, 100);
      dSunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)'); dSunGlow.addColorStop(0.2, 'rgba(255, 245, 157, 0.8)'); dSunGlow.addColorStop(1, 'rgba(255, 138, 101, 0)');
      this.ctx.fillStyle = dSunGlow; this.ctx.beginPath(); this.ctx.arc(dSunX, dSunY, 100, 0, Math.PI * 2); this.ctx.fill();

      const duneY = this.height - Ground.groundHeight;
      this.ctx.fillStyle = '#E65100'; this.ctx.beginPath(); this.ctx.moveTo(this.width * 0.1, duneY); this.ctx.lineTo(this.width * 0.35, duneY - 110); this.ctx.lineTo(this.width * 0.6, duneY); this.ctx.fill();
      this.ctx.fillStyle = '#EF6C00'; this.ctx.beginPath(); this.ctx.moveTo(this.width * 0.45, duneY); this.ctx.lineTo(this.width * 0.6, duneY - 80); this.ctx.lineTo(this.width * 0.8, duneY); this.ctx.fill();

      const backDune = this.ctx.createLinearGradient(0, duneY - 80, 0, duneY);
      backDune.addColorStop(0, '#FFA726'); backDune.addColorStop(1, '#FB8C00');
      this.ctx.fillStyle = backDune; this.ctx.beginPath(); this.ctx.moveTo(0, duneY); this.ctx.quadraticCurveTo(this.width * 0.3, duneY - 100, this.width * 0.7, duneY - 30); this.ctx.quadraticCurveTo(this.width * 0.9, duneY - 60, this.width, duneY - 80); this.ctx.lineTo(this.width, duneY); this.ctx.fill();

      const frontDune = this.ctx.createLinearGradient(0, duneY - 60, 0, duneY);
      frontDune.addColorStop(0, '#FFCA28'); frontDune.addColorStop(1, '#FF8F00');
      this.ctx.fillStyle = frontDune; this.ctx.beginPath(); this.ctx.moveTo(0, duneY - 20); this.ctx.quadraticCurveTo(this.width * 0.2, duneY + 20, this.width * 0.6, duneY - 70); this.ctx.quadraticCurveTo(this.width * 0.8, duneY - 90, this.width, duneY - 40); this.ctx.lineTo(this.width, duneY); this.ctx.lineTo(0, duneY); this.ctx.fill();

    } else if (this.currentTheme === GameTheme.night) {
      const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, '#020111'); bgGrad.addColorStop(1, '#191970');
      this.ctx.fillStyle = bgGrad; this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = "#FFF";
      for(let i=0; i<40; i++) {
        this.ctx.globalAlpha = Math.abs(Math.sin(performance.now() / 1000 + i));
        this.ctx.fillRect((i * 137) % this.width, (i * 93) % (this.height-150), 2, 2);
      }
      this.ctx.globalAlpha = 1.0;
    }

    this.pipeManager.render(this.ctx);
    this.ground.render(this.ctx);
    this.bird.render(this.ctx);
  }

  _renderClassicClouds(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#FFFFFF';
    const drawCloud = (x: number, y: number, scale: number) => {
      ctx.beginPath(); ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
      ctx.arc(x + 25 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
      ctx.arc(x + 55 * scale, y, 25 * scale, 0, Math.PI * 2);
      ctx.arc(x + 25 * scale, y + 10 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(this.width * 0.15, this.height * 0.25, 1);
    drawCloud(this.width * 0.55, this.height * 0.15, 1.2);
    drawCloud(this.width * 0.85, this.height * 0.35, 0.9);
  }
}