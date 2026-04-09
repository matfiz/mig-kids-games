type SfxName =
  | 'hop'
  | 'jump'
  | 'eggPickup'
  | 'giftPickup'
  | 'giftDeliver'
  | 'alarm'
  | 'victory'
  | 'gameOver';

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicOsc: OscillatorNode | null = null;
let musicLfo: OscillatorNode | null = null;
let musicPlaying = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.3;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(masterGain);
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function setMasterVolume(v: number) {
  if (masterGain) masterGain.gain.value = v;
}

export function setMusicVolume(v: number) {
  if (musicGain) musicGain.gain.value = v * 0.4;
}

export function setSfxVolume(v: number) {
  if (sfxGain) sfxGain.gain.value = v;
}

export function playSfx(name: SfxName) {
  const c = getCtx();
  if (!sfxGain) return;

  const now = c.currentTime;

  switch (name) {
    case 'hop': {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain).connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }
    case 'jump': {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain).connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }
    case 'eggPickup':
    case 'giftPickup': {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1100, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain).connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
    case 'giftDeliver': {
      // C-E-G triad
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain).connect(sfxGain!);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
      break;
    }
    case 'alarm': {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(250, now + 0.15);
      osc.frequency.linearRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain).connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case 'victory': {
      // Arpeggio: C-E-G-C'
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        osc.connect(gain).connect(sfxGain!);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.4);
      });
      break;
    }
    case 'gameOver': {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain).connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
  }
}

export function startMusic() {
  if (musicPlaying) return;
  const c = getCtx();
  if (!musicGain) return;

  // Simple ambient melody loop using oscillators
  musicOsc = c.createOscillator();
  musicLfo = c.createOscillator();

  const lfoGain = c.createGain();
  lfoGain.gain.value = 50;
  musicLfo.frequency.value = 0.3;
  musicLfo.connect(lfoGain);
  lfoGain.connect(musicOsc.frequency);

  musicOsc.type = 'sine';
  musicOsc.frequency.value = 330;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  musicOsc.connect(filter).connect(musicGain);
  musicOsc.start();
  musicLfo.start();
  musicPlaying = true;
}

export function stopMusic() {
  if (!musicPlaying) return;
  try {
    musicOsc?.stop();
    musicLfo?.stop();
  } catch { /* ignore */ }
  musicOsc = null;
  musicLfo = null;
  musicPlaying = false;
}

// Auto-mute when tab hidden
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!masterGain) return;
    masterGain.gain.value = document.hidden ? 0 : 0.7;
  });
}
