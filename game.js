const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hpValue = document.getElementById("hpValue");
const scoreValue = document.getElementById("scoreValue");
const levelValue = document.getElementById("levelValue");
const timeValue = document.getElementById("timeValue");
const cueBar = document.getElementById("cueBar");
const hintText = document.getElementById("hintText");
const upgradeOverlay = document.getElementById("upgradeOverlay");
const upgradeList = document.getElementById("upgradeList");
const satelliteList = document.getElementById("satelliteList");
const upgradeSub = document.getElementById("upgradeSub");
const upgradeTitle = upgradeOverlay.querySelector("h2");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const dbgGravityStrength = document.getElementById("dbgGravityStrength");
const dbgGravityStrengthValue = document.getElementById("dbgGravityStrengthValue");
const dbgGravityFalloff = document.getElementById("dbgGravityFalloff");
const dbgGravityFalloffValue = document.getElementById("dbgGravityFalloffValue");
const dbgSatCollision = document.getElementById("dbgSatCollision");
const dbgSatCollisionValue = document.getElementById("dbgSatCollisionValue");
const versionBadge = document.getElementById("versionBadge");

const APP_VERSION = "0.1.0";

if (versionBadge) {
  versionBadge.textContent = `v${APP_VERSION}`;
}

const COLORS = {
  cyan: "#28f4ff",
  pink: "#ff2ea8",
  lime: "#90ff4e",
  amber: "#ffcb54",
  white: "#f3feff",
  warning: "#ff556f",
};

const SATELLITE_COLORS = [
  "#39f7ff",
  "#ff6ea8",
  "#9aff61",
  "#ffd76a",
  "#b58dff",
  "#6fffb0",
  "#ff8b57",
  "#7db7ff",
  "#ff79e8",
];

const UPGRADE_LIBRARY = [
  {
    id: "bulletBurst",
    name: "SHARD BURST",
    desc: "衝突時に短命弾を放射発射",
    category: "attack",
  },
  {
    id: "shockwave",
    name: "NOVA RING",
    desc: "衝突時に衝撃波で周囲の隕石へ範囲ダメージ",
    category: "attack",
  },
  {
    id: "crossLaser",
    name: "CROSS LASER",
    desc: "衝突時に十字レーザーを短時間照射",
    category: "attack",
  },
  {
    id: "prismBurst",
    name: "PRISM BURST",
    desc: "衝突後、一定時間らせん状に小弾を放出",
    category: "attack",
  },
  {
    id: "sniperPulse",
    name: "SNIPER PULSE",
    desc: "最寄り隕石へ貫通ショットを発射",
    category: "attack",
  },
  {
    id: "arcLightning",
    name: "ARC LIGHTNING",
    desc: "近くの隕石へ連鎖ダメージ",
    category: "attack",
  },
  {
    id: "coreMine",
    name: "CORE MINE",
    desc: "小範囲の高威力衝撃波を放つ",
    category: "attack",
  },
  {
    id: "giantBody",
    name: "GIANT BODY",
    desc: "巨体で体当たり。接触ダメージ増加",
    category: "attack",
  },
  {
    id: "bladeOrbit",
    name: "BLADE ORBIT",
    desc: "周囲に剣を展開し回転攻撃",
    category: "attack",
  },
];

const RELIC_LIBRARY = [
  { id: "gravityClick", name: "CLICK SINGULARITY", desc: "クリック中の重力倍率を強化", category: "support" },
  { id: "gravityCore", name: "CORE DENSIFIER", desc: "基礎重力を恒久強化", category: "support" },
  { id: "gravityFuel", name: "FLUX BATTERY", desc: "重力ゲージ最大量を増加", category: "support" },
  { id: "gravitySustain", name: "EVENT INSULATOR", desc: "重力ゲージ消費を軽減", category: "support" },
  { id: "gravityRecover", name: "RECOVERY LOOP", desc: "重力ゲージ回復速度アップ", category: "speed" },
  { id: "hullPlus", name: "HULL PLATING", desc: "最大HPを増加し即時回復", category: "support" },
  { id: "repair", name: "NANO REPAIR", desc: "毎秒わずかに自動回復", category: "support" },
  { id: "guard", name: "AEGIS FILTER", desc: "ブラックホール被ダメージ軽減", category: "support" },
  { id: "tidalBrake", name: "TIDAL BRAKE", desc: "敵隕石の速度を低下", category: "speed" },
];

const game = {
  baseWidth: 1280,
  baseHeight: 720,
  width: 1280,
  height: 720,
  scale: 1,
  centerX: 640,
  centerY: 360,
  blackHoleRadius: 38,
  gravityStrength: 11000000,
  gravityBoostMultiplier: 5,
  gravityFalloffExp: 0.89,
  gravityFloorSat: 28,
  gravityFloorCue: 42,
  satelliteCollisionEnabled: true,
  blackHoleActive: true,
  battleStarted: false,
  awaitingInitialSatellitePick: false,
  maxHp: 20,
  hp: 20,
  score: 0,
  level: 1,
  time: 0,
  running: true,
  pausedForUpgrade: false,
  levelUpFxActive: false,
  levelUpFxTimer: 0,
  levelUpFxDuration: 1.15,
  pendingUpgradeAfterFx: false,
  bossBreakFxActive: false,
  bossBreakFxTimer: 0,
  bossBreakFxDuration: 1.05,
  fusionFxActive: false,
  fusionFxTimer: 0,
  fusionFxDuration: 1.0,
  damageFlashTimer: 0,
  damageFlashDuration: 0.2,
  cuePowerMultiplier: 1,
  globalBulletRicochet: 0,
  nextLevelScore: 12,
  nextMeteorId: 1,
  nextSatelliteId: 1,
  meteorSpawnTimer: 1.5,
  meteorSpawnInterval: 1.5,
  bossSpawnEvery: 45,
  nextBossAt: 45,
  nextSplitBossAt: 60,
  nextFusionUfoAt: 120,
  splitBossAlive: false,
  postBossTier: 0,
  bossThumpTimer: 0,
  bossThumpInterval: 0.62,
  pointer: {
    down: false,
    leftDown: false,
    x: 0,
    y: 0,
    aiming: false,
  },
  gravityBoostActive: false,
  prevGravityBoostActive: false,
  gravityBoostVisual: 0,
  gravityCharge: 1,
  gravityChargeMax: 1,
  gravityDrainPerSec: 0.34,
  gravityRecoverPerSec: 0.2,
  relicGravityMul: 1,
  relicDamageTakenMul: 1,
  relicEnemySpeedMul: 1,
  relicRegenPerSec: 0,
  relicCounts: {},
  pendingRelicAfterBoss: false,
  selectingRelic: false,
  selectingFusion: false,
  pendingFusionAfterFx: false,
  fusionResultActive: false,
  fusionResultTimer: 0,
  fusionResultDuration: 1.35,
  bonusUfo: null,
  cueBall: {
    x: 640,
    y: 360,
    vx: 0,
    vy: 0,
    radius: 10,
    state: "ready",
    maxFlight: 3.2,
    flightTimer: 0,
    trail: [],
  },
  satellites: [],
  meteors: [],
  bullets: [],
  miniSats: [],
  prismEmitters: [],
  satTouchPairs: new Set(),
  effects: [],
  lasers: [],
};

const audio = {
  ctx: null,
  master: null,
  fxBus: null,
  started: false,
  lastPlayed: new Map(),
};

function ensureAudio() {
  if (!audio.ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audio.ctx = new AudioCtx();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.22;
    audio.fxBus = audio.ctx.createGain();
    audio.fxBus.gain.value = 1.0;
    audio.fxBus.connect(audio.master);
    audio.master.connect(audio.ctx.destination);
  }
  if (audio.ctx.state === "suspended") {
    audio.ctx.resume().catch(() => {});
  }
  audio.started = true;
  return audio.ctx;
}

function canPlaySfx(key, minInterval) {
  const ctx = ensureAudio();
  if (!ctx) return false;
  const now = ctx.currentTime;
  const prev = audio.lastPlayed.get(key) || -999;
  if (now - prev < minInterval) return false;
  audio.lastPlayed.set(key, now);
  return true;
}

function playSfxSynth({
  type = "sawtooth",
  freq = 220,
  endFreq = null,
  dur = 0.1,
  gain = 0.1,
  attack = 0.003,
  release = 0.09,
  filterFreq = 1800,
  filterQ = 0.8,
}) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const t1 = t0 + dur;

  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = filterQ;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t1);
  }

  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t1 + release);

  osc.connect(filter);
  filter.connect(env);
  env.connect(audio.fxBus);

  osc.start(t0);
  osc.stop(t1 + release + 0.01);
}

function sfxMiniLaunch() {
  if (!canPlaySfx("mini_launch", 0.03)) return;
  playSfxSynth({ type: "square", freq: 820, endFreq: 560, dur: 0.04, gain: 0.035, filterFreq: 2600 });
}

function sfxImpact() {
  if (!canPlaySfx("impact", 0.04)) return;
  playSfxSynth({ type: "triangle", freq: 180, endFreq: 90, dur: 0.06, gain: 0.06, filterFreq: 900 });
  playSfxSynth({ type: "square", freq: 940, endFreq: 360, dur: 0.03, gain: 0.025, filterFreq: 3200 });
}

function sfxBurst() {
  if (!canPlaySfx("burst", 0.06)) return;
  playSfxSynth({ type: "sawtooth", freq: 420, endFreq: 210, dur: 0.1, gain: 0.06, filterFreq: 2100 });
}

function sfxShockwave() {
  if (!canPlaySfx("shockwave", 0.08)) return;
  playSfxSynth({ type: "triangle", freq: 120, endFreq: 55, dur: 0.16, gain: 0.09, filterFreq: 760, filterQ: 2.2 });
}

function sfxLaser() {
  if (!canPlaySfx("laser", 0.08)) return;
  playSfxSynth({ type: "sawtooth", freq: 720, endFreq: 1280, dur: 0.08, gain: 0.05, filterFreq: 3600 });
}

function sfxGravityToggle(on) {
  if (!canPlaySfx(on ? "gravity_on" : "gravity_off", 0.06)) return;
  playSfxSynth({
    type: "sine",
    freq: on ? 260 : 420,
    endFreq: on ? 520 : 210,
    dur: 0.08,
    gain: 0.05,
    filterFreq: 1800,
  });
}

function sfxLevelUp() {
  if (!canPlaySfx("levelup", 0.12)) return;
  playSfxSynth({ type: "triangle", freq: 380, endFreq: 760, dur: 0.08, gain: 0.06, filterFreq: 2600 });
  playSfxSynth({ type: "sine", freq: 760, endFreq: 980, dur: 0.06, gain: 0.045, filterFreq: 4000 });
}

function sfxBossThump() {
  if (!canPlaySfx("boss_thump", 0.12)) return;
  playSfxSynth({ type: "sine", freq: 62, endFreq: 48, dur: 0.16, gain: 0.11, filterFreq: 380, filterQ: 2.8 });
  playSfxSynth({ type: "triangle", freq: 94, endFreq: 66, dur: 0.14, gain: 0.06, filterFreq: 520, filterQ: 1.8 });
}

function sfxPlayerDamage() {
  if (!canPlaySfx("player_damage", 0.08)) return;
  playSfxSynth({ type: "square", freq: 118, endFreq: 82, dur: 0.11, gain: 0.08, filterFreq: 800, filterQ: 2.2 });
  playSfxSynth({ type: "sawtooth", freq: 210, endFreq: 120, dur: 0.07, gain: 0.05, filterFreq: 1200, filterQ: 1.6 });
}

function resize() {
  const prevScale = game.scale || 1;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  game.width = canvas.width;
  game.height = canvas.height;
  game.centerX = game.width * 0.5;
  game.centerY = game.height * 0.5;
  if (!game.pointer.down) {
    game.pointer.x = game.centerX;
    game.pointer.y = game.centerY;
  }
  game.scale = Math.min(game.width / game.baseWidth, game.height / game.baseHeight);
  game.blackHoleRadius = 38 * game.scale;
  game.cueBall.radius = 10 * game.scale;
  if (game.satellites.length > 0 || game.meteors.length > 0 || game.bullets.length > 0 || game.miniSats.length > 0) {
    const ratio = game.scale / prevScale;
    for (const sat of game.satellites) {
      sat.baseRadius *= ratio;
      sat.radius *= ratio;
    }
    for (const m of game.meteors) m.radius *= ratio;
    for (const b of game.bullets) b.radius *= ratio;
    for (const ms of game.miniSats) ms.radius *= ratio;
  }
}
window.addEventListener("resize", resize);
resize();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function recordTrail(trail, x, y, maxLen) {
  trail.push({ x, y });
  if (trail.length > maxLen) trail.shift();
}

function gravitySource() {
  return { x: game.cueBall.x, y: game.cueBall.y };
}

function gravityAccelAtDistance(r, s, damp = 1) {
  const G = game.gravityStrength * game.relicGravityMul * s * s * s;
  const minPull = game.gravityFloorSat * s;
  const softening = 24000 * s * s;
  const d2 = Math.max(r * r, 1200 * s * s);
  const a = Math.max(G / Math.pow(d2 + softening, game.gravityFalloffExp), minPull) * damp;
  return a;
}

function pushDamageText(x, y, amount, color = COLORS.white) {
  const dmg = Math.max(1, amount);
  game.effects.push({
    type: "damageText",
    x: x + rand(-8, 8) * game.scale,
    y: y - 6 * game.scale,
    vx: rand(-10, 10) * game.scale,
    vy: (-34 - Math.min(22, dmg * 1.1)) * game.scale,
    ttl: 0.55,
    life: 0.55,
    text: Math.round(dmg).toString(),
    color,
  });
}

function dealDamage(meteor, amount, color = COLORS.white) {
  if (!meteor || amount <= 0) return;
  meteor.hp -= amount;
  meteor.damagePopupAccum = (meteor.damagePopupAccum || 0) + amount;
  if ((meteor.damagePopupTimer || 0) <= 0) {
    pushDamageText(meteor.x, meteor.y, meteor.damagePopupAccum, color);
    meteor.damagePopupAccum = 0;
    meteor.damagePopupTimer = 0.08;
  }
}

