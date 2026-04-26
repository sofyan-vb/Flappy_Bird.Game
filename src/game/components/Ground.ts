import { GameEngine, GameState, GameTheme } from '../GameEngine';

export class Ground {
  static groundHeight: number = 112;
  game: GameEngine;
  x: number = 0; y: number = 0; width: number = 0; height: number = Ground.groundHeight;
  scrollX: number = 0;

  constructor(game: GameEngine) { this.game = game; }

  onGameResize(gameWidth: number, gameHeight: number) {
    this.width = gameWidth; this.y = gameHeight - this.height;
  }

  update(dt: number) {
    if (this.game.gameState === GameState.playing) {
      this.scrollX += this.game.gameSpeed * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.game.currentTheme === GameTheme.classic) {
      
      ctx.fillStyle = '#73BF2E';
      ctx.fillRect(this.x, this.y, this.width, 15);

      const spikeWidth = 20;
      const offset = this.scrollX % spikeWidth;
      
      ctx.beginPath();
      ctx.moveTo(0, this.y);
      for (let i = -spikeWidth; i <= this.width + spikeWidth; i += spikeWidth) {
        ctx.lineTo(i - offset, this.y - 12); 
        ctx.lineTo(i - offset + (spikeWidth / 2), this.y);
      }
      ctx.fill();

      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.y);
      for (let i = -spikeWidth; i <= this.width + spikeWidth; i += spikeWidth) {
        ctx.lineTo(i - offset, this.y - 12);
        ctx.lineTo(i - offset + (spikeWidth / 2), this.y);
      }
      ctx.stroke();

     
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(this.x, this.y + 15); ctx.lineTo(this.x + this.width, this.y + 15); ctx.stroke();

   
      ctx.fillStyle = '#DED895';
      ctx.fillRect(this.x, this.y + 15, this.width, this.height - 15);
      
      ctx.strokeStyle = '#D4C87B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const lineOffset = this.scrollX % 40;
      for (let i = -40; i <= this.width + 40; i += 40) {
        ctx.moveTo(i - lineOffset + 20, this.y + 17);
        ctx.lineTo(i - lineOffset, this.y + 40);
      }
      ctx.stroke();

    } else if (this.game.currentTheme === GameTheme.desert) {
      
      
    
      const sandTop = ctx.createLinearGradient(0, this.y, 0, this.y + 20);
      sandTop.addColorStop(0, '#FFCA28');
      sandTop.addColorStop(1, '#FFB300');
      ctx.fillStyle = sandTop;
      ctx.fillRect(this.x, this.y, this.width, 20);
      
     
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const waveOffset = this.scrollX % 40;
      for (let i = -40; i <= this.width + 40; i += 40) {
        ctx.moveTo(i - waveOffset, this.y + 10);
        ctx.quadraticCurveTo(i - waveOffset + 20, this.y + 5, i - waveOffset + 40, this.y + 10);
      }
      ctx.stroke();

   
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(this.x, this.y + 20); ctx.lineTo(this.x + this.width, this.y + 20); ctx.stroke();

      
      const sandDeep = ctx.createLinearGradient(0, this.y + 20, 0, this.y + this.height);
      sandDeep.addColorStop(0, '#FF8F00');
      sandDeep.addColorStop(1, '#E65100');
      ctx.fillStyle = sandDeep;
      ctx.fillRect(this.x, this.y + 20, this.width, this.height - 20);

      
      ctx.fillStyle = '#EF6C00';
      const dotOffset = this.scrollX % 30;
      for (let i = -30; i <= this.width + 30; i += 30) {
        
        ctx.fillRect(i - dotOffset + 15, this.y + 25, 3, 3);
        ctx.fillRect(i - dotOffset + 5, this.y + 35, 2, 2);
        ctx.fillRect(i - dotOffset + 25, this.y + 45, 4, 2);
      }

    } else if (this.game.currentTheme === GameTheme.night) {
      
      ctx.fillStyle = '#050510'; ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#FF00FF'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(0, this.y + 10); ctx.lineTo(this.width, this.y + 10);
      ctx.moveTo(0, this.y + 40); ctx.lineTo(this.width, this.y + 40);
      ctx.moveTo(0, this.y + 80); ctx.lineTo(this.width, this.y + 80);
      const offset = this.scrollX % 40;
      for (let i = -40; i <= this.width; i += 40) {
        ctx.moveTo(i - offset, this.y); ctx.lineTo(i - offset - 30, this.y + this.height);
      }
      ctx.stroke();
    }
  }
}