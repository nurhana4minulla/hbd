/* ============================================================
   BIRTHDAY WEBSITE — script.js
   ============================================================ */

'use strict';

// ─── PAGE NAVIGATION ──────────────────────────────────────────
let currentPage = 1;
const TOTAL_PAGES = 6;

function goToPage(num) {
  if (num === currentPage) return;
  const from = document.getElementById(`page${currentPage}`);
  const to   = document.getElementById(`page${num}`);
  if (!from || !to) return;

  from.classList.add('page--exit');
  from.classList.remove('page--active');

  to.classList.add('page--enter');

  // Force reflow so CSS transition fires
  void to.offsetWidth;

  setTimeout(() => {
    from.classList.remove('page--exit');
    to.classList.remove('page--enter');
    to.classList.add('page--active');
    currentPage = num;
    onPageEnter(num);
  }, 480);
}

function onPageEnter(num) {
  if (num === 1) { initPage1(); playBGM(BGM.hbd); }
  if (num === 2) { initPage2(); playBGM(BGM.hbd); } // no-op: already playing
  if (num === 3) { stopBGM(); }                     // silence
  if (num === 4) { /* silence */ }                   // stays silent
  if (num === 5) { initPage5(); playBGM(BGM.game); }
  if (num === 6) { initPage6(); playBGM(BGM.hbd); }
}

// ─── AUDIO MANAGER ────────────────────────────────────────────
// BGM routing: pages 1,2,6 → hbd.mp3 | pages 3,4 → silence | page 5 → game.mp3
const BGM = {
  hbd:  new Audio('assets/music/hbd.mp3'),
  game: new Audio('assets/music/game.mp3'),
};
BGM.hbd.loop  = true;
BGM.game.loop = true;

const TARGET_VOL  = 0.65;
let _currentBGM   = null;
const _fadeTimers = new WeakMap();

function _clearFade(audio) {
  if (_fadeTimers.has(audio)) {
    clearInterval(_fadeTimers.get(audio));
    _fadeTimers.delete(audio);
  }
}

function _fadeTo(audio, targetVol, duration, onDone) {
  _clearFade(audio);
  const startVol = audio.volume;
  const steps    = Math.max(1, Math.round(duration / 40));
  const stepVol  = (targetVol - startVol) / steps;
  let   step     = 0;
  const id = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, startVol + stepVol * step));
    if (step >= steps) {
      clearInterval(id);
      _fadeTimers.delete(audio);
      if (targetVol <= 0) { audio.pause(); audio.currentTime = 0; }
      onDone && onDone();
    }
  }, 40);
  _fadeTimers.set(audio, id);
}

// Tracks whether we already have a pending "resume on interaction" listener,
// so we never stack duplicate listeners when autoplay is blocked.
let _pendingResumeRegistered = false;

function _registerResumeOnce(audio) {
  if (_pendingResumeRegistered) return;
  _pendingResumeRegistered = true;
  const resume = () => {
    _pendingResumeRegistered = false;
    if (_currentBGM === audio && audio.paused) {
      audio.play().catch(() => {});
      _fadeTo(audio, TARGET_VOL, 800);
    }
  };
  document.addEventListener('click',      resume, { once: true });
  document.addEventListener('touchstart', resume, { once: true });
}

function playBGM(audio) {
  if (_currentBGM === audio) return; // Already the right track — do nothing
  const prev    = _currentBGM;
  _currentBGM   = audio;

  const startNew = () => {
    audio.volume = 0;
    audio.play().catch(() => {
      // Autoplay blocked — defer to next user interaction
      _registerResumeOnce(audio);
    });
    _fadeTo(audio, TARGET_VOL, 900);
  };

  if (prev && !prev.paused) {
    _fadeTo(prev, 0, 500, startNew);
  } else {
    startNew();
  }
}

function stopBGM() {
  if (!_currentBGM) return;
  const prev  = _currentBGM;
  _currentBGM = null;
  _fadeTo(prev, 0, 500);
}