function meteorColorByTier(tier, isBoss = false) {
  const normal = ["#ff2ea8", "#ff8b57", "#ffcb54", "#90ff4e", "#28f4ff"];
  const boss = ["#ff556f", "#ff7a4e", "#ffd15d", "#9dff6a", "#5fe6ff"];
  const idx = Math.min(Math.max(0, tier), normal.length - 1);
  return isBoss ? boss[idx] : normal[idx];
}

function categoryLabel(category) {
  if (category === "attack") return "追加攻撃";
  if (category === "speed") return "速度";
  return "支援";
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) {
    return { r: 120, g: 220, b: 255 };
  }
  if (hex.length === 4) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);
    return { r, g, b };
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function iconSvgByUpgradeId(id) {
  if (id === "bulletBurst") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="7"/><path d="M32 6v12M32 46v12M6 32h12M46 32h12M14 14l8 8M42 42l8 8M14 50l8-8M42 22l8-8" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
  }
  if (id === "shockwave") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="18" fill="none" stroke-width="4"/><circle cx="32" cy="32" r="28" fill="none" stroke-width="4"/></svg>`;
  }
  if (id === "crossLaser") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="28" y="6" width="8" height="52"/><rect x="6" y="28" width="52" height="8"/><circle cx="32" cy="32" r="6"/></svg>`;
  }
  if (id === "prismBurst") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="none" stroke-width="4"/><circle cx="32" cy="32" r="5"/></svg>`;
  }
  if (id === "sniperPulse") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="16" fill="none" stroke-width="4"/><circle cx="32" cy="32" r="5"/><path d="M32 6v10M32 48v10M6 32h10M48 32h10" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
  }
  if (id === "arcLightning") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M34 6L20 34h12l-2 24 14-28H32z" stroke-width="3" fill="none"/></svg>`;
  }
  if (id === "coreMine") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="20" fill="none" stroke-width="4"/><path d="M32 4v8M32 52v8M4 32h8M52 32h8" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
  }
  if (id === "giantBody") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="18" fill="none" stroke-width="5"/><circle cx="32" cy="32" r="8"/><path d="M10 32h8M46 32h8" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
  }
  if (id === "bladeOrbit") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="10" fill="none" stroke-width="3"/><path d="M32 6l5 10-5 10-5-10zM58 32l-10 5-10-5 10-5zM32 58l-5-10 5-10 5 10zM6 32l10-5 10 5-10 5z" stroke-width="2" fill="none"/></svg>`;
  }
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="10"/></svg>`;
}

