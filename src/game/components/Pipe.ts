import { GameEngine, GameState, GameTheme } from '../GameEngine';

export class Pipe {
  game: GameEngine;
  x: number; y: number; width: number; height: number;
  isTopPipe: boolean; passed: boolean = false;

  constructor(game: GameEngine, x: number, y: number, width: number, height: number, isTopPipe: boolean) {
    this.game = game; this.x = x; this.y = y; this.width = width; this.height = height; this.isTopPipe = isTopPipe;
  }

  update(dt: number) {
    if (this.game.gameState === GameState.playing) {
      this.x -= this.game.gameSpeed * dt;
      if (!this.passed && (this.x + this.width) < this.game.bird.x) {
        this.passed = true;
        if (!this.isTopPipe) this.game.increaseScore();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const theme = this.game.currentTheme;
    const colors = this.game.themeColors;
    const capHeight = 30;
    let capY = this.isTopPipe ? (this.y + this.height - capHeight) : this.y;
    const capRect = { x: this.x - 4, y: capY, width: this.width + 8, height: capHeight };

    if (theme === GameTheme.night) {
    
      ctx.save();
      ctx.shadowBlur = 15; ctx.shadowColor = '#00FFFF'; ctx.fillStyle = '#050510'; ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 3;
      ctx.fillRect(this.x, this.y, this.width, this.height); ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillRect(capRect.x, capRect.y, capRect.width, capRect.height); ctx.strokeRect(capRect.x, capRect.y, capRect.width, capRect.height);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.4)'; ctx.shadowBlur = 10;
      ctx.fillRect(this.x + this.width/2 - 2, this.y, 4, this.height);
      ctx.restore();

    } else if (theme === GameTheme.desert) {
      
      const pipeGrad = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
      pipeGrad.addColorStop(0, '#81C784'); 
      pipeGrad.addColorStop(0.5, '#4CAF50'); 
      pipeGrad.addColorStop(1, '#2E7D32'); 

      ctx.fillStyle = pipeGrad; 
      ctx.strokeStyle = colors.pipeStroke; 
      ctx.lineWidth = 3;
      
     
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      
     
      const capGrad = ctx.createLinearGradient(capRect.x, 0, capRect.x + capRect.width, 0);
      capGrad.addColorStop(0, '#81C784');
      capGrad.addColorStop(0.5, '#4CAF50');
      capGrad.addColorStop(1, '#2E7D32');
      ctx.fillStyle = capGrad;
      
      ctx.fillRect(capRect.x, capRect.y, capRect.width, capRect.height);
      ctx.strokeRect(capRect.x, capRect.y, capRect.width, capRect.height);

      
      ctx.strokeStyle = '#1B5E20';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 15, this.y); ctx.lineTo(this.x + 15, this.y + this.height);
      ctx.moveTo(this.x + this.width - 15, this.y); ctx.lineTo(this.x + this.width - 15, this.y + this.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(capRect.x + 15, capRect.y); ctx.lineTo(capRect.x + 15, capRect.y + capRect.height);
      ctx.moveTo(capRect.x + capRect.width - 15, capRect.y); ctx.lineTo(capRect.x + capRect.width - 15, capRect.y + capRect.height);
      ctx.stroke();

    
      ctx.fillStyle = '#FFF59D'; 
      ctx.strokeStyle = '#1B5E20'; 
      ctx.lineWidth = 1;
      for(let sy = this.y + 20; sy < this.y + this.height; sy += 35) {
       
        ctx.beginPath(); ctx.moveTo(this.x, sy); ctx.lineTo(this.x - 8, sy - 3); ctx.lineTo(this.x, sy - 6); ctx.fill(); ctx.stroke();
       
        ctx.beginPath(); ctx.moveTo(this.x + this.width, sy + 15); ctx.lineTo(this.x + this.width + 8, sy + 12); ctx.lineTo(this.x + this.width, sy + 9); ctx.fill(); ctx.stroke();
      }

     
      const flowerY = this.isTopPipe ? capRect.y + capRect.height : capRect.y;
      const flowerDir = this.isTopPipe ? 1 : -1;
      
      
      ctx.fillStyle = '#E91E63'; 
      ctx.beginPath();
      ctx.arc(this.x + 10, flowerY, 6, 0, Math.PI * 2);
      ctx.arc(this.x + 20, flowerY + (4 * flowerDir), 7, 0, Math.PI * 2);
      ctx.arc(this.x + 30, flowerY, 6, 0, Math.PI * 2);
      ctx.fill();
      
     
      ctx.fillStyle = '#F48FB1'; 
      ctx.beginPath();
      ctx.arc(this.x + 20, flowerY + (2 * flowerDir), 4, 0, Math.PI * 2);
      ctx.fill();

    } else {
      
      ctx.fillStyle = colors.pipe; 
      ctx.strokeStyle = colors.pipeStroke; 
      ctx.lineWidth = 3;
      
      ctx.fillRect(this.x, this.y, this.width, this.height); ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillRect(capRect.x, capRect.y, capRect.width, capRect.height); ctx.strokeRect(capRect.x, capRect.y, capRect.width, capRect.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(this.x + 6, this.y, 6, this.height);
      ctx.fillRect(capRect.x + 6, capRect.y, 6, capRect.height);
    }
  }
}