import { GameEngine, GameTheme } from '../GameEngine';

export class SettingsManager {
  private game: GameEngine;
  private container!: HTMLDivElement;
  private modal!: HTMLDivElement;
  private volText!: HTMLSpanElement;
  private isMenuOpen: boolean = false;
  
  public isMoonGravity: boolean = false;

  constructor(game: GameEngine) {
    this.game = game;
    if (typeof document !== 'undefined') {
      this.initUI();
    }
  }

  private initUI() {
    const existingUI = document.getElementById('flappy-settings-ui');
    if (existingUI) existingUI.remove();

    this.container = document.createElement('div');
    this.container.id = 'flappy-settings-ui';
    Object.assign(this.container.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '9999', display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    });

    if (this.game.canvas.parentElement) {
      this.game.canvas.parentElement.style.position = 'relative';
      this.game.canvas.parentElement.appendChild(this.container);
    }

    // 1. TOMBOL GEAR HTML (Diperbagus dengan SVG dan Efek 3D)
    const gearBtn = document.createElement('button');
    
    // Menggunakan SVG agar tajam dan profesional (bukan emoji teks)
    gearBtn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    `;
    
    Object.assign(gearBtn.style, {
      position: 'absolute', top: '15px', right: '20px',
      width: '56px', height: '56px', cursor: 'pointer',
      pointerEvents: 'auto',
      background: 'linear-gradient(135deg, #34495e, #1abc9c)', // Gradien warna elegan
      border: '3px solid #F1C40F',
      borderRadius: '50%', color: '#FFFFFF', 
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      boxShadow: '0 6px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)', // Efek Timbul 3D
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Efek memantul saat dihover
    });

   
    gearBtn.onmouseenter = () => {
      gearBtn.style.transform = 'scale(1.15) rotate(90deg)';
      gearBtn.style.background = 'linear-gradient(135deg, #3b536b, #2ecc71)';
      gearBtn.style.boxShadow = '0 8px 16px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4)';
    };
    gearBtn.onmouseleave = () => {
      gearBtn.style.transform = 'scale(1) rotate(0deg)';
      gearBtn.style.background = 'linear-gradient(135deg, #34495e, #1abc9c)';
      gearBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)';
    };

    gearBtn.onclick = (e) => { 
      e.stopPropagation(); 
      this.toggleMenu(); 
    };
    this.container.appendChild(gearBtn);

    // 2. MODAL PENGATURAN
    this.modal = document.createElement('div');
    Object.assign(this.modal.style, {
      width: '320px', background: '#2C3E50', border: '4px solid #F1C40F',
      borderRadius: '15px', padding: '25px', display: 'none', flexDirection: 'column',
      gap: '18px', pointerEvents: 'auto', boxShadow: '0 15px 30px rgba(0,0,0,0.7)',
      fontFamily: 'Arial, sans-serif', color: 'white'
    });

    const title = document.createElement('h2');
    title.innerText = 'PENGATURAN';
    Object.assign(title.style, { margin: '0', textAlign: 'center', color: '#F1C40F', letterSpacing: '2px' });
    this.modal.appendChild(title);

    this.volText = document.createElement('div');
    Object.assign(this.volText.style, { textAlign: 'center', fontSize: '18px', fontWeight: 'bold' });
    this.updateVolText();
    this.modal.appendChild(this.volText);

    const volRow = document.createElement('div');
    Object.assign(volRow.style, { display: 'flex', justifyContent: 'space-between', gap: '10px' });

    const createBtn = (text: string, color: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.innerText = text;
      Object.assign(btn.style, {
        flex: '1', padding: '12px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', background: color, color: 'white',
        border: 'none', borderRadius: '8px', transition: 'all 0.2s',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      });
      btn.onmouseenter = () => { btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 6px 8px rgba(0,0,0,0.4)'; };
      btn.onmouseleave = () => { btn.style.transform = 'translateY(0)'; btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'; };
      btn.onclick = (e) => { e.stopPropagation(); onClick(); };
      return btn;
    };

    volRow.appendChild(createBtn('-', '#E74C3C', () => this.changeVol(-0.1)));
    volRow.appendChild(createBtn('MUTE', '#95A5A6', () => {
      this.game.soundManager.toggleMute();
      this.updateVolText();
    }));
    volRow.appendChild(createBtn('+', '#2ECC71', () => this.changeVol(0.1)));
    this.modal.appendChild(volRow);

    this.modal.appendChild(createBtn('GANTI TEMA MAP', '#3498DB', () => {
      if (this.game.currentTheme === GameTheme.classic) this.game.setTheme(GameTheme.desert);
      else if (this.game.currentTheme === GameTheme.desert) this.game.setTheme(GameTheme.night);
      else this.game.setTheme(GameTheme.classic);
    }));

    const gravBtn = createBtn('GRAVITASI BULAN: OFF', '#9C27B0', () => {
      this.isMoonGravity = !this.isMoonGravity;
      gravBtn.innerText = `GRAVITASI BULAN: ${this.isMoonGravity ? 'ON' : 'OFF'}`;
      gravBtn.style.background = this.isMoonGravity ? '#E040FB' : '#9C27B0';
      this.game.applyPhysics(); 
    });
    this.modal.appendChild(gravBtn);

    this.modal.appendChild(createBtn('TUTUP', '#7F8C8D', () => this.toggleMenu()));

    this.container.appendChild(this.modal);
  }

  private changeVol(amount: number) {
    let newVol = this.game.soundManager.masterVolume + amount;
    this.game.soundManager.setVolume(newVol);
    this.updateVolText();
  }

  private updateVolText() {
    if (!this.volText) return;
    const isMuted = this.game.soundManager.isMuted;
    const vol = Math.round(this.game.soundManager.masterVolume * 100);
    this.volText.innerText = isMuted ? 'Volume: BISU (MUTE)' : `Volume Suara: ${vol}%`;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.modal.style.display = this.isMenuOpen ? 'flex' : 'none';
  }

  isOpen() {
    return this.isMenuOpen;
  }
}