function iconSvgByRelicId(id) {
  if (id === "gravityClick") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="10"/><path d="M32 6v16M32 42v16M6 32h16M42 32h16" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
  }
  if (id === "gravityCore") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="18" fill="none" stroke-width="4"/><circle cx="32" cy="32" r="28" fill="none" stroke-width="3"/></svg>`;
  }
  if (id === "gravityFuel") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="22" y="10" width="20" height="44" rx="4" ry="4" fill="none" stroke-width="4"/><rect x="27" y="26" width="10" height="20"/><path d="M22 18h20" stroke-width="4"/></svg>`;
  }
  if (id === "gravitySustain") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 34a18 18 0 1 0 0-4" fill="none" stroke-width="4"/><path d="M10 40l8-8 8 8" fill="none" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  if (id === "gravityRecover") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="18" fill="none" stroke-width="4"/><path d="M32 18v14l10 6" fill="none" stroke-width="4" stroke-linecap="round"/><path d="M52 20v10h-10" fill="none" stroke-width="4"/></svg>`;
  }
  if (id === "hullPlus") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8l22 10v13c0 13-8 20-22 25C18 51 10 44 10 31V18z" fill="none" stroke-width="4"/><path d="M32 22v18M23 31h18" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  if (id === "repair") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="17" fill="none" stroke-width="4"/><path d="M32 18v28M18 32h28" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="5"/></svg>`;
  }
  if (id === "guard") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 9l20 8v13c0 12-8 20-20 25C20 50 12 42 12 30V17z" fill="none" stroke-width="4"/><path d="M22 33l7 7 14-14" fill="none" stroke-width="4" stroke-linecap="round"/></svg>`;
  }
  if (id === "tidalBrake") {
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 24h34M8 40h22" stroke-width="4" stroke-linecap="round"/><path d="M44 14l12 18-12 18" fill="none" stroke-width="4"/></svg>`;
  }
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="16" y="16" width="32" height="32" rx="4" ry="4"/></svg>`;
}

function createUpgradeIconNode(upgradeId, category, isEmpty = false) {
  const icon = document.createElement("div");
  icon.className = `upgrade-icon cat-${category}${isEmpty ? " is-empty" : ""}`;
  if (!isEmpty) {
    icon.innerHTML = iconSvgByUpgradeId(upgradeId);
    const accent = colorByAttackType(upgradeId);
    if (accent) {
      const { r, g, b } = hexToRgb(accent);
      icon.style.color = accent;
      icon.style.borderColor = `${accent}cc`;
      icon.style.boxShadow = `inset 0 0 12px ${accent}55, 0 0 14px ${accent}44`;
      icon.style.background = `radial-gradient(circle at 40% 35%, rgba(${r}, ${g}, ${b}, 0.34), rgba(10, 12, 22, 0.94))`;
    }
  }
  return icon;
}

function createRelicIconNode(relicId, category) {
  const icon = document.createElement("div");
  icon.className = `upgrade-icon relic-icon cat-${category}`;
  icon.innerHTML = iconSvgByRelicId(relicId);
  return icon;
}

function spawnInitialSatellites() {
  game.satellites.length = 0;
  const x = game.centerX + 180 * game.scale;
  const y = game.centerY;
  const sat = createSatellite(game.nextSatelliteId++, x, y);
  game.satellites.push(sat);
  setOrbitalVelocity(sat, 1.2);
  playSatelliteSpawnFx(sat);
}

function createSatellite(id, x, y) {
  const baseRadius = 18 * game.scale;
  return {
    id,
    x,
    y,
    vx: 0,
    vy: 0,
    baseRadius,
    radius: baseRadius,
    mass: 1,
    color: SATELLITE_COLORS[(id - 1) % SATELLITE_COLORS.length],
    attackType: null,
    attackLevel: 1,
    secondaryAttackType: null,
    secondaryAttackLevel: 1,
    fusionColors: null,
    nearHoleTime: 0,
    gravityDamp: 1,
    auraLevel: 0,
    auraTimer: 0,
    escapeDelay: rand(2.0, 3.0),
    miniSatCooldown: 0,
    bladeHitCooldowns: new Map(),
    trail: [],
  };
}

function spawnExtraSatellite() {
  const id = game.nextSatelliteId++;
  const sat = createSatellite(
    id,
    rand(game.width * 0.2, game.width * 0.8),
    rand(game.height * 0.2, game.height * 0.8)
  );
  if (game.battleStarted) setOrbitalVelocity(sat, 1.05);
  game.satellites.push(sat);
  playSatelliteSpawnFx(sat);
  return sat;
}

function playSatelliteSpawnFx(sat) {
  const accent = sat.color || COLORS.cyan;
  game.effects.push({
    type: "satSpawn",
    x: sat.x,
    y: sat.y,
    r: sat.radius * 0.7,
    maxR: sat.radius * 5.8,
    ttl: 0.62,
    life: 0.62,
    color: accent,
  });
  for (let i = 0; i < 14; i += 1) {
    const a = (Math.PI * 2 * i) / 14 + rand(-0.12, 0.12);
    const speed = (70 + rand(0, 120)) * game.scale;
    game.effects.push({
      type: "satSpawnSpark",
      x: sat.x,
      y: sat.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      ttl: 0.42,
      life: 0.42,
      color: accent,
    });
  }
}

function spawnMeteor(isBoss = false) {
  const edge = Math.floor(rand(0, 4));
  const margin = 50;
  let x = 0;
  let y = 0;
  if (edge === 0) {
    x = rand(0, game.width);
    y = -margin;
  } else if (edge === 1) {
    x = game.width + margin;
    y = rand(0, game.height);
  } else if (edge === 2) {
    x = rand(0, game.width);
    y = game.height + margin;
  } else {
    x = -margin;
    y = rand(0, game.height);
  }
  // Most meteors are spawned on a near-direct collision course to the black hole.
  const direct = Math.atan2(game.centerY - y, game.centerX - x);
  const mostlyDirect = Math.random() < 0.9;
  const angle = direct + (mostlyDirect ? rand(-0.08, 0.08) : rand(-0.26, 0.26));
  let earlyFactor = 1;
  if (game.time < 45) earlyFactor = 0.5;
  else if (game.time < 75) earlyFactor = 0.7;
  const speed = (isBoss ? rand(35, 45) : rand(52, 92)) * game.scale * earlyFactor * game.relicEnemySpeedMul;
  const baseRadius = isBoss ? 26 : rand(10, 15);
  const radius = baseRadius * game.scale;
  const hpBase = isBoss
    ? 24 + game.level * 4
    : (baseRadius <= 12 ? 1 : 2 + Math.floor(game.level * 0.35));
  const hpTierScale = Math.pow(2, game.postBossTier);
  const hp = Math.ceil(hpBase * (game.time > 60 ? (1 + Math.min(1.0, (game.time - 60) * 0.01)) : 1) * hpTierScale);
  const tierColor = meteorColorByTier(game.postBossTier, isBoss);
  game.meteors.push({
    id: game.nextMeteorId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    hp,
    maxHp: hp,
    radius,
    boss: isBoss,
    wireSeed: rand(0, 1000),
    touchingSatIds: new Set(),
    tier: game.postBossTier,
    color: isBoss ? COLORS.warning : tierColor,
    damagePopupAccum: 0,
    damagePopupTimer: 0,
  });
}

function spawnSplitBoss() {
  const margin = 70;
  const side = Math.floor(rand(0, 4));
  let x = 0;
  let y = 0;
  if (side === 0) {
    x = rand(0, game.width);
    y = -margin;
  } else if (side === 1) {
    x = game.width + margin;
    y = rand(0, game.height);
  } else if (side === 2) {
    x = rand(0, game.width);
    y = game.height + margin;
  } else {
    x = -margin;
    y = rand(0, game.height);
  }
  const a = Math.atan2(game.centerY - y, game.centerX - x);
  const speed = 6 * game.scale * game.relicEnemySpeedMul;
  const hp = 156;
  game.meteors.push({
    id: game.nextMeteorId++,
    x,
    y,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed,
    hp,
    maxHp: hp,
    radius: 126 * game.scale,
    boss: true,
    splitBoss: true,
    splitStage: 0, // 0: huge, 1: medium, 2: small(final)
    wireSeed: rand(0, 1000),
    touchingSatIds: new Set(),
    color: meteorColorByTier(game.postBossTier, true),
    damagePopupAccum: 0,
    damagePopupTimer: 0,
  });
  game.splitBossAlive = true;
}

function splitBossMeteor(m) {
  const nextStage = m.splitStage + 1;
  if (nextStage > 2) return [];
  const baseSpeed = Math.max(4 * game.scale, Math.hypot(m.vx, m.vy) * 0.25);
  const stageHp = nextStage === 1 ? 54 : 24;
  const stageRadius = nextStage === 1 ? 75 * game.scale : 45 * game.scale;
  const children = [];
  for (let i = 0; i < 2; i += 1) {
    const angle = Math.atan2(m.vy, m.vx) + (i === 0 ? -0.55 : 0.55);
    children.push({
      id: game.nextMeteorId++,
      x: m.x + Math.cos(angle) * stageRadius * 0.6,
      y: m.y + Math.sin(angle) * stageRadius * 0.6,
      vx: Math.cos(angle) * (baseSpeed * (nextStage === 1 ? 1.25 : 1.35) * game.relicEnemySpeedMul),
      vy: Math.sin(angle) * (baseSpeed * (nextStage === 1 ? 1.25 : 1.35) * game.relicEnemySpeedMul),
      hp: stageHp,
      maxHp: stageHp,
      radius: stageRadius,
      boss: true,
      splitBoss: true,
      splitStage: nextStage,
      wireSeed: rand(0, 1000),
      touchingSatIds: new Set(),
      color: meteorColorByTier(game.postBossTier, true),
      damagePopupAccum: 0,
      damagePopupTimer: 0,
    });
  }
  return children;
}

function spawnBonusUfo() {
  const margin = 80 * game.scale;
  const y = rand(game.height * 0.18, game.height * 0.42);
  const fromLeft = Math.random() < 0.5;
  const speed = rand(90, 130) * game.scale;
  game.bonusUfo = {
    x: fromLeft ? -margin : game.width + margin,
    y,
    vx: fromLeft ? speed : -speed,
    vy: rand(-18, 18) * game.scale,
    radius: 22 * game.scale,
    life: 14,
    hue: rand(0, 360),
    phase: rand(0, Math.PI * 2),
  };
}

function destroyBonusUfo(x, y) {
  game.bonusUfo = null;
  game.fusionFxActive = true;
  game.fusionFxTimer = game.fusionFxDuration;
  game.pendingFusionAfterFx = true;
  hintText.textContent = "FUSION BONUS ACQUIRED";
  game.effects.push({
    type: "burst",
    x,
    y,
    ttl: 0.5,
    life: 0.5,
    color: COLORS.white,
  });
}

function spawnBossSplitEffects(x, y, radius, color) {
  const accent = color || COLORS.warning;
  game.effects.push({
    type: "bossSplitFlash",
    x,
    y,
    r: Math.max(8 * game.scale, radius * 0.35),
    maxR: radius * 1.45,
    ttl: 0.58,
    life: 0.58,
    color: accent,
  });
  const shardCount = Math.max(10, Math.floor(8 + radius / (14 * game.scale)));
  for (let i = 0; i < shardCount; i += 1) {
    const a = rand(0, Math.PI * 2);
    const speed = rand(120, 260) * game.scale * (0.65 + radius / (120 * game.scale));
    game.effects.push({
      type: "bossSplitShard",
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      size: rand(4, 10) * game.scale + radius * 0.02,
      rot: rand(0, Math.PI * 2),
      spin: rand(-8, 8),
      ttl: rand(0.52, 0.8),
      life: rand(0.52, 0.8),
      color: accent,
    });
  }
}

function spawnMiniSatFromPoint(x, y, nx, ny, speedScale = 1) {
  const len = Math.hypot(nx, ny);
  const dx = len > 0.001 ? nx / len : 1;
  const dy = len > 0.001 ? ny / len : 0;
  const speed = 330 * game.scale * speedScale;
  const spawnR = 10 * game.scale;
  game.miniSats.push({
    x: x + dx * spawnR,
    y: y + dy * spawnR,
    vx: dx * speed,
    vy: dy * speed,
    radius: 5 * game.scale,
    ttl: 5,
    reflected: false,
    hitCooldown: 0,
    trail: [],
  });
}

function emitMiniSatFromSatellite(sat, nx = null, ny = null) {
  if (sat.miniSatCooldown > 0) return;
  let dirX = nx;
  let dirY = ny;
  if (dirX === null || dirY === null) {
    const v = Math.hypot(sat.vx, sat.vy);
    if (v > 0.001) {
      dirX = sat.vx / v;
      dirY = sat.vy / v;
    } else {
      const a = rand(0, Math.PI * 2);
      dirX = Math.cos(a);
      dirY = Math.sin(a);
    }
  }
  spawnMiniSatFromPoint(sat.x, sat.y, dirX, dirY, 1);
  sat.miniSatCooldown = 0.12;
  sfxMiniLaunch();
}

function satelliteAuraMultiplier(sat) {
  return 1 + (sat.auraLevel || 0) * 0.4;
}

function fireBurst(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const shots = 6 + growth * 3;
  const speed = (208 + growth * 24) * game.scale;
  const accent = fromSat.color || COLORS.pink;
  for (let i = 0; i < shots; i += 1) {
    const a = (Math.PI * 2 * i) / shots + rand(-0.08, 0.08);
    game.bullets.push({
      x: fromSat.x,
      y: fromSat.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 3 * game.scale,
      ttl: 1.0 + growth * 0.12,
      damage: (1.15 + growth * 0.45) * powerMul,
      ricochetLeft: game.globalBulletRicochet,
      color: accent,
      sourceSatId: fromSat.id,
      fromFusionSecondary,
    });
  }
}

function firePrismBurst(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const accent = fromSat.color || COLORS.cyan;
  game.prismEmitters.push({
    x: fromSat.x,
    y: fromSat.y,
    angle: rand(0, Math.PI * 2),
    spin: (5.4 + growth * 0.7) * (Math.random() < 0.5 ? -1 : 1),
    fireInterval: Math.max(0.045, 0.12 - growth * 0.01),
    fireTimer: 0,
    ttl: 1.15 + growth * 0.16,
    life: 1.15 + growth * 0.16,
    power: growth,
    powerMul,
    sourceSatId: fromSat.id,
    fromFusionSecondary,
    color: accent,
  });
  game.effects.push({
    type: "ring",
    x: fromSat.x,
    y: fromSat.y,
    r: 4,
    maxR: (52 + growth * 20) * game.scale,
    life: 0.26,
    ttl: 0.26,
    color: accent,
  });
}

function fireSniperPulse(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  let target = null;
  let best = Infinity;
  for (const m of game.meteors) {
    const d = distSq(fromSat, m);
    if (d < best) {
      best = d;
      target = m;
    }
  }
  if (!target) return;
  const dx = target.x - fromSat.x;
  const dy = target.y - fromSat.y;
  const d = Math.max(1, Math.hypot(dx, dy));
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const speed = (520 + growth * 56) * game.scale;
  const accent = fromSat.color || COLORS.white;
  const shotCount = 1 + Math.floor(lvl / 2);
  for (let i = 0; i < shotCount; i += 1) {
    const spread = (i - (shotCount - 1) / 2) * 0.06;
    const rx = (dx / d) * Math.cos(spread) - (dy / d) * Math.sin(spread);
    const ry = (dx / d) * Math.sin(spread) + (dy / d) * Math.cos(spread);
    game.bullets.push({
      x: fromSat.x,
      y: fromSat.y,
      vx: rx * speed,
      vy: ry * speed,
      radius: 3.2 * game.scale,
      ttl: 1.55 + growth * 0.12,
      damage: (2.7 + growth * 0.9) * powerMul,
      ricochetLeft: game.globalBulletRicochet + 2 + Math.floor(lvl / 3),
      color: accent,
      sourceSatId: fromSat.id,
      fromFusionSecondary,
    });
  }
}

function triggerArcLightning(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const maxChains = Math.min(8, 2 + Math.floor(lvl / 2));
  const sorted = [...game.meteors]
    .sort((a, b) => distSq(fromSat, a) - distSq(fromSat, b))
    .slice(0, maxChains);
  let chain = 0;
  for (const m of sorted) {
    const dmg = Math.max(0.45, 1.28 + growth * 0.3 - chain * 0.18) * powerMul;
    dealDamage(m, dmg, fromSat.color || COLORS.cyan);
    if (!fromFusionSecondary) tryFusionAssistFromPrimaryHit(fromSat, m, m.x, m.y);
    game.effects.push({
      type: "lightningBolt",
      x1: fromSat.x,
      y1: fromSat.y,
      x2: m.x,
      y2: m.y,
      ttl: 0.12,
      life: 0.12,
      color: fromSat.color || COLORS.cyan,
    });
    game.effects.push({
      type: "spark",
      x: m.x,
      y: m.y,
      ttl: 0.14,
      life: 0.14,
      color: fromSat.color || COLORS.cyan,
    });
    chain += 1;
  }
}

function triggerCoreMine(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const range = (66 + growth * 16) * game.scale;
  const damage = (6.4 + growth * 2.1) * powerMul;
  game.effects.push({
    type: "ring",
    x: fromSat.x,
    y: fromSat.y,
    r: 5,
    maxR: range,
    life: 0.28,
    ttl: 0.28,
    color: fromSat.color || COLORS.warning,
  });
  for (const m of game.meteors) {
    const d2 = distSq(fromSat, m);
    if (d2 <= range * range) {
      dealDamage(m, damage, fromSat.color || COLORS.warning);
      if (!fromFusionSecondary) tryFusionAssistFromPrimaryHit(fromSat, m, m.x, m.y);
    }
  }
}

function fireRailSpray(fromSat, level) {
  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];
  const speed = (420 + level * 28) * game.scale;
  const accent = fromSat.color || COLORS.amber;
  for (const [dx, dy] of dirs) {
    for (let i = 0; i < 2 + level; i += 1) {
      const spread = (i - (1 + level) / 2) * 0.08;
      const rx = dx * Math.cos(spread) - dy * Math.sin(spread);
      const ry = dx * Math.sin(spread) + dy * Math.cos(spread);
      game.bullets.push({
        x: fromSat.x,
        y: fromSat.y,
        vx: rx * speed,
        vy: ry * speed,
        radius: 2.6 * game.scale,
        ttl: 0.9 + level * 0.08,
        damage: 1.1 + level * 0.32,
        ricochetLeft: game.globalBulletRicochet,
        color: accent,
      });
    }
  }
}

function fireOrbitalNeedle(fromSat, level) {
  const count = 4 + level;
  const speed = (360 + level * 24) * game.scale;
  const accent = fromSat.color || COLORS.white;
  for (let i = 0; i < count; i += 1) {
    const a = (Math.PI * 2 * i) / count + rand(-0.02, 0.02);
    game.bullets.push({
      x: fromSat.x,
      y: fromSat.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 2.1 * game.scale,
      ttl: 1.8 + level * 0.15,
      damage: 0.9 + level * 0.28,
      ricochetLeft: game.globalBulletRicochet + 3,
      color: accent,
    });
  }
}

function triggerBladeOrbit(fromSat, level) {
  // Blade orbit is now always-on; no collision-triggered spawn needed.
}

function triggerBodySlam(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const range = fromSat.radius * (1.54 + growth * 0.16);
  const damage = (2.45 + growth * 0.9) * powerMul;
  game.effects.push({
    type: "ring",
    x: fromSat.x,
    y: fromSat.y,
    r: 4,
    maxR: range,
    life: 0.2,
    ttl: 0.2,
    color: fromSat.color || COLORS.amber,
  });
  for (const m of game.meteors) {
    const d2 = distSq(fromSat, m);
    if (d2 <= range * range) {
      dealDamage(m, damage, fromSat.color || COLORS.amber);
      if (!fromFusionSecondary) tryFusionAssistFromPrimaryHit(fromSat, m, m.x, m.y);
    }
  }
}

function triggerShockwave(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const range = (100 + growth * 24) * game.scale;
  const damage = (4.9 + growth * 1.95) * powerMul;
  game.effects.push({
    type: "ring",
    x: fromSat.x,
    y: fromSat.y,
    r: 5,
    maxR: range,
    life: 0.36,
    ttl: 0.36,
    color: fromSat.color || COLORS.lime,
  });
  for (const m of game.meteors) {
    const d2 = distSq(fromSat, m);
    if (d2 <= range * range) {
      dealDamage(m, damage, fromSat.color || COLORS.lime);
      if (!fromFusionSecondary) tryFusionAssistFromPrimaryHit(fromSat, m, m.x, m.y);
    }
  }
}

function triggerCrossLaser(fromSat, level, powerMul = 1, fromFusionSecondary = false) {
  const lvl = Math.max(1, level);
  const step = lvl - 1;
  const growth = step * 2;
  const life = 0.27 + growth * 0.05;
  const dmg = (2.8 + growth * 1.0) * powerMul;
  const accent = fromSat.color || COLORS.amber;
  game.lasers.push({
    axis: "x",
    x: fromSat.x,
    y: fromSat.y,
    life,
    ttl: life,
    width: (12 + growth * 2.8) * game.scale,
    damage: dmg,
    color: accent,
    sourceSatId: fromSat.id,
    fromFusionSecondary,
    hitMeteorIds: new Set(),
  });
  game.lasers.push({
    axis: "y",
    x: fromSat.x,
    y: fromSat.y,
    life,
    ttl: life,
    width: (12 + growth * 2.8) * game.scale,
    damage: dmg,
    color: accent,
    sourceSatId: fromSat.id,
    fromFusionSecondary,
    hitMeteorIds: new Set(),
  });
}

function triggerAttackType(sat, attackType, level, powerMul = 1, fromFusionSecondary = false) {
  if (attackType === "bulletBurst") {
    sfxBurst();
    fireBurst(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "shockwave") {
    sfxShockwave();
    triggerShockwave(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "crossLaser") {
    sfxLaser();
    triggerCrossLaser(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "prismBurst") {
    sfxBurst();
    firePrismBurst(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "sniperPulse") {
    sfxLaser();
    fireSniperPulse(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "arcLightning") {
    sfxShockwave();
    triggerArcLightning(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "coreMine") {
    sfxShockwave();
    triggerCoreMine(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "giantBody") {
    sfxShockwave();
    triggerBodySlam(sat, level, powerMul, fromFusionSecondary);
  } else if (attackType === "bladeOrbit") {
    // Always-on type: collision does not trigger extra activation.
  }
}

function triggerSatelliteImpact(sat) {
  const powerMul = satelliteAuraMultiplier(sat);
  emitMiniSatFromSatellite(sat);
  sfxImpact();
  triggerAttackType(sat, sat.attackType, sat.attackLevel, powerMul, false);
  if (sat.secondaryAttackType) {
    triggerAttackType(sat, sat.secondaryAttackType, sat.secondaryAttackLevel || 1, powerMul * 0.82, true);
  }
}

function triggerFusionSecondaryAssist(sat, targetMeteor, x, y) {
  if (!sat.secondaryAttackType) return;
  const type = sat.secondaryAttackType;
  const level = Math.max(1, sat.secondaryAttackLevel || 1);
  const weak = 0.42;
  const accent = sat.fusionColors ? sat.fusionColors[1] : sat.color;
  game.effects.push({
    type: "spark",
    x,
    y,
    ttl: 0.12,
    life: 0.12,
    color: accent,
  });
  if (type === "bulletBurst") {
    const count = 4 + Math.floor(level / 2);
    const speed = (180 + level * 18) * game.scale;
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + rand(-0.15, 0.15);
      game.bullets.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        radius: 2.1 * game.scale,
        ttl: 0.55,
        damage: (0.55 + level * 0.12) * weak,
        ricochetLeft: 0,
        color: accent,
        sourceSatId: sat.id,
        fromFusionSecondary: true,
      });
    }
  } else if (type === "prismBurst") {
    game.prismEmitters.push({
      x,
      y,
      angle: rand(0, Math.PI * 2),
      spin: (4.6 + level * 0.3) * (Math.random() < 0.5 ? -1 : 1),
      fireInterval: 0.095,
      fireTimer: 0,
      ttl: 0.42,
      life: 0.42,
      power: Math.max(1, level - 1),
      powerMul: weak,
      sourceSatId: sat.id,
      fromFusionSecondary: true,
      color: accent,
    });
  } else if (type === "sniperPulse") {
    const target = targetMeteor || game.meteors[0];
    if (!target) return;
    const dx = target.x - x;
    const dy = target.y - y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const speed = (430 + level * 22) * game.scale;
    game.bullets.push({
      x,
      y,
      vx: (dx / d) * speed,
      vy: (dy / d) * speed,
      radius: 2.4 * game.scale,
      ttl: 0.9,
      damage: (1.4 + level * 0.4) * weak,
      ricochetLeft: 0,
      color: accent,
      sourceSatId: sat.id,
      fromFusionSecondary: true,
    });
  } else if (type === "shockwave" || type === "coreMine" || type === "giantBody") {
    const range = (type === "coreMine" ? 48 : 60) * game.scale;
    const dmg = (type === "coreMine" ? 2.2 : 1.8) * weak * (1 + level * 0.2);
    game.effects.push({
      type: "ring",
      x,
      y,
      r: 4,
      maxR: range,
      life: 0.18,
      ttl: 0.18,
      color: accent,
    });
    for (const m of game.meteors) {
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy <= range * range) dealDamage(m, dmg, accent);
    }
  } else if (type === "crossLaser") {
    const tmpSat = {
      id: sat.id,
      x,
      y,
      color: accent,
    };
    triggerCrossLaser(tmpSat, level, weak, true);
  } else if (type === "arcLightning") {
    const target = targetMeteor || game.meteors[0];
    if (!target) return;
    dealDamage(target, (1.1 + level * 0.22) * weak, accent);
    game.effects.push({
      type: "lightningBolt",
      x1: x,
      y1: y,
      x2: target.x,
      y2: target.y,
      ttl: 0.08,
      life: 0.08,
      color: accent,
    });
  }
}

function tryFusionAssistFromPrimaryHit(sat, targetMeteor, x, y) {
  if (!sat || !sat.secondaryAttackType) return;
  triggerFusionSecondaryAssist(sat, targetMeteor, x, y);
}

function applyBladeOrbitContinuous(sat, dt) {
  if (sat.attackType !== "bladeOrbit") return;
  const level = sat.attackLevel;
  const step = Math.max(0, level - 1);
  const growth = step * 2;
  const bladeCount = Math.min(10, 1 + growth);
  const bladeLen = (78 + growth * 16) * game.scale;
  const omega = 4.8 + growth * 0.5;
  const hitCooldown = Math.max(0.08, 0.26 - growth * 0.018);

  for (const [id, t] of sat.bladeHitCooldowns) {
    const nt = t - dt;
    if (nt <= 0) sat.bladeHitCooldowns.delete(id);
    else sat.bladeHitCooldowns.set(id, nt);
  }

  for (let b = 0; b < bladeCount; b += 1) {
    const a = game.time * omega + b * (Math.PI * 2 / bladeCount);
    const x1 = sat.x;
    const y1 = sat.y;
    const x2 = sat.x + Math.cos(a) * bladeLen;
    const y2 = sat.y + Math.sin(a) * bladeLen;
    for (const m of game.meteors) {
      if (sat.bladeHitCooldowns.has(m.id)) continue;
      const hitR = m.radius + 6 * game.scale;
      const d2 = pointSegmentDistanceSq(m.x, m.y, x1, y1, x2, y2);
      if (d2 <= hitR * hitR) {
        dealDamage(m, (1.0 + growth * 0.38) * satelliteAuraMultiplier(sat), sat.color || COLORS.cyan);
        tryFusionAssistFromPrimaryHit(sat, m, m.x, m.y);
        sat.bladeHitCooldowns.set(m.id, hitCooldown);
        game.effects.push({
          type: "spark",
          x: x2,
          y: y2,
          ttl: 0.1,
          life: 0.1,
          color: sat.color || COLORS.cyan,
        });
      }
    }
  }
}

function pointSegmentDistanceSq(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = px - x1;
  const wy = py - y1;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return (px - x1) ** 2 + (py - y1) ** 2;
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return (px - x2) ** 2 + (py - y2) ** 2;
  const t = c1 / c2;
  const cx = x1 + vx * t;
  const cy = y1 + vy * t;
  return (px - cx) ** 2 + (py - cy) ** 2;
}

function drawBladeOrbitForSatellite(sat) {
  if (sat.attackType !== "bladeOrbit") return;
  const level = sat.attackLevel;
  const step = Math.max(0, level - 1);
  const growth = step * 2;
  const bladeCount = Math.min(10, 1 + growth);
  const bladeLen = (78 + growth * 16) * game.scale;
  const omega = 4.8 + growth * 0.5;
  const accent = sat.color || COLORS.cyan;
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.shadowBlur = 10;
  ctx.shadowColor = accent;
  for (let b = 0; b < bladeCount; b += 1) {
    const aa = game.time * omega + b * (Math.PI * 2 / bladeCount);
    const tipX = sat.x + Math.cos(aa) * bladeLen;
    const tipY = sat.y + Math.sin(aa) * bladeLen;
    const nx = -Math.sin(aa);
    const ny = Math.cos(aa);
    const width = (3.8 + growth * 0.45) * game.scale;
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    // Blade starts at satellite center and extends outward.
    ctx.moveTo(sat.x, sat.y);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.moveTo(sat.x + nx * width * 0.15, sat.y + ny * width * 0.15);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.strokeStyle = accent;
  }
  ctx.restore();
}

function startBattle() {
  if (game.battleStarted) return;
  game.battleStarted = true;
  game.awaitingInitialSatellitePick = false;
  hintText.textContent = "迎撃開始。左クリック長押しで重力5倍。";
}

function onSatelliteCollision(a, b) {
  triggerSatelliteImpact(a);
  triggerSatelliteImpact(b);
}

function colorByAttackType(type) {
  if (type === "bulletBurst") return "#ff6ea8";
  if (type === "shockwave") return "#90ff4e";
  if (type === "crossLaser") return "#28f4ff";
  if (type === "prismBurst") return "#f48bff";
  if (type === "sniperPulse") return "#f3feff";
  if (type === "arcLightning") return "#73c8ff";
  if (type === "coreMine") return "#ff9d7a";
  if (type === "giantBody") return "#ffd76a";
  if (type === "bladeOrbit") return "#9fffd8";
  return SATELLITE_COLORS[0];
}

function setSatelliteAttackType(sat, type, level = 1) {
  sat.attackType = type;
  sat.attackLevel = Math.max(1, level);
  sat.color = colorByAttackType(type);
  sat.radius = sat.baseRadius * (type === "giantBody" ? (1.5 + (sat.attackLevel - 1) * 0.36) : 1);
}

function setOrbitalVelocity(sat, factor) {
  const s = game.scale;
  const src = gravitySource();
  const dx = sat.x - src.x;
  const dy = sat.y - src.y;
  const r = Math.max(140 * s, Math.hypot(dx, dy));
  const tX = -dy / r;
  const tY = dx / r;
  const accel = gravityAccelAtDistance(r, s, sat.gravityDamp);
  const orbitSpeed = Math.sqrt(Math.max(0.01, accel * r)) * factor;
  const targetVx = tX * orbitSpeed;
  const targetVy = tY * orbitSpeed;
  sat.vx = targetVx;
  sat.vy = targetVy;
}

function updateSatellites(dt) {
  const s = game.scale;
  const wallBounceDamp = 0.5;
  const gravityBoost = game.gravityBoostActive ? game.gravityBoostMultiplier : 1;
  const G = game.gravityStrength * game.relicGravityMul * s * s * s * gravityBoost;
  const minPull = game.gravityFloorSat * s;
  const satSoftening = 24000 * s * s;
  const src = gravitySource();
  const trapRadius = game.blackHoleRadius * 2.2;
  const releaseRadius = game.blackHoleRadius * 3.2;
  for (const sat of game.satellites) {
    sat.auraTimer = (sat.auraTimer || 0) + dt;
    while (sat.auraLevel < 4 && sat.auraTimer >= 5) {
      sat.auraTimer -= 5;
      sat.auraLevel += 1;
    }
    let hitWall = false;
    const hx = sat.x - game.centerX;
    const hy = sat.y - game.centerY;
    const hDist = Math.hypot(hx, hy);
    if (hDist <= trapRadius) {
      sat.nearHoleTime += dt;
      if (sat.nearHoleTime >= sat.escapeDelay) {
        sat.gravityDamp = Math.max(0.14, sat.gravityDamp - dt * 0.42);
      }
    } else if (hDist >= releaseRadius) {
      sat.nearHoleTime = 0;
      sat.gravityDamp = Math.min(1, sat.gravityDamp + dt * 0.9);
    } else {
      sat.gravityDamp = Math.min(1, sat.gravityDamp + dt * 0.28);
    }

    if (game.battleStarted && game.cueBall.state === "ready") {
      const dx = src.x - sat.x;
      const dy = src.y - sat.y;
      const d2 = Math.max(dx * dx + dy * dy, 1200 * s * s);
      const force = Math.max(G / Math.pow(d2 + satSoftening, game.gravityFalloffExp), minPull) * sat.gravityDamp;
      const d = Math.sqrt(d2);
      sat.vx += (dx / d) * force * dt;
      sat.vy += (dy / d) * force * dt;
    }
    sat.x += sat.vx * dt;
    sat.y += sat.vy * dt;
    sat.miniSatCooldown = Math.max(0, sat.miniSatCooldown - dt);

    const drag = game.battleStarted ? 1.0 : 0.97;
    sat.vx *= drag;
    sat.vy *= drag;

    if (sat.x < sat.radius) {
      sat.x = sat.radius;
      sat.vx *= -wallBounceDamp;
      sat.vy *= 0.96;
      hitWall = true;
    }
    if (sat.x > game.width - sat.radius) {
      sat.x = game.width - sat.radius;
      sat.vx *= -wallBounceDamp;
      sat.vy *= 0.96;
      hitWall = true;
    }
    if (sat.y < sat.radius) {
      sat.y = sat.radius;
      sat.vy *= -wallBounceDamp;
      sat.vx *= 0.96;
      hitWall = true;
    }
    if (sat.y > game.height - sat.radius) {
      sat.y = game.height - sat.radius;
      sat.vy *= -wallBounceDamp;
      sat.vx *= 0.96;
      hitWall = true;
    }
    if (hitWall) {
      sat.auraLevel = 0;
      sat.auraTimer = 0;
      game.effects.push({
        type: "spark",
        x: sat.x,
        y: sat.y,
        ttl: 0.16,
        life: 0.16,
        color: sat.color,
      });
    }
    applyBladeOrbitContinuous(sat, dt);
    recordTrail(sat.trail, sat.x, sat.y, 64);
  }

  if (game.satelliteCollisionEnabled) {
    const touchingNow = new Set();
    for (let i = 0; i < game.satellites.length; i += 1) {
      for (let j = i + 1; j < game.satellites.length; j += 1) {
        const a = game.satellites[i];
        const b = game.satellites[j];
        const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minDist = a.radius + b.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 <= minDist * minDist) {
          touchingNow.add(key);
          if (!game.satTouchPairs.has(key)) {
            const d = Math.sqrt(Math.max(d2, 0.001));
            onSatelliteCollision(a, b);
            emitMiniSatFromSatellite(a, -dx / d, -dy / d);
            emitMiniSatFromSatellite(b, dx / d, dy / d);
          }
        }
      }
    }
    game.satTouchPairs = touchingNow;
  } else {
    game.satTouchPairs.clear();
  }
}

function updateCue() {
  const cue = game.cueBall;
  cue.x = game.centerX;
  cue.y = game.centerY;
  cue.vx = 0;
  cue.vy = 0;
  cue.state = "ready";
  cue.trail.length = 0;
}

function updateMeteors(dt) {
  for (let i = game.meteors.length - 1; i >= 0; i -= 1) {
    const m = game.meteors[i];
    if ((m.damagePopupTimer || 0) > 0) {
      m.damagePopupTimer -= dt;
      if (m.damagePopupTimer <= 0 && (m.damagePopupAccum || 0) > 0) {
        pushDamageText(m.x, m.y, m.damagePopupAccum, m.color || COLORS.white);
        m.damagePopupAccum = 0;
      }
    }
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    for (const sat of game.satellites) {
      const dx = m.x - sat.x;
      const dy = m.y - sat.y;
      const r = m.radius + sat.radius;
      const overlapping = dx * dx + dy * dy <= r * r;
      const wasTouching = m.touchingSatIds.has(sat.id);
      if (overlapping) {
        if (!wasTouching) {
          // Damage only once when contact starts.
          const bodyMul = sat.attackType === "giantBody" ? (1.8 + (sat.attackLevel - 1) * 0.44) : 1;
          dealDamage(m, 3.6 * bodyMul * satelliteAuraMultiplier(sat), sat.color || COLORS.cyan);
          sat.vx -= dx * 0.07;
          sat.vy -= dy * 0.07;
          triggerSatelliteImpact(sat);
          emitMiniSatFromSatellite(sat, -dx, -dy);
          game.effects.push({
            type: "spark",
            x: sat.x,
            y: sat.y,
            ttl: 0.2,
            life: 0.2,
            color: COLORS.cyan,
          });
          m.touchingSatIds.add(sat.id);
        }
      } else if (wasTouching) {
        m.touchingSatIds.delete(sat.id);
      }
    }

    if (game.blackHoleActive) {
      const dx = m.x - game.centerX;
      const dy = m.y - game.centerY;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= game.blackHoleRadius * game.blackHoleRadius) {
        game.hp -= (m.boss ? 4 : 1) * game.relicDamageTakenMul;
        game.damageFlashTimer = game.damageFlashDuration;
        sfxPlayerDamage();
        game.meteors.splice(i, 1);
        game.effects.push({
          type: "flash",
          x: game.centerX,
          y: game.centerY,
          ttl: 0.35,
          life: 0.35,
          color: COLORS.warning,
        });
        continue;
      }
    }

    if (m.hp <= 0) {
      if (m.splitBoss && m.splitStage < 2) {
        const children = splitBossMeteor(m);
        spawnBossSplitEffects(m.x, m.y, m.radius, m.color);
        sfxBurst();
        game.effects.push({
          type: "burst",
          x: m.x,
          y: m.y,
          ttl: 0.5,
          life: 0.5,
          color: COLORS.warning,
        });
        game.meteors.splice(i, 1);
        for (const c of children) game.meteors.push(c);
        continue;
      }

      game.score += m.boss ? 3 : 1;
      game.effects.push({
        type: "burst",
        x: m.x,
        y: m.y,
        ttl: 0.4,
        life: 0.4,
        color: m.boss ? COLORS.warning : COLORS.pink,
      });
      game.meteors.splice(i, 1);
      continue;
    }
  }

  // When all split-boss fragments are gone, mark wave clear and raise difficulty tier.
  if (game.splitBossAlive) {
    const anySplitBoss = game.meteors.some((m) => m.splitBoss);
    if (!anySplitBoss) {
      game.splitBossAlive = false;
      game.postBossTier += 1;
      hintText.textContent = `BOSS DOWN - THREAT TIER ${game.postBossTier}`;
      game.bossBreakFxActive = true;
      game.bossBreakFxTimer = game.bossBreakFxDuration;
      game.pendingRelicAfterBoss = true;
    }
  }
}

function updateBullets(dt) {
  for (let i = game.bullets.length - 1; i >= 0; i -= 1) {
    const b = game.bullets[i];
    b.ttl -= dt;
    if (b.ttl <= 0) {
      game.bullets.splice(i, 1);
      continue;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    let bounced = false;
    if (b.x <= b.radius || b.x >= game.width - b.radius) {
      b.vx *= -1;
      bounced = true;
    }
    if (b.y <= b.radius || b.y >= game.height - b.radius) {
      b.vy *= -1;
      bounced = true;
    }
    if (bounced) {
      if (b.ricochetLeft > 0) {
        b.ricochetLeft -= 1;
      } else {
        game.bullets.splice(i, 1);
        continue;
      }
    }
    for (let j = game.meteors.length - 1; j >= 0; j -= 1) {
      const m = game.meteors[j];
      const dx = m.x - b.x;
      const dy = m.y - b.y;
      const r = m.radius + b.radius;
      if (dx * dx + dy * dy <= r * r) {
        dealDamage(m, b.damage, b.color || COLORS.white);
        if (!b.fromFusionSecondary && b.sourceSatId != null) {
          tryFusionAssistFromPrimaryHit(getSatelliteById(b.sourceSatId), m, b.x, b.y);
        }
        b.damage *= 0.82;
        if (b.damage < 0.5) {
          game.bullets.splice(i, 1);
        }
        break;
      }
    }
  }
}

function updateLasers(dt) {
  for (let i = game.lasers.length - 1; i >= 0; i -= 1) {
    const l = game.lasers[i];
    l.ttl -= dt;
    if (l.ttl <= 0) {
      game.lasers.splice(i, 1);
      continue;
    }
    for (const m of game.meteors) {
      if (l.axis === "x" && Math.abs(m.y - l.y) <= l.width + m.radius) {
        dealDamage(m, l.damage * dt * 12, l.color || COLORS.amber);
        if (!l.fromFusionSecondary && l.sourceSatId != null && !l.hitMeteorIds.has(m.id)) {
          l.hitMeteorIds.add(m.id);
          tryFusionAssistFromPrimaryHit(getSatelliteById(l.sourceSatId), m, m.x, m.y);
        }
      }
      if (l.axis === "y" && Math.abs(m.x - l.x) <= l.width + m.radius) {
        dealDamage(m, l.damage * dt * 12, l.color || COLORS.amber);
        if (!l.fromFusionSecondary && l.sourceSatId != null && !l.hitMeteorIds.has(m.id)) {
          l.hitMeteorIds.add(m.id);
          tryFusionAssistFromPrimaryHit(getSatelliteById(l.sourceSatId), m, m.x, m.y);
        }
      }
    }
  }
}

function updatePrismEmitters(dt) {
  for (let i = game.prismEmitters.length - 1; i >= 0; i -= 1) {
    const e = game.prismEmitters[i];
    e.ttl -= dt;
    e.fireTimer -= dt;
    e.angle += e.spin * dt;
    if (e.ttl <= 0) {
      game.prismEmitters.splice(i, 1);
      continue;
    }
    while (e.fireTimer <= 0) {
      e.fireTimer += e.fireInterval;
      const volley = 1 + Math.floor((e.power + 1) / 4);
      const speed = (220 + e.power * 24) * game.scale;
      for (let n = 0; n < volley; n += 1) {
        const a = e.angle + (n - (volley - 1) * 0.5) * 0.16;
        game.bullets.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          radius: 2.45 * game.scale,
          ttl: 0.82 + e.power * 0.08,
          damage: (0.65 + e.power * 0.3) * (e.powerMul || 1),
          ricochetLeft: game.globalBulletRicochet,
          color: e.color || COLORS.cyan,
          sourceSatId: e.sourceSatId,
          fromFusionSecondary: !!e.fromFusionSecondary,
        });
      }
    }
  }
}

function updateEffects(dt) {
  for (let i = game.effects.length - 1; i >= 0; i -= 1) {
    const e = game.effects[i];
    e.ttl -= dt;
    if (e.type === "ring") {
      e.r += (e.maxR - e.r) * 0.2;
    } else if (e.type === "damageText") {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= 0.9;
      e.vy *= 0.95;
    } else if (e.type === "bossSplitFlash") {
      e.r += (e.maxR - e.r) * 0.3;
    } else if (e.type === "bossSplitShard") {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= 0.986;
      e.vy *= 0.986;
      e.rot += e.spin * dt;
    } else if (e.type === "satSpawn") {
      e.r += (e.maxR - e.r) * 0.28;
    } else if (e.type === "satSpawnSpark") {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= 0.92;
      e.vy *= 0.92;
    }
    if (e.ttl <= 0) {
      game.effects.splice(i, 1);
    }
  }
}

function randomUpgradeChoices(isInitialPick = false) {
  const attackPool = UPGRADE_LIBRARY.filter((u) => u.category === "attack");
  if (isInitialPick) {
    const arr = [...attackPool];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 3).map((u) => ({
      key: u.id,
      kind: "attack",
      id: u.id,
      name: u.name,
      desc: u.desc,
      category: u.category,
      primaryId: u.id,
      secondaryId: null,
    }));
  }
  const fusedMap = new Map();
  for (const s of game.satellites) {
    if (s.attackType && s.secondaryAttackType) {
      const key = `${s.attackType}x${s.secondaryAttackType}`;
      if (!fusedMap.has(key)) {
        const a = UPGRADE_LIBRARY.find((u) => u.id === s.attackType);
        const b = UPGRADE_LIBRARY.find((u) => u.id === s.secondaryAttackType);
        if (a && b) {
          fusedMap.set(key, {
            key,
            kind: "fusion",
            id: key,
            name: `${a.name} x ${b.name}`,
            desc: `${a.desc}\n${b.desc}`,
            category: "attack",
            primaryId: a.id,
            secondaryId: b.id,
          });
        }
      }
    }
  }
  const normalChoices = attackPool.map((u) => ({
    key: u.id,
    kind: "attack",
    id: u.id,
    name: u.name,
    desc: u.desc,
    category: u.category,
    primaryId: u.id,
    secondaryId: null,
  }));
  const fusedChoices = [...fusedMap.values()];
  const ownedKeySet = new Set(
    game.satellites
      .map((s) => satelliteUpgradeKey(s))
      .filter((k) => !!k)
  );
  const capped = ownedKeySet.size >= 4;
  const pool = capped
    ? [...normalChoices, ...fusedChoices].filter((u) => ownedKeySet.has(u.key))
    : [...normalChoices, ...fusedChoices];
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

function satelliteUpgradeKey(sat) {
  if (!sat || !sat.attackType) return null;
  if (sat.secondaryAttackType) return `${sat.attackType}x${sat.secondaryAttackType}`;
  return sat.attackType;
}

function randomRelicChoices() {
  const arr = [...RELIC_LIBRARY];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

function renderSatelliteTargetList() {
  satelliteList.innerHTML = "";
  for (const sat of game.satellites) {
    const card = document.createElement("div");
    card.className = "satellite-btn";
    const upInfo = sat.attackType ? UPGRADE_LIBRARY.find((u) => u.id === sat.attackType) : null;
    const typeLabel = upInfo ? upInfo.name : "UNSET";
    card.innerHTML = `<div class="upgrade-title">SATELLITE</div><div class="satellite-meta">${typeLabel} / Lv.${sat.attackLevel}</div>`;
    const slot = document.createElement("div");
    slot.className = "satellite-slots";
    if (sat.attackType) {
      const up = UPGRADE_LIBRARY.find((u) => u.id === sat.attackType);
      slot.appendChild(createUpgradeIconNode(sat.attackType, up ? up.category : "attack"));
    } else {
      slot.appendChild(createUpgradeIconNode("empty", "attack", true));
    }
    card.appendChild(slot);
    satelliteList.appendChild(card);
  }
}

function getSatelliteById(id) {
  for (const sat of game.satellites) {
    if (sat.id === id) return sat;
  }
  return null;
}

function fuseSatellites(firstId, secondId) {
  if (firstId === secondId) return false;
  const a = getSatelliteById(firstId);
  const b = getSatelliteById(secondId);
  if (!a || !b || !a.attackType || !b.attackType) return false;
  a.secondaryAttackType = b.attackType;
  a.secondaryAttackLevel = b.attackLevel;
  a.fusionColors = [a.color, b.color];
  const aLevel = a.auraLevel || 0;
  const bLevel = b.auraLevel || 0;
  a.auraLevel = Math.min(4, Math.max(aLevel, bLevel));
  a.auraTimer = 0;
  game.satellites = game.satellites.filter((s) => s !== b);
  game.satTouchPairs.clear();
  playSatelliteSpawnFx(a);
  hintText.textContent = `${a.attackType.toUpperCase()} + ${b.attackType.toUpperCase()} FUSION`;
  return a;
}

function applyAttackChoice(choice, isInitialPick) {
  const attackKey = typeof choice === "string" ? choice : choice.key;
  const isFusionChoice = typeof choice === "object" && choice.kind === "fusion";
  if (isInitialPick) {
    if (game.satellites.length === 0) return;
    setSatelliteAttackType(game.satellites[0], attackKey, 1);
    closeUpgradeSelection();
    startBattle();
    return;
  }

  const sameType = game.satellites
    .filter((s) => satelliteUpgradeKey(s) === attackKey)
    .sort((a, b) => a.attackLevel - b.attackLevel);
  if (sameType.length > 0) {
    if (isFusionChoice) {
      sameType[0].attackLevel += 1;
      sameType[0].secondaryAttackLevel = Math.max(sameType[0].secondaryAttackLevel || 1, sameType[0].attackLevel);
    } else {
      sameType[0].attackLevel += 1;
      setSatelliteAttackType(sameType[0], sameType[0].attackType, sameType[0].attackLevel);
    }
  } else {
    const ownedTypeSet = new Set(
      game.satellites
        .map((s) => satelliteUpgradeKey(s))
        .filter((k) => !!k)
    );
    if (ownedTypeSet.size >= 4) {
      closeUpgradeSelection();
      return;
    }
    const sat = spawnExtraSatellite();
    setSatelliteAttackType(sat, attackKey, 1);
    setOrbitalVelocity(sat, 1.0);
  }
  closeUpgradeSelection();
}

function applyRelicChoice(relicId) {
  game.relicCounts[relicId] = (game.relicCounts[relicId] || 0) + 1;
  if (relicId === "gravityClick") {
    game.gravityBoostMultiplier += 0.85;
  } else if (relicId === "gravityCore") {
    game.relicGravityMul *= 1.18;
  } else if (relicId === "gravityFuel") {
    game.gravityChargeMax *= 1.28;
    game.gravityCharge = Math.min(game.gravityChargeMax, game.gravityCharge + game.gravityChargeMax * 0.24);
  } else if (relicId === "gravitySustain") {
    game.gravityDrainPerSec *= 0.86;
  } else if (relicId === "gravityRecover") {
    game.gravityRecoverPerSec *= 1.22;
  } else if (relicId === "hullPlus") {
    game.maxHp += 4;
    game.hp = Math.min(game.maxHp, game.hp + 4);
  } else if (relicId === "repair") {
    game.relicRegenPerSec += 0.2;
  } else if (relicId === "guard") {
    game.relicDamageTakenMul *= 0.88;
  } else if (relicId === "tidalBrake") {
    game.relicEnemySpeedMul *= 0.92;
  }
  closeUpgradeSelection();
}

function openUpgradeSelection(isInitialPick = false) {
  game.pausedForUpgrade = true;
  game.selectingRelic = false;
  game.selectingFusion = false;
  game.awaitingInitialSatellitePick = isInitialPick;
  upgradeOverlay.classList.remove("hidden");
  upgradeOverlay.classList.remove("fusion-mode");
  upgradeOverlay.classList.remove("fusion-result-mode");
  upgradeList.innerHTML = "";
  satelliteList.style.display = "none";
  upgradeTitle.textContent = "UPGRADE PICK";
  const choices = randomUpgradeChoices(isInitialPick);
  for (const up of choices) {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    const top = document.createElement("div");
    top.className = "upgrade-top";
    const icon = createUpgradeIconNode(up.primaryId, up.category);
    const textWrap = document.createElement("div");
    const category = categoryLabel(up.category);
    textWrap.innerHTML = `<div class="upgrade-title">${up.name}</div><div class="upgrade-meta cat-text-${up.category}">${category}</div>`;
    top.appendChild(icon);
    if (up.kind === "fusion") {
      const iconB = createUpgradeIconNode(up.secondaryId, up.category);
      top.appendChild(iconB);
    }
    top.appendChild(textWrap);
    const desc = document.createElement("div");
    if (up.kind === "fusion") {
      const lines = up.desc.split("\n");
      desc.innerHTML = `${lines[0]}<br>${lines[1] || ""}`;
    } else {
      desc.textContent = up.desc;
    }
    const foot = document.createElement("div");
    foot.className = "upgrade-meta";
    if (isInitialPick) {
      foot.textContent = "START!!";
    } else {
      const sameType = game.satellites
        .filter((s) => satelliteUpgradeKey(s) === up.key)
        .sort((a, b) => b.attackLevel - a.attackLevel);
      if (sameType.length === 0) {
        foot.textContent = "NEW!!";
      } else {
        foot.textContent = `Level${sameType[0].attackLevel + 1}!!`;
      }
    }
    btn.appendChild(top);
    btn.appendChild(desc);
    btn.appendChild(foot);
    btn.addEventListener("click", () => {
      applyAttackChoice(up, isInitialPick);
    });
    upgradeList.appendChild(btn);
  }
  upgradeSub.textContent = isInitialPick
    ? "初期衛星の攻撃タイプを選択"
    : "攻撃タイプを選択";
}

function openRelicSelection() {
  game.pausedForUpgrade = true;
  game.selectingRelic = true;
  game.awaitingInitialSatellitePick = false;
  upgradeOverlay.classList.remove("hidden");
  upgradeOverlay.classList.remove("fusion-mode");
  upgradeOverlay.classList.remove("fusion-result-mode");
  upgradeList.innerHTML = "";
  satelliteList.style.display = "none";
  upgradeTitle.textContent = "BOSS RELIC";
  const choices = randomRelicChoices();
  for (const relic of choices) {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    const top = document.createElement("div");
    top.className = "upgrade-top";
    const icon = createRelicIconNode(relic.id, relic.category);
    const textWrap = document.createElement("div");
    textWrap.innerHTML = `<div class="upgrade-title">${relic.name}</div><div class="upgrade-meta cat-text-${relic.category}">RELIC</div>`;
    top.appendChild(icon);
    top.appendChild(textWrap);
    const desc = document.createElement("div");
    desc.textContent = relic.desc;
    const owned = game.relicCounts[relic.id] || 0;
    const foot = document.createElement("div");
    foot.className = "upgrade-meta";
    foot.textContent = owned > 0 ? `OWNED x${owned + 1}` : "NEW RELIC";
    btn.appendChild(top);
    btn.appendChild(desc);
    btn.appendChild(foot);
    btn.addEventListener("click", () => {
      applyRelicChoice(relic.id);
    });
    upgradeList.appendChild(btn);
  }
  upgradeSub.textContent = "ボスレリックを選択して全体強化";
}

function openFusionSelection() {
  const eligible = game.satellites.filter((s) => !!s.attackType && !s.secondaryAttackType);
  if (eligible.length < 2) return;
  game.pausedForUpgrade = true;
  game.selectingFusion = true;
  game.fusionResultActive = false;
  game.fusionResultTimer = 0;
  game.selectingRelic = false;
  game.awaitingInitialSatellitePick = false;
  upgradeOverlay.classList.remove("hidden");
  upgradeOverlay.classList.add("fusion-mode");
  upgradeOverlay.classList.remove("fusion-result-mode");
  upgradeList.innerHTML = "";
  satelliteList.style.display = "none";
  upgradeTitle.textContent = "SAT FUSION";
  let first = null;

  const renderChoices = () => {
    upgradeList.innerHTML = "";
    for (const sat of eligible) {
      const btn = document.createElement("button");
      btn.className = "upgrade-btn";
      const top = document.createElement("div");
      top.className = "upgrade-top";
      const icon = createUpgradeIconNode(sat.attackType, "attack");
      const textWrap = document.createElement("div");
      textWrap.innerHTML = `<div class="upgrade-title">${sat.attackType.toUpperCase()}</div><div class="upgrade-meta">Lv.${sat.attackLevel}</div>`;
      top.appendChild(icon);
      top.appendChild(textWrap);
      const desc = document.createElement("div");
      if (!first) {
        desc.textContent = "1体目を選択";
      } else if (first === sat.id) {
        desc.textContent = "選択中";
        btn.style.borderColor = "rgba(255,230,120,0.95)";
      } else {
        desc.textContent = "2体目として融合";
      }
      btn.appendChild(top);
      btn.appendChild(desc);
      btn.addEventListener("click", () => {
        if (!first) {
          first = sat.id;
          renderChoices();
          return;
        }
        if (first === sat.id) return;
        const matA = getSatelliteById(first);
        const matB = getSatelliteById(sat.id);
        const result = fuseSatellites(first, sat.id);
        if (!result) return;
        if (result && matA && matB) {
          showFusionResultPresentation(result, matA, matB);
        } else {
          closeUpgradeSelection();
        }
      });
      upgradeList.appendChild(btn);
    }
  };

  renderChoices();
  upgradeSub.textContent = "融合する衛星を2体選択";
}

function closeUpgradeSelection() {
  game.pausedForUpgrade = false;
  upgradeOverlay.classList.add("hidden");
  upgradeOverlay.classList.remove("fusion-mode");
  upgradeOverlay.classList.remove("fusion-result-mode");
  game.selectingRelic = false;
  game.selectingFusion = false;
  game.fusionResultActive = false;
  game.fusionResultTimer = 0;
  game.awaitingInitialSatellitePick = false;
  upgradeTitle.textContent = "UPGRADE PICK";
  upgradeSub.textContent = "攻撃タイプを選択";
  satelliteList.innerHTML = "";
  satelliteList.style.display = "";
}

function showFusionResultPresentation(resultSat, matA, matB) {
  const aInfo = UPGRADE_LIBRARY.find((u) => u.id === matA.attackType);
  const bInfo = UPGRADE_LIBRARY.find((u) => u.id === matB.attackType);
  const aName = aInfo ? aInfo.name : matA.attackType;
  const bName = bInfo ? bInfo.name : matB.attackType;
  const resultName = `${aName} x ${bName}`;
  game.fusionResultActive = true;
  game.fusionResultTimer = game.fusionResultDuration;
  game.pausedForUpgrade = true;
  game.selectingFusion = true;
  upgradeOverlay.classList.add("fusion-mode");
  upgradeOverlay.classList.add("fusion-result-mode");
  upgradeOverlay.classList.remove("hidden");
  upgradeTitle.textContent = "FUSION RESULT";
  upgradeSub.textContent = "融合結果";
  upgradeList.innerHTML = "";
  satelliteList.style.display = "none";

  const left = document.createElement("div");
  left.className = "upgrade-btn fusion-mat";
  left.innerHTML = `<div class="upgrade-top"></div><div class="upgrade-title">${aName}</div>`;
  left.querySelector(".upgrade-top").appendChild(createUpgradeIconNode(matA.attackType, "attack"));

  const right = document.createElement("div");
  right.className = "upgrade-btn fusion-mat";
  right.innerHTML = `<div class="upgrade-top"></div><div class="upgrade-title">${bName}</div>`;
  right.querySelector(".upgrade-top").appendChild(createUpgradeIconNode(matB.attackType, "attack"));

  const result = document.createElement("div");
  result.className = "upgrade-btn fusion-result";
  const top = document.createElement("div");
  top.className = "upgrade-top";
  top.appendChild(createUpgradeIconNode(matA.attackType, "attack"));
  top.appendChild(createUpgradeIconNode(matB.attackType, "attack"));
  result.appendChild(top);
  const title = document.createElement("div");
  title.className = "upgrade-title";
  title.textContent = resultName;
  const desc = document.createElement("div");
  desc.innerHTML = `${aInfo ? aInfo.desc : ""}<br>${bInfo ? bInfo.desc : ""}`;
  const foot = document.createElement("div");
  foot.className = "upgrade-meta";
  foot.textContent = `Lv.${resultSat.attackLevel}`;
  result.appendChild(title);
  result.appendChild(desc);
  result.appendChild(foot);

  const plus = document.createElement("div");
  plus.className = "fusion-symbol";
  plus.textContent = "+";
  const arrow = document.createElement("div");
  arrow.className = "fusion-symbol";
  arrow.textContent = "=>";

  upgradeList.appendChild(left);
  upgradeList.appendChild(plus);
  upgradeList.appendChild(right);
  upgradeList.appendChild(arrow);
  upgradeList.appendChild(result);
}

function updateSpawns(dt) {
  if (!game.battleStarted) return;
  game.meteorSpawnTimer -= dt;
  if (game.meteorSpawnTimer <= 0) {
    const countScale = Math.pow(1.5, game.postBossTier);
    const spawnCount = Math.max(1, Math.min(16, Math.floor(countScale)));
    for (let i = 0; i < spawnCount; i += 1) {
      spawnMeteor(false);
    }
    const postBossPressure = game.time > 60 ? Math.min(0.7, (game.time - 60) * 0.006) : 0;
    const minInterval = Math.max(0.2, 0.45 - postBossPressure * 0.25);
    game.meteorSpawnInterval = Math.max(minInterval, 1.5 - game.level * 0.05 - postBossPressure);
    game.meteorSpawnTimer = game.meteorSpawnInterval;
  }
  if (!game.splitBossAlive && game.time >= game.nextSplitBossAt) {
    spawnSplitBoss();
    game.nextSplitBossAt += 120;
  }
  if (!game.splitBossAlive && !game.bonusUfo && game.time >= game.nextFusionUfoAt) {
    spawnBonusUfo();
    game.nextFusionUfoAt += 120;
  }
}

function updateMiniSats(dt) {
  const s = game.scale;
  const wallBounceDamp = 0.5;
  const src = gravitySource();
  const softening = 22000 * s * s;
  const minPull = game.gravityFloorSat * s;
  const gravityBoost = game.gravityBoostActive ? game.gravityBoostMultiplier : 1;
  const G = game.gravityStrength * game.relicGravityMul * s * s * s * gravityBoost;

  for (let i = game.miniSats.length - 1; i >= 0; i -= 1) {
    const ms = game.miniSats[i];
    ms.ttl -= dt;
    ms.hitCooldown = Math.max(0, ms.hitCooldown - dt);
    if (ms.ttl <= 0) {
      game.miniSats.splice(i, 1);
      continue;
    }

    const dxg = src.x - ms.x;
    const dyg = src.y - ms.y;
    const d2g = Math.max(dxg * dxg + dyg * dyg, 900 * s * s);
    const dg = Math.sqrt(d2g);
    const pull = Math.max(G / Math.pow(d2g + softening, game.gravityFalloffExp), minPull) * 0.55;
    ms.vx += (dxg / dg) * pull * dt;
    ms.vy += (dyg / dg) * pull * dt;

    ms.x += ms.vx * dt;
    ms.y += ms.vy * dt;
    recordTrail(ms.trail, ms.x, ms.y, 24);

    if (ms.x <= ms.radius) {
      ms.x = ms.radius;
      ms.vx *= -wallBounceDamp;
      ms.vy *= 0.97;
    }
    if (ms.x >= game.width - ms.radius) {
      ms.x = game.width - ms.radius;
      ms.vx *= -wallBounceDamp;
      ms.vy *= 0.97;
    }
    if (ms.y <= ms.radius) {
      ms.y = ms.radius;
      ms.vy *= -wallBounceDamp;
      ms.vx *= 0.97;
    }
    if (ms.y >= game.height - ms.radius) {
      ms.y = game.height - ms.radius;
      ms.vy *= -wallBounceDamp;
      ms.vx *= 0.97;
    }

    for (const m of game.meteors) {
      const dx = ms.x - m.x;
      const dy = ms.y - m.y;
      const minDist = ms.radius + m.radius;
      const d2 = dx * dx + dy * dy;
      if (d2 <= minDist * minDist && ms.hitCooldown <= 0) {
        const d = Math.sqrt(Math.max(d2, 0.001));
        const nx = dx / d;
        const ny = dy / d;
        const overlap = minDist - d;
        ms.x += nx * overlap;
        ms.y += ny * overlap;
        const along = ms.vx * nx + ms.vy * ny;
        if (along < 0) {
          ms.vx -= 2 * along * nx;
          ms.vy -= 2 * along * ny;
        }
        ms.reflected = true;
        ms.hitCooldown = 0.06;
        dealDamage(m, 1.2, COLORS.white);
        game.effects.push({
          type: "spark",
          x: ms.x,
          y: ms.y,
          ttl: 0.16,
          life: 0.16,
          color: COLORS.lime,
        });
      }
    }
  }
}

function updateBonusUfo(dt) {
  const u = game.bonusUfo;
  if (!u) return;
  u.life -= dt;
  u.phase += dt * 3.2;
  u.hue = (u.hue + dt * 90) % 360;
  u.x += u.vx * dt;
  u.y += u.vy * dt;
  u.vy += Math.sin(game.time * 3.5 + u.phase) * 5 * game.scale * dt;

  const off = 120 * game.scale;
  if (u.life <= 0 || u.x < -off || u.x > game.width + off || u.y < -off || u.y > game.height + off) {
    game.bonusUfo = null;
    return;
  }

  for (const sat of game.satellites) {
    const dx = sat.x - u.x;
    const dy = sat.y - u.y;
    const rr = sat.radius + u.radius;
    if (dx * dx + dy * dy <= rr * rr) {
      destroyBonusUfo(u.x, u.y);
      break;
    }
  }
}

function nextLevelIncrement(level) {
  const base = 12 + Math.floor(level * 3.2);
  if (level < 8) return base;
  const t = level - 7;
  const ramp = Math.floor(6 * Math.pow(t, 1.35));
  return base + ramp;
}

function updateLevel() {
  const bossSequenceActive =
    game.bossBreakFxActive ||
    game.pendingRelicAfterBoss ||
    game.selectingRelic ||
    game.fusionFxActive ||
    game.pendingFusionAfterFx ||
    game.selectingFusion ||
    game.fusionResultActive;
  if (bossSequenceActive) return;
  if (game.score >= game.nextLevelScore) {
    game.level += 1;
    game.nextLevelScore += nextLevelIncrement(game.level);
    sfxLevelUp();
    game.levelUpFxActive = true;
    game.levelUpFxTimer = game.levelUpFxDuration;
    game.pendingUpgradeAfterFx = true;
  }
}

function updateGravityCharge(dt) {
  if (game.pointer.leftDown && game.gravityCharge > 0) {
    game.gravityBoostActive = true;
    game.gravityCharge = Math.max(0, game.gravityCharge - game.gravityDrainPerSec * dt);
    if (game.gravityCharge <= 0) {
      game.gravityBoostActive = false;
    }
  } else {
    game.gravityBoostActive = false;
    game.gravityCharge = Math.min(game.gravityChargeMax, game.gravityCharge + game.gravityRecoverPerSec * dt);
  }
  if (game.gravityBoostActive !== game.prevGravityBoostActive) {
    sfxGravityToggle(game.gravityBoostActive);
    game.prevGravityBoostActive = game.gravityBoostActive;
  }
}

function pointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

canvas.addEventListener("pointerdown", (evt) => {
  if (!game.running || game.pausedForUpgrade || game.levelUpFxActive) return;
  ensureAudio();
  if (evt.button === 0) game.pointer.leftDown = true;
  const p = pointerPos(evt);
  game.pointer.down = true;
  game.pointer.x = p.x;
  game.pointer.y = p.y;
});

canvas.addEventListener("pointermove", (evt) => {
  const p = pointerPos(evt);
  game.pointer.x = p.x;
  game.pointer.y = p.y;
});

canvas.addEventListener("pointerup", (evt) => {
  if (!game.running) return;
  if (evt.button === 0) game.pointer.leftDown = false;
  const p = pointerPos(evt);
  game.pointer.x = p.x;
  game.pointer.y = p.y;
  game.pointer.down = false;
  game.pointer.aiming = false;
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

canvas.addEventListener("pointercancel", () => {
  game.pointer.leftDown = false;
});

function applyDebugGravitySettings() {
  const strength = Number(dbgGravityStrength.value) * 1000000;
  const falloff = Number(dbgGravityFalloff.value);
  game.gravityStrength = strength;
  game.gravityFalloffExp = falloff;
  dbgGravityStrengthValue.textContent = Math.round(strength).toString();
  dbgGravityFalloffValue.textContent = falloff.toFixed(2);
}

dbgGravityStrength.addEventListener("input", applyDebugGravitySettings);
dbgGravityFalloff.addEventListener("input", applyDebugGravitySettings);
dbgSatCollision.addEventListener("input", () => {
  game.satelliteCollisionEnabled = !!dbgSatCollision.checked;
  dbgSatCollisionValue.textContent = game.satelliteCollisionEnabled ? "ON" : "OFF";
});

function drawGlowCircle(x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWireMeteor(m) {
  const pulse = 0.5 + Math.sin(game.time * 2 + m.wireSeed) * 0.5;
  const color = m.color || (m.boss ? COLORS.warning : COLORS.pink);
  drawGlowCircle(m.x, m.y, m.radius * 0.75, color, 0.32 + pulse * 0.16);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = m.boss ? 2.3 : 1.5;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.beginPath();
  for (let i = 0; i < 7; i += 1) {
    const a = (Math.PI * 2 * i) / 7 + m.wireSeed;
    const rr = m.radius * (0.8 + (i % 2) * 0.2);
    const x = m.x + Math.cos(a) * rr;
    const y = m.y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  const hpRatio = Math.max(0, m.hp / m.maxHp);
  ctx.strokeStyle = "rgba(145, 250, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(m.x - m.radius, m.y - m.radius - 10);
  ctx.lineTo(m.x - m.radius + m.radius * 2 * hpRatio, m.y - m.radius - 10);
  ctx.stroke();
  ctx.restore();
}

function drawTrail(trail, color, startWidth, endWidth, alpha) {
  if (!trail || trail.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 1; i < trail.length; i += 1) {
    const p0 = trail[i - 1];
    const p1 = trail[i];
    const t = i / (trail.length - 1);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * t;
    ctx.lineWidth = endWidth + (startWidth - endWidth) * t;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSatellite(sat) {
  const fused = sat.fusionColors && sat.fusionColors.length === 2;
  const primary = fused ? sat.fusionColors[0] : sat.color;
  const secondary = fused ? sat.fusionColors[1] : sat.color;
  drawTrail(sat.trail, primary, sat.radius * 0.6, sat.radius * 0.12, 0.28);
  const auraLevel = Math.max(0, Math.min(4, sat.auraLevel || 0));
  if (fused) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(sat.x, sat.y - sat.radius * 2.2, sat.radius * 2.2, sat.radius * 4.4);
    ctx.clip();
    drawGlowCircle(sat.x, sat.y, sat.radius * 1.05, primary, 0.72);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(sat.x - sat.radius * 2.2, sat.y - sat.radius * 2.2, sat.radius * 2.2, sat.radius * 4.4);
    ctx.clip();
    drawGlowCircle(sat.x, sat.y, sat.radius * 1.05, secondary, 0.72);
    ctx.restore();
  } else {
    drawGlowCircle(sat.x, sat.y, sat.radius * 1.05, sat.color, 0.72);
  }
  ctx.save();
  ctx.strokeStyle = primary;
  ctx.lineWidth = 1.4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = primary;
  for (let i = 1; i <= auraLevel; i += 1) {
    const rr = sat.radius * (1.33 + i * 0.34);
    ctx.globalAlpha = 0.2 + i * 0.12;
    ctx.lineWidth = 1.2 + i * 0.35;
    ctx.beginPath();
    ctx.arc(sat.x, sat.y, rr, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (sat.fusionColors && sat.fusionColors.length === 2) {
    ctx.fillStyle = sat.fusionColors[0];
    ctx.beginPath();
    ctx.moveTo(sat.x, sat.y);
    ctx.arc(sat.x, sat.y, sat.radius - 1, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = sat.fusionColors[1];
    ctx.beginPath();
    ctx.moveTo(sat.x, sat.y);
    ctx.arc(sat.x, sat.y, sat.radius - 1, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(240,255,255,0.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sat.x, sat.y - sat.radius);
    ctx.lineTo(sat.x, sat.y + sat.radius);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(sat.x, sat.y, sat.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sat.x - sat.radius - 4, sat.y);
  ctx.lineTo(sat.x + sat.radius + 4, sat.y);
  ctx.moveTo(sat.x, sat.y - sat.radius - 4);
  ctx.lineTo(sat.x, sat.y + sat.radius + 4);
  ctx.stroke();
  ctx.font = `${Math.max(11, Math.floor(12 * game.scale))}px "Press Start 2P"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.white;
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(120, 250, 255, 0.9)";
  ctx.fillText(`Lv${sat.attackLevel}`, sat.x, sat.y + 1);
  ctx.restore();
}

