/* Agent Office 前端：像素風辦公室 + 員工名冊 + 動態紀錄。
 * 資料來源有兩種：
 *   即時：連到 server.py 的 /api/stream（SSE）
 *   示範：瀏覽器內建的虛擬團隊（找不到伺服器時自動使用，所以單檔 HTML 也能直接看）
 */
(() => {
'use strict';

/* ============================================================ 常數 */
const W = 320, H = 184;                 // 畫布的邏輯解析度
const SPEED = 30;                       // 走路速度（邏輯像素/秒）
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const STATUS = {
  idle:     { label: '待命',   color: '#8e97a8' },
  thinking: { label: '思考中', color: '#8f6bf0' },
  working:  { label: '工作中', color: '#1fa971' },
  waiting:  { label: '等待中', color: '#e5a50a' },
  error:    { label: '出錯了', color: '#ec4f55' },
  done:     { label: '完成',   color: '#3f8cf5' },
};
const AT_DESK = new Set(['thinking', 'working', 'waiting', 'error', 'done']);

const SHIRTS = ['#e0556b', '#4f86e8', '#e0a63c', '#44b58a', '#9a6bd6', '#e07b3c', '#3cb8c9', '#7c8aa0'];
const INK = '#232838';
/* 八種動物：fur 毛色、light 臉頰/肚子的淺色、limb 手腳顏色（預設同毛色）、ear 耳朵往上凸出的高度 */
const ANIMALS = {
  cat:     { fur: '#e8a35a', light: '#fbe7c8', ear: 3, nose: '#e8828f' },
  dog:     { fur: '#c98f5d', light: '#f5dfc4', ear: 0, nose: INK, flop: '#7a4a2a' },
  rabbit:  { fur: '#f2f2f6', light: '#ffffff', ear: 5, nose: '#f08fa0' },
  panda:   { fur: '#f6f6f6', light: '#ffffff', ear: 2, nose: INK, limb: '#262a36', dark: '#262a36' },
  fox:     { fur: '#e5692f', light: '#fff1e2', ear: 3, nose: INK },
  bear:    { fur: '#8f6140', light: '#dcb892', ear: 2, nose: INK },
  frog:    { fur: '#68bf6e', light: '#d7f2b8', ear: 2, nose: '#3c8a47' },
  penguin: { fur: '#2d3447', light: '#ffffff', ear: 0, nose: '#f6a623', limb: '#2d3447' },
};
const ANIMAL_ORDER = Object.keys(ANIMALS);

/* 八張辦公桌：兩排四欄。seat 是坐下時的腳底位置，stand 是椅子前面的站位 */
const DESKS = [];
for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 4; c++) {
    const x = 14 + c * 54, y = 46 + r * 54;
    DESKS.push({ x, y, seat: { x: x + 18, y: y + 36 }, stand: { x: x + 18, y: y + 44 } });
  }
}
/* 走道：兩條橫向走道 + 一條連接它們的直向走道，所有路線都沿著它們走 */
const CORRIDORS = [94, 152];
const LANE_X = 219;
/* 休息區可站/坐的位置 */
const SPOTS = [
  { x: 248, y: 75,  pose: 'sofa' },
  { x: 264, y: 75,  pose: 'sofa' },
  { x: 280, y: 75,  pose: 'sofa' },
  { x: 302, y: 73,  pose: 'coffee' },
  { x: 250, y: 128, pose: 'stand' },
  { x: 276, y: 134, pose: 'stand' },
  { x: 298, y: 126, pose: 'stand' },
  { x: 236, y: 142, pose: 'stand' },
];