// Attempt autoplay on page load; if blocked, wait for first interaction
function _tryAutoplay() {
  const audio  = BGM.hbd;
  _currentBGM  = audio;
  audio.volume = 0;
  audio.play().then(() => {
    _fadeTo(audio, TARGET_VOL, 1200);
  }).catch(() => {
    // Autoplay blocked — reuse the shared resume-on-interaction helper
    _registerResumeOnce(audio);
  });
}

// ─── PAGE 1 — HAPPY BIRTHDAY ──────────────────────────────────
function initPage1() {
  spawnPetals('petal-container', 22);
  spawnSparkles();
}

function spawnPetals(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#F4B8C8','#E8A4B8','#C4B5D4','#F2C9A0','#FFD6E0','#E0D0F0'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'petal-el';
    el.style.left     = Math.random() * 100 + 'vw';
    el.style.top      = '-40px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width    = (8 + Math.random() * 10) + 'px';
    el.style.height   = (14 + Math.random() * 14) + 'px';
    el.style.animationDuration = (6 + Math.random() * 9) + 's';
    el.style.animationDelay   = (Math.random() * 8) + 's';
    container.appendChild(el);
    el.addEventListener('animationend', () => {
      // Recycle petal
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDelay = '0s';
      void el.offsetWidth;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
      el.style.animationDuration = (6 + Math.random() * 9) + 's';
    });
  }
}

