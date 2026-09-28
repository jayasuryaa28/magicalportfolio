/**
 * ==========================================================================
 * THE ARCANE ENGINE - JAYASURYA'S MAGICAL REALM JAVASCRIPT
 * ==========================================================================
 */

// Force browser to always start from the top on page reload or fresh visit
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('pageshow', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  /* --------------------------------------------------------------------------
   * 1. MAGIC WAND PARTICLE CANVAS SYSTEM & WAND CORES
   * -------------------------------------------------------------------------- */
  const wandCorePalettes = {
    phoenix: ['#f5c542', '#ffd700', '#fff3a8', '#ffffff', '#e09f3e'],
    dragon: ['#ef4444', '#dc2626', '#f87171', '#ffffff', '#b91c1c'],
    unicorn: ['#38bdf8', '#bae6fd', '#e0f2fe', '#ffffff', '#7dd3fc'],
    thestral: ['#c084fc', '#a855f7', '#e9d5ff', '#ffffff', '#9333ea']
  };
  const wandCoreGlows = {
    phoenix: 'rgba(245, 197, 66, 0.85)',
    dragon: 'rgba(239, 68, 68, 0.85)',
    unicorn: 'rgba(56, 189, 248, 0.85)',
    thestral: 'rgba(168, 85, 247, 0.85)'
  };
  let currentWandCore = 'phoenix';
  let currentWandPalette = wandCorePalettes.phoenix;

  function getActiveWandGlow() {
    return wandCoreGlows[currentWandCore] || wandCoreGlows.phoenix;
  }

  const canvas = document.getElementById('magic-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -100, y: -100, prevX: -100, prevY: -100, speed: 0 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Sparkle {
    constructor(x, y, customColor = null) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 2.5 + 0.5;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - 0.8; // subtle float upward
      this.size = Math.random() * 3.5 + 1;
      this.alpha = 1;
      this.decay = Math.random() * 0.025 + 0.015;
      // Use active wand core palette unless customColor provided
      const colors = currentWandPalette || wandCorePalettes.phoenix;
      this.color = customColor || colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.size > 0.2) this.size -= 0.04;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Touch/Mobile detection
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

  // Zero-Lag Dynamic Particle System: Only renders when active particles exist
  let particleAnimId = null;
  function handleParticles() {
    if (particles.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particleAnimId = null;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
    particleAnimId = requestAnimationFrame(handleParticles);
  }

  function startParticleLoop() {
    if (!particleAnimId && particles.length > 0) {
      particleAnimId = requestAnimationFrame(handleParticles);
    }
  }

  // Intercept particles.push to automatically start loop on demand
  const origParticlesPush = particles.push.bind(particles);
  particles.push = function(...items) {
    const res = origParticlesPush(...items);
    startParticleLoop();
    return res;
  };

  // Custom Wand Cursor Tracking: strictly disabled on mobile / touch
  const wandCursor = document.getElementById('wand-cursor');
  let cursorX = 0, cursorY = 0;
  let targetX = 0, targetY = 0;

  if (isTouchDevice) {
    if (wandCursor) wandCursor.style.display = 'none';
  } else {
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const dx = e.clientX - mouse.prevX;
      const dy = e.clientY - mouse.prevY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;

      // Spawn wand sparkle trail on PC
      const spawnCount = Math.min(Math.floor(mouse.speed / 5) + 1, 3);
      for (let i = 0; i < spawnCount; i++) {
        particles.push(new Sparkle(e.clientX + (Math.random() - 0.5) * 8, e.clientY + (Math.random() - 0.5) * 8));
      }
    });

    function renderCursor() {
      cursorX += (targetX - cursorX) * 0.25;
      cursorY += (targetY - cursorY) * 0.25;
      if (wandCursor) {
        wandCursor.style.left = `${cursorX}px`;
        wandCursor.style.top = `${cursorY}px`;
      }
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Enlarge cursor on interactive elements on desktop
    const interactives = document.querySelectorAll('a, button, input, textarea, .spell-card, .metric-card, .golden-snitch');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (wandCursor) {
          wandCursor.style.transform = 'translate(-50%, -50%) scale(1.6)';
          wandCursor.style.borderColor = '#ffffff';
        }
        playChimeNote(600 + Math.random() * 400);
      });
      el.addEventListener('mouseleave', () => {
        if (wandCursor) {
          wandCursor.style.transform = 'translate(-50%, -50%) scale(1)';
          wandCursor.style.borderColor = getActiveWandGlow();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 1.1 INTERACTIVE GOLDEN SNITCH AI & CATCH GAME
   * -------------------------------------------------------------------------- */
  const snitch = document.getElementById('golden-snitch');
  const snitchToast = document.getElementById('snitch-achievement-modal');
  const closeSnitchToastBtn = document.getElementById('close-snitch-toast');
  let snitchToastTimer = null;
  let snitchDodges = 0;
  let isSnitchCaught = false;

  if (closeSnitchToastBtn && snitchToast) {
    closeSnitchToastBtn.addEventListener('click', () => {
      snitchToast.classList.add('hidden');
    });
  }

  if (snitch) {
    window.addEventListener('mousemove', (e) => {
      if (isSnitchCaught) return;

      const snitchRect = snitch.getBoundingClientRect();
      const sCenterX = snitchRect.left + snitchRect.width / 2;
      const sCenterY = snitchRect.top + snitchRect.height / 2;

      const distX = e.clientX - sCenterX;
      const distY = e.clientY - sCenterY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // If wand cursor gets close, Snitch darts away playfully!
      // After 3 dodges, it hovers gracefully allowing Seeker to catch!
      if (distance < 95 && snitchDodges < 4) {
        snitchDodges++;
        const angle = Math.atan2(distY, distX);
        const escapeDist = 140 + Math.random() * 100;
        
        let newX = sCenterX - Math.cos(angle) * escapeDist;
        let newY = sCenterY - Math.sin(angle) * escapeDist;

        // Keep inside screen bounds
        newX = Math.max(50, Math.min(window.innerWidth - 80, newX));
        newY = Math.max(70, Math.min(window.innerHeight - 120, newY));

        snitch.style.position = 'fixed';
        snitch.style.left = `${newX}px`;
        snitch.style.top = `${newY}px`;
        snitch.style.right = 'auto';

        // Spawn gold flutter sparks
        for (let i = 0; i < 8; i++) {
          particles.push(new Sparkle(sCenterX, sCenterY));
        }
        playChimeNote(880 + Math.random() * 250, 0.2);
      } else if (snitchDodges >= 4) {
        // Reset dodge count after 2.5s so it can be caught or flutter again
        setTimeout(() => { snitchDodges = 0; }, 2500);
      }
    });

    // Clicking the Snitch (Caught by Seeker!)
    snitch.addEventListener('click', (e) => {
      e.stopPropagation();
      initAudio();
      isSnitchCaught = true;
      snitch.classList.add('snitch-caught');
      playVictoryFanfare();

      // Giant Quidditch Victory Fireworks
      const rect = snitch.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 100; i++) {
        particles.push(new Sparkle(cx, cy));
      }

      // Display Hogwarts Achievement Banner
      if (snitchToast) {
        snitchToast.classList.remove('hidden');
        clearTimeout(snitchToastTimer);
        snitchToastTimer = setTimeout(() => {
          snitchToast.classList.add('hidden');
          snitch.classList.remove('snitch-caught');
          isSnitchCaught = false;
        }, 7000);
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 1.2 CLICK SPELL SHOCKWAVE & WAND FLASH
   * -------------------------------------------------------------------------- */
  window.addEventListener('click', (e) => {
    // Exclude clicking on inputs/textareas
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    initAudio();
    playChimeNote(740 + Math.random() * 200, 0.3);

    // Create magical shockwave
    const shockwave = document.createElement('div');
    shockwave.className = 'spell-shockwave';
    shockwave.style.left = `${e.clientX}px`;
    shockwave.style.top = `${e.clientY}px`;
    shockwave.style.width = '160px';
    shockwave.style.height = '160px';
    document.body.appendChild(shockwave);

    setTimeout(() => shockwave.remove(), 700);

    // Burst 16 sparkles
    for (let i = 0; i < 16; i++) {
      particles.push(new Sparkle(e.clientX, e.clientY));
    }
  });

  /* --------------------------------------------------------------------------
   * 1.3 3D MOUSE PARALLAX ON HERO CONTENT & SPOTLIGHT CARDS
   * -------------------------------------------------------------------------- */
  const heroWrapper = document.querySelector('.hero-content-wrapper');
  if (heroWrapper) {
    window.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rotY = ((e.clientX - centerX) / centerX) * 5; // max 5deg
      const rotX = -((e.clientY - centerY) / centerY) * 5;
      heroWrapper.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  }

  // Interactive spotlight hover on glass cards
  document.querySelectorAll('.glass-panel, .glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spot-x', `${x}px`);
      card.style.setProperty('--spot-y', `${y}px`);
    });
  });

  /* --------------------------------------------------------------------------
   * 2. SYNTHESIZED WEB AUDIO ENGINE (ZERO DEPENDENCY / OFFLINE READY)
   * -------------------------------------------------------------------------- */
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicInterval = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Celesta / Bell chime note generator
  function playChimeNote(freq = 523.25, duration = 0.6) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      // Ignored for autoplay restrictions
    }
  }

  // Spell cast whoosh chime sound
  function playSpellCastSound() {
    if (!audioCtx) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playChimeNote(freq, 0.8);
        }, idx * 60);
      });
    } catch (e) {}
  }

  // Chocolate Frog Card 3D Flip Whoosh Sound
  function playCardFlipSound() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, audioCtx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(340, audioCtx.currentTime + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3600, audioCtx.currentTime + 0.1);
      filter.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);

      // Magical parchment sparkle notes
      setTimeout(() => playChimeNote(659.25, 0.25), 50);
      setTimeout(() => playChimeNote(987.77, 0.3), 110);
    } catch (e) {}
  }

  // Quidditch Victory Fanfare (Snitch Caught!)
  function playVictoryFanfare() {
    if (!audioCtx) return;
    try {
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfareNotes.forEach((freq, idx) => {
        setTimeout(() => {
          playChimeNote(freq, 0.6);
          playChimeNote(freq * 1.5, 0.4);
        }, idx * 120);
      });
    } catch (e) {}
  }

  // Patronus Ethereal Wave Audio
  function playPatronusEtherealSound() {
    if (!audioCtx) return;
    try {
      const chords = [329.63, 493.88, 659.25, 987.77, 1318.51];
      chords.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 2.4);
        }, idx * 90);
      });
    } catch (e) {}
  }

  // Accio Whoosh Sound
  function playAccioWhoosh() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(980, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
      setTimeout(() => {
        playChimeNote(1046.50, 0.7);
      }, 350);
    } catch (e) {}
  }

  // 1. Time-Turner Chrono Warp Sound (Sanctum)
  function playTimeTurnerChronoSound() {
    if (!audioCtx) return;
    try {
      const ticks = [330, 440, 554, 660, 880, 1108, 1320, 1760];
      ticks.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        }, idx * 42);
      });
      setTimeout(() => {
        playChimeNote(1760, 1.2);
        playChimeNote(2217, 1.0);
      }, ticks.length * 42);
    } catch (e) {}
  }

  // 2. Pensieve Fluid Dive Sound (Wizard)
  function playPensieveDiveSound() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(146.83, audioCtx.currentTime + 0.75);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.75);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.75);

      [880, 1174.66, 1760].forEach((f, i) => {
        setTimeout(() => playChimeNote(f, 0.8), i * 110 + 70);
      });
    } catch (e) {}
  }

  // 3. Incendio Ignition Sound (Spellbook)
  function playIncendioIgnitionSound() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(980, audioCtx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);

      [440, 660, 523, 784].forEach((f, idx) => {
        setTimeout(() => playChimeNote(f, 0.3), idx * 65);
      });
    } catch (e) {}
  }

  // 4. Alohomora Vault Unlock Sound (Chamber)
  function playAlohomoraUnlockSound() {
    if (!audioCtx) return;
    try {
      [280, 460].forEach((freq, idx) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.08);
        }, idx * 105);
      });

      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1318.51, audioCtx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }, 220);
    } catch (e) {}
  }

  // 5. Marauder's Map Unfold Sound (Chronicles)
  function playMaraudersUnfoldSound() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(196, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(392, audioCtx.currentTime + 0.38);
      gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);

      [523.25, 659.25, 783.99].forEach((f, i) => {
        setTimeout(() => playChimeNote(f, 0.7), 150 + i * 110);
      });
    } catch (e) {}
  }

  // 6. Owl Post Wingbeat Flutter Sound (Owl Post)
  function playOwlWingbeatSound() {
    if (!audioCtx) return;
    try {
      [0, 130, 260].forEach((del) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.13);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.13);
        }, del);
      });

      setTimeout(() => {
        playChimeNote(1046.50, 0.7);
        playChimeNote(1567.98, 0.7);
      }, 400);
    } catch (e) {}
  }

  // Magical Ambient Arpeggio loop (Celesta harp scale)
  const pentatonicScale = [
    261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50
  ];

  function startAmbientArpeggio() {
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = setInterval(() => {
      if (!isMusicPlaying) return;
      const note = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
      playChimeNote(note, 1.2);
    }, 700);
  }

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioStatus = document.getElementById('audio-status');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      isMusicPlaying = !isMusicPlaying;
      if (isMusicPlaying) {
        audioIcon.textContent = '🔊';
        audioStatus.textContent = 'Ambiance Active';
        audioToggleBtn.style.borderColor = 'var(--gold-glow)';
        audioToggleBtn.style.boxShadow = '0 0 15px var(--gold-glow)';
        startAmbientArpeggio();
        playSpellCastSound();
      } else {
        audioIcon.textContent = '🎵';
        audioStatus.textContent = 'Ambiance';
        audioToggleBtn.style.borderColor = 'rgba(245, 197, 66, 0.35)';
        audioToggleBtn.style.boxShadow = 'none';
        if (musicInterval) clearInterval(musicInterval);
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 3. ARCANE SPELLS ENGINE (LUMOS, ACCIO, EXPECTO PATRONUM)
   * -------------------------------------------------------------------------- */
  const spellBanner = document.getElementById('spell-incantation-banner');
  let spellBannerTimer = null;

  function showSpellBanner(text) {
    if (!spellBanner) return;
    spellBanner.textContent = text;
    spellBanner.classList.add('show');
    clearTimeout(spellBannerTimer);
    spellBannerTimer = setTimeout(() => {
      spellBanner.classList.remove('show');
    }, 2400);
  }

  // 1. Lumos / Nox Spell
  const lumosBtn = document.getElementById('lumos-btn');
  function toggleLumos() {
    initAudio();
    document.body.classList.toggle('nox-mode');
    const isNox = document.body.classList.contains('nox-mode');
    if (lumosBtn) {
      lumosBtn.querySelector('.btn-text').textContent = isNox ? 'Nox [L]' : 'Lumos [L]';
      lumosBtn.querySelector('.icon').textContent = isNox ? '🌑' : '✨';
    }
    showSpellBanner(isNox ? '🌑 NOX! ✦ Wand Light Extinguished' : '✨ LUMOS! ✦ Wand Light Awakened');
    playSpellCastSound();

    for (let i = 0; i < 35; i++) {
      particles.push(new Sparkle(window.innerWidth / 2, window.innerHeight / 2));
    }
  }

  if (lumosBtn) {
    lumosBtn.addEventListener('click', toggleLumos);
  }

  // 2. Accio Snitch Spell
  const accioBtn = document.getElementById('accio-btn');
  function castAccioSnitch() {
    initAudio();
    playAccioWhoosh();
    showSpellBanner('⚡ ACCIO SNITCH! ✦ Summoned to Wand');

    if (!snitch) return;
    const targetX = mouse.x > 0 ? mouse.x : window.innerWidth / 2;
    const targetY = mouse.y > 0 ? mouse.y : window.innerHeight / 2;

    snitch.style.position = 'fixed';
    snitch.style.transition = 'all 0.65s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    snitch.style.left = `${targetX - 16}px`;
    snitch.style.top = `${targetY - 16}px`;
    snitch.style.right = 'auto';

    const core = snitch.querySelector('.snitch-core');
    if (core) {
      core.classList.add('accio-glow');
      setTimeout(() => core.classList.remove('accio-glow'), 1200);
    }

    // Trailing golden particle beam
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const sRect = snitch.getBoundingClientRect();
        particles.push(new Sparkle(sRect.left + sRect.width / 2, sRect.top + sRect.height / 2));
      }, i * 20);
    }
  }

  if (accioBtn) {
    accioBtn.addEventListener('click', castAccioSnitch);
  }

  // 3. Expecto Patronum Spell
  const patronusBtn = document.getElementById('patronus-btn');
  const patronusOverlay = document.getElementById('patronus-overlay');

  function castExpectoPatronum() {
    initAudio();
    playPatronusEtherealSound();
    showSpellBanner('🦌 EXPECTO PATRONUM! ✦ Silver Stag Ward');

    if (patronusOverlay) {
      patronusOverlay.classList.add('active');

      // Summon celestial silver mist particles
      for (let i = 0; i < 75; i++) {
        setTimeout(() => {
          const p = new Sparkle(
            window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.7,
            window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight * 0.7
          );
          p.color = Math.random() > 0.4 ? '#bae6fd' : '#ffffff';
          p.size = Math.random() * 5 + 2.5;
          particles.push(p);
        }, i * 25);
      }

      setTimeout(() => {
        patronusOverlay.classList.remove('active');
      }, 3000);
    }
  }

  if (patronusBtn) {
    patronusBtn.addEventListener('click', castExpectoPatronum);
  }

  // Global Keyboard Arcane Shortcuts:
  // L = Lumos, A = Accio, P = Patronus, S = Sorting Hat, W = Wand Core, R = Resume, Esc = Close Modals
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'Escape') {
      closeAllArcaneModals();
    } else if (e.key === 'l' || e.key === 'L') {
      toggleLumos();
    } else if (e.key === 'a' || e.key === 'A') {
      castAccioSnitch();
    } else if (e.key === 'p' || e.key === 'P') {
      castExpectoPatronum();
    } else if (e.key === 's' || e.key === 'S') {
      toggleSortingHatModal();
    } else if (e.key === 'w' || e.key === 'W') {
      toggleWandModal();
    } else if (e.key === 'r' || e.key === 'R') {
      toggleResumeModal();
    }
  });

  /* --------------------------------------------------------------------------
   * 4. SKILLS & SPELLS GRIMOIRE CATEGORY FILTER
   * -------------------------------------------------------------------------- */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const spellCards = document.querySelectorAll('.spell-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      playChimeNote(784, 0.4);

      spellCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
   * 5. OWL POST DISPATCH (CONTACT FORM)
   * -------------------------------------------------------------------------- */
  const owlForm = document.getElementById('owl-dispatch-form');
  const dispatchBtn = document.getElementById('dispatch-owl-btn');
  const dispatchText = document.getElementById('dispatch-btn-text');
  const successBanner = document.getElementById('dispatch-success-banner');
  const successTitle = document.getElementById('dispatch-success-title');
  const successDesc = document.getElementById('dispatch-success-desc');
  const mailtoLink = document.getElementById('dispatch-mailto-link');

  if (owlForm) {
    owlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      initAudio();
      playSpellCastSound();

      const name = document.getElementById('wizard-name')?.value.trim() || '';
      const email = document.getElementById('owl-address')?.value.trim() || '';
      const subject = document.getElementById('scroll-subject')?.value.trim() || 'Portfolio Inquiry';
      const message = document.getElementById('scroll-message')?.value.trim() || '';

      if (!name || !email || !message) {
        alert('Please fill in your name, email, and message before dispatching the owl.');
        return;
      }

      // Animate button into flight mode
      dispatchBtn.disabled = true;
      dispatchText.textContent = 'Enchanting Owl & Flying to Inbox...';
      dispatchBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';

      // Trigger sparkles
      const rect = dispatchBtn.getBoundingClientRect();
      for (let i = 0; i < 30; i++) {
        particles.push(new Sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2));
      }

      const mailtoUrl = `mailto:jayasurya28806@gmail.com?subject=${encodeURIComponent('[Portfolio Owl Post] ' + subject + ' - ' + name)}&body=${encodeURIComponent('Sender Name: ' + name + '\nSender Email: ' + email + '\n\nMessage:\n' + message)}`;
      if (mailtoLink) {
        mailtoLink.href = mailtoUrl;
      }

      const payload = {
        name: name,
        email: email,
        _subject: `[Portfolio Owl Post] ${subject} (from ${name})`,
        message: message,
        _template: 'box',
        _captcha: 'false'
      };

      try {
        const response = await fetch('https://formsubmit.co/ajax/jayasurya28806@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (successBanner) {
          successBanner.classList.remove('hidden');
        }
        if (successDesc) {
          successDesc.innerHTML = `Your message from <strong>${name}</strong> (${email}) has been dispatched directly to Jaya Surya's mailbox (<strong class="glow-link">jayasurya28806@gmail.com</strong>)!`;
        }
        dispatchText.textContent = 'Owl Dispatched Successfully!';
        dispatchBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        owlForm.reset();

      } catch (err) {
        console.warn('FormSubmit background dispatch note:', err);
        if (successBanner) {
          successBanner.classList.remove('hidden');
        }
        if (successDesc) {
          successDesc.innerHTML = `Your owl is ready! You can also click the button below to confirm sending from your email app directly to <strong class="glow-link">jayasurya28806@gmail.com</strong>.`;
        }
        window.open(mailtoUrl, '_blank');
        dispatchText.textContent = 'Owl Dispatched!';
        dispatchBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        owlForm.reset();
      }

      setTimeout(() => {
        dispatchBtn.disabled = false;
        dispatchText.textContent = 'Release The Owl (Send Message)';
        dispatchBtn.style.background = '';
      }, 7000);
    });
  }

  /* --------------------------------------------------------------------------
   * 6. MOBILE NAVIGATION TOGGLE
   * -------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    const handleToggle = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      initAudio();
      const isOpen = navLinks.classList.toggle('open');
      mobileToggle.classList.toggle('open', isOpen);
      playChimeNote(isOpen ? 620 : 440, 0.2);
    };

    mobileToggle.addEventListener('click', handleToggle);

    // Close when tapping any link or button inside the menu
    navLinks.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('open');
      });
    });

    // Close when tapping outside the menu on mobile
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('open');
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 7. ARCANE REALM CONFIGS & SCROLL TRANSITION ENGINE
   * -------------------------------------------------------------------------- */
  const sectionTransitionConfigs = {
    '#hero': {
      themeClass: 'theme-hero',
      icon: '⏳',
      runes: '✦ CHRONO WARP · TIME-TURNER TO SANCTUM ✦',
      subtext: 'Rewinding the tapestry of time into the Grand Sanctum...',
      sound: playTimeTurnerChronoSound,
      palette: ['#f5c542', '#ffd700', '#fff3a8', '#f59e0b', '#ffffff'],
      arrivalSoundFreq: 1046.50
    },
    '#about': {
      themeClass: 'theme-about',
      icon: '🌊',
      runes: '✦ PENSIEVE DIVE · THE WIZARD\'S MEMORY ✦',
      subtext: 'Diving deep into the Pensieve of philosophy and origin...',
      sound: playPensieveDiveSound,
      palette: ['#38bdf8', '#bae6fd', '#e0f2fe', '#60a5fa', '#ffffff'],
      arrivalSoundFreq: 880.00
    },
    '#skills': {
      themeClass: 'theme-skills',
      icon: '🔥',
      runes: '✦ INCENDIO · IGNITING THE ARCANE GRIMOIRE ✦',
      subtext: 'Awakening the spells of Python, AI models, and full-stack sorcery...',
      sound: playIncendioIgnitionSound,
      palette: ['#ef4444', '#f97316', '#f59e0b', '#dc2626', '#ffffff'],
      arrivalSoundFreq: 1318.51
    },
    '#projects': {
      themeClass: 'theme-projects',
      icon: '🗝️',
      runes: '✦ ALOHOMORA · UNSEALING CHAMBER OF INNOVATIONS ✦',
      subtext: 'Unlocking the 7 chambers of autonomous voice AI, mesh, and bug intelligence...',
      sound: playAlohomoraUnlockSound,
      palette: ['#10b981', '#06b6d4', '#34d399', '#22d3ee', '#ffffff'],
      arrivalSoundFreq: 1174.66
    },
    '#journey': {
      themeClass: 'theme-journey',
      icon: '📜',
      runes: '✦ MISCHIEF MANAGED · UNFOLDING THE CHRONICLES ✦',
      subtext: 'Traced in living ink: academic laurels, honours diploma, and milestones...',
      sound: playMaraudersUnfoldSound,
      palette: ['#d4af37', '#b48246', '#fef08a', '#a16207', '#ffffff'],
      arrivalSoundFreq: 783.99
    },
    '#contact': {
      themeClass: 'theme-contact',
      icon: '✉️',
      runes: '✦ HEDWIG\'S FLIGHT · SOARING TO OWL POST ✦',
      subtext: 'Summoning the snowy owl airway directly to Jaya Surya\'s mailbox...',
      sound: playOwlWingbeatSound,
      palette: ['#ffffff', '#e0e7ff', '#c7d2fe', '#ef4444', '#fecaca'],
      arrivalSoundFreq: 1567.98
    }
  };

  const defaultTransitionConfig = {
    themeClass: 'theme-hero',
    icon: '✨',
    runes: '✦ APPARATING THROUGH THE AETHER ✦',
    subtext: 'Materializing across the magical dimensions...',
    sound: playSpellCastSound,
    palette: ['#f5c542', '#ffd700', '#fff3a8', '#ffffff'],
    arrivalSoundFreq: 880.00
  };

  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links .nav-item');

  /* --------------------------------------------------------------------------
   * 8. MAGICAL SPELL PROGRESS BEAM & SCROLL SPY (60FPS RAF-THROTTLED)
   * -------------------------------------------------------------------------- */
  const progressBar = document.getElementById('spell-progress-bar');
  let lastScrollY = window.scrollY;
  let isScrollThrottled = false;

  window.addEventListener('scroll', () => {
    if (isScrollThrottled) return;
    isScrollThrottled = true;

    requestAnimationFrame(() => {
      const scrollPos = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      // 1. Progress beam
      if (totalHeight > 0 && progressBar) {
        const progressPercent = Math.min(100, Math.max(0, (scrollPos / totalHeight) * 100));
        progressBar.style.width = `${progressPercent}%`;
      }

      // 2. Active nav link highlight
      const scrollYTarget = scrollPos + 220;
      let currentId = '';
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollYTarget >= top && scrollYTarget < top + height) {
          currentId = section.getAttribute('id');
        }
      });
      if (currentId) {
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#${currentId}`);
        });
      }

      // 3. Fast scroll embers (Desktop only — never on mobile to prevent touch scroll stutter)
      if (!isTouchDevice) {
        const scrollDelta = Math.abs(scrollPos - lastScrollY);
        if (scrollDelta > 30) {
          for (let i = 0; i < 2; i++) {
            particles.push(new Sparkle(
              window.innerWidth - 30 + (Math.random() - 0.5) * 40,
              Math.random() * window.innerHeight
            ));
          }
        }
      }

      lastScrollY = scrollPos;
      isScrollThrottled = false;
    });
  }, { passive: true });

  /* --------------------------------------------------------------------------
   * 9. MAGICAL SCROLL REVEAL OBSERVER (INTERSECTION OBSERVER)
   * -------------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(`
    .section-header,
    .about-visual-column,
    .about-text-column,
    .honours-diploma-banner,
    .spell-card,
    .featured-project-banner,
    .project-detailed-card,
    .chronicle-card,
    .owl-post-card,
    .timeline-node,
    .philosophy-formula-box
  `);

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    // Stagger delay for adjacent cards
    const delayIndex = (index % 4) + 1;
    el.classList.add(`delay-${delayIndex}`);
  });

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        
        // Spawn subtle greeting sparkles near the element
        const rect = entry.target.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight) {
          for (let i = 0; i < 6; i++) {
            particles.push(new Sparkle(
              rect.left + Math.random() * rect.width,
              rect.top + Math.random() * 40
            ));
          }
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealTargets.forEach(el => scrollObserver.observe(el));

  // Section active aura wave on entering viewport
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-in-view');
      } else {
        entry.target.classList.remove('section-in-view');
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.realm-section').forEach(sec => sectionObserver.observe(sec));

  /* --------------------------------------------------------------------------
   * 10. ARCANE FULL-SCREEN APPARITION TRANSITIONS (FOR CLICKED LINKS)
   * -------------------------------------------------------------------------- */
  const portalOverlay = document.getElementById('arcane-portal-overlay');
  const portalIcon = document.getElementById('portal-icon');
  const portalRunes = document.getElementById('portal-runes');
  const portalSubtext = document.getElementById('portal-subtext');
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      initAudio();
      isClickApparating = true;

      const config = sectionTransitionConfigs[targetId] || defaultTransitionConfig;

      // Update overlay theme and content
      if (portalOverlay) {
        portalOverlay.classList.remove('theme-hero', 'theme-about', 'theme-skills', 'theme-projects', 'theme-journey', 'theme-contact');
        portalOverlay.classList.add(config.themeClass);
      }
      if (portalIcon) portalIcon.textContent = config.icon;
      if (portalRunes) portalRunes.textContent = config.runes;
      if (portalSubtext) portalSubtext.textContent = config.subtext;

      // Play dedicated section transition sound
      config.sound();

      // Show overlay with split dimensional wipe
      if (portalOverlay) {
        portalOverlay.classList.add('active');
      }

      // Burst themed sparkles from screen center
      for (let i = 0; i < 45; i++) {
        const randColor = config.palette[Math.floor(Math.random() * config.palette.length)];
        particles.push(new Sparkle(window.innerWidth / 2, window.innerHeight / 2, randColor));
      }

      // Smooth scroll to target destination
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Close portal overlay and trigger arrival celebration
        setTimeout(() => {
          if (portalOverlay) {
            portalOverlay.classList.remove('active');
          }

          // Reset click apparating flag and synchronize active realm
          activeScrollRealm = targetId.replace('#', '');
          setTimeout(() => {
            isClickApparating = false;
          }, 300);

          // Play arrival celestial chime
          playChimeNote(config.arrivalSoundFreq, 0.8);

          // Flash arrival sparkles across destination
          const rect = targetElement.getBoundingClientRect();
          for (let i = 0; i < 35; i++) {
            const randColor = config.palette[Math.floor(Math.random() * config.palette.length)];
            particles.push(new Sparkle(
              rect.left + Math.random() * rect.width,
              window.innerHeight * 0.35 + (Math.random() - 0.5) * 160,
              randColor
            ));
          }

          // Section arrival surge animation
          targetElement.classList.remove('section-arrival-surge');
          void targetElement.offsetWidth;
          targetElement.classList.add('section-arrival-surge');

          // Section title luminous surge
          const secTitle = targetElement.querySelector('.section-title, .hero-title');
          if (secTitle) {
            secTitle.classList.remove('title-arrival-glow');
            void secTitle.offsetWidth;
            secTitle.classList.add('title-arrival-glow');
          }

          // Section arrival shockwave ring
          const header = targetElement.querySelector('.section-header, .hero-content-wrapper');
          if (header) {
            const wave = document.createElement('div');
            wave.className = 'arrival-shockwave';
            if (config.palette[0]) wave.style.borderColor = config.palette[0];
            header.style.position = 'relative';
            header.appendChild(wave);
            setTimeout(() => wave.remove(), 950);
          }
        }, 420);
      }, 260);
    });
  });

  /* --------------------------------------------------------------------------
   * 11. HEDWIG THE SNOWY OWL ARRIVAL SEQUENCE (SOARS FROM BOTTOM-RIGHT TO TOP-LEFT)
   * -------------------------------------------------------------------------- */
  const owlFlight = document.getElementById('owl-flight-box');

  if (owlFlight) {
    // Sparkle trail following the flying owl as it climbs across screen
    let owlTrailInterval = setInterval(() => {
      const rect = owlFlight.getBoundingClientRect();
      if (rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight) {
        for (let i = 0; i < 3; i++) {
          particles.push(new Sparkle(
            rect.left + rect.width * 0.45 + (Math.random() - 0.5) * 36,
            rect.top + rect.height * 0.55 + (Math.random() - 0.5) * 28
          ));
        }
      }
    }, 45);

    // After 4.5s when owl soars over the top-left and exits completely, remove from DOM
    setTimeout(() => {
      clearInterval(owlTrailInterval);
      if (owlFlight && owlFlight.parentNode) {
        owlFlight.parentNode.removeChild(owlFlight); // Completely removed from DOM - NEVER loops!
      } else if (owlFlight) {
        owlFlight.remove();
      }
    }, 4550);
  }

  /* --------------------------------------------------------------------------
   * 12. DYNAMIC HERO RUNIC TYPING ENGINE
   * -------------------------------------------------------------------------- */
  const typingRune = document.getElementById('hero-typing-rune');
  if (typingRune) {
    const titles = [
      'Creative Technologist',
      'Theoretical Physics Researcher (QSIL)',
      'Artificial Intelligence Engineer',
      'Author of QSIL (DOI: 10.5281/zenodo.22996262)',
      'Full-Stack Web & Android Developer',
      'Tamil Music & Visual Storyteller',
      'B.Tech Computer Science Scholar'
    ];
    let titleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function runTypingLoop() {
      const currentTitle = titles[titleIdx];

      if (isDeleting) {
        charIdx--;
        typingRune.textContent = currentTitle.substring(0, charIdx);
      } else {
        charIdx++;
        typingRune.textContent = currentTitle.substring(0, charIdx);
      }

      let typingSpeed = isDeleting ? 30 : 65;

      if (!isDeleting && charIdx === currentTitle.length) {
        // Hold title on screen for 2.2s
        typingSpeed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        typingSpeed = 450;
      }

      setTimeout(runTypingLoop, typingSpeed);
    }

    runTypingLoop();
  }

  /* --------------------------------------------------------------------------
   * 13. MODAL CONTROLLER & HELPER
   * -------------------------------------------------------------------------- */
  function closeAllArcaneModals() {
    if (sortingHatModal) sortingHatModal.classList.add('hidden');
    if (wandModal) wandModal.classList.add('hidden');
    if (resumeModal) resumeModal.classList.add('hidden');
  }

  /* --------------------------------------------------------------------------
   * 14. THE SORTING HAT CEREMONY MINI-GAME
   * -------------------------------------------------------------------------- */
  const sortingHatModal = document.getElementById('sorting-hat-modal');
  const sortingHatBtn = document.getElementById('sorting-hat-btn');
  const closeSortingHatBtn = document.getElementById('close-sorting-hat');
  const hatSpeech = document.getElementById('hat-speech-text');
  const quizStep = document.getElementById('sorting-quiz-step');
  const quizCounter = document.getElementById('quiz-counter');
  const quizTitle = document.getElementById('quiz-question-title');
  const quizOptionsList = document.getElementById('quiz-options-list');
  const resultStep = document.getElementById('sorting-result-step');
  const houseCrest = document.getElementById('house-crest-badge');
  const houseName = document.getElementById('house-name');
  const houseDesc = document.getElementById('house-desc');
  const applyAuraBtn = document.getElementById('apply-house-aura-btn');
  const retakeBtn = document.getElementById('retake-sorting-btn');

  const sortingHatQuestions = [
    {
      title: "When tackling an impossible technical challenge, what drives you?",
      options: [
        { text: "Courage to experiment boldly and push uncharted frontiers", house: "gryffindor" },
        { text: "Intellectual depth, byte-level mastery, and architectural elegance", house: "ravenclaw" },
        { text: "Ambition to outmaneuver constraints and forge high-impact triumphs", house: "slytherin" },
        { text: "Patience, unwavering dedication, and building reliable community tools", house: "hufflepuff" }
      ]
    },
    {
      title: "What magical artifact calls to your deepest ambitions?",
      options: [
        { text: "The Sword of Godric Gryffindor — defending allies and leading with valor", house: "gryffindor" },
        { text: "The Diadem of Rowena Ravenclaw — unlocking infinite wisdom & secret truths", house: "ravenclaw" },
        { text: "The Elder Wand & Resurrection Stone — unmatched mastery, power, and legacy", house: "slytherin" },
        { text: "Helga Hufflepuff's Golden Cup — enduring fellowship, warmth, and resilience", house: "hufflepuff" }
      ]
    },
    {
      title: "Which realm of arcane engineering inspires your soul?",
      options: [
        { text: "High-octane mobile systems & rapid emergency prototypes", house: "gryffindor" },
        { text: "Neural voice AI, knowledge retrieval, and autonomous algorithms", house: "ravenclaw" },
        { text: "Scalable commercial platforms, product strategy, and creative direction", house: "slytherin" },
        { text: "Decentralized offline mesh networks and accessible tools for all", house: "hufflepuff" }
      ]
    }
  ];

  const houseData = {
    gryffindor: {
      name: "GRYFFINDOR!",
      crest: "🦁",
      themeClass: "house-gryffindor",
      desc: "Bravery, daring, and chivalry! You build boldly and face the fiercest technical dragons without flinching. True to Godric Gryffindor's legacy!",
      color: "#ef4444"
    },
    ravenclaw: {
      name: "RAVENCLAW!",
      crest: "🦅",
      themeClass: "house-ravenclaw",
      desc: "Wit, wisdom, and boundless intellect! You master deep neural arithmancy, elegant algorithms, and clean system design. Wisdom beyond measure is your greatest treasure!",
      color: "#38bdf8"
    },
    slytherin: {
      name: "SLYTHERIN!",
      crest: "🐍",
      themeClass: "house-slytherin",
      desc: "Ambition, cunning, and resourcefulness! You forge high-impact innovations, outmaneuver systemic bottlenecks, and turn grand visions into triumph!",
      color: "#10b981"
    },
    hufflepuff: {
      name: "HUFFLEPUFF!",
      crest: "🦡",
      themeClass: "house-hufflepuff",
      desc: "Loyalty, patience, and unbreakable dedication! You craft reliable, resilient systems and empower the community with unwavering integrity!",
      color: "#eab308"
    }
  };

  let currentHatQuestionIdx = 0;
  let houseScores = { gryffindor: 0, ravenclaw: 0, slytherin: 0, hufflepuff: 0 };
  let activeSortedHouse = 'gryffindor';

  function openSortingHatModal() {
    initAudio();
    playSpellCastSound();
    if (sortingHatModal) sortingHatModal.classList.remove('hidden');
    resetSortingHat();
  }

  function closeSortingHatModal() {
    if (sortingHatModal) sortingHatModal.classList.add('hidden');
  }

  function toggleSortingHatModal() {
    if (!sortingHatModal) return;
    if (sortingHatModal.classList.contains('hidden')) {
      openSortingHatModal();
    } else {
      closeSortingHatModal();
    }
  }

  function resetSortingHat() {
    currentHatQuestionIdx = 0;
    houseScores = { gryffindor: 0, ravenclaw: 0, slytherin: 0, hufflepuff: 0 };
    if (hatSpeech) {
      hatSpeech.textContent = "“Step forward, young wizard! Let me peer inside your mind and see where your true magic belongs...”";
    }
    if (quizStep) quizStep.classList.remove('hidden');
    if (resultStep) resultStep.classList.add('hidden');
    renderSortingQuestion();
  }

  function renderSortingQuestion() {
    if (!quizStep || !quizTitle || !quizOptionsList) return;
    const q = sortingHatQuestions[currentHatQuestionIdx];
    if (quizCounter) quizCounter.textContent = `Incantation ${currentHatQuestionIdx + 1} of ${sortingHatQuestions.length}`;
    quizTitle.textContent = q.title;
    quizOptionsList.innerHTML = '';

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span class="opt-bullet">✦</span> <span>${opt.text}</span>`;
      btn.addEventListener('click', () => {
        handleSortingAnswer(opt.house);
      });
      quizOptionsList.appendChild(btn);
    });
  }

  function handleSortingAnswer(house) {
    initAudio();
    playChimeNote(600 + Math.random() * 300, 0.3);
    houseScores[house] = (houseScores[house] || 0) + 1;

    // Hat murmurs
    const hatMurmurs = [
      "“Fascinating... yes, there is great strength here...”",
      "“A sharp mind, full of ambition and courage...”",
      "“Ah! I see... your magical core is coming into focus!”"
    ];
    if (hatSpeech) {
      hatSpeech.textContent = hatMurmurs[currentHatQuestionIdx] || "“Intriguing...”";
    }

    currentHatQuestionIdx++;
    if (currentHatQuestionIdx < sortingHatQuestions.length) {
      renderSortingQuestion();
    } else {
      revealSortingResult();
    }
  }

  function revealSortingResult() {
    if (!quizStep || !resultStep) return;
    quizStep.classList.add('hidden');
    resultStep.classList.remove('hidden');

    // Find highest score
    let highestHouse = 'gryffindor';
    let maxPts = -1;
    for (const h in houseScores) {
      if (houseScores[h] > maxPts) {
        maxPts = houseScores[h];
        highestHouse = h;
      }
    }
    activeSortedHouse = highestHouse;
    const won = houseData[highestHouse];

    if (hatSpeech) {
      hatSpeech.textContent = `“Ah, yes! Better be... ${won.name.replace('!', '')}! Your spirit shines brightly!”`;
    }
    if (houseCrest) houseCrest.textContent = won.crest;
    if (houseName) {
      houseName.textContent = won.name;
      houseName.style.color = won.color;
    }
    if (houseDesc) houseDesc.textContent = won.desc;

    // Victory chime & fireworks
    playVictoryFanfare();
    for (let i = 0; i < 60; i++) {
      particles.push(new Sparkle(window.innerWidth / 2, window.innerHeight * 0.45, won.color));
    }
  }

  function applyHouseAura(houseKey) {
    const won = houseData[houseKey];
    if (!won) return;

    // Remove previous house classes
    document.body.classList.remove('house-gryffindor', 'house-ravenclaw', 'house-slytherin', 'house-hufflepuff');
    document.body.classList.add(won.themeClass);
    localStorage.setItem('hogwartsHouse', houseKey);

    initAudio();
    playSpellCastSound();
    showSpellBanner(`✨ HOGWARTS AURA ATTUNED TO ${won.name}`);

    // Burst aura sparkles
    for (let i = 0; i < 40; i++) {
      particles.push(new Sparkle(window.innerWidth / 2, window.innerHeight / 2, won.color));
    }

    setTimeout(() => {
      closeSortingHatModal();
    }, 1200);
  }

  // Restore saved house aura on load
  const savedHouse = localStorage.getItem('hogwartsHouse');
  if (savedHouse && houseData[savedHouse]) {
    document.body.classList.add(houseData[savedHouse].themeClass);
  }

  if (sortingHatBtn) sortingHatBtn.addEventListener('click', openSortingHatModal);
  if (closeSortingHatBtn) closeSortingHatBtn.addEventListener('click', closeSortingHatModal);
  if (retakeBtn) retakeBtn.addEventListener('click', resetSortingHat);
  if (applyAuraBtn) applyAuraBtn.addEventListener('click', () => applyHouseAura(activeSortedHouse));

  if (sortingHatModal) {
    sortingHatModal.addEventListener('click', (e) => {
      if (e.target === sortingHatModal) closeSortingHatModal();
    });
  }

  /* --------------------------------------------------------------------------
   * 15. CHAMBER OF PROJECTS LIVE FILTER & SEARCH
   * -------------------------------------------------------------------------- */
  const projectSearchInput = document.getElementById('project-search-input');
  const clearProjectSearchBtn = document.getElementById('clear-project-search');
  const projectFilterTabs = document.querySelectorAll('.p-filter-tab');
  const projectCards = document.querySelectorAll('.project-detailed-card');

  let activeProjectFilter = 'all';
  let projectSearchQuery = '';

  function filterProjects() {
    let matchCount = 0;
    projectCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardText = (card.textContent || '').toLowerCase();

      const matchesFilter = activeProjectFilter === 'all' || cardCategory.toLowerCase().includes(activeProjectFilter);
      const matchesSearch = !projectSearchQuery || cardText.includes(projectSearchQuery);

      if (matchesFilter && matchesSearch) {
        card.classList.remove('project-card-hidden');
        matchCount++;
      } else {
        card.classList.add('project-card-hidden');
      }
    });
  }

  if (projectSearchInput) {
    projectSearchInput.addEventListener('input', (e) => {
      projectSearchQuery = (e.target.value || '').trim().toLowerCase();
      if (clearProjectSearchBtn) {
        if (projectSearchQuery) {
          clearProjectSearchBtn.classList.remove('hidden');
        } else {
          clearProjectSearchBtn.classList.add('hidden');
        }
      }
      filterProjects();
    });
  }

  if (clearProjectSearchBtn) {
    clearProjectSearchBtn.addEventListener('click', () => {
      if (projectSearchInput) {
        projectSearchInput.value = '';
        projectSearchQuery = '';
        projectSearchInput.focus();
      }
      clearProjectSearchBtn.classList.add('hidden');
      playChimeNote(520, 0.2);
      filterProjects();
    });
  }

  projectFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      projectFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeProjectFilter = tab.getAttribute('data-filter') || 'all';

      initAudio();
      playChimeNote(784, 0.3);
      filterProjects();
    });
  });

  /* --------------------------------------------------------------------------
   * 15.1 CHOCOLATE FROG CARDS: 3D HOLOGRAPHIC FOIL & CARD FLIP CONTROLLER
   * -------------------------------------------------------------------------- */
  const holographicTiltCards = document.querySelectorAll('.chocolate-frog-card, .spell-card.chocolate-frog-tilt');

  holographicTiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const pctX = Math.round((x / rect.width) * 100);
      const pctY = Math.round((y / rect.height) * 100);
      card.style.setProperty('--foil-x', `${pctX}%`);
      card.style.setProperty('--foil-y', `${pctY}%`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -8;
      const rotY = ((x - centerX) / centerX) * 8;

      const inner = card.querySelector('.cf-card-inner');
      const isFlipped = card.classList.contains('is-flipped');

      if (inner) {
        if (!isFlipped) {
          inner.style.transform = `perspective(1400px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        } else {
          inner.style.transform = `perspective(1400px) rotateX(${rotX.toFixed(2)}deg) rotateY(${(180 + rotY).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        }
      } else {
        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--foil-x', `50%`);
      card.style.setProperty('--foil-y', `50%`);

      const inner = card.querySelector('.cf-card-inner');
      const isFlipped = card.classList.contains('is-flipped');

      if (inner) {
        inner.style.transform = isFlipped ? 'rotateY(180deg)' : 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      } else {
        card.style.transform = '';
      }
    });
  });

  // Flip trigger click handling with sound & animation
  document.addEventListener('click', (e) => {
    const flipTrigger = e.target.closest('.cf-flip-trigger, .cf-flip-back-trigger');
    if (flipTrigger) {
      e.preventDefault();
      e.stopPropagation();
      const card = flipTrigger.closest('.chocolate-frog-card');
      if (card) {
        initAudio();
        card.classList.toggle('is-flipped');
        playCardFlipSound();
        const inner = card.querySelector('.cf-card-inner');
        if (inner) {
          inner.style.transform = card.classList.contains('is-flipped') ? 'rotateY(180deg)' : 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
      }
    }
  });

  /* --------------------------------------------------------------------------
   * 16. OLLIVANDERS WAND CORE CUSTOMIZER
   * -------------------------------------------------------------------------- */
  const wandModal = document.getElementById('wand-core-modal');
  const wandBtn = document.getElementById('wand-core-btn');
  const closeWandBtn = document.getElementById('close-wand-modal');
  const wandCards = document.querySelectorAll('.wand-card');

  function openWandModal() {
    initAudio();
    playSpellCastSound();
    if (wandModal) wandModal.classList.remove('hidden');
  }

  function closeWandModal() {
    if (wandModal) wandModal.classList.add('hidden');
  }

  function toggleWandModal() {
    if (!wandModal) return;
    if (wandModal.classList.contains('hidden')) {
      openWandModal();
    } else {
      closeWandModal();
    }
  }

  function selectWandCore(core) {
    if (!wandCorePalettes[core]) return;
    currentWandCore = core;
    currentWandPalette = wandCorePalettes[core];

    wandCards.forEach(c => {
      const isSelected = c.getAttribute('data-core') === core;
      c.classList.toggle('active', isSelected);
      const tag = c.querySelector('.wand-select-tag');
      if (tag) {
        tag.textContent = isSelected ? 'Active Core' : 'Select Core';
      }
    });

    const glow = getActiveWandGlow();
    if (wandCursor) {
      wandCursor.style.borderColor = glow;
      wandCursor.style.boxShadow = `0 0 16px ${glow}, inset 0 0 8px ${glow}`;
    }

    initAudio();
    playSpellCastSound();
    showSpellBanner(`🪄 WAND CORE ATTUNED: ${core.toUpperCase()}`);

    // Burst 45 sparkles in chosen core's color palette
    for (let i = 0; i < 45; i++) {
      particles.push(new Sparkle(window.innerWidth / 2, window.innerHeight / 2));
    }
  }

  if (wandBtn) wandBtn.addEventListener('click', openWandModal);
  if (closeWandBtn) closeWandBtn.addEventListener('click', closeWandModal);
  if (wandModal) {
    wandModal.addEventListener('click', (e) => {
      if (e.target === wandModal) closeWandModal();
    });
  }

  wandCards.forEach(card => {
    card.addEventListener('click', () => {
      const core = card.getAttribute('data-core');
      selectWandCore(core);
    });
  });

  /* --------------------------------------------------------------------------
   * 17. HOGWARTS PARCHMENT RESUME MODAL & PRINT VIEW
   * -------------------------------------------------------------------------- */
  const resumeModal = document.getElementById('parchment-resume-modal');
  const openResumeBtn = document.getElementById('open-resume-btn');
  const navResumeBtn = document.getElementById('nav-resume-btn');
  const contactResumePill = document.getElementById('contact-resume-pill');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');

  function openResumeModal() {
    initAudio();
    playSpellCastSound();
    if (resumeModal) resumeModal.classList.remove('hidden');
  }

  function closeResumeModal() {
    if (resumeModal) resumeModal.classList.add('hidden');
  }

  function toggleResumeModal() {
    if (!resumeModal) return;
    if (resumeModal.classList.contains('hidden')) {
      openResumeModal();
    } else {
      closeResumeModal();
    }
  }

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResumeModal);
  if (navResumeBtn) navResumeBtn.addEventListener('click', openResumeModal);
  if (contactResumePill) contactResumePill.addEventListener('click', openResumeModal);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeModal);
  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      initAudio();
      playChimeNote(880, 0.4);
      showSpellBanner('📜 SUMMONING PARCHMENT PRINT... ✦');
      window.print();
    });
  }

  /* --------------------------------------------------------------------------
   * 18. MARAUDER'S MAP ANIMATED INK FOOTSTEPS ENGINE
   * -------------------------------------------------------------------------- */
  const marauderCanvas = document.getElementById('marauders-canvas');
  if (marauderCanvas) {
    const mCtx = marauderCanvas.getContext('2d');
    let footprints = [];
    let inkRipples = [];

    function resizeMarauder() {
      marauderCanvas.width = window.innerWidth;
      marauderCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeMarauder);
    resizeMarauder();

    class Footprint {
      constructor(x, y, angle, isLeft, label = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.isLeft = isLeft;
        this.label = label;
        this.alpha = 0.85;
        this.decay = 0.0035; // Fades gracefully over ~4.5 seconds
      }

      update() {
        this.alpha -= this.decay;
      }

      draw() {
        mCtx.save();
        mCtx.translate(this.x, this.y);
        mCtx.rotate(this.angle);
        mCtx.globalAlpha = Math.max(0, this.alpha);

        const side = this.isLeft ? -1 : 1;
        mCtx.fillStyle = 'rgba(168, 120, 72, 0.75)';
        mCtx.shadowColor = 'rgba(212, 175, 55, 0.35)';
        mCtx.shadowBlur = 3;

        // Front sole
        mCtx.beginPath();
        mCtx.ellipse(side * 5, -8, 4.2, 8.5, side * 0.08, 0, Math.PI * 2);
        mCtx.fill();

        // Rear heel
        mCtx.beginPath();
        mCtx.ellipse(side * 5, 8, 3.6, 5, 0, 0, Math.PI * 2);
        mCtx.fill();

        // Subtle Marauder character label
        if (this.label && this.alpha > 0.35) {
          mCtx.font = 'italic 10px "Cinzel Decorative", Georgia, serif';
          mCtx.fillStyle = 'rgba(212, 175, 55, 0.8)';
          mCtx.fillText(this.label, side * 14, 2);
        }

        mCtx.restore();
      }
    }

    class InkRipple {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.maxRadius = 70;
        this.alpha = 0.6;
      }

      update() {
        this.radius += 1.8;
        this.alpha -= 0.016;
      }

      draw() {
        mCtx.save();
        mCtx.globalAlpha = Math.max(0, this.alpha);
        mCtx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
        mCtx.lineWidth = 1.5;
        mCtx.beginPath();
        mCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        mCtx.stroke();
        mCtx.restore();
      }
    }

    let marauderAnimId = null;
    function renderMarauder() {
      if (footprints.length === 0 && inkRipples.length === 0) {
        mCtx.clearRect(0, 0, marauderCanvas.width, marauderCanvas.height);
        marauderAnimId = null;
        return;
      }
      mCtx.clearRect(0, 0, marauderCanvas.width, marauderCanvas.height);

      for (let i = 0; i < footprints.length; i++) {
        footprints[i].update();
        footprints[i].draw();
        if (footprints[i].alpha <= 0) {
          footprints.splice(i, 1);
          i--;
        }
      }

      for (let j = 0; j < inkRipples.length; j++) {
        inkRipples[j].update();
        inkRipples[j].draw();
        if (inkRipples[j].alpha <= 0) {
          inkRipples.splice(j, 1);
          j--;
        }
      }

      marauderAnimId = requestAnimationFrame(renderMarauder);
    }

    function startMarauderLoop() {
      if (!marauderAnimId && (footprints.length > 0 || inkRipples.length > 0)) {
        marauderAnimId = requestAnimationFrame(renderMarauder);
      }
    }

    const origFootprintsPush = footprints.push.bind(footprints);
    footprints.push = function(...items) {
      const res = origFootprintsPush(...items);
      startMarauderLoop();
      return res;
    };

    const origRipplesPush = inkRipples.push.bind(inkRipples);
    inkRipples.push = function(...items) {
      const res = origRipplesPush(...items);
      startMarauderLoop();
      return res;
    };

    // Spawn a walking patrol along bottom screen margin every 9 seconds (PC only to preserve mobile GPU)
    if (!isTouchDevice) {
      const marauderWalkers = ['Jaya Surya', 'Moony', 'Padfoot', 'Prongs'];
      function startWalkerPatrol() {
        const walker = marauderWalkers[Math.floor(Math.random() * marauderWalkers.length)];
        const stepCount = 7;
        const startX = 60 + Math.random() * (window.innerWidth - 300);
        const startY = window.innerHeight - 60 - Math.random() * 80;
        const angle = (Math.random() - 0.5) * 0.4;

        for (let s = 0; s < stepCount; s++) {
          setTimeout(() => {
            const stepX = startX + Math.cos(angle) * (s * 28);
            const stepY = startY + Math.sin(angle) * (s * 28);
            const isLeft = s % 2 === 0;
            const label = s === 1 ? walker : null;
            footprints.push(new Footprint(stepX, stepY, angle + Math.PI / 2, isLeft, label));
          }, s * 550);
        }
      }

      setTimeout(() => {
        startWalkerPatrol();
        setInterval(startWalkerPatrol, 10000);
      }, 2500);
    }

    // On background click, spawn an ink ripple on Marauder's canvas
    window.addEventListener('click', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      inkRipples.push(new InkRipple(e.clientX, e.clientY));
    });
  }

  /* --------------------------------------------------------------------------
   * 19. MOBILE & DESKTOP ZERO-LAG VIDEO ORCHESTRATION (INTERSECTION OBSERVER)
   * -------------------------------------------------------------------------- */
  const backgroundVideos = document.querySelectorAll('video');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { rootMargin: '60px 0px', threshold: 0.05 });

    backgroundVideos.forEach(vid => videoObserver.observe(vid));
  }

});