/* ============================================================ 小工具 */
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const rnd = (a, b) => a + Math.random() * (b - a);
const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pad = (n) => String(n).padStart(2, '0');
const fmtClock = (ms) => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const fmtElapsed = (s) => { s = Math.max(0, Math.floor(s)); return s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${Math.floor(s / 60)}:${pad(s % 60)}`; };
const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

/* ============================================================ 狀態 */
const agents = new Map();
let completed = 0;
let skew = 0;                            // 伺服器時間 - 瀏覽器時間
const spotOwner = new Array(SPOTS.length).fill(null);
const deskOwner = new Array(DESKS.length).fill(null);
let nextShirt = 0;
let scale = 3;
const nowMs = () => Date.now() + skew;

const dom = {
  scene: $('#scene'), canvas: $('#canvas'), tags: $('#tags'), empty: $('#empty'),
  roster: $('#roster'), rosterEmpty: $('#rosterEmpty'), feed: $('#feed'), feedEmpty: $('#feedEmpty'),
  banner: $('#banner'), modeLive: $('#modeLive'), modeDemo: $('#modeDemo'),
  cWorking: $('#cWorking'), cIdle: $('#cIdle'), cDone: $('#cDone'),
};
let ctx = dom.canvas.getContext('2d');
const mainCtx = ctx;
ctx.imageSmoothingEnabled = false;

/* ============================================================ 路線規劃 */
const nearestCorridor = (y) => (Math.abs(y - CORRIDORS[0]) <= Math.abs(y - CORRIDORS[1]) ? CORRIDORS[0] : CORRIDORS[1]);

function route(from, to) {
  const cp = nearestCorridor(from.y), cq = nearestCorridor(to.y);
  const pts = [{ x: from.x, y: cp }];
  if (cp !== cq) pts.push({ x: LANE_X, y: cp }, { x: LANE_X, y: cq });
  pts.push({ x: to.x, y: cq }, { x: to.x, y: to.y });
  return pts.filter((p, i) => {
    const prev = i ? pts[i - 1] : from;
    return Math.hypot(p.x - prev.x, p.y - prev.y) > 0.01;
  });
}

/* ============================================================ Agent 生命週期 */
function createAgent(id, instant, wantAnimal) {
  const h = hash(id);
  const desk = deskOwner.indexOf(null);
  const a = {
    id, name: id, role: '', kind: '', status: 'idle', task: '', since: nowMs(),
    desk, spot: -1, atDesk: false, goal: null,
    x: 160, y: H + 14, path: [], pose: 'stand', face: 'd',
    stage: null, timer: 0, carry: false, errandTo: null,
    say: null, flash: 0, wanderAt: 0, statusAt: 0,
    shirt: SHIRTS[nextShirt++ % SHIRTS.length], seed: h % 9, animal: '', skin: '#fff', legs: '#fff', earH: 0,
    tag: null, card: null,
  };
  if (desk >= 0) deskOwner[desk] = id;
  a.tag = buildTag(a);
  a.card = buildCard(a);
  agents.set(id, a);
  setAnimal(a, pickAnimal(id, wantAnimal));
  plan(a, instant);
  syncRosterVisibility();
  return a;
}

/* 沒指定動物時，依代號挑一種；盡量不跟辦公室裡已有的重複 */
function pickAnimal(id, want) {
  if (ANIMALS[want]) return want;
  const used = new Set([...agents.values()].map((a) => a.animal));
  const start = hash(id) % ANIMAL_ORDER.length;
  for (let i = 0; i < ANIMAL_ORDER.length; i++) {
    const k = ANIMAL_ORDER[(start + i) % ANIMAL_ORDER.length];
    if (!used.has(k)) return k;
  }
  return ANIMAL_ORDER[start];
}
function setAnimal(a, name) {
  const sp = ANIMALS[name];
  if (!sp || a.animal === name) return;
  a.animal = name;
  a.skin = sp.limb || sp.fur;
  a.legs = sp.limb || sp.fur;
  a.earH = sp.ear;
  if (a.card) drawAvatar(a.card.querySelector('.avatar'), a);
}

function removeAgent(id) {
  const a = agents.get(id);
  if (!a) return;
  if (a.desk >= 0) deskOwner[a.desk] = null;
  if (a.spot >= 0 && spotOwner[a.spot] === id) spotOwner[a.spot] = null;
  a.tag.remove(); a.card.remove();
  agents.delete(id);
  syncRosterVisibility();
}

function ensureSpot(a) {
  if (a.spot >= 0 && spotOwner[a.spot] === a.id) return;
  const free = SPOTS.map((_, i) => i).filter((i) => spotOwner[i] === null);
  const pick = free.length ? free[Math.floor(Math.random() * free.length)] : Math.floor(Math.random() * SPOTS.length);
  a.spot = pick;
  spotOwner[pick] = a.id;
}
function releaseSpot(a) {
  if (a.spot >= 0 && spotOwner[a.spot] === a.id) spotOwner[a.spot] = null;
  a.spot = -1;
}

/* 依目前狀態決定目的地並規劃路線 */
function plan(a, instant) {
  let goal;
  if (AT_DESK.has(a.status) && a.desk >= 0) {
    releaseSpot(a);
    goal = DESKS[a.desk].seat;
    a.atDesk = true;
  } else {
    ensureSpot(a);
    goal = SPOTS[a.spot];
    a.atDesk = false;
  }
  a.goal = goal;
  a.wanderAt = performance.now() / 1000 + rnd(6, 14);
  if (instant || reduceMotion) { a.x = goal.x; a.y = goal.y; a.path = []; }
  else a.path = route({ x: a.x, y: a.y }, goal);
}

/* 交接：拿著文件走到對方座位，停一下，再回到自己的目的地 */
function startErrand(a, toId) {
  const target = agents.get(toId);
  if (!target || target === a || a.stage || reduceMotion) return;
  const dest = target.desk >= 0 ? DESKS[target.desk].stand : SPOTS[Math.max(0, target.spot)];
  a.stage = 'errand';
  a.errandTo = toId;
  a.carry = true;
  a.path = route({ x: a.x, y: a.y }, dest);
  if (!a.path.length) arrived(a);
}
function arrived(a) {
  if (a.stage !== 'errand') return;
  a.stage = 'drop';
  a.timer = 1.3;
  a.pose = 'stand';
  a.face = 'u';
  const target = agents.get(a.errandTo);
  if (target) target.flash = 1.6;
}

function step(a, dt, t) {
  if (a.stage === 'drop') {
    a.timer -= dt;
    if (a.timer <= 0) { a.carry = false; a.stage = null; plan(a); }
    return;
  }
  if (a.path.length) {
    const p = a.path[0];
    const dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy), sp = SPEED * dt;
    if (d <= sp) { a.x = p.x; a.y = p.y; a.path.shift(); }
    else { a.x += (dx / d) * sp; a.y += (dy / d) * sp; }
    if (Math.abs(dx) > Math.abs(dy)) a.face = dx < 0 ? 'l' : 'r'; else a.face = dy < 0 ? 'u' : 'd';
    a.pose = 'walk';
    if (!a.path.length) arrived(a);
    return;
  }
  if (a.atDesk) { a.pose = 'sit'; a.face = 'u'; return; }
  const spot = SPOTS[a.spot];
  a.pose = spot.pose;
  a.face = spot.pose === 'coffee' ? 'u' : 'd';
  if (a.status === 'idle' && t > a.wanderAt && !reduceMotion) {
    const free = SPOTS.map((_, i) => i).filter((i) => spotOwner[i] === null);
    if (free.length) {
      releaseSpot(a);
      a.spot = free[Math.floor(Math.random() * free.length)];
      spotOwner[a.spot] = a.id;
      a.goal = SPOTS[a.spot];
      a.path = route({ x: a.x, y: a.y }, a.goal);
    }
    a.wanderAt = t + rnd(8, 16);
  }
}

/* ============================================================ 事件處理 */
function eventText(ev) {
  if (ev.message) return ev.message;
  if (ev.to) { const to = agents.get(ev.to); return `${ev.name} 把成果交給 ${to ? to.name : ev.to}`; }
  const s = STATUS[ev.status];
  return `${ev.name}：${s ? s.label : ev.status}${ev.task && !(s && ev.task === s.label) && ev.task !== '完成' ? ' · ' + ev.task : ''}`;
}

function pushFeed(ev) {
  const s = STATUS[ev.status] || STATUS.idle;
  const li = el('li');
  li.style.setProperty('--st', s.color);
  const time = el('time', null, fmtClock((ev.ts || nowMs() / 1000) * 1000));
  li.append(time, el('i'), el('span', null, eventText(ev)));
  dom.feed.prepend(li);
  while (dom.feed.children.length > 60) dom.feed.lastChild.remove();
  dom.feedEmpty.hidden = true;
}

function handle(ev, opts = {}) {
  if (!ev || !ev.agent) return;
  if (ev.status === 'offline') {
    if (!ev.auto && !opts.silent) pushFeed({ ...ev, message: `${ev.name || ev.agent} 下班了`, status: 'idle' });
    removeAgent(ev.agent);
    return;
  }
  const isNew = !agents.has(ev.agent);
  const a = agents.get(ev.agent) || createAgent(ev.agent, !!opts.instant, ev.animal);
  if (ev.animal && ANIMALS[ev.animal]) setAnimal(a, ev.animal);
  const prevStatus = a.status;
  if (ev.name) a.name = ev.name;
  if (ev.role != null) a.role = ev.role;
  if (ev.kind != null) a.kind = ev.kind;
  a.task = ev.task || '';
  a.status = STATUS[ev.status] ? ev.status : 'idle';
  if (a.status !== prevStatus || isNew) { a.since = (ev.ts ? ev.ts * 1000 : nowMs()); a.statusAt = performance.now() / 1000; }
  if (ev.status === 'done' && prevStatus !== 'done' && opts.countDone !== false) completed++;

  if (ev.message && !opts.silent) a.say = { text: ev.message, until: performance.now() + 4500 };

  if (!a.stage && (a.status !== prevStatus || isNew)) plan(a, !!opts.instant);
  if (ev.to && !opts.silent) startErrand(a, ev.to);
  if (!ev.auto && !ev.quiet && !opts.silent && (isNew || a.status !== prevStatus || ev.message || ev.to || ev.task !== undefined && a._lastTask !== a.task)) pushFeed({ ...ev, name: a.name });
  a._lastTask = a.task;
  renderCard(a);
  updateCounters();
}

function updateCounters() {
  let working = 0, idle = 0;
  for (const a of agents.values()) { if (a.status === 'idle') idle++; else if (a.status === 'working' || a.status === 'thinking') working++; }
  dom.cWorking.textContent = working;
  dom.cIdle.textContent = idle;
  dom.cDone.textContent = completed;
}

function resetAll() {
  for (const id of [...agents.keys()]) removeAgent(id);
  completed = 0;
  dom.feed.textContent = '';
  dom.feedEmpty.hidden = false;
  updateCounters();
}

/* ============================================================ DOM：名牌 / 名冊 */
function buildTag() {
  const tag = el('div', 'tag');
  const bubble = el('div', 'bubble');
  bubble.append(el('i', 'dot'), el('span', 'txt'));
  const plate = el('div', 'plate');
  tag.append(bubble, plate);
  dom.tags.append(tag);
  return tag;
}

function buildCard(a) {
  const li = el('li', 'card');
    li.dataset.id = a.id;
  const who = el('div', 'who');
  const nm = el('div', 'nm'); nm.append(el('span'), el('small'), el('em', 'kind'));
  who.append(nm, el('div', 'job'));
  const meta = el('div', 'meta');
  meta.append(el('span', 'pill'), el('span', 'since'));
  const avatar = el('canvas', 'avatar');
  avatar.width = 16; avatar.height = 16;
  li.append(avatar, who, meta);
  li.addEventListener('mouseenter', () => { li.classList.add('hl'); a.flash = 1.2; });
  li.addEventListener('mouseleave', () => li.classList.remove('hl'));
  dom.roster.append(li);
  return li;
}

function renderCard(a) {
  const s = STATUS[a.status];
  const c = a.card;
  c.style.setProperty('--st', s.color);
  c.querySelector('.nm span').textContent = a.name;
  c.querySelector('.nm small').textContent = a.role;
  const kind = c.querySelector('.kind');
  kind.textContent = a.kind === 'claude' ? 'Claude' : a.kind === 'codex' ? 'Codex' : a.kind;
  kind.dataset.kind = a.kind;
  kind.hidden = !a.kind;
  c.querySelector('.job').textContent = a.task || (a.status === 'idle' ? '休息中' : s.label);
  c.querySelector('.pill').textContent = s.label;
}

function syncRosterVisibility() {
  dom.rosterEmpty.hidden = agents.size > 0;
}

function updateTags(t) {
  const now = performance.now();
  let z = 1;
  for (const a of [...agents.values()].sort((p, q) => p.y - q.y)) {
    const s = STATUS[a.status];
    const seated = a.pose === 'sit' && !a.path.length && a.desk >= 0;
    const ax = seated ? DESKS[a.desk].x + 18 : a.x;
    const ay = seated ? DESKS[a.desk].y - 3 : a.y - 22 - a.earH;
    const tag = a.tag;
    tag.style.setProperty('--st', s.color);
    const half = (a._tw || 80) / 2;
    const px = Math.min(Math.max(ax * scale, half + 2), W * scale - half - 2);
    tag.style.transform = `translate(${Math.round(px)}px, ${Math.round(ay * scale)}px) translate(-50%, -100%)`;
    tag.style.zIndex = String(z++);

    const bubble = tag.firstChild;
    let text = '', kind = '', show = true;
    if (a.say && now < a.say.until) { text = a.say.text; kind = 'say'; }
    else if (a.status === 'idle') show = false;
    else {
      text = a.task || s.label;
      if (a.status === 'thinking') text += '.'.repeat(Math.floor(t * 2.5) % 4);
    }
    let dirty = false;
    if (bubble.hidden === show) { bubble.hidden = !show; dirty = true; }
    bubble.classList.toggle('say', kind === 'say');
    if (show && a._txt !== text) { bubble.lastChild.textContent = text; a._txt = text; dirty = true; }
    if (a._name !== a.name) { tag.lastChild.textContent = a.name; a._name = a.name; dirty = true; }
    if (dirty || a._scale !== scale) { a._tw = tag.offsetWidth; a._scale = scale; }
  }
}

/* ============================================================ 繪圖 */
const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

const GLYPH = {
  '?': ['XXX', '..X', '.X.', '...', '.X.'],
  '!': ['.X.', '.X.', '.X.', '...', '.X.'],
  'v': ['....X', '...X.', 'X.X..', '.X...'],
  'x': ['X.X', '.X.', 'X.X'],
  'z': ['XXX', '..X', '.X.', 'X..', 'XXX'],
};
function glyph(name, x, y, c) {
  GLYPH[name].forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') R(x + i, y + j, 1, 1, c); });
}

function drawWindow(x, y, w, h, t, dark) {
  R(x - 1, y - 1, w + 2, h + 2, dark ? '#242b3d' : '#f4f6fb');
  R(x, y, w, h, dark ? '#0f1630' : '#8fc8f0');
  if (dark) {
    for (let i = 0; i < 9; i++) { const sx = x + 2 + ((i * 37 + x) % (w - 4)), sy = y + 2 + ((i * 53) % (h - 6)); R(sx, sy, 1, 1, i % 3 ? '#9aa6d8' : '#fff'); }
    R(x + w - 9, y + 3, 4, 4, '#f3efc9'); R(x + w - 8, y + 3, 3, 3, '#0f1630');
  } else {
    R(x, y + h - 6, w, 6, '#a9d9a0');
    const cx = x + ((t * 2 + x * 3) % (w + 14)) - 12;
    R(cx, y + 4, 10, 3, '#ffffff'); R(cx + 2, y + 2, 6, 3, '#ffffff');
  }
  R(x + (w >> 1), y, 1, h, dark ? '#242b3d' : '#f4f6fb');
}

function drawWhiteboard(t) {
  const x = 76, y = 8;
  R(x - 1, y - 1, 62, 26, '#b9c0cf'); R(x, y, 60, 24, '#fdfdfd');
  let todo = 0, doing = 0;
  for (const a of agents.values()) { if (a.status === 'thinking' || a.status === 'waiting') todo++; else if (a.status === 'working') doing++; }
  const cols = [[todo, '#e5a50a', 'T'], [doing, '#1fa971', 'D'], [Math.min(completed, 4), '#3f8cf5', 'X']];
  cols.forEach(([n, color], i) => {
    const cx = x + 3 + i * 19;
    R(cx, y + 3, 16, 2, color);
    for (let k = 0; k < Math.min(n, 3); k++) R(cx + 1 + (k % 2) * 7, y + 7 + Math.floor(k / 2) * 7 + (k === 2 ? 0 : 0), 6, 5, ['#ffe28a', '#a8f0c8', '#a9cdfc'][i]);
    if (n > 3) R(cx + 8, y + 15, 6, 5, ['#ffe28a', '#a8f0c8', '#a9cdfc'][i]);
  });
  R(x + 19, y + 3, 1, 19, '#e3e6ee'); R(x + 38, y + 3, 1, 19, '#e3e6ee');
}

function drawClock() {
  const cx = 214, cy = 17, d = new Date();
  R(cx - 6, cy - 6, 13, 13, '#f4f6fb'); R(cx - 5, cy - 5, 11, 11, '#ffffff');
  ctx.strokeStyle = '#232838'; ctx.lineWidth = 1;
  const hand = (ang, len) => { ctx.beginPath(); ctx.moveTo(cx + 0.5, cy + 0.5); ctx.lineTo(cx + 0.5 + Math.sin(ang) * len, cy + 0.5 - Math.cos(ang) * len); ctx.stroke(); };
  hand(((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2, 2.6);
  hand((d.getMinutes() / 60) * Math.PI * 2, 4);
}

function drawScene(t, dark) {
  // 地板（地毯格紋）
  for (let y = 40; y < H; y += 16) for (let x = 0; x < W; x += 16) R(x, y, 16, 16, ((x + y) >> 4) % 2 ? '#c4ccdb' : '#ccd3e0');
  // 牆
  R(0, 0, W, 40, '#e7eaf1'); R(0, 36, W, 4, '#b4bccb'); R(0, 40, W, 1, '#9aa3b6');
  drawWindow(14, 7, 44, 24, t, dark);
  drawWhiteboard(t);
  drawWindow(152, 7, 44, 24, t, dark);
  drawClock();
  R(236, 7, 22, 25, '#8c6fd1'); R(238, 9, 18, 21, '#f6f1ff'); R(241, 12, 12, 2, '#8c6fd1'); R(241, 17, 12, 1, '#b9a6e8'); R(241, 20, 9, 1, '#b9a6e8'); R(241, 23, 11, 1, '#b9a6e8');

  // 休息區：地毯、沙發、咖啡機、茶几、植物
  R(232, 98, 84, 54, '#8fa6c9'); R(234, 100, 80, 50, '#a3b8d8');
  for (let i = 0; i < 80; i += 8) { R(234 + i, 100, 4, 2, '#8fa6c9'); R(234 + i + 4, 148, 4, 2, '#8fa6c9'); }
  R(240, 52, 56, 24, '#2f7f7b'); R(240, 52, 56, 12, '#3a948f'); R(240, 64, 56, 12, '#43a39d');
  R(236, 56, 6, 20, '#2b6f6c'); R(294, 56, 6, 20, '#2b6f6c');
  R(256, 64, 1, 12, '#2f7f7b'); R(272, 64, 1, 12, '#2f7f7b');
  R(293, 44, 18, 22, '#454d63'); R(295, 46, 14, 8, '#232838'); R(298, 58, 8, 6, '#d9dde8'); R(300, 56, 4, 2, '#e5484d');
  R(256, 106, 26, 12, '#b88a5e'); R(256, 106, 26, 2, '#cfa273'); R(256, 118, 26, 2, '#8c643f');
  R(262, 102, 4, 4, '#fff'); R(262, 102, 4, 1, '#d9534f'); R(272, 103, 6, 3, '#e8e2cf');
  R(238, 122, 8, 6, '#a0603d'); R(236, 108, 12, 14, '#3f9b58'); R(239, 104, 6, 6, '#56b36d'); R(240, 112, 4, 4, '#2f8148');
  R(4, 168, 10, 8, '#a0603d'); R(2, 152, 14, 18, '#3f9b58'); R(5, 148, 8, 8, '#56b36d');

  // 辦公桌與空椅子
  DESKS.forEach((d, i) => {
    R(d.x + 1, d.y + 25, 36, 2, 'rgba(0,0,0,0.12)');
    R(d.x, d.y + 10, 36, 12, '#c79a6b'); R(d.x, d.y + 10, 36, 1, '#dcb283'); R(d.x, d.y + 22, 36, 3, '#9a6f47');
    R(d.x + 12, d.y + 16, 12, 3, '#3a4256'); R(d.x + 13, d.y + 17, 10, 1, '#6b7590'); R(d.x + 27, d.y + 16, 2, 3, '#3a4256');
    if (i % 2) { R(d.x + 31, d.y + 13, 3, 3, '#a0603d'); R(d.x + 30, d.y + 10, 5, 4, '#3f9b58'); }
    else { R(d.x + 3, d.y + 13, 4, 5, '#ffffff'); R(d.x + 3, d.y + 13, 4, 1, '#d9534f'); R(d.x + 29, d.y + 13, 5, 6, '#f4f2ea'); }
    const owner = deskOwner[i] && agents.get(deskOwner[i]);
    if (!(owner && owner.pose === 'sit' && !owner.path.length)) drawChair(d.seat.x, d.seat.y, '#46526b');
  });
}

function drawChair(x, y, color) {
  R(x - 5, y - 6, 10, 5, color); R(x - 5, y - 6, 10, 1, '#6d7a98'); R(x - 4, y - 1, 8, 1, '#232838');
}

function drawMonitors(t) {
  DESKS.forEach((d, i) => {
    const a = deskOwner[i] && agents.get(deskOwner[i]);
    const x = d.x + 11, y = d.y;
    R(x, y, 14, 11, '#1b2030'); R(x + 6, y + 11, 2, 2, '#1b2030'); R(x + 4, y + 13, 6, 1, '#1b2030');
    const sx = x + 1, sy = y + 1;
    let bg = '#0c0f18', glow = null;
    const st = a ? a.status : null;
    const seatedHere = a && a.pose === 'sit' && !a.path.length;
    if (!a || !seatedHere && st === 'idle') { R(sx, sy, 12, 8, bg); return; }
    if (st === 'working') {
      bg = '#0d2a2b'; glow = STATUS.working.color;
      R(sx, sy, 12, 8, bg);
      const off = Math.floor(t * 5);
      for (let k = 0; k < 4; k++) R(sx + 1, sy + 1 + k * 2, 2 + (((k + off) * 7) % 8), 1, k % 2 ? '#7fb4ff' : '#59e0b0');
    } else if (st === 'thinking') {
      bg = '#1c1a33'; glow = STATUS.thinking.color;
      R(sx, sy, 12, 8, bg);
      R(sx + 1, sy + 1, 6, 1, '#6a5bb8'); R(sx + 1, sy + 3, 4, 1, '#6a5bb8');
      if (Math.floor(t * 2) % 2) R(sx + 6, sy + 3, 1, 2, '#e7e3ff');
    } else if (st === 'waiting') {
      bg = '#33290e'; glow = STATUS.waiting.color;
      R(sx, sy, 12, 8, bg);
      if (Math.floor(t * 1.5) % 2) glyph('?', sx + 4, sy + 2, '#ffd25e');
    } else if (st === 'error') {
      const blink = Math.floor(t * 4) % 2;
      bg = blink ? '#5a1215' : '#2a0b0d'; glow = STATUS.error.color;
      R(sx, sy, 12, 8, bg);
      glyph('x', sx + 4, sy + 2, '#ff8b8f');
    } else if (st === 'done') {
      bg = '#0e2540'; glow = STATUS.done.color;
      R(sx, sy, 12, 8, bg);
      glyph('v', sx + 3, sy + 2, '#9cc8ff');
    } else {
      R(sx, sy, 12, 8, '#10131c');
      const bx = Math.floor(2 + (Math.sin(t * 0.9 + i) * 0.5 + 0.5) * 8), by = Math.floor(1 + (Math.cos(t * 1.3 + i) * 0.5 + 0.5) * 5);
      R(sx + bx, sy + by, 2, 2, '#3a4262');
    }
    if (glow) {
      ctx.globalAlpha = dark ? 0.2 : 0.1; R(d.x + 6, d.y + 10, 24, 14, glow); ctx.globalAlpha = 1;
    }
  });
}

/* ---- 角色 ---- */
const shadeCache = {};
function shade(hex, f) {
  const key = hex + f;
  if (shadeCache[key]) return shadeCache[key];
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return (shadeCache[key] = `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`);
}

/* 動物的頭：8x7 的圓臉，加上依物種不同的耳朵、臉與表情。y 是頭頂（不含耳朵） */
function head(x, y, a, face, t, dx = 0) {
  const sp = ANIMALS[a.animal] || ANIMALS.cat;
  const hx = x - 4 + dx, hy = y, fur = sp.fur, side = face === 'l' || face === 'r';
  const front = face === 'd', dir = face === 'l' ? -1 : 1;
  const pink = '#f6b3c0';
  // 耳朵／眼突（畫在頭後面）
  switch (a.animal) {
    case 'cat': case 'fox': {
      const tip = a.animal === 'fox' ? INK : fur;
      R(hx, hy - 1, 3, 1, fur); R(hx, hy - 2, 2, 1, fur); R(hx, hy - 3, 1, 1, tip);
      R(hx + 5, hy - 1, 3, 1, fur); R(hx + 6, hy - 2, 2, 1, fur); R(hx + 7, hy - 3, 1, 1, tip);
      if (front && a.animal === 'cat') { R(hx + 1, hy - 1, 1, 1, pink); R(hx + 6, hy - 1, 1, 1, pink); }
      break;
    }
    case 'rabbit':
      R(hx + 1, hy - 5, 2, 5, fur); R(hx + 5, hy - 5, 2, 5, fur);
      if (!(face === 'u')) { R(hx + 2, hy - 4, 1, 3, pink); R(hx + 5, hy - 4, 1, 3, pink); }
      break;
    case 'panda': R(hx, hy - 2, 2, 3, sp.dark); R(hx + 6, hy - 2, 2, 3, sp.dark); break;
    case 'bear': R(hx, hy - 2, 2, 2, fur); R(hx + 6, hy - 2, 2, 2, fur); if (!(face === 'u')) { R(hx, hy - 1, 1, 1, sp.light); R(hx + 7, hy - 1, 1, 1, sp.light); } break;
    case 'frog':
      R(hx, hy - 2, 3, 3, fur); R(hx + 5, hy - 2, 3, 3, fur);
      if (face !== 'u') { R(hx + 1, hy - 1, 2, 2, '#ffffff'); R(hx + 5, hy - 1, 2, 2, '#ffffff'); R(hx + 2, hy, 1, 1, INK); R(hx + 5, hy, 1, 1, INK); }
      break;
    default: break;
  }
  // 頭（外圍一圈比毛色深的描邊，坐在桌前背對鏡頭時輪廓才清楚）
  const edge = shade(fur, 0.62);
  R(hx + 1, hy - 1, 6, 1, edge); R(hx - 1, hy + 1, 1, 5, edge); R(hx + 8, hy + 1, 1, 5, edge);
  R(hx, hy, 1, 1, edge); R(hx + 7, hy, 1, 1, edge);
  R(hx + 1, hy, 6, 7, fur); R(hx, hy + 1, 8, 5, fur);
  if (a.animal === 'cat' && face !== 'u') R(hx + 3, hy, 2, 1, '#c9772f');
  if (a.animal === 'penguin' && face !== 'u') { R(hx + 1, hy + 2, 6, 4, sp.light); R(hx + 2, hy + 6, 4, 1, sp.light); }
  const blink = Math.floor(t * 0.7 + a.seed) % 9 === 0;
  const eye = (ex, ey) => { R(ex, ey, 1, blink ? 1 : 2, INK); };
  if (front) {
    if (a.animal === 'panda') { R(hx + 1, hy + 2, 2, 3, sp.dark); R(hx + 5, hy + 2, 2, 3, sp.dark); if (!blink) { R(hx + 2, hy + 3, 1, 1, '#ffffff'); R(hx + 5, hy + 3, 1, 1, '#ffffff'); } }
    else if (a.animal !== 'frog') { eye(hx + 2, hy + 3); eye(hx + 5, hy + 3); }
    if (a.animal === 'penguin') R(hx + 3, hy + 5, 2, 1, sp.nose);
    else if (a.animal === 'frog') { R(hx + 1, hy + 5, 6, 1, '#2f7a3c'); R(hx + 1, hy + 4, 1, 1, pink); R(hx + 6, hy + 4, 1, 1, pink); }
    else if (a.animal === 'fox') { R(hx + 1, hy + 4, 6, 2, sp.light); R(hx + 2, hy + 6, 4, 1, sp.light); R(hx + 3, hy + 4, 2, 1, sp.nose); }
    else { R(hx + 2, hy + 4, 4, 3, sp.light); R(hx + 3, hy + 4, 2, 1, sp.nose); }
  } else if (side) {
    const ex = dir < 0 ? hx + 2 : hx + 5, fx = dir < 0 ? hx - 2 : hx + 8;
    if (a.animal === 'panda') { R(ex - (dir < 0 ? 0 : 1), hy + 2, 2, 3, sp.dark); if (!blink) R(ex, hy + 3, 1, 1, '#ffffff'); }
    else if (a.animal !== 'frog') eye(ex, hy + 3);
    else { R(ex, hy + 4, 1, 1, '#2f7a3c'); }
    if (a.animal === 'penguin') R(fx, hy + 4, 2, 1, sp.nose);
    else if (a.animal !== 'frog') { R(fx, hy + 4, 2, 3, a.animal === 'fox' || a.animal === 'dog' || a.animal === 'bear' ? sp.light : fur); R(dir < 0 ? fx : fx + 1, hy + 4, 1, 1, sp.nose); }
  }
  if (a.animal === 'dog') { R(hx - 1, hy + 1, 2, 4, sp.flop); R(hx + 7, hy + 1, 2, 4, sp.flop); }
}

/* 尾巴（畫在身體後面）。小幅搖擺 */
function tail(a, x, y, bob, face, t) {
  const sp = ANIMALS[a.animal];
  const tx = face === 'r' ? x - 7 : x + 5;
  const wag = Math.round(Math.sin(t * 5 + a.seed));
  switch (a.animal) {
    case 'cat': R(tx + wag, y - 11 + bob, 2, 6, sp.fur); R(tx + wag, y - 11 + bob, 2, 1, '#c9772f'); break;
    case 'fox': R(tx + wag, y - 9 + bob, 3, 5, sp.fur); R(tx + wag, y - 9 + bob, 3, 2, '#ffffff'); break;
    case 'dog': R(tx + wag, y - 9 + bob, 2, 4, sp.fur); break;
    case 'bear': R(tx, y - 7 + bob, 2, 2, sp.fur); break;
    case 'rabbit': R(tx, y - 7 + bob, 3, 3, '#e4e6ee'); break;
    case 'panda': R(tx, y - 7 + bob, 2, 2, sp.dark); break;
    default: break;
  }
}

/* 名冊裡的小頭像 */
function drawAvatar(cv, a) {
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, 16, 16);
  const saved = ctx;
  ctx = c;
  const top = (ANIMALS[a.animal] || ANIMALS.cat).ear + 1;
  R(2, top + 6, 12, 16 - top - 6, a.shirt);
  head(8, top, { ...a, seed: 99 }, 'd', 0);
  ctx = saved;
}

function paper(x, y) {
  R(x, y, 5, 6, '#ffffff'); R(x, y, 5, 1, '#d5dae5'); R(x + 1, y + 2, 3, 1, '#9aa3b5'); R(x + 1, y + 4, 3, 1, '#9aa3b5');
}

function drawStanding(a, x, y, t, moving) {
  const f = moving ? Math.floor(t * 8) % 4 : 0;
  const bob = moving && (f === 1 || f === 3) ? -1 : 0;
  const lL = moving && f === 1 ? 1 : 0, lR = moving && f === 3 ? 1 : 0;
  tail(a, x, y, bob, a.face, t);
  R(x - 3, y - 5, 2, 5 - lL, a.legs); R(x + 1, y - 5, 2, 5 - lR, a.legs);
  R(x - 4, y - 12 + bob, 8, 7, a.shirt);
  const swing = moving ? (f === 1 ? 1 : f === 3 ? -1 : 0) : 0;
  const coffee = a.pose === 'coffee';
  R(x - 6, y - 12 + bob + swing, 2, 6, a.shirt); R(x - 6, y - 6 + bob + swing, 2, 1, a.skin);
  if (coffee) {
    const sip = Math.floor(t * 0.8) % 3 === 0 ? -2 : 0;
    R(x + 4, y - 14 + sip, 2, 6, a.shirt); R(x + 4, y - 15 + sip, 2, 1, a.skin);
    R(x + 3, y - 18 + sip, 4, 3, '#ffffff'); R(x + 3, y - 18 + sip, 4, 1, '#c0392b');
    if (Math.floor(t * 3) % 2) R(x + 4, y - 21 + sip, 1, 2, 'rgba(255,255,255,0.7)');
  } else { R(x + 4, y - 12 + bob - swing, 2, 6, a.shirt); R(x + 4, y - 6 + bob - swing, 2, 1, a.skin); }
  head(x, y - 18 + bob, a, a.face, t);
  if (a.carry) paper(x + (a.face === 'l' ? -9 : 5), y - 10 + bob);
}

function drawSeated(a, x, y, t) {
  const since = performance.now() / 1000 - a.statusAt;
  let jx = 0, lookX = 0, hop = 0;
  if (a.status === 'error') jx = Math.floor(t * 14) % 2 ? 1 : -1;
  if (a.status === 'waiting') lookX = Math.floor(t * 0.9) % 2 ? 1 : -1;
  const cheering = a.status === 'done' && since < 2.6;
  if (cheering) hop = Math.floor(t * 6) % 2 ? 2 : 0;
  const by = y - hop;
  R(x - 4 + jx, by - 10, 8, 7, a.shirt);
  head(x + jx, by - 17, a, 'u', t, lookX);
  R(x - 1 + jx, by - 11, 2, 1, a.skin);
  const tL = a.status === 'working' && Math.floor(t * 9) % 2, tR = a.status === 'working' && Math.floor(t * 9 + 1) % 2;
  const arm = (side, up) => {
    const ax = side < 0 ? x - 6 + jx : x + 4 + jx;
    R(ax, by - up, 2, up - 3, a.shirt); R(ax, by - up - 1, 2, 1, a.skin);
  };
  if (cheering) { arm(-1, 22); arm(1, 22); }
  else if (a.status === 'working') { arm(-1, tL ? 17 : 18); arm(1, tR ? 17 : 18); }
  else if (a.status === 'thinking') { arm(-1, 12); R(x + 4, by - 14, 2, 5, a.shirt); R(x + 3, by - 15, 2, 1, a.skin); }
  else if (a.status === 'error') { R(x - 6 + jx, by - 17, 2, 7, a.shirt); R(x + 4 + jx, by - 17, 2, 7, a.shirt); R(x - 5 + jx, by - 18, 2, 1, a.skin); R(x + 3 + jx, by - 18, 2, 1, a.skin); }
  else { arm(-1, 12); arm(1, 12); }
  drawChair(x, y, '#46526b');
  if (cheering) for (let i = 0; i < 4; i++) { const k = (t * 3 + i * 1.7) % 2; R(x - 10 + i * 7, by - 24 - k * 4, 1, 1, ['#ffd25e', '#7fb4ff', '#ff8b8f', '#8ff0c0'][i]); }
  if (a.status === 'error') for (let i = 0; i < 2; i++) { const k = (t * 1.3 + i * 0.8) % 1.6; R(x - 3 + i * 6 + Math.round(Math.sin(t * 3 + i) * 2), by - 20 - k * 6, 2, 2, 'rgba(120,120,130,0.55)'); }
}

function drawSofa(a, x, y, t) {
  R(x - 4, y - 9, 8, 6, a.shirt);
  R(x - 6, y - 9, 2, 5, a.shirt); R(x + 4, y - 9, 2, 5, a.shirt);
  R(x - 6, y - 4, 2, 1, a.skin); R(x + 4, y - 4, 2, 1, a.skin);
  R(x - 3, y - 3, 6, 3, a.legs); R(x - 4, y, 3, 1, a.legs); R(x + 1, y, 3, 1, a.legs);
  head(x, y - 15, a, 'd', t);
  if (performance.now() / 1000 - a.statusAt > 10) {
    const k = Math.floor(t * 1.2) % 3;
    ctx.globalAlpha = 0.9; glyph('z', x + 6 + k, y - 22 - k * 2, '#ffffff'); ctx.globalAlpha = 1;
  }
}

function drawAgent(a, t) {
  const x = Math.round(a.x), y = Math.round(a.y);
  if (a.flash > 0) { ctx.globalAlpha = Math.min(0.5, a.flash * 0.4); R(x - 8, y - 22, 16, 24, '#ffffff'); ctx.globalAlpha = 1; }
  if (a.pose !== 'sit') R(x - 5, y - 1, 10, 2, 'rgba(0,0,0,0.18)');
  if (a.pose === 'sit') drawSeated(a, x, y, t);
  else if (a.pose === 'sofa') drawSofa(a, x, y, t);
  else drawStanding(a, x, y, t, a.pose === 'walk');
}

let dark = false;
function frame(t, dt) {
  dark = isDark();
  drawScene(t, dark);
  if (dark) { ctx.globalAlpha = 0.34; R(0, 0, W, H, '#070b24'); ctx.globalAlpha = 1; }
  drawMonitors(t);
  const list = [...agents.values()];
  for (const a of list) { step(a, dt, t); if (a.flash > 0) a.flash -= dt; }
  list.sort((p, q) => p.y - q.y);
  for (const a of list) drawAgent(a, t);
}

/* ============================================================ 版面縮放 */
/* 畫布內部解析度取「剛好夠用的整數倍」，再由瀏覽器縮到實際寬度：
 * 整數倍時維持銳利的像素邊緣，非整數倍時只有輕微柔化，所以畫面可以吃滿可用寬度。 */
function resize() {
  const avail = Math.max(240, dom.scene.parentElement.clientWidth - 16);
  const dpr = window.devicePixelRatio || 1;
  scale = Math.min(4, avail / W);
  const k = Math.max(1, Math.ceil(scale * dpr - 0.001));
  if (dom.canvas.width !== W * k) {
    dom.canvas.width = W * k;
    dom.canvas.height = H * k;
  }
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.imageSmoothingEnabled = false;
  dom.canvas.style.imageRendering = Number.isInteger(+(scale * dpr).toFixed(3)) ? 'pixelated' : 'auto';
  dom.scene.style.width = `${Math.round(W * scale)}px`;
  dom.scene.style.height = `${Math.round(H * scale)}px`;
  dom.tags.style.setProperty('--tagmax', `${Math.max(90, Math.min(170, Math.round(52 * scale)))}px`);
  dom.tags.style.setProperty('--tagfs', `${Math.max(9, Math.min(11.5, 3.9 * scale)).toFixed(1)}px`);
}
new ResizeObserver(resize).observe($('#stage'));

/* ============================================================ 示範團隊（瀏覽器內建） */
const TEAM = [
  ['planner', 'Planner', '規劃師', 'claude', 'fox'], ['researcher', 'Researcher', '研究員', 'claude', 'rabbit'], ['coder', 'Coder', '工程師', 'codex', 'cat'],
  ['reviewer', 'Reviewer', '審查員', 'claude', 'panda'], ['tester', 'Tester', '測試員', 'codex', 'frog'], ['analyst', 'Analyst', '資料分析', 'claude', 'dog'], ['writer', 'Writer', '文件撰寫', 'claude', 'penguin'],
];
const FEATURES = ['新增使用者登入功能', '修正訂單金額計算', '串接第三方付款 API', '優化首頁載入速度', '重構資料匯入流程'];
const TOPICS = ['電商銷售資料', '使用者留存分析', '競品功能比較', '客服工單趨勢', '廣告投放成效'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

let demoToken = null;
function startDemo() {
  const token = { stop: false };
  demoToken = token;
  const sleep = (lo, hi = lo) => new Promise((res, rej) => setTimeout(() => (token.stop ? rej(token) : res()), rnd(lo, hi) * 1000));
  const meta = {};
  TEAM.forEach(([id, name, role, kind, animal]) => { meta[id] = { name, role, kind, animal }; });
  const emit = (agent, status, task, extra = {}) => {
    if (token.stop) return;
    const prev = agents.get(agent);
    const ev = { ts: nowMs() / 1000, agent, name: meta[agent].name, role: meta[agent].role, kind: meta[agent].kind, animal: meta[agent].animal, status, task: task === undefined ? (prev && status !== 'idle' ? prev.task : '') : task, message: '', to: '', ...extra };
    handle(ev);
  };
  const doing = async (who, status, task, lo, hi) => { emit(who, status, task); await sleep(lo, hi); };
  const hand = async (a, b, message) => { emit(a, 'idle', '', { message, to: b }); await sleep(3, 3.6); };

  const featureLine = async () => {
    const f = pick(FEATURES);
    await doing('planner', 'thinking', `分析需求：${f}`, 3, 5);
    await doing('planner', 'working', '拆解任務、排定優先順序', 4, 6);
    await hand('planner', 'coder', '任務清單好了，交給你');
    await doing('coder', 'thinking', '設計實作方式', 3, 4);
    await doing('coder', 'working', `撰寫程式：${f}`, 7, 10);
    await hand('coder', 'reviewer', '請幫我審查這份修改');
    await doing('reviewer', 'working', '逐行審查程式碼', 5, 7);
    if (Math.random() < 0.3) {
      await hand('reviewer', 'coder', '有兩處邏輯要調整');
      await doing('coder', 'working', '依審查意見修改', 5, 7);
      await hand('coder', 'reviewer', '改好了，再看一次');
      await doing('reviewer', 'working', '重新審查', 3, 5);
    }
    emit('reviewer', 'done', '審查通過'); await sleep(1.5);
    await hand('reviewer', 'tester', '可以開始測試');
    await doing('tester', 'working', '執行單元測試與整合測試', 5, 7);
    if (Math.random() < 0.35) {
      await doing('tester', 'error', '3 個測試案例未通過', 3, 4);
      await hand('tester', 'coder', '測試失敗，請看報告');
      await doing('coder', 'working', '修正失敗的案例', 5, 7);
      await hand('coder', 'tester', '修好了，再跑一次');
      await doing('tester', 'working', '重新執行測試', 4, 6);
    }
    emit('tester', 'done', '全部測試通過'); await sleep(2.5);
    emit('tester', 'idle', ''); emit('coder', 'idle', '');
    await sleep(4, 8);
  };
  const researchLine = async () => {
    const topic = pick(TOPICS);
    await doing('researcher', 'working', `蒐集資料：${topic}`, 5, 7);
    if (Math.random() < 0.4) await doing('researcher', 'waiting', '等待資料庫存取權限', 4, 6);
    await hand('researcher', 'analyst', '原始資料已整理');
    await doing('analyst', 'thinking', '規劃分析方法', 3, 4);
    await doing('analyst', 'working', `清洗與分析：${topic}`, 7, 10);
    await hand('analyst', 'writer', '圖表與結論在這裡');
    await doing('writer', 'working', '撰寫分析報告', 7, 9);
    emit('writer', 'done', '報告完成'); await sleep(2.5);
    emit('writer', 'idle', '');
    await sleep(5, 9);
  };
  const loop = (fn, delay) => (async () => { try { await sleep(delay); for (;;) await fn(); } catch (e) { if (e !== token) throw e; } })();

  (async () => {
    try {
      for (const [id] of TEAM) { emit(id, 'idle', ''); await sleep(0.6); }
      loop(featureLine, 1); loop(researchLine, 6);
    } catch (e) { if (e !== token) throw e; }
  })();
}
function stopDemo() { if (demoToken) demoToken.stop = true; demoToken = null; }

/* ============================================================ 即時連線 */
let source = null;
function stopLive() { if (source) { source.close(); source = null; } }

function startLive() {
  stopLive();
  source = new EventSource('api/stream');
  source.onopen = () => showBanner('');
  source.onerror = () => showBanner('與伺服器的連線中斷，正在重新連線…');
  source.addEventListener('snapshot', (e) => {
    const snap = JSON.parse(e.data);
    skew = snap.server_time * 1000 - Date.now();
    completed = snap.completed || 0;
    const seen = new Set();
    for (const s of snap.agents) {
      seen.add(s.id);
      const existed = agents.has(s.id);
      handle({ ts: s.since, agent: s.id, name: s.name, role: s.role, kind: s.kind, animal: s.animal, status: s.status, task: s.task }, { instant: !existed, silent: true, countDone: false });
      const a = agents.get(s.id);
      if (a) a.since = s.since * 1000;
    }
    for (const id of [...agents.keys()]) if (!seen.has(id)) removeAgent(id);
    if (!dom.feed.children.length) for (const ev of snap.log.slice(-40)) pushFeed({ ...ev, name: ev.name });
    updateCounters();
  });
  source.onmessage = (e) => handle(JSON.parse(e.data));
}

/* ============================================================ 模式切換 */
let mode = null;
let liveAvailable = false;
function showBanner(text) { dom.banner.textContent = text; dom.banner.hidden = !text; }
function syncModeButtons() {
  dom.modeLive.setAttribute('aria-pressed', String(mode === 'live'));
  dom.modeDemo.setAttribute('aria-pressed', String(mode === 'demo'));
  dom.modeLive.disabled = !liveAvailable && mode !== 'live';
  dom.modeLive.title = liveAvailable || mode === 'live' ? '' : '找不到伺服器：先執行 python agent_office/server.py';
}

function setMode(next) {
  if (next === mode) return;
  stopDemo(); stopLive(); resetAll(); showBanner('');
  mode = next;
  if (mode === 'demo') {
    if (liveAvailable) showBanner('目前是示範畫面，不是你的 agent。切換到「即時」才會顯示真實狀態。');
    else if (location.protocol === 'file:' || !liveAvailable) showBanner('示範模式：畫面中的團隊是瀏覽器模擬的。執行 python agent_office/server.py 後重新整理，就能看到你自己的 agent。');
    startDemo();
  } else startLive();
  syncModeButtons();
}

async function detectLive() {
  if (/[?&]demo\b/.test(location.search) || location.protocol === 'file:') return false;
  try {
    const r = await fetch('api/state', { cache: 'no-store' });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return false;
    await r.json();
    return true;
  } catch { return false; }
}

dom.modeLive.addEventListener('click', async () => {
  if (!liveAvailable) liveAvailable = await detectLive();
  if (liveAvailable) setMode('live'); else syncModeButtons();
});
dom.modeDemo.addEventListener('click', () => setMode('demo'));
$('#emptyDemo').addEventListener('click', () => setMode('demo'));

/* ============================================================ 主迴圈 */
let last = performance.now();
let lastSecond = 0;
function loop(nowTs) {
  const dt = Math.min(0.1, (nowTs - last) / 1000);
  last = nowTs;
  const t = nowTs / 1000;
  frame(t, dt);
  updateTags(t);
  if (t - lastSecond >= 1) {
    lastSecond = t;
    for (const a of agents.values()) a.card.querySelector('.since').textContent = a.status === 'idle' ? '' : fmtElapsed((nowMs() - a.since) / 1000);
    dom.empty.hidden = !(mode === 'live' && agents.size === 0);
  }
  requestAnimationFrame(loop);
}

(async function boot() {
  resize();
  liveAvailable = await detectLive();
  setMode(liveAvailable ? 'live' : 'demo');
  requestAnimationFrame(loop);
})();

/* 讓測試與除錯可以直接餵事件 */
window.__office = { handle, agents, setMode, stopDemo, resetAll };
})();