function drawBlackHole() {
  const t = game.time;
  const r = game.blackHoleRadius;
  const boost = game.gravityBoostVisual;
  const hpRatio = Math.max(0, Math.min(1, game.hp / game.maxHp));
  const danger = 1 - hpRatio;
  const blink = (0.5 + 0.5 * Math.sin(t * (12 + 10 * danger))) * danger;
  const hot = Math.min(1, danger * 1.15 + blink * 0.3);
  const pulseBoost = 1 + boost * 0.3;
  const ringR = Math.round(40 + 215 * hot);
  const ringG = Math.round(242 - 172 * hot);
  const ringB = Math.round(255 - 210 * hot);
  const ringColor = `rgba(${ringR}, ${ringG}, ${ringB}, 0.92)`;
  const auraColor = `rgba(${ringR}, ${Math.max(20, ringG - 20)}, ${Math.max(30, ringB - 30)}, ${0.12 + 0.28 * hot})`;

  ctx.save();
  const grad = ctx.createRadialGradient(game.centerX, game.centerY, 2, game.centerX, game.centerY, r * (3.2 + 0.5 * boost));
  grad.addColorStop(0, "rgba(0,0,0,0.92)");
  grad.addColorStop(0.36, `rgba(${35 + ringR * 0.24}, ${8 + ringG * 0.1}, ${50 + ringB * 0.15}, 0.62)`);
  grad.addColorStop(0.68, auraColor);
  grad.addColorStop(1, "rgba(20,10,25,0.04)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(game.centerX, game.centerY, r * (3.2 + 0.5 * boost), 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 18 + 16 * hot + 14 * boost;
  ctx.shadowColor = ringColor;
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 2.1 + hot * 1.5 + boost * 1.2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(
      game.centerX,
      game.centerY,
      r * (1.2 + i * 0.34) * pulseBoost,
      r * (0.33 + i * 0.11) * (1 + 0.18 * boost),
      t * (0.55 + i * 0.12 + 0.55 * boost) + i,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Rotating accretion ring accents.
  ctx.setLineDash([6, 7]);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = `rgba(255, ${180 - Math.round(120 * hot)}, ${150 - Math.round(90 * hot)}, ${0.35 + hot * 0.4})`;
  for (let i = 0; i < 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(game.centerX, game.centerY, r * (1.7 + i * 0.45), r * (0.6 + i * 0.2), t * (1.3 + i * 0.4), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Core pulse and danger blink.
  drawGlowCircle(game.centerX, game.centerY, r * 0.62, `rgba(${255 - Math.round(20 * hot)}, ${100 - Math.round(70 * hot)}, ${120 - Math.round(85 * hot)}, 1)`, 0.45 + hot * 0.35);
  if (boost > 0) {
    drawGlowCircle(game.centerX, game.centerY, r * (1.8 + 0.25 * Math.sin(t * 14)), "rgba(80, 220, 255, 0.9)", 0.22);
  }
  if (danger > 0.35) {
    drawGlowCircle(game.centerX, game.centerY, r * (1.25 + blink * 0.3), `rgba(255, 40, 45, ${0.2 + blink * 0.35})`, 0.25 + blink * 0.35);
  }
  ctx.restore();
}

function drawGravityBoostBackground() {
  const boost = game.gravityBoostVisual;
  if (boost <= 0.001) return;
  const t = game.time;
  const cx = game.centerX;
  const cy = game.centerY;
  const maxR = Math.hypot(game.width, game.height) * 0.58;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 20; i += 1) {
    const p = i / 20;
    const a = t * 3.2 + i * 0.42;
    const r0 = maxR * (0.25 + p * 0.72);
    const r1 = r0 - maxR * (0.08 + p * 0.2);
    const x0 = cx + Math.cos(a) * r0;
    const y0 = cy + Math.sin(a) * r0;
    const x1 = cx + Math.cos(a + 0.18) * r1;
    const y1 = cy + Math.sin(a + 0.18) * r1;
    ctx.strokeStyle = `rgba(90, 235, 255, ${(0.05 + (1 - p) * 0.16) * boost})`;
    ctx.lineWidth = (1 + (1 - p) * 2.5) * (0.65 + 0.35 * boost);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, cy, game.blackHoleRadius * 1.2, cx, cy, maxR);
  g.addColorStop(0, `rgba(80, 215, 255, ${0.06 * boost})`);
  g.addColorStop(1, "rgba(8, 20, 36, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCueBall() {
  const cue = game.cueBall;
  drawTrail(cue.trail, COLORS.amber, cue.radius * 0.7, cue.radius * 0.14, 0.34);
  if (cue.state === "ready") {
    drawGlowCircle(game.centerX, game.centerY, cue.radius, COLORS.amber, 0.72);
  } else {
    drawGlowCircle(cue.x, cue.y, cue.radius, COLORS.amber, 0.72);
  }
  ctx.save();
  ctx.strokeStyle = COLORS.amber;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 12;
  ctx.shadowColor = COLORS.amber;
  ctx.beginPath();
  ctx.arc(cue.state === "ready" ? game.centerX : cue.x, cue.state === "ready" ? game.centerY : cue.y, cue.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBonusUfo() {
  const u = game.bonusUfo;
  if (!u) return;
  const hueA = (u.hue + 0) % 360;
  const hueB = (u.hue + 110) % 360;
  const hueC = (u.hue + 220) % 360;
  ctx.save();
  const g = ctx.createRadialGradient(u.x, u.y, 2, u.x, u.y, u.radius * 2.2);
  g.addColorStop(0, `hsla(${hueA}, 95%, 72%, 0.65)`);
  g.addColorStop(0.6, `hsla(${hueB}, 92%, 62%, 0.3)`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(u.x, u.y, u.radius * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `hsl(${hueA}, 96%, 70%)`;
  ctx.shadowBlur = 18;
  ctx.shadowColor = `hsl(${hueB}, 96%, 62%)`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(u.x, u.y, u.radius * 1.35, u.radius * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `hsl(${hueC}, 94%, 66%)`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(u.x, u.y - u.radius * 0.15, u.radius * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBullets() {
  for (const b of game.bullets) {
    drawGlowCircle(b.x, b.y, b.radius + 1.2, b.color, 0.5);
    ctx.fillStyle = b.color;
    ctx.fillRect(Math.floor(b.x - b.radius), Math.floor(b.y - b.radius), b.radius * 2, b.radius * 2);
  }
}

function drawMiniSats() {
  for (const ms of game.miniSats) {
    drawTrail(ms.trail, COLORS.white, ms.radius * 1.2, ms.radius * 0.2, 0.34);
    drawGlowCircle(ms.x, ms.y, ms.radius * 0.9, COLORS.white, 0.66);
    ctx.save();
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.white;
    ctx.beginPath();
    ctx.arc(ms.x, ms.y, ms.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawLasers() {
  for (const l of game.lasers) {
    const a = l.ttl / l.life;
    const accent = l.color || COLORS.amber;
    ctx.save();
    const { r, g, b } = hexToRgb(accent);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 * a})`;
    ctx.lineWidth = l.width * 2.5;
    ctx.shadowBlur = 16;
    ctx.shadowColor = accent;
    ctx.beginPath();
    if (l.axis === "x") {
      ctx.moveTo(0, l.y);
      ctx.lineTo(game.width, l.y);
    } else {
      ctx.moveTo(l.x, 0);
      ctx.lineTo(l.x, game.height);
    }
    ctx.stroke();
    ctx.strokeStyle = `rgba(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)}, ${0.9 * a})`;
    ctx.lineWidth = Math.max(2, l.width * 0.65);
    ctx.beginPath();
    if (l.axis === "x") {
      ctx.moveTo(0, l.y);
      ctx.lineTo(game.width, l.y);
    } else {
      ctx.moveTo(l.x, 0);
      ctx.lineTo(l.x, game.height);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function drawEffects() {
  for (const e of game.effects) {
    const a = Math.max(0, e.ttl / e.life);
    if (e.type === "ring") {
      const accent = e.color || COLORS.lime;
      const { r, g, b } = hexToRgb(accent);
      ctx.save();
      ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = accent;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (e.type === "damageText") {
      const accent = e.color || COLORS.white;
      const { r, g, b } = hexToRgb(accent);
      ctx.save();
      ctx.font = `${Math.max(12, Math.floor(18 * game.scale))}px "Rajdhani"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(${r},${g},${b},${0.95 * a})`;
      ctx.strokeStyle = `rgba(10,20,35,${0.75 * a})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = accent;
      ctx.strokeText(e.text, e.x, e.y);
      ctx.fillText(e.text, e.x, e.y);
      ctx.restore();
    } else if (e.type === "bossSplitFlash") {
      const accent = e.color || COLORS.warning;
      const { r, g, b } = hexToRgb(accent);
      drawGlowCircle(e.x, e.y, e.r * 0.85, accent, a * 0.2);
      ctx.save();
      ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.95})`;
      ctx.lineWidth = 2.4 + (1 - a) * 2.4;
      ctx.shadowBlur = 22;
      ctx.shadowColor = accent;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (e.type === "bossSplitShard") {
      const accent = e.color || COLORS.warning;
      const { r, g, b } = hexToRgb(accent);
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rot);
      ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.36})`;
      ctx.strokeStyle = `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)},${a * 0.95})`;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = accent;
      ctx.beginPath();
      ctx.moveTo(e.size * 1.25, 0);
      ctx.lineTo(0, -e.size * 0.58);
      ctx.lineTo(-e.size * 1.05, 0);
      ctx.lineTo(0, e.size * 0.58);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (e.type === "burst") {
      drawGlowCircle(e.x, e.y, 20 * (1 - a) + 4, e.color, a * 0.6);
    } else if (e.type === "flash") {
      drawGlowCircle(e.x, e.y, 60 * (1 - a) + 5, e.color, a * 0.65);
    } else if (e.type === "spark") {
      drawGlowCircle(e.x, e.y, 8 * (1 - a) + 2, e.color, a * 0.52);
    } else if (e.type === "satSpawn") {
      const accent = e.color || COLORS.cyan;
      const { r, g, b } = hexToRgb(accent);
      ctx.save();
      ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.85})`;
      ctx.lineWidth = 2 + (1 - a) * 2.6;
      ctx.shadowBlur = 18;
      ctx.shadowColor = accent;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (e.type === "satSpawnSpark") {
      drawGlowCircle(e.x, e.y, 4 * a + 1, e.color || COLORS.cyan, a * 0.75);
    } else if (e.type === "lightningBolt") {
      const accent = e.color || COLORS.cyan;
      const { r, g, b } = hexToRgb(accent);
      const dx = e.x2 - e.x1;
      const dy = e.y2 - e.y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const jitter = 6 * game.scale;
      ctx.save();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.85 * a})`;
      ctx.shadowBlur = 14;
      ctx.shadowColor = accent;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(e.x1, e.y1);
      const segments = 7;
      for (let i = 1; i < segments; i += 1) {
        const t = i / segments;
        const j = (Math.random() * 2 - 1) * jitter * (1 - t * 0.35);
        ctx.lineTo(e.x1 + dx * t + nx * j, e.y1 + dy * t + ny * j);
      }
      ctx.lineTo(e.x2, e.y2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.75 * a})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawAimLine() {
  if (!game.pointer.aiming) return;
  ctx.save();
  ctx.strokeStyle = COLORS.amber;
  ctx.shadowBlur = 8;
  ctx.shadowColor = COLORS.amber;
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(game.centerX, game.centerY);
  ctx.lineTo(game.pointer.x, game.pointer.y);
  ctx.stroke();
  ctx.restore();
}

function drawVignette() {
  const g = ctx.createRadialGradient(
    game.centerX,
    game.centerY,
    Math.min(game.width, game.height) * 0.15,
    game.centerX,
    game.centerY,
    Math.max(game.width, game.height) * 0.65
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.34)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, game.width, game.height);
}

function drawDamageFlash() {
  if (game.damageFlashTimer <= 0) return;
  const t = game.damageFlashTimer / game.damageFlashDuration;
  const alpha = Math.min(0.22, t * 0.24);
  ctx.save();
  ctx.fillStyle = `rgba(255, 45, 60, ${alpha})`;
  ctx.fillRect(0, 0, game.width, game.height);
  ctx.restore();
}

function drawLevelUpFx() {
  if (!game.levelUpFxActive) return;
  const p = 1 - (game.levelUpFxTimer / game.levelUpFxDuration);
  const cx = game.centerX;
  const cy = game.centerY;
  const alpha = Math.sin(Math.min(1, p) * Math.PI);
  const burst = (0.35 + 0.65 * p) * Math.max(game.width, game.height) * 0.35;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 20; i += 1) {
    const a = i * (Math.PI * 2 / 20) + p * 0.8;
    const x0 = cx + Math.cos(a) * (burst * 0.2);
    const y0 = cy + Math.sin(a) * (burst * 0.2);
    const x1 = cx + Math.cos(a) * burst;
    const y1 = cy + Math.sin(a) * burst;
    ctx.strokeStyle = `rgba(90, 240, 255, ${alpha * 0.22})`;
    ctx.lineWidth = 2 + (1 - p) * 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, burst * 1.1);
  g.addColorStop(0, `rgba(255, 90, 190, ${0.18 * alpha})`);
  g.addColorStop(1, "rgba(10, 12, 20, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, burst * 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = `${Math.floor(44 * game.scale + 26)}px "Press Start 2P"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(70, 240, 255, 0.95)";
  ctx.fillStyle = `rgba(235, 255, 255, ${0.35 + 0.6 * alpha})`;
  ctx.fillText("LEVEL UP", cx, cy);
  ctx.restore();
}

function drawBossBreakFx() {
  if (!game.bossBreakFxActive) return;
  const p = 1 - (game.bossBreakFxTimer / game.bossBreakFxDuration);
  const cx = game.centerX;
  const cy = game.centerY;
  const alpha = Math.sin(Math.min(1, p) * Math.PI);
  const burst = (0.35 + 0.65 * p) * Math.max(game.width, game.height) * 0.36;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 24; i += 1) {
    const a = i * (Math.PI * 2 / 24) - p * 1.1;
    const x0 = cx + Math.cos(a) * (burst * 0.16);
    const y0 = cy + Math.sin(a) * (burst * 0.16);
    const x1 = cx + Math.cos(a) * burst;
    const y1 = cy + Math.sin(a) * burst;
    ctx.strokeStyle = `rgba(255, 120, 75, ${alpha * 0.22})`;
    ctx.lineWidth = 2 + (1 - p) * 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, burst * 1.08);
  g.addColorStop(0, `rgba(255, 66, 90, ${0.2 * alpha})`);
  g.addColorStop(1, "rgba(18, 8, 12, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, burst * 1.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = `${Math.floor(40 * game.scale + 24)}px "Press Start 2P"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(255, 120, 80, 0.95)";
  ctx.fillStyle = `rgba(255, 238, 230, ${0.4 + 0.58 * alpha})`;
  ctx.fillText("BOSS BREAK", cx, cy);
  ctx.restore();
}

function drawFusionFx() {
  if (!game.fusionFxActive) return;
  const p = 1 - (game.fusionFxTimer / game.fusionFxDuration);
  const cx = game.centerX;
  const cy = game.centerY;
  const alpha = Math.sin(Math.min(1, p) * Math.PI);
  const burst = (0.34 + 0.66 * p) * Math.max(game.width, game.height) * 0.34;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i += 1) {
    const a = i * (Math.PI * 2 / 26) + p * 0.9;
    const x0 = cx + Math.cos(a) * (burst * 0.18);
    const y0 = cy + Math.sin(a) * (burst * 0.18);
    const x1 = cx + Math.cos(a) * burst;
    const y1 = cy + Math.sin(a) * burst;
    ctx.strokeStyle = `rgba(170, 255, 255, ${alpha * 0.24})`;
    ctx.lineWidth = 2 + (1 - p) * 2.2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.font = `${Math.floor(36 * game.scale + 22)}px "Press Start 2P"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(170, 255, 255, 0.95)";
  ctx.fillStyle = `rgba(240, 255, 255, ${0.4 + 0.55 * alpha})`;
  ctx.fillText("FUSION BONUS", cx, cy);
  ctx.restore();
}

function drawScene() {
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.fillStyle = "rgba(2, 6, 12, 0.27)";
  ctx.fillRect(0, 0, game.width, game.height);

  drawGravityBoostBackground();
  drawBlackHole();
  drawBonusUfo();
  for (const m of game.meteors) drawWireMeteor(m);
  drawBullets();
  drawMiniSats();
  drawLasers();
  for (const sat of game.satellites) {
    drawSatellite(sat);
    drawBladeOrbitForSatellite(sat);
  }
  drawCueBall();
  drawEffects();
  drawAimLine();
  drawLevelUpFx();
  drawBossBreakFx();
  drawFusionFx();
  drawVignette();
  drawDamageFlash();
}

function updateHud() {
  hpValue.textContent = Math.max(0, Math.ceil(game.hp)).toString();
  scoreValue.textContent = game.score.toString();
  levelValue.textContent = game.level.toString();
  timeValue.textContent = Math.floor(game.time).toString();
  cueBar.style.width = `${(game.gravityCharge / game.gravityChargeMax) * 100}%`;
}

function gameOver() {
  game.running = false;
  finalScore.textContent = `Score: ${game.score}`;
  gameOverOverlay.classList.remove("hidden");
}

function resetGame() {
  game.hp = game.maxHp;
  game.score = 0;
  game.level = 1;
  game.time = 0;
  game.running = true;
  game.pausedForUpgrade = false;
  game.blackHoleActive = true;
  game.battleStarted = false;
  game.levelUpFxActive = false;
  game.levelUpFxTimer = 0;
  game.pendingUpgradeAfterFx = false;
  game.bossBreakFxActive = false;
  game.bossBreakFxTimer = 0;
  game.fusionFxActive = false;
  game.fusionFxTimer = 0;
  game.cuePowerMultiplier = 1;
  game.globalBulletRicochet = 0;
  game.nextLevelScore = 12;
  game.nextSatelliteId = 1;
  game.meteorSpawnInterval = 1.5;
  game.meteorSpawnTimer = 1.5;
  game.nextBossAt = game.bossSpawnEvery;
  game.nextSplitBossAt = 60;
  game.nextFusionUfoAt = 120;
  game.splitBossAlive = false;
  game.postBossTier = 0;
  game.bossThumpTimer = 0;
  game.bullets.length = 0;
  game.prismEmitters.length = 0;
  game.miniSats.length = 0;
  game.satTouchPairs.clear();
  game.effects.length = 0;
  game.lasers.length = 0;
  game.meteors.length = 0;
  game.cueBall.x = game.centerX;
  game.cueBall.y = game.centerY;
  game.cueBall.vx = 0;
  game.cueBall.vy = 0;
  game.cueBall.state = "ready";
  game.cueBall.flightTimer = 0;
  game.pointer.down = false;
  game.pointer.leftDown = false;
  game.pointer.aiming = false;
  game.gravityBoostActive = false;
  game.prevGravityBoostActive = false;
  game.gravityBoostVisual = 0;
  game.gravityBoostMultiplier = 5;
  game.gravityChargeMax = 1;
  game.gravityCharge = game.gravityChargeMax;
  game.gravityDrainPerSec = 0.34;
  game.gravityRecoverPerSec = 0.2;
  game.relicGravityMul = 1;
  game.relicDamageTakenMul = 1;
  game.relicEnemySpeedMul = 1;
  game.relicRegenPerSec = 0;
  game.relicCounts = {};
  game.pendingRelicAfterBoss = false;
  game.selectingRelic = false;
  game.selectingFusion = false;
  game.pendingFusionAfterFx = false;
  game.fusionResultActive = false;
  game.fusionResultTimer = 0;
  game.bonusUfo = null;
  game.maxHp = 20;
  game.hp = game.maxHp;
  game.pointer.x = game.centerX;
  game.pointer.y = game.centerY;
  game.damageFlashTimer = 0;
  spawnInitialSatellites();
  hintText.textContent = "初期衛星の攻撃タイプを選択";
  gameOverOverlay.classList.add("hidden");
  upgradeOverlay.classList.add("hidden");
  openUpgradeSelection(true);
}

function tick(dt) {
  if (!game.running) return;
  game.damageFlashTimer = Math.max(0, game.damageFlashTimer - dt);
  if (game.bossBreakFxActive) {
    game.bossBreakFxTimer -= dt;
    if (game.bossBreakFxTimer <= 0) {
      game.bossBreakFxActive = false;
      game.bossBreakFxTimer = 0;
    }
  }
  if (game.fusionFxActive) {
    game.fusionFxTimer -= dt;
    if (game.fusionFxTimer <= 0) {
      game.fusionFxActive = false;
      game.fusionFxTimer = 0;
    }
  }
  if (game.pendingRelicAfterBoss && !game.pausedForUpgrade && !game.levelUpFxActive && !game.bossBreakFxActive) {
    game.pendingRelicAfterBoss = false;
    openRelicSelection();
  }
  if (game.pendingFusionAfterFx && !game.pausedForUpgrade && !game.levelUpFxActive && !game.bossBreakFxActive && !game.fusionFxActive) {
    game.pendingFusionAfterFx = false;
    openFusionSelection();
  }
  if (game.fusionResultActive) {
    game.fusionResultTimer -= dt;
    if (game.fusionResultTimer <= 0) {
      closeUpgradeSelection();
    }
  }
  if (!game.pausedForUpgrade && game.splitBossAlive) {
    game.bossThumpTimer -= dt;
    if (game.bossThumpTimer <= 0) {
      sfxBossThump();
      game.bossThumpTimer = game.bossThumpInterval;
    }
  }
  if (game.levelUpFxActive) {
    game.levelUpFxTimer -= dt;
    if (game.levelUpFxTimer <= 0) {
      game.levelUpFxActive = false;
      game.levelUpFxTimer = 0;
      if (game.pendingUpgradeAfterFx) {
        game.pendingUpgradeAfterFx = false;
        openUpgradeSelection();
      }
    }
  } else if (!game.pausedForUpgrade) {
    game.time += dt;
    if (game.relicRegenPerSec > 0) {
      game.hp = Math.min(game.maxHp, game.hp + game.relicRegenPerSec * dt);
    }
    updateGravityCharge(dt);
    const targetBoostVisual = game.gravityBoostActive ? 1 : 0;
    const smooth = Math.min(1, dt * 9);
    game.gravityBoostVisual += (targetBoostVisual - game.gravityBoostVisual) * smooth;
    updateCue(dt);
    updateSatellites(dt);
    updateBonusUfo(dt);
    updateBullets(dt);
    updatePrismEmitters(dt);
    updateMiniSats(dt);
    updateLasers(dt);
    updateMeteors(dt);
    updateEffects(dt);
    updateSpawns(dt);
    updateLevel();
    if (game.hp <= 0) gameOver();
  }
  updateHud();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  tick(dt);
  drawScene();
  requestAnimationFrame(loop);
}

resetGame();
applyDebugGravitySettings();
game.satelliteCollisionEnabled = !!dbgSatCollision.checked;
dbgSatCollisionValue.textContent = game.satelliteCollisionEnabled ? "ON" : "OFF";
requestAnimationFrame(loop);
