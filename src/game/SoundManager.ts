export class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  
  public masterVolume: number = 0.5; 
  public isMuted: boolean = false;
  
  private bgmInterval: number | null = null;
  public isBgmPlaying: boolean = false;

  constructor() {
    this.init();
    
    if (typeof window !== 'undefined') {
      this.forceImmediateAutoplay();
    }
  }

  init() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      this.isEnabled = true;
    } catch (e) {
      console.warn("Audio Context failed", e);
      this.isEnabled = false;
    }
  }

  
  private forceImmediateAutoplay() {
    this.isBgmPlaying = true;

    const attemptPlay = () => {
      if (!this.ctx) this.init();
      
      
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          if (this.ctx!.state === 'running' && this.bgmInterval === null) {
            this.startBgmLoop();
          }
        }).catch(() => {});
      } else if (this.ctx && this.ctx.state === 'running' && this.bgmInterval === null) {
        this.startBgmLoop();
      }
    };

    setTimeout(attemptPlay, 10);


    const brutalForce = setInterval(() => {
      if (this.ctx && this.ctx.state === 'running' && this.bgmInterval !== null) {
        clearInterval(brutalForce); 
      } else {
        attemptPlay();
      }
    }, 100);

    
    const silentUnlock = () => {
      attemptPlay();
      ['click', 'touchstart', 'keydown', 'mousedown'].forEach(evt => {
        window.removeEventListener(evt, silentUnlock, true);
      });
    };
    ['click', 'touchstart', 'keydown', 'mousedown'].forEach(evt => {
      window.addEventListener(evt, silentUnlock, { capture: true, once: true });
    });
  }

  setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.isMuted = this.masterVolume === 0;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  getEffectiveVolume() {
    return this.isMuted ? 0 : this.masterVolume;
  }

  playMenuBGM() {
    this.isBgmPlaying = true; 
    if (this.ctx && this.ctx.state === 'running') {
      this.startBgmLoop();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this.startBgmLoop());
    }
  }

  private startBgmLoop() {
    if (!this.isEnabled || !this.ctx) return;
    if (this.bgmInterval !== null) return; 

    
    const melody = [ 329.63, 392.00, 440.00, 329.63, 493.88, 440.00, 392.00, 440.00 ]; 
    let i = 0;
    
    this.bgmInterval = window.setInterval(() => {
      if (this.ctx && this.isBgmPlaying && !this.isMuted) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle'; 
        osc.frequency.value = melody[i % melody.length];
        
        gain.gain.setValueAtTime(this.masterVolume * 0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2); 
        
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.2);
        i++;
      }
    }, 180);
  }

  stopMenuBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playFlap() {
    const vol = this.getEffectiveVolume();
    if (!this.isEnabled || !this.ctx || vol === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5 * vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.1);
  }

  playScore() {
    const vol = this.getEffectiveVolume();
    if (!this.isEnabled || !this.ctx || vol === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); 
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); 
    gain.gain.setValueAtTime(0.1 * vol, this.ctx.currentTime);
    gain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.1, 0.05);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.3);
  }

  playHit() {
    const vol = this.getEffectiveVolume();
    if (!this.isEnabled || !this.ctx || vol === 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3 * vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.3);
  }
}