function spawnSparkles() {
  const container = document.getElementById('sparkle-container');
  if (!container) return;
  function createSparkle() {
    const el = document.createElement('div');
    el.className = 'sparkle-el';
    el.style.left    = Math.random() * 100 + 'vw';
    el.style.top     = Math.random() * 100 + 'vh';
    el.style.width   = el.style.height = (3 + Math.random() * 5) + 'px';
    el.style.background = Math.random() > .5 ? '#FFD6E8' : '#E0D0FF';
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
  for (let i = 0; i < 18; i++) createSparkle();
  setInterval(() => createSparkle(), 800);
}

// ─── PAGE 2 — BIRTHDAY MESSAGE ────────────────────────────────
function initPage2() {
  spawnPetals('petal-container-2', 12);
}

// ─── BUTTON LISTENERS — PAGE 1 & 2 ───────────────────────────
document.getElementById('p1-next').addEventListener('click', () => goToPage(2));
document.getElementById('p2-next').addEventListener('click', () => goToPage(3));

// ─── PAGE 3 — MEME SELECTION ──────────────────────────────────
const memeCards     = document.querySelectorAll('.meme-card');
const overlay       = document.getElementById('processing-overlay');
const processingTxt = document.getElementById('processing-text');
const revealBtn     = document.getElementById('processing-reveal');

const processingSteps = [
  'Choice received...',
  'Analyzing...',
  'Processing...',
  '...',
  'Interesting.',
];

// Replace meme images with placeholders if images fail to load
memeCards.forEach((card, i) => {
  const img = card.querySelector('.meme-img');
  const wrap = card.querySelector('.meme-img-wrap');
  const placeholders = ['🐱', '🏆', '❓', '🏳'];
  // Note: if SVG images load, no placeholder is needed
  img.addEventListener('error', () => {
    img.style.display = 'none';
    const ph = document.createElement('div');
    ph.className = 'meme-img-placeholder';
    ph.textContent = placeholders[i] || '🎉';
    wrap.appendChild(ph);
  });
});

function runProcessingAnimation() {
  overlay.classList.add('visible');
  revealBtn.style.display = 'none';
  processingTxt.textContent = processingSteps[0];

  let step = 1;
  const delays = [800, 900, 800, 700, 900];

  function next() {
    if (step < processingSteps.length) {
      setTimeout(() => {
        processingTxt.style.opacity = '0';
        setTimeout(() => {
          processingTxt.textContent = processingSteps[step];
          processingTxt.style.opacity = '1';
          step++;
          next();
        }, 220);
      }, delays[step - 1]);
    } else {
      // Show reveal button
      setTimeout(() => {
        revealBtn.style.display = '';
        revealBtn.style.animation = 'fade-up .4s both';
      }, 600);
    }
  }
  next();
}

memeCards.forEach(card => {
  card.addEventListener('click', () => {
    memeCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    runProcessingAnimation();
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

revealBtn.addEventListener('click', () => {
  overlay.classList.remove('visible');
  goToPage(4);
});

// ─── PAGE 4 — VIDEO REVEAL ────────────────────────────────────
const video        = document.getElementById('birthday-video');
const playOverlay  = document.getElementById('video-play-overlay');
const playBtn      = document.getElementById('video-play-btn');
const videoMissing = document.getElementById('video-missing');
const p4Next       = document.getElementById('p4-next');
const videoSkipBtn = document.getElementById('video-skip-btn');

// Check if video source is accessible
video.addEventListener('error', () => {
  videoMissing.style.display = '';
  playOverlay.style.display = 'none';
  video.style.display = 'none';
});

video.addEventListener('loadedmetadata', () => {
  // Video found — try autoplay
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Autoplay succeeded
      playOverlay.classList.add('hidden');
    }).catch(() => {
      // Autoplay blocked — show overlay
      playOverlay.classList.remove('hidden');
    });
  }
});

playOverlay.addEventListener('click', () => {
  video.play();
  playOverlay.classList.add('hidden');
});
playBtn.addEventListener('click', e => {
  e.stopPropagation();
  video.play();
  playOverlay.classList.add('hidden');
});

video.addEventListener('ended', () => {
  p4Next.style.display = '';
  p4Next.style.animation = 'fade-up .5s both';
});

p4Next.addEventListener('click', () => goToPage(5));
videoSkipBtn && videoSkipBtn.addEventListener('click', () => goToPage(5));

// ─── PAGE 5 — CATCH THE HEARTS GAME ──────────────────────────

// ── Constants ──
const CANVAS_W   = 640;
const CANVAS_H   = 400;
const PLAYER_W   = 72;
const PLAYER_H   = 42;
const PLAYER_SPD = 8;  // pixels per frame at 60fps
const GOAL_SCORE = 10;
const GAME_TIME  = 30;

const ITEM_TYPES = [
  { emoji: '❤️',  value:  1, weight: 5 },
  { emoji: '❤️',  value:  1, weight: 5 },
  { emoji: '💔',  value: -1, weight: 2 },
  { emoji: '⭐',  value:  2, weight: 2 },
  { emoji: '💩',  value: -1, weight: 1 },
];

// ── Game state ──
let gameRunning  = false;
let gameWon      = false;
let gameScore    = 0;
let gameTimeLeft = GAME_TIME;
let gameItems    = [];
let gameLastSpawn = 0;
let gameSpawnInterval = 1200; // ms between spawns
let gameMobileDirLeft  = false;
let gameMobileDirRight = false;
let gameAnimFrame = null;
let gameTimerInterval = null;
let gameLastTime = 0;
let confettiParticles = [];
let confettiRunning = false;

const canvas      = document.getElementById('game-canvas');
const ctx         = canvas.getContext('2d');
const scoreEl     = document.getElementById('game-score');
const timerEl     = document.getElementById('game-timer');
const startOverlay = document.getElementById('game-start-overlay');
const winOverlay   = document.getElementById('game-win-overlay');
const overOverlay  = document.getElementById('game-over-overlay');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

// Scale canvas for display
function resizeCanvas() {
  const wrapper = canvas.parentElement;
  const w = Math.min(wrapper.clientWidth, CANVAS_W);
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.style.width  = w + 'px';
  canvas.style.height = (w * CANVAS_H / CANVAS_W) + 'px';

  confettiCanvas.width  = confettiCanvas.parentElement.clientWidth;
  confettiCanvas.height = confettiCanvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);

let player = { x: CANVAS_W / 2, y: CANVAS_H - 40, w: PLAYER_W, h: PLAYER_H };
const keys = {};

// Game keys — prevent default to stop arrow keys from scrolling the page
const GAME_KEYS = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','A','d','D']);
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (gameRunning && GAME_KEYS.has(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

function pickRandomItem() {
  const totalWeight = ITEM_TYPES.reduce((a, t) => a + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of ITEM_TYPES) {
    r -= t.weight;
    if (r <= 0) return { ...t };
  }
  return { ...ITEM_TYPES[0] };
}

function spawnItem(now) {
  const type = pickRandomItem();
  const margin = 30;
  gameItems.push({
    ...type,
    x:     margin + Math.random() * (CANVAS_W - margin * 2),
    y:     -30,
    speed: 2.8 + Math.random() * 2.4 + (GAME_TIME - gameTimeLeft) * 0.06,
    size:  32,
  });
  gameLastSpawn = now;
  // Gradually speed up spawning
  gameSpawnInterval = Math.max(600, 1200 - (GAME_TIME - gameTimeLeft) * 18);
}

function updateGame(ts) {
  if (!gameRunning) return;
  const now = ts;
  const dt  = Math.min((now - gameLastTime) / 1000, .1); // in seconds
  gameLastTime = now;

  // Move player
  let moved = false;
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || gameMobileDirLeft) {
    player.x -= PLAYER_SPD;
    moved = true;
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D'] || gameMobileDirRight) {
    player.x += PLAYER_SPD;
    moved = true;
  }
  player.x = Math.max(player.w / 2, Math.min(CANVAS_W - player.w / 2, player.x));

  // Spawn items
  if (now - gameLastSpawn > gameSpawnInterval) {
    spawnItem(now);
  }

  // Move items & check collision
  gameItems = gameItems.filter(item => {
    item.y += item.speed;

    // Collision with basket
    const dx = Math.abs(item.x - player.x);
    const dy = item.y - player.y;
    if (dx < player.w / 2 + 8 && dy > -10 && dy < player.h / 2 + 14) {
      gameScore += item.value;
      gameScore  = Math.max(0, gameScore);
      updateHUD();
      if (gameScore >= GOAL_SCORE) {
        winGame();
        return false;
      }
      return false;
    }

    // Off screen
    if (item.y > CANVAS_H + 40) return false;
    return true;
  });

  drawGame();
  gameAnimFrame = requestAnimationFrame(updateGame);
}

function drawGame() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Soft background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#FFF0F8');
  grad.addColorStop(1, '#FDF8F2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw items
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  gameItems.forEach(item => {
    ctx.font = `${item.size}px serif`;
    ctx.fillText(item.emoji, item.x, item.y);
  });

  // Draw player basket
  ctx.font = `${PLAYER_H}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧺', player.x, player.y);
}

function updateHUD() {
  scoreEl.textContent = `${gameScore} / ${GOAL_SCORE}`;
  timerEl.textContent = `${gameTimeLeft}s`;
  if (gameTimeLeft <= 10) {
    timerEl.classList.add('warning');
  } else {
    timerEl.classList.remove('warning');
  }
}

function startGame() {
  // Stop any previous loop
  cancelAnimationFrame(gameAnimFrame);
  clearInterval(gameTimerInterval);

  gameRunning   = false;
  gameWon       = false;
  gameScore     = 0;
  gameTimeLeft  = GAME_TIME;
  gameItems     = [];
  gameLastSpawn = 0;
  gameSpawnInterval = 1200;
  player.x      = CANVAS_W / 2;
  player.y      = CANVAS_H - 40;

  startOverlay.style.display = 'none';
  winOverlay.style.display   = 'none';
  overOverlay.style.display  = 'none';

  updateHUD();
  resizeCanvas();

  // Give canvas focus so keyboard events reach it reliably
  canvas.focus();

  gameRunning = true;
  gameLastTime = performance.now();
  gameAnimFrame = requestAnimationFrame(updateGame);

  gameTimerInterval = setInterval(() => {
    if (!gameRunning) { clearInterval(gameTimerInterval); return; }
    gameTimeLeft--;
    updateHUD();
    if (gameTimeLeft <= 0) {
      clearInterval(gameTimerInterval);
      if (!gameWon) loseGame();
    }
  }, 1000);
}

function winGame() {
  gameRunning = false;
  gameWon     = true;
  clearInterval(gameTimerInterval);
  cancelAnimationFrame(gameAnimFrame);
  drawGame(); // final frame

  setTimeout(() => {
    winOverlay.style.display = '';
    startConfetti();
  }, 200);
}

function loseGame() {
  gameRunning = false;
  cancelAnimationFrame(gameAnimFrame);
  setTimeout(() => {
    overOverlay.style.display = '';
  }, 200);
}

// ── Confetti ──
const CONFETTI_COLORS = ['#E8A4B8','#C4B5D4','#F2C9A0','#F9D84A','#FFB3C6','#A8D8EA'];

function startConfetti() {
  const cw = confettiCanvas.width;
  const ch = confettiCanvas.height;
  confettiParticles = [];
  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x:   Math.random() * cw,
      y:   Math.random() * ch - ch,
      w:   6 + Math.random() * 8,
      h:   4 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot:  Math.random() * 360,
      rotSpeed: (Math.random() - .5) * 5,
      vy:   2 + Math.random() * 3,
      vx:   (Math.random() - .5) * 2,
    });
  }
  confettiRunning = true;
  drawConfetti();
}

function drawConfetti() {
  if (!confettiRunning) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p => {
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot * Math.PI / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
    p.y   += p.vy;
    p.x   += p.vx;
    p.rot += p.rotSpeed;
    if (p.y > confettiCanvas.height + 20) {
      p.y = -10;
      p.x = Math.random() * confettiCanvas.width;
    }
  });
  requestAnimationFrame(drawConfetti);
}

// ── Mobile controls ──
const mobileLeft  = document.getElementById('mobile-left');
const mobileRight = document.getElementById('mobile-right');

mobileLeft.addEventListener('pointerdown',  () => { gameMobileDirLeft  = true;  });
mobileLeft.addEventListener('pointerup',    () => { gameMobileDirLeft  = false; });
mobileLeft.addEventListener('pointerleave', () => { gameMobileDirLeft  = false; });
mobileRight.addEventListener('pointerdown',  () => { gameMobileDirRight = true;  });
mobileRight.addEventListener('pointerup',    () => { gameMobileDirRight = false; });
mobileRight.addEventListener('pointerleave', () => { gameMobileDirRight = false; });

// Touch-drag on canvas for mobile
let touchStartX = null;
canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
canvas.addEventListener('touchmove', e => {
  if (touchStartX === null) return;
  const dx = e.touches[0].clientX - touchStartX;
  touchStartX = e.touches[0].clientX;
  // Map screen dx to canvas coords
  const scale = CANVAS_W / canvas.getBoundingClientRect().width;
  player.x += dx * scale;
  player.x = Math.max(player.w / 2, Math.min(CANVAS_W - player.w / 2, player.x));
}, { passive: true });
canvas.addEventListener('touchend', () => { touchStartX = null; });

// ── Game button listeners ──
document.getElementById('game-start-btn').addEventListener('click', startGame);
document.getElementById('game-retry-btn').addEventListener('click', startGame);
document.getElementById('game-win-btn').addEventListener('click', () => {
  confettiRunning = false;
  goToPage(6);
});

function initPage5() {
  startOverlay.style.display = '';
  winOverlay.style.display   = 'none';
  overOverlay.style.display  = 'none';
  resizeCanvas();
  // Draw empty canvas
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#FFF0F8');
  grad.addColorStop(1, '#FDF8F2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

// ─── PAGE 6 — BIRTHDAY CAKE ───────────────────────────────────
const CANDLE_COUNT = 5;
let candlesLit   = 0;
let candlesBlown = 0;
let cakeInteracted = false;

function initPage6() {
  candlesLit   = 0;
  candlesBlown = 0;
  cakeInteracted = false;

  // Always start from the top of the page so the cake is visible first
  const page6El = document.getElementById('page6');
  page6El.scrollTop = 0;

  spawnPetals('petal-container-6', 14);

  // Reset flames
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const flame = document.getElementById(`flame-${i}`);
    if (flame) {
      flame.classList.remove('out', 'lighting');
      flame.style.opacity = '0';
    }
  }

  // Reset final message
  const finalMsg = document.getElementById('final-message');
  finalMsg.style.display = 'none';
  finalMsg.classList.remove('visible');

  // Reset cake messages (so animation replays)
  const msgs = document.getElementById('cake-messages');
  msgs.classList.remove('visible');

  const blowHint = document.getElementById('blow-hint');
  blowHint.classList.remove('visible');

  // Animate cake in
  const cakeWrap = document.getElementById('cake-wrap');
  cakeWrap.classList.remove('cake-visible');

  setTimeout(() => {
    cakeWrap.classList.add('cake-visible');
    msgs.classList.add('visible');
    lightCandlesSequentially();
  }, 300);
}

function lightCandlesSequentially() {
  function lightNext(i) {
    if (i >= CANDLE_COUNT) {
      // All lit — show blow hint
      setTimeout(() => {
        document.getElementById('blow-hint').classList.add('visible');
      }, 400);
      return;
    }
    setTimeout(() => {
      const flame = document.getElementById(`flame-${i}`);
      if (flame) {
        flame.style.opacity = '1';
        flame.classList.add('lighting');
        flame.addEventListener('animationend', () => {
          flame.classList.remove('lighting');
        }, { once: true });
        candlesLit++;
      }
      lightNext(i + 1);
    }, 350);
  }
  lightNext(0);
}

// Cake click → blow candles
const cakeWrap = document.getElementById('cake-wrap');
cakeWrap.addEventListener('click', blowCandles);
cakeWrap.addEventListener('touchend', e => {
  e.preventDefault();
  blowCandles();
});

function blowCandles() {
  if (cakeInteracted) return;
  cakeInteracted = true;

  // Hide blow hint
  document.getElementById('blow-hint').classList.remove('visible');

  // Blow each candle with a small delay and smoke
  for (let i = 0; i < CANDLE_COUNT; i++) {
    setTimeout(() => {
      const flame = document.getElementById(`flame-${i}`);
      if (flame) {
        flame.classList.add('out');
        // Smoke puff
        const smoke = document.createElement('span');
        smoke.className = 'smoke-puff';
        smoke.textContent = '💨';
        flame.parentElement.style.position = 'relative';
        flame.parentElement.appendChild(smoke);
        smoke.addEventListener('animationend', () => smoke.remove());
      }
      candlesBlown++;
      if (candlesBlown === CANDLE_COUNT) {
        showFinalMessage();
      }
    }, i * 180);
  }
}

function showFinalMessage() {
  setTimeout(() => {
    // Hide make-a-wish text
    document.querySelector('.cake-msg-wish').style.opacity = '0';

    // Show final message
    const finalMsg = document.getElementById('final-message');
    finalMsg.style.display = '';
    void finalMsg.offsetWidth;
    finalMsg.classList.add('visible');

    // Animate hearts
    const heartsEl = document.getElementById('final-hearts');
    heartsEl.innerHTML = '';
    const heartEmojis = ['🌷','💕','🌸','✨','🫶'];
    heartEmojis.forEach((h, i) => {
      const span = document.createElement('span');
      span.className = 'final-heart';
      span.textContent = h;
      span.style.animationDelay = (i * 120) + 'ms';
      heartsEl.appendChild(span);
    });
  }, 800);
}

// ─── INIT ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initPage1();
  resizeCanvas();
  _tryAutoplay(); // Start hbd.mp3 for page 1 (with autoplay fallback)
});

