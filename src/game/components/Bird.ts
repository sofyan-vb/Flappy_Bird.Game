import { GameEngine, GameState, GameTheme } from '../GameEngine';
import { Ground } from './Ground';

export class Bird {
  game: GameEngine;
  x: number = 0; y: number = 0; width: number = 40; height: number = 40;
  gravity: number = 1500; jumpVelocity: number = -500; velocityY: number = 0;
  animationTimer: number = 0; angle: number = 0; hitboxRadius: number = 17;

  constructor(game: GameEngine) { this.game = game; }

  onGameResize(gameWidth: number, gameHeight: number) {
    if (this.game.gameState === GameState.mainMenu) { this.x = gameWidth / 4; this.y = gameHeight / 2; }
  }

  update(dt: number) {
    if (this.game.gameState === GameState.playing) {
      this.velocityY += this.gravity * dt; this.y += this.velocityY * dt;
      this.angle = Math.max(-0.8, Math.min(0.8, this.velocityY * 0.0015));
      if (this.velocityY < 0) { this.animationTimer += dt * 1.5; } else { this.animationTimer += dt * 0.5; }
      if (this.y < this.height / 2) { this.y = this.height / 2; this.velocityY = 0; }
      this.checkCollision();
    }
  }
  
  checkCollision() {
    const groundY = this.game.height - Ground.groundHeight;
    if (this.y + this.hitboxRadius >= groundY) { this.game.gameOver(); return; }
    for (const pipe of this.game.pipeManager.pipes) {
      const closestX = Math.max(pipe.x, Math.min(this.x, pipe.x + pipe.width));
      const closestY = Math.max(pipe.y, Math.min(this.y, pipe.y + pipe.height));
      const dX = this.x - closestX; const dY = this.y - closestY;
      if ((dX * dX) + (dY * dY) < (this.hitboxRadius * this.hitboxRadius)) { this.game.gameOver(); return; }
    }
  }

  jump() { this.velocityY = this.jumpVelocity; }
  reset() { this.x = this.game.width / 4; this.y = this.game.height / 2; this.velocityY = 0; this.angle = 0; }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle); ctx.translate(-this.width / 2, -this.height / 2);
    switch (this.game.currentTheme) {
      case GameTheme.night: this._renderUFO(ctx); break;
      case GameTheme.desert: this._renderDesertBird(ctx); break;
      case GameTheme.classic: default: this._renderClassicBird(ctx); break;
    }
    ctx.restore();
  }

  _strokePath(ctx: CanvasRenderingContext2D) { ctx.strokeStyle = '#000000'; ctx.lineWidth = 2.5; ctx.stroke(); }

  
  _renderClassicBird(ctx: CanvasRenderingContext2D) {
    const flap = Math.sin(this.animationTimer * 20) * 8;
    const beakOpen = Math.max(0, Math.sin(this.animationTimer * 15)) * 4;

    ctx.fillStyle = '#0288D1'; ctx.beginPath(); ctx.moveTo(8, 16); ctx.lineTo(-4, 12); ctx.lineTo(-2, 20); ctx.lineTo(-6, 26); ctx.lineTo(8, 24); ctx.closePath(); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#29B6F6'; ctx.beginPath(); ctx.ellipse(20, 20, 16, 13, 0, 0, 2 * Math.PI); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#81D4FA'; ctx.beginPath(); ctx.ellipse(20, 25, 12, 7, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#0277BD'; ctx.beginPath(); ctx.moveTo(10, 18); ctx.quadraticCurveTo(20, 18 - flap, 26, 20 - (flap / 2)); ctx.quadraticCurveTo(18, 26 + (flap / 3), 10, 24); ctx.closePath(); ctx.fill(); this._strokePath(ctx);

    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(28, 15, 5, 5, 0, 0, 2*Math.PI); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(30, 15, 2, 0, 2*Math.PI); ctx.fill();
    ctx.fillStyle = '#29B6F6'; ctx.fillRect(22, 9, 12, 6); ctx.beginPath(); ctx.moveTo(23, 15); ctx.lineTo(33, 15); ctx.stroke();

    ctx.fillStyle = '#FF7043'; ctx.beginPath(); ctx.moveTo(35, 17); ctx.lineTo(46, 17 - beakOpen); ctx.lineTo(35, 20 - beakOpen/2); ctx.closePath(); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#E64A19'; ctx.beginPath(); ctx.moveTo(35, 20 + beakOpen/2); ctx.lineTo(43, 22 + beakOpen); ctx.lineTo(34, 24); ctx.closePath(); ctx.fill(); this._strokePath(ctx);

    ctx.save(); ctx.translate(18, 5); ctx.rotate(0.2); 
    ctx.fillStyle = '#5D4037'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 3, 0, 0, Math.PI*2); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#6D4C41'; ctx.beginPath(); ctx.moveTo(-9, -1); ctx.bezierCurveTo(-9, -14, 9, -14, 9, -1); ctx.closePath(); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#212121'; ctx.fillRect(-9, -4, 18, 3); ctx.restore();
  }

  
  _renderDesertBird(ctx: CanvasRenderingContext2D) {
    const flap = Math.sin(this.animationTimer * 20) * 8;
    const beakOpen = Math.max(0, Math.sin(this.animationTimer * 15)) * 4;

    ctx.fillStyle = '#3E2723'; ctx.beginPath(); ctx.moveTo(8, 16); ctx.lineTo(-4, 12); ctx.lineTo(-2, 20); ctx.lineTo(-6, 26); ctx.lineTo(8, 24); ctx.closePath(); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#D7CCC8'; ctx.beginPath(); ctx.ellipse(20, 20, 16, 13, 0, 0, 2 * Math.PI); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#EFEBE9'; ctx.beginPath(); ctx.ellipse(20, 25, 12, 7, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#5D4037'; ctx.beginPath(); ctx.moveTo(10, 18); ctx.quadraticCurveTo(20, 18 - flap, 26, 20 - (flap / 2)); ctx.quadraticCurveTo(18, 26 + (flap / 3), 10, 24); ctx.closePath(); ctx.fill(); this._strokePath(ctx);

    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(28, 14, 5, 5, 0, 0, 2*Math.PI); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#D50000'; ctx.beginPath(); ctx.arc(30, 14, 2, 0, 2*Math.PI); ctx.fill();
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(34, 12); ctx.stroke(); ctx.lineWidth = 2.5;

    ctx.fillStyle = '#FF8F00'; ctx.beginPath(); ctx.moveTo(35, 15); ctx.lineTo(48, 18 - beakOpen); ctx.lineTo(35, 20 - beakOpen/2); ctx.closePath(); ctx.fill(); this._strokePath(ctx);
    ctx.fillStyle = '#FF6F00'; ctx.beginPath(); ctx.moveTo(35, 20 + beakOpen/2); ctx.lineTo(44, 23 + beakOpen); ctx.lineTo(34, 24); ctx.closePath(); ctx.fill(); this._strokePath(ctx);

    ctx.fillStyle = '#D32F2F';
    ctx.beginPath(); ctx.ellipse(20, 8, 12, 4, -0.2, 0, Math.PI*2); ctx.fill(); this._strokePath(ctx);
    ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(-2, 4); ctx.lineTo(0, 11); ctx.closePath(); ctx.fill(); this._strokePath(ctx);
  }

  
  _renderUFO(ctx: CanvasRenderingContext2D) {
    const pulse = Math.abs(Math.sin(this.animationTimer * 10));
    if (this.velocityY < 0) {
      const grad = ctx.createRadialGradient(20, 35 + (pulse * 5), 2, 20, 35, 10 + (pulse * 5));
      grad.addColorStop(0, '#FFFFFF'); grad.addColorStop(0.5, '#00E5FF'); grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(20, 35, 8, 10 + (pulse * 5), 0, 0, 2 * Math.PI); ctx.fill();
    }
    const domeGrad = ctx.createRadialGradient(20, 15, 2, 20, 15, 12);
    domeGrad.addColorStop(0, 'rgba(132, 255, 255, 1)'); domeGrad.addColorStop(1, 'rgba(0, 229, 255, 0.2)');
    ctx.fillStyle = domeGrad; ctx.beginPath(); ctx.arc(20, 15, 12, Math.PI, 0, false); ctx.fill();
    ctx.fillStyle = '#76FF03'; ctx.beginPath(); ctx.ellipse(20, 14, 4, 6, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = 'black'; ctx.beginPath(); ctx.ellipse(18, 14, 1, 2, 0, 0, 2 * Math.PI); ctx.ellipse(22, 14, 1, 2, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(20, 15, 12, Math.PI, 0, false); this._strokePath(ctx);
    const dishGrad = ctx.createLinearGradient(0, 14, 0, 30);
    dishGrad.addColorStop(0, '#ECEFF1'); dishGrad.addColorStop(1, '#546E7A');
    ctx.fillStyle = dishGrad; ctx.beginPath(); ctx.ellipse(20, 22, 22, 8, 0, 0, 2 * Math.PI); ctx.fill(); this._strokePath(ctx);
    const t = this.animationTimer * 15;
    ctx.fillStyle = Math.sin(t) > 0 ? '#00FFFF' : '#B0BEC5'; ctx.beginPath(); ctx.arc(6, 22, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = Math.sin(t + 2) > 0 ? '#FF00FF' : '#B0BEC5'; ctx.beginPath(); ctx.arc(20, 24, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = Math.sin(t + 4) > 0 ? '#00FFFF' : '#B0BEC5'; ctx.beginPath(); ctx.arc(34, 22, 2.5, 0, Math.PI * 2); ctx.fill();
  }
}