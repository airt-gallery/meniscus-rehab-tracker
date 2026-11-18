'use strict';
/* ===== Helpers ===== */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pkey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const todayKey = () => dkey(new Date());
const addDays = (k, n) => { const d = pkey(k); d.setDate(d.getDate() + n); return dkey(d); };
const diffDays = (a, b) => Math.round((pkey(b) - pkey(a)) / 864e5);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fmtDate = (k, long) => { const d = pkey(k); return long ? `${WD[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}` : `${d.getDate()} ${MON[d.getMonth()]}`; };
const dowIdx = (k) => (pkey(k).getDay() + 6) % 7;
const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
const okDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const mmss = (s) => { s = Math.max(0, Math.ceil(s)); const m = Math.floor(s / 60); return m >= 1 ? `${m}:${pad(s % 60)}` : String(s); };

const IC = {
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  plan: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  log: '<path d="M3 20h18M6 16v-5M11 16V6M16 16v-8M21 16v-3"/>',
  guide: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  home: '<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  wave: '<path d="M2 12c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M9 7a3 3 0 1 0 0-.1"/>',
  dumbbell: '<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="m9 21 2.5-6.5L14 17v4M8 11.5l3-3.5 3 2.5 3 1M11 8l-1.5 6.5"/>',
  run: '<circle cx="15" cy="4.5" r="1.8"/><path d="m6 20 4-3 1.5-4 3 3v4M7 10.5l4-3 3 2 2 3h3M11.5 13l1.5-5.5"/>',
  shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="m6 16 4-7h5l3 7M10 9l2 7H6M14 5h3"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chevL: '<path d="m15 6-6 6 6 6"/>', chevR: '<path d="m9 6 6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>', pause: '<path d="M8.5 5v14M15.5 5v14"/>',
  snow: '<path d="M12 2v20M4 7l16 10M20 7 4 17M9 3l3 3 3-3M9 21l3-3 3 3"/>',
  alert: '<path d="M12 3.5 22 20.5H2zM12 10v4.5M12 17.5v.3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.2"/>',
  swap: '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 9a4.5 4.5 0 0 1-1 9z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10.5 5-3v9l-5-3z"/>',
  flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
  pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7zM7 10l7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  down: '<path d="M12 4v12m-5-5 5 5 5-5M5 20h14"/>', up: '<path d="M12 20V8m-5 5 5-5 5 5M5 4h14"/>',
};
const ic = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const MARK = '<svg class="mark" viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" rx="7" fill="#132542" stroke="#D9AE4F" stroke-width="1.2"/><path d="M8.5 5 13.5 12.8 9.8 21" fill="none" stroke="#D9AE4F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13.5" cy="12.8" r="2.7" fill="#0A1220" stroke="#F0CB78" stroke-width="1.4"/></svg>';

/* ===== State ===== */
const KEY = 'meniscusRehab.v1';
let lastT = 0;
const stamp = () => { const n = Date.now(); lastT = n > lastT ? n : lastT + 1; return lastT; };
function defaultPlan() {
  const t = todayKey();
  return { t: stamp(), auto: true, start: t, phase: 1, phaseStart: t, hist: [{ phase: 1, start: t, why: 'Started' }], checks: {}, slClear: false, landClear: false, runStage: 1, sound: true, iceTarget: 60, six: null, side: null, notes: '', ack: false };
}
let State = { v: 1, plan: null, days: {} };
let storageOK = true;

function sanitizePlan(p) {
  const o = Object.assign({ checks: {}, hist: [], slClear: false, landClear: false, runStage: 1, sound: true, iceTarget: 60, six: null }, p && typeof p === 'object' ? p : {});
  if (!okDate(o.start)) o.start = todayKey();
  if (!okDate(o.phaseStart)) o.phaseStart = o.start;
  o.phase = num(o.phase, 1, 4, 1) | 0;
  o.runStage = num(o.runStage, 1, 9, 1) | 0;
  o.iceTarget = num(o.iceTarget, 7, 365, 60) | 0;
  o.t = num(o.t, 0, 1e15, 0);
  o.auto = !!o.auto; o.slClear = !!o.slClear; o.landClear = !!o.landClear; o.sound = o.sound !== false;
  if (!o.checks || typeof o.checks !== 'object' || Array.isArray(o.checks)) o.checks = {};
  o.hist = (Array.isArray(o.hist) ? o.hist : []).filter((h) => h && okDate(h.start)).map((h) => ({ phase: num(h.phase, 1, 4, 1) | 0, start: h.start, why: String(h.why || '').slice(0, 160) }));
  if (!o.hist.length) o.hist = [{ phase: o.phase, start: o.phaseStart, why: '' }];
  if (o.six && typeof o.six !== 'object') o.six = null;
  o.side = o.side === 'right' ? 'right' : o.side === 'left' ? 'left' : null;
  o.notes = String(o.notes || '').slice(0, 600);
  o.ack = !!o.ack;
  return o;
}
function sanitizeDay(d) {
  const out = {};
  if (!d || typeof d !== 'object') return out;
  Object.keys(d).forEach((k) => {
    if (!/^(m|e|q|w|g|k|s_[a-z0-9]{1,16})$/.test(k)) return;
    const v = d[k];
    if (!v || typeof v !== 'object' || Array.isArray(v) || !Number.isFinite(Number(v.t))) return;
    try { out[k] = JSON.parse(JSON.stringify(v)); } catch (e) { /* skip */ }
  });
  return out;
}
function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && o.plan && o.days) {
        State = { v: 1, plan: sanitizePlan(o.plan), days: {} };
        Object.keys(o.days).forEach((k) => { if (okDate(k)) State.days[k] = sanitizeDay(o.days[k]); });
      }
    }
  } catch (e) { storageOK = false; }
  if (!State.plan) State.plan = defaultPlan();
  Object.values(State.days).forEach((d) => Object.values(d).forEach((v) => { if (v.t > lastT) lastT = v.t; }));
}
let saveTimer = 0;
function saveLocal(now) {
  clearTimeout(saveTimer);
  const go = () => { try { localStorage.setItem(KEY, JSON.stringify(State)); storageOK = true; } catch (e) { storageOK = false; } };
  if (now) go(); else saveTimer = setTimeout(go, 120);
}
const sec = (date, k) => { const d = State.days[date]; const v = d && d[k]; return v && !v.del ? v : null; };
function setSec(date, k, patch) {
  const d = State.days[date] || (State.days[date] = {});
  d[k] = Object.assign({}, sec(date, k) || {}, patch, { t: stamp() });
  delete d[k].del;
  changed(date);
}
function delSec(date, k) { const d = State.days[date]; if (!d || !d[k]) return; d[k] = { del: 1, t: stamp() }; changed(date); }
function setPlan(patch) { State.plan = Object.assign({}, State.plan, patch, { t: stamp(), auto: false }); changed('plan'); }
function changed(id) { saveLocal(); Cloud.mark(id); }

/* ===== Merge (local-first, per-section last-writer-wins) ===== */
function mergeDay(a, b) {
  a = a || {}; b = b || {};
  const out = {}; let toLocal = false, toRemote = false;
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
    const x = a[k], y = b[k];
    if (!x) { out[k] = y; toLocal = true; return; }
    if (!y) { out[k] = x; toRemote = true; return; }
    const tx = +x.t || 0, ty = +y.t || 0;
    if (tx > ty) { out[k] = x; toRemote = true; }
    else if (ty > tx) { out[k] = y; toLocal = true; }
    else { out[k] = x; if (JSON.stringify(x) !== JSON.stringify(y)) toRemote = true; }
  });
  return { m: out, toLocal, toRemote };
}
function pickPlan(local, remote) {
  if (!remote) return 'local';
  if (local.auto && !remote.auto) return 'remote';
  if (!local.auto && remote.auto) return 'local';
  if (local.auto && remote.auto) return remote.t < local.t ? 'remote' : (remote.t > local.t ? 'local' : 'same');
  return remote.t > local.t ? 'remote' : (remote.t < local.t ? 'local' : 'same');
}
function mergeAll(remote) {
  let changedLocal = false; const push = [];
  const rp = remote.plan && typeof remote.plan === 'object' ? sanitizePlan(remote.plan) : null;
  const who = pickPlan(State.plan, rp);
  if (who === 'remote') { State.plan = rp; changedLocal = true; }
  else if (who === 'local') push.push('plan');
  const ids = new Set([...Object.keys(State.days), ...Object.keys(remote).filter(okDate)]);
  ids.forEach((id) => {
    const res = mergeDay(State.days[id], remote[id] ? sanitizeDay(remote[id]) : {});
    if (res.toLocal) { State.days[id] = res.m; changedLocal = true; }
    if (res.toRemote) push.push(id);
  });
  return { changed: changedLocal, push };
}

/* ===== Storage: everything stays in this browser (localStorage). No server, no account. ===== */
const withTimeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej({ code: 'timeout' }), ms); Promise.resolve(p).then((v) => { clearTimeout(t); res(v); }, (e) => { clearTimeout(t); rej(e); }); });
const Cloud = {
  status: 'local',
  mark() {},
  label() { return storageOK ? 'Saved in this browser only. Nothing is sent anywhere.' : 'This browser is blocking storage, so entries will be lost when you close it.'; },
};
function paintCloud() {}

/* ===== Injured-side text tokens: {inj} {oth} {Inj} {Oth} ===== */
function sides() { return State.plan && State.plan.side === 'right' ? ['right', 'left'] : ['left', 'right']; }
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function tx(s) { if (s == null) return s; const [i, o] = sides(); return String(s).replace(/\{inj\}/g, i).replace(/\{oth\}/g, o).replace(/\{Inj\}/g, cap1(i)).replace(/\{Oth\}/g, cap1(o)); }

/* ===== Program logic ===== */
function phaseOn(date) {
  const h = (State.plan.hist || []).filter((x) => x.start <= date).sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return h.length ? h[h.length - 1].phase : State.plan.phase;
}
function sessionKeyFor(date) {
  const k = sec(date, 'k'); const ph = phaseOn(date);
  if (k && k.v && SESS[ph][k.v]) return k.v;
  return WEEK[ph][dowIdx(date)];
}
const zones = (ph) => PHASES[ph].pain;
const zoneOf = (v, ph) => { const z = zones(ph); return v <= z.g ? 0 : v <= z.a ? 1 : 2; };
function readiness(date) {
  const m = sec(date, 'm'); if (!m) return null;
  const z = zones(phaseOn(date));
  if (m.mech) return { lvl: 'r', mech: true, why: 'Locking or giving way reported' };
  if (m.sw === 2) return { lvl: 'r', why: 'More swelling than yesterday' };
  if (m.pain > z.a) return { lvl: 'r', why: `Resting pain ${m.pain}/10` };
  const a = [];
  if (m.pain > z.g) a.push(`resting pain ${m.pain}/10`);
  if (m.sw === 1) a.push('a little swelling');
  if (m.st === 0) a.push('not fully straight');
  if (m.cmp === 1) a.push('worse than yesterday');
  if (a.length) { const s = a.join(', '); return { lvl: 'a', why: s[0].toUpperCase() + s.slice(1) }; }
  return { lvl: 'g', why: 'All clear' };
}
function mornings(date, n) { const out = []; for (let i = 0; i < n; i++) { const m = sec(addDays(date, -i), 'm'); if (m) out.push(m); } return out; }
function sessionsDone(date, back) {
  const out = [];
  for (let i = 0; i < back; i++) {
    const d = addDays(date, -i), day = State.days[d]; if (!day) continue;
    Object.keys(day).forEach((k) => { if (k.startsWith('s_')) { const s = sec(d, k); if (s && s.fin) out.push(Object.assign({ date: d, key: k.slice(2) }, s)); } });
  }
  return out.sort((a, b) => (a.fin < b.fin ? 1 : -1));
}
const median = (arr) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
const AUTO = {
  restPain3: (date) => { const ms = mornings(date, 7); if (ms.length < 5) return { ok: false, why: `${ms.length} of 5 mornings logged` }; const md = median(ms.map((m) => m.pain)); return { ok: md <= 3, why: `Median ${md}/10 over ${ms.length} mornings` }; },
  noMoreSwell7: (date) => { const ms = mornings(date, 7); if (ms.length < 5) return { ok: false, why: `${ms.length} of 5 mornings logged` }; const n = ms.filter((m) => m.sw === 2).length; return { ok: !n, why: n ? `${plural(n, 'day')} with more swelling` : 'None in the last 7 days' }; },
  noMoreSwell14: (date) => { const ms = mornings(date, 14); if (ms.length < 8) return { ok: false, why: `${ms.length} of 8 mornings logged` }; const n = ms.filter((m) => m.sw === 2).length; return { ok: !n, why: n ? `${plural(n, 'day')} with more swelling` : 'None in the last 14 days' }; },
};
function gateStatus(ph, date) {
  const P = State.plan;
  const items = PHASES[ph].gate.map((g) => {
    if (g.auto) { const r = AUTO[g.auto](date); return Object.assign({}, g, { ok: r.ok, why: r.why }); }
    return Object.assign({}, g, { ok: !!P.checks[g.id], manual: true });
  });
  const daysIn = diffDays(P.phaseStart, date) + 1;
  const needDays = PHASES[ph].weeks * 7;
  return { items, met: items.filter((i) => i.ok).length, all: items.every((i) => i.ok), timeOk: daysIn >= needDays, daysIn, needDays };
}
function slGate(date) {
  const P = State.plan;
  const ms = mornings(date, 7);
  const low = ms.filter((m) => m.pain <= 2 && !m.sw && !m.mech).length;
  const ss = sessionsDone(date, 21).filter((s) => Number.isFinite(s.pain)).slice(0, 3);
  const sessOk = ss.length >= 3 && ss.every((s) => s.pain <= 3);
  const items = [
    { ok: low >= 5, label: '5 of the last 7 mornings at 2/10 or less, with no swelling', why: `${low} of 5 so far` },
    { ok: sessOk, label: 'Last 3 sessions at 3/10 or less', why: ss.length < 3 ? `${ss.length} of 3 logged` : `${ss.map((s) => s.pain).join(', ')} out of 10` },
    { ok: !!P.checks['sl-test'], label: 'Stand on the {inj} leg for 30 s, pain-free', manual: true, id: 'sl-test' },
  ];
  return { open: P.slClear || items.every((i) => i.ok), physio: P.slClear, items };
}
const landOpen = (date) => State.plan.landClear && AUTO.noMoreSwell14(date).ok;
function resolveItems(ph, key, date) {
  const S = SESS[ph][key]; const g = slGate(date);
  return S.items.map((it) => {
    const o = typeof it === 'string' ? { id: it } : Object.assign({}, it);
    const ex = EX[o.id];
    if (ex.single && !g.open) { o.locked = 'sl'; o.alt = ex.alt || null; }
    if (ex.gate === 'land' && !landOpen(date)) o.locked = 'land';
    if (ex.gate === 'cod' && State.plan.runStage < 8) o.locked = 'cod';
    return o;
  });
}
const LOCKWHY = { sl: 'Locked until the pain settles (single-leg rule)', land: 'Locked until your physio OKs landing drills', cod: 'Locked until 20 min of easy running is settled' };
function doseFor(o, ex) { return o.dose || ex.dose; }
function stageSegs(n) {
  const st = STAGES[n]; const segs = [{ s: 300, ph: 'WALK', rep: 'Warm-up: brisk walk', col: 'blue', beep: 'lo' }];
  for (let i = 1; i <= st.reps; i++) {
    segs.push({ s: st.jog, ph: 'JOG', rep: st.reps > 1 ? `Jog ${i} of ${st.reps}` : 'Easy continuous jog', col: 'gold', beep: 'hi', tick: true });
    if (st.walk && i < st.reps) segs.push({ s: st.walk, ph: 'WALK', rep: `Walk, then jog ${i + 1}`, col: 'blue', beep: 'lo', tick: true });
  }
  segs.push({ s: 300, ph: 'WALK', rep: 'Cool-down: easy walk', col: 'blue', beep: 'lo' });
  return segs;
}
function segsFor(ex, o = {}) {
  const G3 = { s: 3, ph: 'GET READY', col: 'muted' };
  if (ex.kind === 'hold') {
    const reps = o.reps || ex.reps, hold = o.hold || ex.hold, rest = ex.rest || 5;
    const sides = ex.sides ? ['Left', 'Right'] : [null];
    const segs = [G3];
    sides.forEach((sd, si) => {
      if (si) segs.push({ s: 8, ph: 'SWITCH', rep: 'Change sides', col: 'muted', beep: 'lo' });
      for (let i = 1; i <= reps; i++) {
        segs.push({ s: hold, ph: 'HOLD', rep: `${sd ? sd + ' · ' : ''}Rep ${i} of ${reps}`, col: 'gold', beep: 'hi', tick: hold >= 8 });
        if (i < reps) segs.push({ s: rest, ph: rest >= 20 ? 'REST' : 'RELAX', rep: `Next: rep ${i + 1}`, col: 'blue', beep: 'lo', tick: rest >= 8 });
      }
    });
    return segs;
  }
  if (ex.kind === 'stretch') {
    const reps = ex.reps || 3, hold = ex.hold || 30; const segs = [G3];
    ['Left', 'Right'].forEach((sd, si) => {
      if (si) segs.push({ s: 8, ph: 'SWITCH', rep: 'Change sides', col: 'muted', beep: 'lo' });
      for (let i = 1; i <= reps; i++) {
        segs.push({ s: hold, ph: 'HOLD', rep: `${sd} · ${i} of ${reps}`, col: 'gold', beep: 'hi', tick: true });
        if (i < reps) segs.push({ s: 5, ph: 'EASE OFF', rep: 'Breathe', col: 'blue', beep: 'lo' });
      }
    });
    return segs;
  }
  if (ex.kind === 'time') {
    if (ex.segs && !o.mins) return [G3].concat(ex.segs.map(([l, s], i) => ({ s, ph: 'GO', rep: l, col: 'gold', beep: i ? 'hi' : 'hi', tick: true })));
    return [G3, { s: (o.mins || ex.mins || 10) * 60, ph: 'GO', rep: ex.name, col: 'gold', beep: 'hi', tick: true }];
  }
  if (ex.kind === 'ice') return [{ s: 1200, ph: 'ICE ON', rep: 'Round 1: ice on', col: 'blue', beep: 'hi', ice: 1 }, { s: 1200, ph: 'ICE OFF', rep: 'Round 1: ice off', col: 'muted', beep: 'lo', tick: true }];
  if (ex.kind === 'run') return stageSegs(State.plan.runStage);
  return [{ s: o.rest || ex.rest || 60, ph: 'REST', rep: 'Rest between sets', col: 'blue', beep: 'lo', tick: true }];
}

/* ===== Sound, wake lock, timer ===== */
const Snd = {
  ctx: null,
  init() { try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { this.ctx = null; } },
  tone(f, d, v = 0.16, at = 0) {
    if (!State.plan.sound || !this.ctx) return;
    try { const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03); } catch (e) { /* no audio */ }
  },
  hi() { this.tone(880, 0.13); this.tone(1175, 0.16, 0.16, 0.16); buzz(80); },
  lo() { this.tone(523, 0.28); buzz(40); },
  tick() { this.tone(660, 0.06, 0.1); },
  done() { [0, 0.18, 0.36].forEach((a) => this.tone(1047, 0.14, 0.16, a)); buzz([90, 60, 90]); },
};
function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ } }
let wakeLock = null;
async function wake(on) {
  try {
    if (on && navigator.wakeLock && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); }
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { wakeLock = null; }
}
const T = {
  r: null, iv: 0,
  start(segs, meta) {
    Snd.init(); wake(true);
    this.r = { segs, i: 0, endAt: Date.now() + segs[0].s * 1000, paused: false, left: 0, meta, ticked: {} };
    this.cue(segs[0]); clearInterval(this.iv); this.iv = setInterval(() => this.tick(), 200); this.paint();
  },
  cue(s) { if (s.beep === 'hi') Snd.hi(); else if (s.beep === 'lo') Snd.lo(); },
  tick() {
    const r = this.r; if (!r) return;
    if (r.paused) return this.paint();
    let left = r.endAt - Date.now();
    while (left <= 0) {
      const fin = r.segs[r.i];
      if (fin.ice && r.meta.onIce) r.meta.onIce();
      r.i++;
      if (r.i >= r.segs.length) return this.finish(true);
      r.endAt += r.segs[r.i].s * 1000; left = r.endAt - Date.now(); r.ticked = {};
      if (left > 0) this.cue(r.segs[r.i]);
    }
    const s = r.segs[r.i], sec3 = Math.ceil(left / 1000);
    if (s.tick && sec3 <= 3 && sec3 >= 1 && !r.ticked[sec3]) { r.ticked[sec3] = 1; Snd.tick(); }
    this.paint();
  },
  pause() { const r = this.r; if (!r) return; if (r.paused) { r.endAt = Date.now() + r.left; r.paused = false; } else { r.left = r.endAt - Date.now(); r.paused = true; } this.paint(); },
  skip() { const r = this.r; if (!r) return; r.endAt = Date.now() - 1; if (r.paused) { r.paused = false; } this.tick(); },
  stop() { this.finish(false); },
  finish(done) {
    const r = this.r; clearInterval(this.iv); this.r = null; wake(false);
    if (done) { Snd.done(); if (r && r.meta.onDone) r.meta.onDone(); }
    this.paint();
  },
  paint() {
    const box = $('#tbox'), pill = $('#tpill');
    const r = this.r;
    if (!r) { if (box) box.innerHTML = ''; if (pill) pill.remove(); const b = $('#tstart'); if (b) b.hidden = false; return; }
    const s = r.segs[r.i]; const left = r.paused ? r.left : r.endAt - Date.now();
    const frac = Math.max(0, Math.min(1, 1 - left / (s.s * 1000)));
    const col = { gold: '#E2B14E', blue: '#6CC3F5', muted: '#8EA0BA', green: '#3CC08A' }[s.col] || '#E2B14E';
    if (box && box.dataset.k === r.meta.k) {
      const C = 2 * Math.PI * 92;
      box.innerHTML = `<div class="timer"><div class="ring"><svg viewBox="0 0 208 208"><circle cx="104" cy="104" r="92" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"/><circle cx="104" cy="104" r="92" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/></svg><div class="in"><div class="ph" style="color:${col}">${esc(s.ph)}${r.paused ? ' · PAUSED' : ''}</div><div class="big num">${mmss(left / 1000)}</div><div class="rep">${esc(s.rep || '')}</div></div></div>
        <div class="tctl"><button class="btn" data-a="tpause">${ic(r.paused ? 'play' : 'pause')}${r.paused ? 'Resume' : 'Pause'}</button><button class="btn" data-a="tskip">Skip</button><button class="btn danger" data-a="tstop">Stop</button></div>
        ${r.segs.length > 1 ? `<p class="tiny dim" style="text-align:center;margin-top:8px">Step ${r.i + 1} of ${r.segs.length}. Beeps mark each change, so keep the volume up.</p>` : ''}</div>`;
      const b = $('#tstart'); if (b) b.hidden = true;
    }
    if (!box || box.dataset.k !== r.meta.k) {
      let p = pill;
      if (!p) { p = document.createElement('button'); p.id = 'tpill'; p.className = 'tpill'; p.dataset.a = 'treopen'; document.body.appendChild(p); }
      p.innerHTML = `${ic('timer').replace('<svg', '<svg style="width:16px;height:16px"')}<span>${esc(s.rep || r.meta.title)} · <span class="num">${mmss(left / 1000)}</span>${r.paused ? ' (paused)' : ''}</span>`;
    } else if (pill) pill.remove();
  },
};

/* ===== UI shell ===== */
const UI = { tab: 'today', date: todayKey(), planPh: null, sheet: null, stopFig: null, tableView: false };
const thumbs = {};
const thumb = (fig) => thumbs[fig] || (thumbs[fig] = Fig.svgString(FIGS[fig], 'b'));
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200);
}
function dialog({ title, text, ok = 'OK', cancel = 'Cancel', danger, input, onOk }) {
  const d = document.createElement('div'); d.className = 'dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.innerHTML = `<div class="box"><h3>${esc(title)}</h3><p>${text}</p>${input ? `<input type="text" id="dlgIn" placeholder="${esc(input)}" style="margin:8px 0 4px">` : ''}<div class="row2" style="margin-top:12px"><button class="btn" data-x="no">${esc(cancel)}</button><button class="btn ${danger ? 'danger' : 'gold'}" data-x="ok">${esc(ok)}</button></div></div>`;
  d.addEventListener('click', (e) => {
    const x = e.target.closest('[data-x]'); if (!x && e.target !== d) return;
    if (x && x.dataset.x === 'ok') { const v = input ? ($('#dlgIn', d).value || '').trim() : true; d.remove(); onOk && onOk(v); } else d.remove();
  });
  document.body.appendChild(d);
  const f = $('#dlgIn', d) || $('[data-x="ok"]', d); if (f) f.focus();
}
function refresh() { renderView(); if (UI.sheet && UI.sheet.refresh) UI.sheet.refresh(); }
function renderView() {
  const v = $('#view'); if (!v) return;
  if (UI.date > todayKey()) UI.date = todayKey();
  v.innerHTML = ({ today: viewToday, plan: viewPlan, log: viewLog, guide: viewGuide }[UI.tab] || viewToday)();
  document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-current', t.dataset.tab === UI.tab ? 'page' : 'false'));
  const ph = State.plan.phase;
  $('#topSub').textContent = `${State.plan.side ? cap1(State.plan.side) + ' knee · ' : ''}Phase ${ph} · ${PHASES[ph].name} · week ${Math.max(1, Math.floor(diffDays(State.plan.phaseStart, todayKey()) / 7) + 1)} of ${PHASES[ph].weeks}`;
  if (UI.tab === 'log') mountChart();
}
function setTab(t) { UI.tab = t; try { history.replaceState(null, '', '#' + t); } catch (e) { /* sandbox */ } renderView(); window.scrollTo(0, 0); }

/* ===== Today ===== */
function viewToday() {
  const date = UI.date, today = todayKey(), P = State.plan;
  const ph = phaseOn(date), PH = PHASES[ph];
  const wk = Math.max(1, Math.floor(diffDays(P.phaseStart, date) / 7) + 1);
  const pday = diffDays(P.start, date) + 1;
  let h = `<div class="dnav"><div><div class="d">${date === today ? 'Today' : esc(fmtDate(date, true))}</div><div class="sub">${date === today ? esc(fmtDate(date, true)) + ' · ' : ''}Phase ${ph} ${esc(PH.name)} · week ${wk}${pday >= 1 ? ` · day ${pday}` : ''}</div></div>
    <div class="arrows"><button class="pillnav" data-a="day" data-n="-1" aria-label="Previous day">${ic('chevL')}</button><button class="pillnav" data-a="day" data-n="1" aria-label="Next day"${date >= today ? ' disabled' : ''}>${ic('chevR')}</button></div></div>`;
  if (date !== today) h += `<div class="banner k"><div class="bi">${ic('info')}</div><div><b>Logging ${esc(fmtDate(date, true))}</b><p>Anything you change here is saved to that day. <button class="link" data-a="goToday">Back to today</button></p></div></div>`;
  h += alertsHTML(date);
  h += morningHTML(date);
  h += sessionHTML(date);
  h += quadHTML(date);
  h += eveningHTML(date);
  h += statsHTML(date);
  return `<div class="view">${h}</div>`;
}
function alertsHTML(date) {
  const P = State.plan, today = todayKey(); let h = '';
  const m = sec(date, 'm');
  if (m && m.mech) h += `<div class="banner r"><div class="bi">${ic('alert')}</div><div><b>Red flag: locking or giving way</b><p>Don’t force the knee to free it. Contact your GP or physio. If it’s stuck bent or swells fast, go to urgent care.</p></div></div>`;
  const ms = mornings(date, 7);
  const nights = ms.filter((x) => x.night).length;
  if (nights >= 3) h += `<div class="banner a"><div class="bi">${ic('moon')}</div><div><b>Night pain ${nights} of the last 7 nights</b><p>Regular night pain is a red flag. Mention it to your GP or physio this week.</p></div></div>`;
  let ns = 0; for (let i = 0; i < 7; i++) { const e = sec(addDays(date, -i), 'e'); if (e && e.nsaid) ns++; }
  if (ns >= 3) h += `<div class="banner a"><div class="bi">${ic('pill')}</div><div><b>Anti-inflammatories on ${ns} of the last 7 days</b><p>Regular use hides the pain signal this program steers by. Check with your GP or pharmacist.</p></div></div>`;
  if (date === today) {
    const d6 = diffDays(P.start, today) + 1;
    if (d6 >= 36 && !P.six) {
      const first = []; const last = [];
      for (let i = 0; i < 7; i++) { const a = sec(addDays(P.start, i), 'm'); if (a) first.push(a.pain); const b = sec(addDays(today, -i), 'm'); if (b) last.push(b.pain); }
      const avg = (a) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '–');
      h += `<div class="card" style="border-color:rgba(217,174,79,.45)"><div class="ch"><div class="sicon">${ic('flag')}</div><div class="grow"><h2>Week 6 review point</h2><small>Built into the program</small></div></div>
        <p class="small">Exercise-first care works for many meniscus tears, but it shouldn’t turn into a long wait if it isn’t working, especially if you’re under 40 or the tear came from an injury. Is the knee <b>clearly</b> better than when you started?</p>
        <p class="small muted">Average morning pain: first week ${avg(first)}/10 → last 7 days ${avg(last)}/10.</p>
        <div class="row2" style="margin-top:10px"><button class="btn sm" data-a="six" data-v="better">Clearly better</button><button class="btn sm gold" data-a="six" data-v="not">Not clearly</button></div></div>`;
    }
    if (P.six && P.six.v === 'not' && !P.six.booked) h += `<div class="banner k"><div class="bi">${ic('flag')}</div><div><b>Ask your GP about a specialist opinion</b><p>A sports physician or orthopaedic surgeon can say whether the tear is worth repairing. That’s better decided early. <button class="link" data-a="sixBooked">Done, it’s booked</button></p></div></div>`;
    const g = gateStatus(P.phase, today);
    if (P.phase < 4 && g.all && g.timeOk) h += `<div class="banner g"><div class="bi">${ic('check')}</div><div><b>Phase ${P.phase} criteria met</b><p>You’re ready to move on. <button class="link" data-a="tab" data-t="plan">Review in Plan</button></p></div></div>`;
  }
  return h;
}
function morningHTML(date) {
  const m = sec(date, 'm'), r = readiness(date);
  if (!m) return `<div class="card"><div class="ch"><div class="sicon">${ic('today')}</div><div class="grow"><h2>Morning check</h2><small>20 seconds. It sets today’s plan.</small></div></div><button class="btn gold block" data-a="morning">Start morning check</button></div>`;
  const T = { g: ['Green light', 'Go as planned. Stay in the green zone.'], a: ['Amber: scale back today', 'One set less on everything, stay in the smaller range, no load increases. Pool beats gym today if you can.'], r: ['Red: settle day', 'Swap to the settle day: quad sets, gentle heel slides, ice and leg up.'] }[r.lvl];
  return `<div class="banner ${r.lvl}"><div class="bi">${ic(r.lvl === 'g' ? 'check' : 'alert')}</div><div style="flex:1"><b>${T[0]}</b><p>${esc(r.why)} · resting pain ${m.pain}/10. ${T[1]}</p><p><button class="link" data-a="morning">Edit morning check</button></p></div></div>`;
}
function sessionHTML(date) {
  const ph = phaseOn(date), key = sessionKeyFor(date), S = SESS[ph][key], r = readiness(date);
  const s = sec(date, 's_' + key) || {};
  const icn = ICONS_FOR[key] || 'dumbbell';
  let h = `<div class="card"><div class="ch"><div class="sicon${key === 'pool' ? ' b' : ''}">${ic(icn)}</div><div class="grow"><h2>${esc(S.name)}</h2><small>${S.rest ? 'Rest is part of the program' : `About ${S.mins} min`}${sec(date, 'k') ? ' · swapped' : ''}</small></div><button class="btn sm" data-a="swap">${ic('swap')}Swap</button></div>`;
  if (r && r.lvl === 'r' && key !== 'recovery' && !S.rest) h += `<div class="note r" style="margin:0 0 10px"><b>Red morning</b>Today’s plan is too much. <button class="link" data-a="swapTo" data-k="recovery">Switch to the settle day</button></div>`;
  if (r && r.lvl === 'a' && (key === 'gym' || key.startsWith('str') || key.startsWith('gym')) && SESS[ph].pool) h += `<div class="note" style="margin:0 0 10px"><b>Amber morning</b>The pool is the kinder option today. <button class="link" data-a="swapTo" data-k="pool">Swap to pool</button></div>`;
  if (S.rest) h += `<p class="small muted" style="margin:0 0 8px">Feeling good isn’t a reason to skip a rest day. Rushing is the most common cause of a flare. Daily basics, evening stretches and ice still count.</p>`;
  if (key === 'run') h += `<p class="small" style="margin:0 0 8px"><span class="badge">Stage ${State.plan.runStage}</span> <span class="muted">${esc(STAGES[State.plan.runStage].label)}</span></p>`;
  const items = resolveItems(ph, key, date);
  if (items.length) {
    h += '<div class="list">';
    items.forEach((o) => { h += exRowHTML(o, s, 's_' + key); });
    h += '</div>';
  }
  if (!S.rest || Object.keys(s.done || {}).length) {
    if (s.fin) {
      const z = zoneOf(s.pain ?? 0, ph);
      h += `<div class="row2" style="margin-top:12px;align-items:center"><div><span class="badge ${['g', 'a', 'r'][z]}">${ic('check').replace('<svg', '<svg style="width:13px;height:13px"')} Done · max pain ${s.pain}/10</span> <span class="tiny muted">${['No swelling', 'A little swelling', 'More swelling'][s.sw || 0]}</span></div><button class="btn sm" data-a="finish" style="flex:none">Edit</button></div>`;
    } else {
      const n = Object.keys(s.done || {}).length;
      h += `<button class="btn ${n ? 'gold' : ''} block" style="margin-top:12px" data-a="finish"${n ? '' : ' disabled'}>${n ? `Finish session (${n} done)` : 'Tick exercises as you go'}</button>`;
    }
  }
  return h + '</div>';
}
function exRowHTML(o, s, ctx) {
  const base = EX[o.id];
  if (o.locked && !o.alt) {
    return `<div class="ex locked"><span class="chk lock">${ic('lock')}</span><button class="t" data-a="ex" data-id="${o.id}" data-ctx="${ctx}" data-view="1"><b>${esc(base.name)}</b><span>${esc(LOCKWHY[o.locked])}. Skip for now.</span></button><button class="th" data-a="ex" data-id="${o.id}" data-ctx="${ctx}" data-view="1" aria-label="View ${esc(base.name)}">${thumb(base.fig)}</button></div>`;
  }
  const id = o.locked ? o.alt : o.id; const ex = EX[id];
  const done = s.done && s.done[id];
  const dose = o.locked ? ex.dose : doseFor(o, ex);
  const sub = `${esc(dose)}${o.optional ? ' · optional' : ''}${o.locked ? ` · <span class="alt">${ic('lock').replace('<svg', '<svg style="width:11px;height:11px;vertical-align:-1px"')} instead of ${esc(base.name)}</span>` : ''}`;
  return `<div class="ex${done ? ' done' : ''}"><button class="chk${done ? ' on' : ''}" data-a="tick" data-id="${id}" data-ctx="${ctx}" aria-label="${done ? 'Untick' : 'Tick'} ${esc(ex.name)}">${ic('check')}</button><button class="t" data-a="ex" data-id="${id}" data-ctx="${ctx}" data-o="${esc(JSON.stringify({ dose: o.dose, mins: o.mins, note: o.note }))}"><b>${esc(ex.name)}${s.hurt && s.hurt[id] ? '<i class="hurt" title="Flagged as painful"></i>' : ''}</b><span>${sub}</span></button><button class="th" data-a="ex" data-id="${id}" data-ctx="${ctx}" aria-label="Open ${esc(ex.name)}">${thumb(ex.fig)}</button></div>`;
}
function quadHTML(date) {
  const ph = phaseOn(date), tgt = QUAD_TARGET[ph]; if (!tgt) return '';
  const q = sec(date, 'q'); const n = (q && q.n) || 0;
  const dots = Array.from({ length: Math.max(tgt, n) }, (_, i) => `<i style="width:10px;height:10px;border-radius:50%;display:inline-block;background:${i < n ? 'var(--gold)' : 'rgba(255,255,255,.12)'}"></i>`).join(' ');
  return `<div class="card tight"><div class="ch" style="margin:0"><div class="grow"><b>Daily basics</b><div class="tiny muted">Each round: 10 quad sets, then 10 heel slides in your pain-free range. ${tgt === 3 ? '2–3' : '1–2'} rounds a day.</div><div style="margin-top:6px">${dots} <span class="tiny muted">${n} today</span></div></div>
    <button class="btn sm" data-a="ex" data-id="quadset" data-ctx="q">${ic('timer')}Timer</button><button class="btn sm gold" data-a="quad" aria-label="Add a quad set round">${ic('plus')}</button></div></div>`;
}
function eveningHTML(date) {
  const ph = phaseOn(date), e = sec(date, 'e') || {}, list = EVENING[ph];
  let iceN = 0; Object.keys(State.days).forEach((d) => { const x = sec(d, 'e'); if (x && x.ice > 0) iceN++; });
  const tgt = State.plan.iceTarget;
  let h = `<div class="card"><div class="ch"><div class="sicon b">${ic('moon')}</div><div class="grow"><h2>Evening: stretch, then ice</h2><small>Hips, outer thigh (ITB/TFL), hamstrings and calves</small></div></div><div class="list">`;
  list.forEach((id) => { h += exRowHTML({ id, optional: EX[id].optional }, { done: e.st || {}, hurt: e.hurt || {} }, 'e'); });
  h += `</div><div class="note b" style="margin-top:12px"><b>Ice · 20 on, 20 off</b><div style="display:flex;align-items:center;gap:10px;margin-top:6px"><div style="flex:1"><span class="num" style="font-size:20px;font-weight:750">${e.ice || 0}</span> <span class="small muted">round${(e.ice || 0) === 1 ? '' : 's'} tonight</span></div><button class="btn sm" data-a="iceAdj" data-n="-1" aria-label="One less round">${ic('minus')}</button><button class="btn sm" data-a="iceAdj" data-n="1" aria-label="One more round">${ic('plus')}</button><button class="btn sm gold" data-a="ex" data-id="ice" data-ctx="e">${ic('snow')}Timer</button></div>
    <div style="margin-top:10px" class="tiny muted">Ice evenings so far: ${iceN} of ${tgt}. Change the target in Settings.</div><div class="prog" style="margin-top:6px"><i style="width:${Math.min(100, (iceN / tgt) * 100).toFixed(0)}%"></i></div></div>`;
  h += `<div class="q" style="margin-top:14px">Anti-inflammatory tablets today?<small>For example naproxen or ibuprofen. Never take one before a session, because it hides the pain signal.</small></div><div class="seg"><button class="${!e.nsaid ? 'on' : ''}" data-a="nsaid" data-v="0">No</button><button class="${e.nsaid ? 'on' : ''}" data-a="nsaid" data-v="1">Yes</button></div>`;
  return h + '</div>';
}
function iceStreak(date) { let n = 0; let d = date; const e0 = sec(d, 'e'); if (!(e0 && e0.ice > 0)) d = addDays(d, -1); while (true) { const e = sec(d, 'e'); if (e && e.ice > 0) { n++; d = addDays(d, -1); } else break; } return n; }
function greenStreak(date) { let n = 0; let d = date; if (!sec(d, 'm')) d = addDays(d, -1); while (true) { const r = readiness(d); if (r && r.lvl === 'g') { n++; d = addDays(d, -1); } else break; } return n; }
function weekSessions(date) { const mon = addDays(date, -dowIdx(date)); let n = 0; for (let i = 0; i < 7; i++) { const d = addDays(mon, i); const day = State.days[d]; if (!day) continue; Object.keys(day).forEach((k) => { if (k.startsWith('s_')) { const s = sec(d, k); if (s && s.fin) n++; } }); } return n; }
function statsHTML(date) {
  const plannedWeek = WEEK[phaseOn(date)].filter((k) => !SESS[phaseOn(date)][k].rest).length;
  return `<div class="grid2"><div class="stat"><b class="num">${greenStreak(date)}</b><span>green mornings in a row</span></div><div class="stat"><b class="num">${iceStreak(date)}</b><span>ice evenings in a row</span></div><div class="stat"><b class="num">${weekSessions(date)}<span class="muted" style="font-size:14px"> / ${plannedWeek}</span></b><span>sessions this week</span></div><div class="stat"><b class="num">${Math.max(0, diffDays(State.plan.start, todayKey()) + 1)}</b><span>days since the reset</span></div></div>`;
}

/* ===== Plan ===== */
function viewPlan() {
  const P = State.plan, today = todayKey();
  const sel = UI.planPh || P.phase, PH = PHASES[sel], cur = sel === P.phase;
  let h = '<div class="steps">';
  [1, 2, 3, 4].forEach((n) => { h += `<button class="${n === sel ? 'cur' : ''}${n < P.phase ? ' past' : ''}" data-a="planPh" data-n="${n}"><b>${n}</b><span>${esc(PHASES[n].name)}</span></button>`; });
  h += '</div>';
  const wk = Math.max(1, Math.floor(diffDays(P.phaseStart, today) / 7) + 1);
  h += `<div class="card"><div class="ch"><div class="grow"><h2>Phase ${sel}: ${esc(PH.title)}</h2><small>${cur ? `You’re here · week ${wk} of about ${PH.weeks} · started ${esc(fmtDate(P.phaseStart))}` : sel < P.phase ? 'Done' : `About ${PH.weeks} weeks · criteria-based, not calendar-based`}</small></div>${cur ? '<span class="badge">Current</span>' : ''}</div><ul class="small" style="margin:0;padding-left:18px">${PH.goals.map((g) => `<li>${esc(tx(g))}</li>`).join('')}</ul></div>`;
  const z = PH.pain;
  h += `<div class="card"><h3>Pain rules in this phase</h3><div class="tl" role="img" aria-label="Green 0 to ${z.g}, amber ${z.g + 1} to ${z.a}, red ${z.a + 1} to 10"><div style="flex:${z.g + 1};background:var(--green);color:#06210F">0–${z.g} go</div><div style="flex:${z.a - z.g};background:var(--amber);color:#2A1700">${z.g + 1}–${z.a}</div><div style="flex:${10 - z.a};background:var(--red);color:#2B0606">${z.a + 1}+ stop</div></div><p class="tiny muted" style="margin:6px 0 0">Amber means ease off: smaller range, less load or fewer reps.</p><p class="small" style="margin-top:10px">${esc(PH.rule)}</p><p class="small muted">Swelling is a stop sign. If the knee looks puffier, feels hot, or won’t fully straighten next morning, repeat the last comfortable session instead of progressing.</p></div>`;
  if (cur) {
    const g = gateStatus(sel, today);
    h += `<div class="card"><div class="ch"><div class="grow"><h2>${sel < 4 ? `Ready for Phase ${sel + 1}?` : 'Return-to-sport checklist'}</h2><small>${g.met} of ${g.items.length} met${sel < 4 ? ` · ${g.timeOk ? 'time done' : `day ${g.daysIn} of about ${g.needDays}`}` : ''}</small></div></div><div class="gate"><ul>${g.items.map((i) => gateLi(i)).join('')}</ul></div>`;
    if (sel < 4) {
      if (g.all && g.timeOk) h += `<button class="btn gold block" style="margin-top:10px" data-a="movePhase">Move to Phase ${sel + 1}</button>`;
      else h += `<p class="tiny muted" style="margin:10px 0 6px">${g.all ? 'Criteria met early. Check with your physio before moving on.' : 'Progress by criteria, not the calendar. Dotted circles fill in from your logs.'}</p><button class="btn block sm" data-a="movePhase" data-early="1">Move on early (physio cleared)</button>`;
    }
    h += '</div>';
    if (sel <= 2) {
      const sg = slGate(today);
      h += `<div class="card"><div class="ch"><div class="sicon">${ic(sg.open ? 'check' : 'lock')}</div><div class="grow"><h2>Single-leg work: ${sg.open ? 'unlocked' : 'locked'}</h2><small>Conservative rule: no single-leg loading until the pain settles</small></div></div>${sg.physio ? '<p class="small">Unlocked because your physio cleared it.</p>' : `<div class="gate"><ul>${sg.items.map((i) => gateLi(i)).join('')}</ul></div>`}
        <p class="tiny muted" style="margin-top:8px">Until this unlocks, Phase 2 swaps step-ups, split squats, single-leg bridges and single-leg calf raises for their two-leg versions.</p><button class="btn sm block" data-a="slClear">${P.slClear ? 'Remove physio clearance' : 'My physio has cleared single-leg work'}</button></div>`;
    }
    if (sel === 3) h += `<div class="card"><div class="ch"><div class="sicon">${ic(landOpen(today) ? 'check' : 'lock')}</div><div class="grow"><h2>Landing drills: ${landOpen(today) ? 'unlocked' : 'locked'}</h2><small>Late Phase 3 only. Daily life comfortable, swelling settled, physio agrees.</small></div></div><button class="btn sm block" data-a="landClear">${P.landClear ? 'Remove physio OK' : 'My physio has OK’d landing drills'}</button></div>`;
  }
  if (sel === 4 || (cur && sel === 4)) h += runCardHTML(cur);
  const pat = WEEK[sel];
  h += `<div class="card"><h3>Weekly pattern</h3><div class="wk">${pat.map((k, i) => `<div${cur && i === dowIdx(today) ? ' class="today"' : ''}><b>${DOW[i]}</b>${ic(ICONS_FOR[k] || 'dumbbell')}${esc(SESS[sel][k].name.replace('Rest day', 'Rest').replace('Home activation', 'Home').replace('Pool session', 'Pool').replace('Gym: light, small range', 'Gym').replace('Longer easy cardio', 'Cardio').replace('Balance and landing', 'Balance').replace('Strength + landing', 'Strength'))}</div>`).join('')}</div><p class="tiny muted" style="margin-top:8px">Every evening: stretch, then ice. Swap any day to fit life, but keep the rest days.</p></div>`;
  const ids = []; Object.values(SESS[sel]).forEach((s) => s.items.forEach((it) => { const id = typeof it === 'string' ? it : it.id; if (!ids.includes(id)) ids.push(id); })); EVENING[sel].forEach((id) => { if (!ids.includes(id)) ids.push(id); }); if (!ids.includes('ice')) ids.push('ice');
  h += `<div class="card"><h3>Exercise library: Phase ${sel}</h3><div class="lib">${ids.map((id) => `<button data-a="ex" data-id="${id}" data-view="1">${thumb(EX[id].fig)}<b>${esc(EX[id].name)}</b><span>${esc(EX[id].dose)}</span></button>`).join('')}</div></div>`;
  return `<div class="view">${h}</div>`;
}
function gateLi(i) {
  const tick = i.ok ? `<span class="gi ok">${ic('check')}</span>` : `<span class="gi${i.manual ? '' : ' auto'}"></span>`;
  const inner = `${tick}<span style="flex:1">${esc(tx(i.label))}${i.why ? `<span class="why">${esc(i.why)}</span>` : i.manual ? '<span class="why">Tap when it’s true</span>' : ''}</span>`;
  return i.manual ? `<li><button style="display:flex;gap:10px;align-items:flex-start;text-align:left;width:100%" data-a="check" data-id="${i.id}">${inner}</button></li>` : `<li>${inner}</li>`;
}
function runCardHTML(cur) {
  const n = State.plan.runStage;
  let good = 0; sessionsDone(todayKey(), 60).forEach((s) => { if (s.key === 'run' && s.stage === n && s.pain <= 3 && !s.sw) good++; });
  return `<div class="card"><div class="ch"><div class="sicon">${ic('run')}</div><div class="grow"><h2>Walk-run: stage ${n} of 9</h2><small>${esc(STAGES[n].label)}</small></div></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Stage</th><th>Main set</th></tr></thead><tbody>${STAGES.slice(1).map((s, i) => `<tr${i + 1 === n ? ' style="color:var(--gold2);font-weight:700"' : ''}><td>${i + 1}</td><td>${esc(s.label)}</td></tr>`).join('')}</tbody></table></div>
    <p class="small" style="margin-top:10px">Good sessions at this stage: <b>${good}</b> of 2. Move up only if pain stayed at 3–4/10 or less, settled within 24 h, and there was no extra swelling. A flare means drop back two stages.</p>
    ${cur ? `<div class="row2"><button class="btn sm" data-a="stage" data-n="-2">Flare: back 2</button><button class="btn sm gold" data-a="stage" data-n="1"${n >= 9 || good < 2 ? ' disabled' : ''}>Move up a stage</button></div>` : ''}</div>`;
}

/* ===== Log ===== */
function viewLog() {
  const today = todayKey(); let logged = 0, sessions = 0;
  Object.keys(State.days).forEach((d) => { if (sec(d, 'm')) logged++; Object.keys(State.days[d]).forEach((k) => { if (k.startsWith('s_') && sec(d, k) && sec(d, k).fin) sessions++; }); });
  let h = `<div class="grid2"><div class="stat"><b class="num">${logged}</b><span>morning checks</span></div><div class="stat"><b class="num">${sessions}</b><span>sessions finished</span></div></div>`;
  h += `<div class="card"><div class="ch"><div class="grow"><h2>Pain over 4 weeks</h2><small>Tap a day for details</small></div><button class="btn sm" data-a="tableView">${UI.tableView ? 'Chart' : 'Table'}</button></div><div id="chartBox" class="chart"></div>
    <div class="legend"><span><i style="background:var(--s1)"></i>Morning resting pain</span><span><i style="background:var(--s2)"></i>Max pain in a session</span></div></div>`;
  h += calHTML(today);
  const w = lastSec('w'), g = lastSec('g');
  h += `<div class="card"><h3>Check-ins</h3><div class="list">
    <button class="ex" data-a="weekly"><span class="sicon">${ic('walk')}</span><span class="t"><b>Fortnightly check-in</b><span>${w ? `Last: ${esc(fmtDate(w.date))}${w.v.walk ? ` · walking ${w.v.walk} min` : ''}${w.v.kg ? ` · ${w.v.kg} kg` : ''}` : 'Walking distance, straightening, one thing easier, weight'}</span></span>${ic('chevR')}</button>
    <button class="ex" data-a="gait"><span class="sicon">${ic('video')}</span><span class="t"><b>Gait check</b><span>${g ? `Last: ${esc(fmtDate(g.date))} · ${Object.keys(g.v.f || {}).length} of ${GAIT.length} look right` : 'Ask someone to film you walking, then check 7 things'}</span></span>${ic('chevR')}</button>
  </div></div>`;
  h += `<div class="card"><h3>Last 14 days</h3>${histHTML(today)}</div>`;
  h += `<div class="card"><div class="ch"><div class="sicon">${ic('copy')}</div><div class="grow"><h2>Physio summary</h2><small>Your logs as plain text to copy into a message or take to an appointment</small></div></div><button class="btn block" data-a="summary">View and copy</button></div>`;
  h += `<div class="card"><div class="ch"><div class="sicon">${ic('cloud')}</div><div class="grow"><h2>Your data</h2><small>${esc(Cloud.label())}</small></div></div><div class="row2"><button class="btn sm" data-a="exportData">${ic('down')}Back up</button><button class="btn sm" data-a="importData">${ic('up')}Restore</button></div></div>`;
  return `<div class="view">${h}</div>`;
}
function lastSec(k) { const ds = Object.keys(State.days).sort().reverse(); for (const d of ds) { const v = sec(d, k); if (v) return { date: d, v }; } return null; }
function calHTML(today) {
  const end = addDays(today, 6 - dowIdx(today)); const start = addDays(end, -27);
  let h = `<div class="card"><h3>Calendar</h3><div class="cal">${DOW.map((d) => `<div class="h">${d[0]}</div>`).join('')}`;
  for (let i = 0; i < 28; i++) {
    const d = addDays(start, i), day = State.days[d] || {};
    let ses = false; Object.keys(day).forEach((k) => { if (k.startsWith('s_') && sec(d, k) && sec(d, k).fin) ses = true; });
    const e = sec(d, 'e'), m = sec(d, 'm');
    const dots = [ses ? '<i style="background:var(--gold)"></i>' : '', e && e.ice ? '<i style="background:var(--blue)"></i>' : '', m && m.sw ? `<i style="background:${m.sw === 2 ? 'var(--red)' : 'var(--amber)'}"></i>` : ''].join('');
    h += `<button class="c${d === today ? ' today' : ''}${d > today ? ' fut' : ''}" data-a="goDay" data-d="${d}"${d > today ? ' disabled' : ''} aria-label="${esc(fmtDate(d, true))}"><span>${pkey(d).getDate()}</span><span class="dots">${dots}</span></button>`;
  }
  return h + `</div><div class="legend"><span><i style="background:var(--gold)"></i>Session done</span><span><i style="background:var(--blue)"></i>Iced</span><span><i style="background:var(--amber)"></i>Some swelling</span><span><i style="background:var(--red)"></i>More swelling</span></div></div>`;
}
function histHTML(today) {
  let h = '', any = false;
  for (let i = 0; i < 14; i++) {
    const d = addDays(today, -i), m = sec(d, 'm'), e = sec(d, 'e'), day = State.days[d] || {};
    const ss = Object.keys(day).filter((k) => k.startsWith('s_')).map((k) => [k.slice(2), sec(d, k)]).filter(([, v]) => v && (v.fin || Object.keys(v.done || {}).length));
    if (!m && !e && !ss.length) continue;
    any = true;
    const ph = phaseOn(d);
    const bits = [];
    if (m) bits.push(`Morning ${m.pain}/10${m.sw ? (m.sw === 2 ? ', more swelling' : ', a little swelling') : ''}${m.st === 0 ? ', not fully straight' : ''}${m.mech ? ', locking/giving way' : ''}`);
    ss.forEach(([k, v]) => { const nm = (SESS[ph][k] || { name: k }).name; const hurt = Object.keys(v.hurt || {}).map((x) => EX[x] ? EX[x].name : x); bits.push(`${nm}: ${Object.keys(v.done || {}).length} done${v.fin ? `, max ${v.pain}/10` : ''}${hurt.length ? `, sore on ${hurt.join(', ')}` : ''}${v.note ? `, “${v.note}”` : ''}`); });
    if (e) { const x = []; if (e.ice) x.push(`iced ×${e.ice}`); if (e.nsaid) x.push('anti-inflammatory'); if (x.length) bits.push(x.join(', ')); }
    h += `<button class="hist" style="display:block;width:100%;text-align:left" data-a="goDay" data-d="${d}"><div class="hd"><span>${esc(fmtDate(d, true))}</span>${m ? `<span class="badge ${['g', 'a', 'r'][readiness(d) ? ['g', 'a', 'r'].indexOf(readiness(d).lvl) : 0]}">${readiness(d).lvl === 'g' ? 'Green' : readiness(d).lvl === 'a' ? 'Amber' : 'Red'}</span>` : ''}</div><div class="bd">${esc(bits.join(' · '))}</div></button>`;
  }
  return any ? h : '<p class="empty">Nothing logged yet. Start with today’s morning check.</p>';
}
function mountChart() {
  const box = $('#chartBox'); if (!box) return;
  const today = todayKey(); const days = []; for (let i = 27; i >= 0; i--) days.push(addDays(today, -i));
  const rows = days.map((d) => { const m = sec(d, 'm'); const ss = sessionsDone(d, 1).filter((s) => s.date === d); const sp = ss.length ? Math.max(...ss.map((s) => s.pain ?? 0)) : null; return { d, mp: m ? m.pain : null, sp, sw: m ? m.sw : null }; });
  if (UI.tableView) {
    const r2 = rows.filter((r) => r.mp != null || r.sp != null).reverse();
    box.innerHTML = r2.length ? `<table class="tbl"><thead><tr><th>Day</th><th>Morning</th><th>Session max</th><th>Swelling</th></tr></thead><tbody>${r2.map((r) => `<tr><td>${esc(fmtDate(r.d, true))}</td><td class="num">${r.mp ?? '–'}</td><td class="num">${r.sp ?? '–'}</td><td>${r.sw == null ? '–' : ['None', 'A little', 'More'][r.sw]}</td></tr>`).join('')}</tbody></table>` : '<p class="empty">No entries yet.</p>';
    return;
  }
  const W = 340, H = 176, x0 = 24, x1 = 334, y0 = 12, y1 = 148;
  const X = (i) => x0 + (i * (x1 - x0)) / 27, Y = (v) => y1 - (v / 10) * (y1 - y0);
  const z = zones(State.plan.phase);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pain over the last 28 days">`;
  s += `<rect x="${x0}" y="${Y(10)}" width="${x1 - x0}" height="${Y(z.a) - Y(10)}" fill="rgba(239,91,91,.07)"/><rect x="${x0}" y="${Y(z.a)}" width="${x1 - x0}" height="${Y(z.g) - Y(z.a)}" fill="rgba(240,162,59,.07)"/><rect x="${x0}" y="${Y(z.g)}" width="${x1 - x0}" height="${Y(0) - Y(z.g)}" fill="rgba(60,192,138,.07)"/>`;
  [0, 2, 4, 6, 8, 10].forEach((v) => { s += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(148,163,184,.12)" stroke-width="1"/><text x="${x0 - 6}" y="${Y(v) + 3.5}" text-anchor="end" font-size="10" fill="#7586A0">${v}</text>`; });
  [0, 7, 14, 21, 27].forEach((i) => { s += `<text x="${X(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === 27 ? 'end' : 'middle'}" font-size="10" fill="#7586A0">${esc(fmtDate(days[i]))}</text>`; });
  let path = '', open = false;
  rows.forEach((r, i) => { if (r.mp == null) { open = false; return; } path += `${open ? 'L' : 'M'}${X(i).toFixed(1)},${Y(r.mp).toFixed(1)} `; open = true; });
  if (path) s += `<path d="${path}" fill="none" stroke="#3987E5" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  rows.forEach((r, i) => { if (r.mp != null) s += `<circle cx="${X(i).toFixed(1)}" cy="${Y(r.mp).toFixed(1)}" r="4" fill="#3987E5" stroke="#13233F" stroke-width="2"/>`; });
  rows.forEach((r, i) => { if (r.sp != null) s += `<circle cx="${(X(i) + 3).toFixed(1)}" cy="${Y(r.sp).toFixed(1)}" r="4.5" fill="#BF8A22" stroke="#13233F" stroke-width="2"/>`; });
  s += `<line id="xh" x1="0" x2="0" y1="${y0}" y2="${y1}" stroke="rgba(213,222,234,.4)" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`;
  s += `<rect x="${x0 - 6}" y="0" width="${x1 - x0 + 12}" height="${y1}" fill="transparent" id="hit"/></svg><div class="tip" id="ctip" hidden></div>`;
  box.innerHTML = s;
  if (!rows.some((r) => r.mp != null || r.sp != null)) box.insertAdjacentHTML('beforeend', '<p class="empty" style="margin-top:-6px">Your morning checks and sessions will appear here.</p>');
  const svg = $('svg', box), tip = $('#ctip', box), xh = $('#xh', box);
  const show = (ev) => {
    const r = svg.getBoundingClientRect(); const px = ((ev.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(27, Math.round(((px - x0) / (x1 - x0)) * 27))); const row = rows[i];
    xh.setAttribute('x1', X(i)); xh.setAttribute('x2', X(i)); xh.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.innerHTML = `<b>${esc(fmtDate(row.d, true))}</b>Morning: ${row.mp ?? '–'}/10 · Session: ${row.sp ?? '–'}/10${row.sw ? ` · ${row.sw === 2 ? 'more swelling' : 'a little swelling'}` : ''}`;
    const left = (X(i) / W) * r.width; tip.style.left = Math.max(70, Math.min(r.width - 70, left)) + 'px'; tip.style.top = '6px';
  };
  const hide = () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); };
  svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show); svg.addEventListener('pointerleave', hide);
}

/* ===== Guide ===== */
function viewGuide() {
  const ph = State.plan.phase, z = PHASES[ph].pain;
  const acc = (title, body, open) => `<details class="acc"${open ? ' open' : ''}><summary>${title}</summary><div class="body">${body}</div></details>`;
  let h = `<div class="card"><h3>Every session</h3>
    <div class="tl" style="margin:6px 0 10px"><div style="flex:${z.g + 1};background:var(--green);color:#06210F">0–${z.g}</div><div style="flex:${z.a - z.g};background:var(--amber);color:#2A1700">${z.g + 1}–${z.a}</div><div style="flex:${10 - z.a};background:var(--red);color:#2B0606">${z.a + 1}+</div></div>
    <ul class="small" style="margin:0;padding-left:18px"><li>${esc(PHASES[ph].rule)}</li><li>Pain should settle within about 30 min, and the next morning shouldn’t be clearly worse for more than an hour.</li><li>Swelling is a stop sign: repeat the last comfortable session.</li><li>Sharp inner-knee pain, catching or a stuck feeling: stop that movement. Never force the knee to free it.</li><li>Change one thing at a time (range, load or reps), never two in the same week.</li></ul></div>`;
  h += `<div class="card" style="border-color:rgba(239,91,91,.35)"><h3 style="color:#FF9C9C">Red flags: contact your GP or physio</h3><ul class="small" style="margin:0;padding-left:18px"><li>The knee locks and you can’t unlock it yourself.</li><li>Repeated giving way, or buckling so you nearly fall.</li><li>Rapid or large swelling, especially after a twist.</li><li>Pain clearly worse week on week despite easing off, or night pain that regularly wakes you.</li><li>Fever, spreading redness, or feeling generally unwell.</li><li>Calf swelling and heat with unexplained breathlessness: get help urgently (possible clot).</li></ul></div>`;
  let b = '';
  b += acc('How this program works', `<ul>
    <li><b>Four phases:</b> settle (1), strength (2), power and balance (3), return to running (4). Move on when you meet the criteria in Plan, not just when the weeks run out.</li>
    <li><b>Pain rules steer everything.</b> Phase 1 uses a stricter scale (0–2 is green). Later phases allow 0–3, and a familiar ache up to 4–5 if it settles within 30 minutes and the next morning is no worse.</li>
    <li><b>The morning check sets the day.</b> An amber morning scales the session back. A red morning suggests a settle day instead.</li>
    <li><b>Single-leg loading stays locked</b> until 5 of 7 mornings are at 2/10 or less with no swelling, your last 3 sessions are at 3/10 or less, and a 30-second single-leg stand is pain-free. A physio can override this.</li>
    <li><b>Lying-down, isometric and small-range work comes first.</b> Two rest days and pool days are built into every week. Swap any day to fit your life, but keep the rest days.</li>
    <li><b>Week 6 review point.</b> If you’re not clearly better, ask your GP about a specialist opinion rather than waiting months.</li></ul>`);
  b += acc('About meniscus tears', `<ul>
    <li>The meniscus is a C-shaped cartilage cushion inside the knee. Tears come from wear (degenerative), an injury (traumatic), or a mix of both.</li>
    <li>For degenerative tears in middle-aged adults, trials such as ESCAPE, FIDELITY, METEOR and Kise 2016 found exercise therapy did about as well as keyhole trimming. That’s why guidelines start with rehab.</li>
    <li>Tears from an injury, especially in younger people, are different. Expert consensus favours saving the meniscus and doing any repair early. That’s what the week-6 review point is for.</li>
    <li>This program doesn’t cover ligament injuries, a knee that is locked, or recovery after surgery. Get the diagnosis confirmed first.</li></ul>`);
  b += acc('Pool guide', `<ul><li>Waist-deep water takes about half your weight off the knee. Chest-deep takes off about two-thirds, and more as you go deeper. Go deeper on sore days.</li><li>Water walking (forward, backward, sideways), leg swings, mini squats, calf raises, then an easy swim.</li><li>Freestyle or backstroke only. No breaststroke kick, no hard push-offs or tumble turns, and use the steps.</li><li>Good on amber days and between gym days.</li></ul>`);
  b += acc('Gait check', `<p>Ask someone to film you walking, side-on and front-on, 10–15 seconds each, without telling you when. You walk differently when you know. Then tick the checklist in Log → Gait check. Retest every two weeks and compare.</p>`);
  b += acc('Medication and supplements: what to know', `<ul>
    <li><b>Anti-inflammatory tablets</b> (such as naproxen or ibuprofen): occasional use only, with food, and never before a session, because they hide the pain signal this program steers by. Check with a doctor or pharmacist first if you have stomach, kidney or heart problems. Paracetamol is the usual first choice when you need pain relief without an anti-inflammatory effect.</li>
    <li><b>Turmeric and curcumin supplements:</b> Australia’s TGA has warned of rare liver injury, more likely with high doses and “enhanced absorption” products. Avoid them if you’ve had liver problems.</li>
    <li><b>Ice</b> eases pain and irritability. There’s no good evidence that it speeds healing. The case against icing is mainly about the first few days after an injury.</li></ul>`);
  b += acc('Weight and load', `<p>In a 2005 study (Messier) of overweight older adults with knee arthritis, each unit of weight lost cut the knee load per walking step by about four units. It adds up over thousands of steps a day. You can log weight in the fortnightly check-in.</p>`);
  b += acc('Things to avoid early', `<ul><li>Deep loaded bending: full squats, deep lunges, long kneeling, low chairs you have to haul yourself out of.</li><li>Pivoting, twisting and cutting, including getting out of a car with a planted foot.</li><li>Running, jumping and hopping until the right phase.</li><li>Forcing the heel to the buttock, or cranking the knee if it catches.</li><li>Long downhill walks or rough tracks early on.</li><li>Breaststroke kick. Single-leg loading until it unlocks.</li></ul>`);
  b += acc('Sources', `<ul class="small">
    <li>Noorduyn et al. ESCAPE trial 5-year follow-up. JAMA Netw Open 2022. van de Graaf et al. ESCAPE. JAMA 2018.</li>
    <li>Kise et al. Exercise therapy versus arthroscopic partial meniscectomy. BMJ 2016.</li>
    <li>Katz et al. METEOR trial. NEJM 2013, and 5-year outcomes 2020.</li>
    <li>Sihvonen et al. FIDELITY sham-surgery trial. NEJM 2013, with 2- and 5-year follow-ups.</li>
    <li>Beaufils et al. 2016 ESSKA degenerative meniscus consensus. KSSTA 2017.</li>
    <li>ESSKA-AOSSM-AASPT formal EU-US meniscus rehabilitation consensus, 2024.</li>
    <li>Kopf et al. Management of traumatic meniscus tears: 2019 ESSKA consensus. KSSTA 2020.</li>
    <li>Kurzweil et al. Repair of horizontal meniscus tears: a systematic review. Arthroscopy 2014.</li>
    <li>TGA safety advisory: medicines containing turmeric or curcumin, risk of liver injury (2023).</li>
    <li>Messier et al. Weight loss reduces knee-joint loads. Arthritis &amp; Rheumatism 2005.</li>
    <li>Falvey et al. Iliotibial band syndrome: treatment evidence. Scand J Med Sci Sports 2010.</li>
    <li>Dubois &amp; Esculier. Soft-tissue injuries simply need PEACE and LOVE. BJSM 2020.</li>
    <li>Becker. Aquatic therapy: scientific foundations and clinical applications. PM&amp;R 2009.</li>
    <li>NHS patient guidance on degenerative and acute meniscal tears; GLA:D Australia.</li></ul>`);
  b += acc('Disclaimer', `<p>This app is general education and a personal log. It isn’t medical advice, diagnosis or treatment, and it doesn’t replace an assessment by a GP or physiotherapist. Have a physio review the program before you start, and stop and seek care if a red flag appears.</p>`);
  h += `<div class="card">${b}</div>`;
  h += `<p class="tiny dim" style="text-align:center;margin:4px 0 0">Your entries stay in this browser. Nothing is sent anywhere.</p>`;
  return `<div class="view">${h}</div>`;
}

/* ===== Sheets ===== */
function openSheet(o) {
  closeSheet(true);
  const scrim = document.createElement('div'); scrim.className = 'scrim'; if (!o.noClose) scrim.dataset.a = 'closeSheet';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', o.title);
  sh.innerHTML = `<div class="grab"></div><div class="sh"><h2>${esc(o.title)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</h2>${o.noClose ? '' : `<button class="close" data-a="closeSheet" aria-label="Close">${ic('x')}</button>`}</div><div class="sb" id="sb"></div>${o.foot !== false ? '<div class="sf" id="sf"></div>' : ''}`;
  document.body.append(scrim, sh);
  UI.sheet = Object.assign({ el: sh, scrim }, o);
  o.render();
  requestAnimationFrame(() => { scrim.classList.add('on'); sh.classList.add('on'); });
  document.body.style.overflow = 'hidden';
}
function closeSheet(instant) {
  const s = UI.sheet; if (!s) return;
  if (UI.stopFig) { UI.stopFig(); UI.stopFig = null; }
  UI.sheet = null; document.body.style.overflow = '';
  if (instant) { s.el.remove(); s.scrim.remove(); }
  else { s.el.classList.remove('on'); s.scrim.classList.remove('on'); setTimeout(() => { s.el.remove(); s.scrim.remove(); }, 260); }
  T.paint();
}
function painPicker(name, val, ph) {
  return `<div class="pain" role="radiogroup" aria-label="Pain 0 to 10">${Array.from({ length: 11 }, (_, i) => `<button role="radio" aria-checked="${val === i}" class="z${zoneOf(i, ph)}${val === i ? ' on' : ''}" data-a="pick" data-f="${name}" data-v="${i}">${i}</button>`).join('')}</div><div class="zlab"><span>No pain</span><span>Worst imaginable</span></div>`;
}
const seg = (name, val, opts, cls = '') => `<div class="seg ${cls}">${opts.map(([v, l, c]) => `<button class="${val === v ? 'on ' + (c || '') : ''}" data-a="pick" data-f="${name}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;

/* Exercise sheet */
function openExercise(id, ctx, view, o = {}) {
  const ex = EX[id]; const date = UI.date; const ph = phaseOn(date);
  const k = `${ctx || 'lib'}:${id}`;
  openSheet({ title: ex.name, sub: [ex.sub, view ? 'Library' : null].filter(Boolean).join(' · '), k,
    render() {
      const sb = $('#sb'), sf = $('#sf');
      const s = ctx && ctx !== 'lib' ? (ctx === 'e' ? sec(date, 'e') || {} : ctx === 'q' ? {} : sec(date, ctx) || {}) : {};
      const doneMap = ctx === 'e' ? s.st || {} : s.done || {};
      const done = !!doneMap[id];
      const setsDone = (s.sets && s.sets[id]) || 0;
      const load = s.load && s.load[id] != null ? s.load[id] : (lastLoad(id) ?? 0);
      const hurt = !!(s.hurt && s.hurt[id]);
      const dose = o.dose || ex.dose;
      let h = `<div class="figbox" id="figbox"></div>`;
      h += `<div id="tbox" data-k="${k}"></div>`;
      h += `<div class="dose"><b>${esc(dose)}</b>${ex.freq ? `<span>${esc(ex.freq)}</span>` : ''}</div>`;
      if (o.note) h += `<p class="small" style="color:var(--gold2)">${esc(o.note)}</p>`;
      const live = ctx && !view && ctx !== 'lib';
      if (live && ex.kind === 'reps' && ctx !== 'e') {
        const n = o.sets || ex.sets || 2;
        h += `<div class="q">Sets<small>Tap each set as you finish it. A rest timer starts automatically.</small></div><div class="sets">${Array.from({ length: n }, (_, i) => `<button class="setb${i < setsDone ? ' on' : ''}" data-a="set" data-n="${i + 1}" data-id="${id}">Set ${i + 1}</button>`).join('')}</div>`;
      }
      if (['hold', 'stretch', 'time', 'ice', 'run'].includes(ex.kind) || (live && ex.kind === 'reps')) {
        const label = { hold: 'Start hold timer', stretch: 'Start stretch timer', time: 'Start timer', ice: 'Start ice timer (20 on, 20 off)', run: `Start stage ${State.plan.runStage} timer`, reps: 'Start rest timer' }[ex.kind];
        h += `<button class="btn block" id="tstart" style="margin-top:12px" data-a="tgo" data-id="${id}">${ic('timer')}${label}</button>`;
      }
      if (live && ex.load) h += `<div class="q">${esc(ex.load.label)}<small>Logged with today’s session</small></div><div class="stepper"><button data-a="load" data-d="-1" data-id="${id}" aria-label="Less">−</button><output class="num">${load} ${ex.load.unit}</output><button data-a="load" data-d="1" data-id="${id}" aria-label="More">+</button></div>`;
      if (live && ctx !== 'q' && ex.kind !== 'ice') h += `<div class="q">How did it feel?</div>${seg('hurt', hurt ? 1 : 0, [[0, 'Fine'], [1, 'It hurt', 'r']], 'c')}`;
      if (ex.why) h += `<p class="small muted" style="margin-top:14px">${esc(tx(ex.why))}</p>`;
      h += `<ol class="cues">${ex.cues.map((c) => `<li>${esc(tx(c))}</li>`).join('')}</ol>`;
      if (ex.stop) h += `<div class="note r"><b>Stop if</b>${esc(tx(ex.stop))}</div>`;
      if (ex.next) h += `<div class="note"><b>Progress</b>${esc(tx(ex.next))}</div>`;
      if (ex.tip) h += `<div class="note k"><b>Physio tip</b>${esc(tx(ex.tip))}</div>`;
      if (ex.note) h += `<div class="note b"><b>Note</b>${esc(tx(ex.note))}</div>`;
      if (ex.single) h += `<div class="note"><b>Single-leg</b>${slGate(date).open ? 'Unlocked.' : 'Locked until the pain settles. The session shows the two-leg version instead.'}</div>`;
      sb.innerHTML = h;
      if (UI.stopFig) UI.stopFig();
      UI.stopFig = Fig.mount($('#figbox'), FIGS[ex.fig], { label: ex.name + ' demonstration' });
      $('#figbox').insertAdjacentHTML('beforeend', '<div class="figcap"><i></i>' + esc(tx('Your {inj} leg')) + '</div>');
      if (sf) {
        if (live && ctx !== 'q' && ex.kind !== 'ice') sf.innerHTML = `<button class="btn ${done ? '' : 'gold'} block" data-a="tick" data-id="${id}" data-ctx="${ctx}" data-close="1">${done ? 'Done ✓ (tap to undo)' : 'Mark done'}</button>`;
        else if (ctx === 'q') sf.innerHTML = `<button class="btn gold block" data-a="quad" data-close="1">Log a round (quad sets + heel slides)</button>`;
        else sf.innerHTML = `<button class="btn block" data-a="closeSheet">Close</button>`;
      }
      T.paint();
    },
    refresh() { /* keep figure animating; repaint controls only */ this.render(); },
    ctx, id, opts: o,
  });
}
function lastLoad(id) { const ds = Object.keys(State.days).sort().reverse(); for (const d of ds) { const day = State.days[d]; for (const k of Object.keys(day)) { if (!k.startsWith('s_')) continue; const s = sec(d, k); if (s && s.load && s.load[id] != null) return s.load[id]; } } return null; }

function openMorning() {
  const date = UI.date, ph = phaseOn(date);
  const cur = sec(date, 'm') || {};
  const f = { pain: cur.pain ?? null, sw: cur.sw ?? null, st: cur.st ?? null, cmp: cur.cmp ?? null, mech: cur.mech ?? null, night: cur.night ?? null };
  openSheet({ title: 'Morning check', sub: fmtDate(date, true), form: f,
    render() {
      const F = this.form;
      $('#sb').innerHTML = `<div class="q">Pain at rest right now</div>${painPicker('pain', F.pain, ph)}
        <div class="q">Swelling compared with yesterday</div>${seg('sw', F.sw, [[0, 'None', 'g'], [1, 'A little', 'a'], [2, 'More', 'r']], 'c')}
        <div class="q">Does the knee straighten fully?</div>${seg('st', F.st, [[1, 'Yes', 'g'], [0, 'Not quite', 'a']], 'c')}
        <div class="q">Compared with yesterday morning<small>The next-day rule: was yesterday’s dose right?</small></div>${seg('cmp', F.cmp, [[-1, 'Better', 'g'], [0, 'Same'], [1, 'Worse', 'a']], 'c')}
        <div class="q">Any locking or giving way since yesterday?</div>${seg('mech', F.mech, [[0, 'No', 'g'], [1, 'Yes', 'r']], 'c')}
        <div class="q">Did knee pain wake you last night?</div>${seg('night', F.night, [[0, 'No', 'g'], [1, 'Yes', 'a']], 'c')}`;
      const ok = F.pain != null && F.sw != null && F.st != null && F.cmp != null && F.mech != null && F.night != null;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="saveMorning"${ok ? '' : ' disabled'}>${ok ? 'Save' : 'Answer all six'}</button>`;
    },
  });
}
function openFinish() {
  const date = UI.date, ph = phaseOn(date), key = sessionKeyFor(date), s = sec(date, 's_' + key) || {};
  openSheet({ title: 'Finish session', sub: SESS[ph][key].name, form: { pain: s.pain ?? null, sw: s.sw ?? null, note: s.note || '' },
    render() {
      const F = this.form;
      const hurt = Object.keys(s.hurt || {}).map((x) => EX[x] && EX[x].name).filter(Boolean);
      $('#sb').innerHTML = `<div class="q">Highest pain during the session</div>${painPicker('pain', F.pain, ph)}
        <div class="q">Swelling afterwards</div>${seg('sw', F.sw, [[0, 'None', 'g'], [1, 'A little', 'a'], [2, 'More', 'r']], 'c')}
        ${hurt.length ? `<p class="small muted" style="margin-top:12px">Flagged as painful: ${esc(hurt.join(', '))}. Next time use a smaller range or the easier option.</p>` : ''}
        <div class="q">Notes <small>Optional. Anything to tell your physio?</small></div><textarea id="fnote" maxlength="400" placeholder="e.g. heel slides pinched at the end of range">${esc(F.note)}</textarea>
        ${key === 'run' ? `<p class="small muted" style="margin-top:10px">Logged at walk-run stage ${State.plan.runStage}.</p>` : ''}
        <p class="tiny dim" style="margin-top:10px">Tomorrow’s morning check finishes this log: the knee shouldn’t be clearly worse.</p>`;
      const ok = F.pain != null && F.sw != null;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="saveFinish"${ok ? '' : ' disabled'}>Save session</button>`;
    },
  });
}
function openSwap() {
  const date = UI.date, ph = phaseOn(date), cur = sessionKeyFor(date), planned = WEEK[ph][dowIdx(date)];
  openSheet({ title: 'Swap today’s session', sub: `Planned: ${SESS[ph][planned].name}`, foot: false,
    render() {
      $('#sb').innerHTML = `<div class="list">${Object.keys(SESS[ph]).filter((k, i, a) => !(k === 'restwalk' && a.includes('rest') && false)).map((k) => `<button class="ex" data-a="swapTo" data-k="${k}"><span class="sicon${k === 'pool' ? ' b' : ''}">${ic(ICONS_FOR[k] || 'dumbbell')}</span><span class="t"><b>${esc(SESS[ph][k].name)}${k === planned ? ' <span class="badge n">planned</span>' : ''}</b><span>${SESS[ph][k].rest ? 'Rest' : `About ${SESS[ph][k].mins} min`} · ${SESS[ph][k].items.length ? esc(SESS[ph][k].items.map((it) => EX[typeof it === 'string' ? it : it.id].name).slice(0, 4).join(', ')) : 'Nothing but evening stretch and ice'}</span></span>${k === cur ? ic('check') : ''}</button>`).join('')}</div><p class="tiny dim" style="margin-top:10px">Keep two rest days a week.</p>`;
    },
  });
}
function openWeekly() {
  const date = UI.date; const cur = sec(date, 'w') || {};
  openSheet({ title: 'Fortnightly check-in', sub: fmtDate(date, true), form: { walk: cur.walk ?? '', st: cur.st ?? null, easier: cur.easier || '', kg: cur.kg ?? '' },
    render() {
      const F = this.form; const first = firstWeight();
      $('#sb').innerHTML = `<p class="small muted">Progress shows up in ordinary life (stairs, the car, sleep) before it shows up in the gym.</p>
        <div class="q">How long can you walk comfortably? <small>Minutes on the flat</small></div><input type="number" inputmode="numeric" id="wWalk" min="0" max="300" value="${esc(F.walk)}" placeholder="e.g. 20">
        <div class="q">Does the knee fully straighten?</div>${seg('st', F.st, [[1, 'Yes', 'g'], [0, 'Not quite', 'a']], 'c')}
        <div class="q">One thing that’s easier than two weeks ago</div><input type="text" id="wEasier" maxlength="160" value="${esc(F.easier)}" placeholder="e.g. getting out of the car">
        <div class="q">Weight <small>Optional. Each kg lost is about 4 kg less load through the knee per walking step.</small></div><input type="number" inputmode="decimal" step="0.1" id="wKg" min="30" max="250" value="${esc(F.kg)}" placeholder="kg">
        ${first && F.kg ? `<p class="small" style="margin-top:8px">${(() => { const dlt = +(first.kg - F.kg).toFixed(1); return dlt > 0 ? `Down ${dlt} kg since ${esc(fmtDate(first.date))}. That’s roughly ${Math.round(dlt * 4)} kg less force through the knee with every step.` : `Starting point ${first.kg} kg (${esc(fmtDate(first.date))}).`; })()}</p>` : ''}`;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="saveWeekly">Save check-in</button>`;
    },
  });
}
function firstWeight() { const ds = Object.keys(State.days).sort(); for (const d of ds) { const w = sec(d, 'w'); if (w && w.kg) return { date: d, kg: +w.kg }; } return null; }
function openGait() {
  const date = UI.date; const cur = sec(date, 'g') || {};
  openSheet({ title: 'Gait check', sub: fmtDate(date, true), form: { f: Object.assign({}, cur.f || {}), note: cur.note || '' },
    render() {
      const F = this.form;
      $('#sb').innerHTML = `<p class="small">Ask someone to film you walking, side-on and front-on, without warning you. Watch it back at half speed and tick what looks right.</p>
        <div class="list" style="margin-top:6px">${GAIT.map((g) => `<button class="ex" data-a="gaitTick" data-id="${g.id}"><span class="chk${F.f[g.id] ? ' on' : ''}">${ic('check')}</span><span class="t"><b>${esc(tx(g.label))}</b></span></button>`).join('')}</div>
        <div class="q">What did you notice?</div><textarea id="gNote" maxlength="400" placeholder="e.g. shorter step on the left, knee drifts in">${esc(F.note)}</textarea>`;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="saveGait">Save gait check</button>`;
    },
  });
}
function openWelcome() {
  const P = State.plan;
  openSheet({ title: 'Welcome', sub: 'Two quick choices, then you’re set', noClose: true, form: { side: P.side, start: P.start, notes: P.notes || '' },
    render() {
      const F = this.form;
      $('#sb').innerHTML = `<p class="small">This app guides you through a staged, criteria-based rehab program for a meniscus tear managed without surgery: daily sessions, pain rules, timers, and a log you can share with your physio.</p>
        <div class="q">Which knee?</div>${seg('side', F.side, [['left', 'Left'], ['right', 'Right']])}
        <div class="q">Start date<small>Usually today. Phase 1 starts here.</small></div><input type="date" id="wStart" data-k="start" value="${esc(F.start)}">
        <div class="q">Diagnosis notes <small>Optional, e.g. what your scan report or doctor said. Stays on this device and appears in your physio summary.</small></div><textarea id="wNotes" data-k="notes" maxlength="600" placeholder="e.g. medial meniscus tear, ligaments intact">${esc(F.notes)}</textarea>
        <div class="note r" style="margin-top:14px"><b>Before you start</b>This is general education and a personal log, not medical advice. Get the diagnosis confirmed and have a physio review the program first. Stop and seek care if a red flag appears (see Guide).</div>`;
      const ok = F.side === 'left' || F.side === 'right';
      $('#sf').innerHTML = `<button class="btn gold block" data-a="saveWelcome"${ok ? '' : ' disabled'}>${ok ? 'I understand, let’s start' : 'Choose a knee to continue'}</button>`;
    },
  });
}
function openSetup() {
  const P = State.plan;
  openSheet({ title: 'Settings', sub: 'Your program and data',
    form: { side: P.side || 'left', phase: P.phase, sound: P.sound ? 1 : 0, start: P.start, phaseStart: P.phaseStart, ice: P.iceTarget, notes: P.notes || '' },
    render() {
      const F = this.form;
      $('#sb').innerHTML = `<div class="q">Which knee?</div>${seg('side', F.side, [['left', 'Left'], ['right', 'Right']])}
        <div class="q">Program start date</div><input type="date" id="setStart" data-k="start" value="${esc(F.start)}">
        <div class="q">Current phase</div>${seg('phase', F.phase, [[1, '1'], [2, '2'], [3, '3'], [4, '4']])}
        <div class="q">Phase started</div><input type="date" id="setPhStart" data-k="phaseStart" value="${esc(F.phaseStart)}">
        <div class="q">Diagnosis notes<small>Optional. Appears in your physio summary.</small></div><textarea id="setNotes" data-k="notes" maxlength="600">${esc(F.notes)}</textarea>
        <div class="q">Timer sounds</div>${seg('sound', F.sound, [[1, 'On'], [0, 'Off']])}
        <div class="q">Ice evenings target<small>Whatever your physio suggests</small></div><input type="number" id="setIce" data-k="ice" min="7" max="365" value="${esc(F.ice)}">
        <div class="q">Your data</div><p class="small muted">${esc(Cloud.label())} Back up regularly, because browsers can clear stored data.</p>
        <div class="row2"><button class="btn sm" data-a="exportData">${ic('down')}Back up</button><button class="btn sm" data-a="importData">${ic('up')}Restore</button></div>
        <div class="q">Start over</div><button class="btn sm danger block" data-a="wipe">Erase all data</button>
        <p class="tiny dim" style="margin-top:14px">Phase history: ${P.hist.map((h) => `Phase ${h.phase} from ${esc(fmtDate(h.start))}${h.why ? ` (${esc(h.why)})` : ''}`).join(' → ')}</p>`;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="saveSetup">Save settings</button>`;
    },
  });
}
function summaryText() {
  const today = todayKey(), P = State.plan, ph = P.phase;
  const ms = []; for (let i = 0; i < 14; i++) { const m = sec(addDays(today, -i), 'm'); if (m) ms.push(m); }
  const avg = (a) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '–');
  const ss = sessionsDone(today, 14);
  const byKind = {}; ss.forEach((s) => { const n = (SESS[phaseOn(s.date)][s.key] || { name: s.key }).name; byKind[n] = (byKind[n] || 0) + 1; });
  const hurt = {}; for (let i = 0; i < 14; i++) { const d = addDays(today, -i), day = State.days[d] || {}; Object.keys(day).forEach((k) => { const s = sec(d, k); if (s && s.hurt) Object.keys(s.hurt).forEach((x) => { hurt[x] = (hurt[x] || 0) + 1; }); }); }
  const loads = {}; Object.keys(EX).forEach((id) => { if (EX[id].load) { const l = lastLoad(id); if (l) loads[EX[id].name] = l; } });
  let ice = 0, ns = 0; for (let i = 0; i < 14; i++) { const e = sec(addDays(today, -i), 'e'); if (e && e.ice) ice++; if (e && e.nsaid) ns++; }
  const g = gateStatus(ph, today); const sl = slGate(today);
  const gait = lastSec('g'); const w = lastSec('w');
  const L = [];
  L.push('KNEE REHAB SUMMARY FOR YOUR PHYSIO');
  L.push(`Generated ${fmtDate(today, true)} ${pkey(today).getFullYear()}`);
  L.push('');
  L.push(`Knee: ${cap1(sides()[0])}.`);
  if (P.notes) L.push(`Diagnosis notes: ${P.notes}`);
  L.push('Program: staged, criteria-based rehab for a meniscus tear managed without surgery. Phase 1 in a pain-free range (0-2/10); single-leg loading locked until pain settles; lying-down, isometric and small-range work early; pool sessions; evening stretches and ice; hip strength; gait self-check; week-6 review point.');
  L.push('');
  L.push(`Now: Phase ${ph} (${PHASES[ph].name}), started ${fmtDate(P.phaseStart)}. Day ${diffDays(P.start, today) + 1} of the program (started ${fmtDate(P.start)}).`);
  L.push(`Single-leg work: ${sl.physio ? 'cleared by physio' : sl.open ? 'unlocked by criteria' : 'locked'}.`);
  if (ph === 4) L.push(`Walk-run stage: ${P.runStage} (${STAGES[P.runStage].label}).`);
  L.push('');
  L.push('LAST 14 DAYS');
  L.push(`- Morning resting pain: avg ${avg(ms.map((m) => m.pain))}/10 over ${ms.length} mornings (range ${ms.length ? Math.min(...ms.map((m) => m.pain)) + '-' + Math.max(...ms.map((m) => m.pain)) : '–'}).`);
  L.push(`- Swelling: ${ms.filter((m) => !m.sw).length} days none, ${ms.filter((m) => m.sw === 1).length} a little, ${ms.filter((m) => m.sw === 2).length} more.`);
  L.push(`- Fully straight: ${ms.filter((m) => m.st === 1).length} of ${ms.length} mornings. Locking/giving way: ${ms.some((m) => m.mech) ? 'REPORTED on ' + ms.filter((m) => m.mech).length + ' day(s)' : 'none reported'}. Night pain: ${ms.filter((m) => m.night).length} nights.`);
  L.push(`- Sessions finished: ${ss.length}${Object.keys(byKind).length ? ' (' + Object.entries(byKind).map(([k, v]) => `${k} ${v}`).join(', ') + ')' : ''}. Avg max session pain: ${avg(ss.map((s) => s.pain ?? 0))}/10.`);
  L.push(`- Exercises flagged as painful: ${Object.keys(hurt).length ? Object.entries(hurt).map(([k, v]) => `${EX[k] ? EX[k].name : k} (${v}x)`).join(', ') : 'none'}.`);
  if (Object.keys(loads).length) L.push(`- Latest loads: ${Object.entries(loads).map(([k, v]) => `${k} ${v} kg`).join(', ')}.`);
  L.push(`- Ice: ${ice} of 14 evenings. Anti-inflammatory tablets: ${ns} day(s).`);
  L.push('');
  L.push(`CRITERIA FOR THE NEXT PHASE: ${g.met} OF ${g.items.length} MET`);
  g.items.forEach((i) => L.push(`- [${i.ok ? 'x' : ' '}] ${tx(i.label)}${i.why ? ' (' + i.why + ')' : ''}`));
  if (w) { L.push(''); L.push(`Last check-in (${fmtDate(w.date)}): walking ${w.v.walk || '–'} min, fully straight: ${w.v.st === 1 ? 'yes' : w.v.st === 0 ? 'not quite' : '–'}${w.v.easier ? `, easier: ${w.v.easier}` : ''}.`); }
  if (gait) { const off = GAIT.filter((x) => !(gait.v.f || {})[x.id]).map((x) => tx(x.label).toLowerCase()); L.push(`Gait check (${fmtDate(gait.date)}): ${off.length ? 'not yet right: ' + off.join('; ') : 'all 7 look right'}${gait.v.note ? `. Notes: ${gait.v.note}` : ''}.`); }
  const notes = ss.filter((s) => s.note).slice(0, 5).map((s) => `${fmtDate(s.date)}: ${s.note}`);
  if (notes.length) { L.push(''); L.push('SESSION NOTES'); notes.forEach((n) => L.push('- ' + n)); }
  if (P.six) { L.push(''); L.push(`Week-6 review: ${P.six.v === 'better' ? 'clearly better' : 'NOT clearly better: specialist opinion requested'} (${fmtDate(P.six.date)}).`); }
  return L.join('\n');
}
function openSummary() {
  openSheet({ title: 'Physio summary', sub: 'Last 14 days',
    render() {
      $('#sb').innerHTML = `<p class="small muted">Copy this into a message or email, or show it at your appointment. Only what you’ve logged is included.</p><textarea id="sumTxt" readonly style="min-height:340px;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${esc(summaryText())}</textarea>`;
      $('#sf').innerHTML = `<div class="row2"><button class="btn" data-a="pdfSum">${ic('down')}Save PDF</button><button class="btn gold" data-a="copySum">${ic('copy')}Copy text</button></div>`;
    },
  });
}
/* Minimal text PDF (Helvetica, A4), built offline with no libraries */
function pdfSafe(s) { return String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/·/g, '-').replace(/→/g, '->').replace(/×/g, 'x').replace(/[^\x20-\x7E\xA0-\xFF]/g, ''); }
function wrapLine(s, max) { const out = []; let line = ''; String(s).split(' ').forEach((w) => { if ((line + ' ' + w).trim().length > max) { if (line) out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); out.push(line); return out; }
function makePDF(title, text) {
  const esc2 = (s) => pdfSafe(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const rows = [];
  text.split('\n').forEach((ln, i) => {
    if (i === 0) return;
    const head = /^[A-Z][A-Z0-9 ()\-:/]+$/.test(ln.trim()) && ln.trim().length > 3;
    const parts = ln ? wrapLine(ln, head ? 80 : 98) : [''];
    parts.forEach((p, j) => rows.push({ t: (j && ln.startsWith('- ') ? '  ' : '') + p, b: head }));
  });
  const perPage = 56; const pages = [];
  for (let i = 0; i < rows.length; i += perPage) pages.push(rows.slice(i, i + perPage));
  if (!pages.length) pages.push([]);
  const objs = []; const add = (s) => { objs.push(s); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>'); add('PAGES');
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = [];
  pages.forEach((pg, pi) => {
    let c = '0.039 0.071 0.125 rg 0 790 595 52 re f 0.851 0.682 0.31 rg 0 788 595 2.5 re f\n';
    c += `BT /F2 15 Tf 1 1 1 rg 40 808 Td (${esc2(title)}) Tj ET\n`;
    c += `BT /F1 9 Tf 0.75 0.8 0.88 rg 480 808 Td (${esc2('Page ' + (pi + 1) + ' of ' + pages.length)}) Tj ET\n`;
    c += 'BT 0.08 0.1 0.15 rg 40 760 Td 12.8 TL\n';
    pg.forEach((r) => { c += `/${r.b ? 'F2' : 'F1'} ${r.b ? 10.5 : 9.6} Tf (${esc2(r.t)}) Tj T*\n`; });
    c += 'ET\n';
    c += `BT /F1 8 Tf 0.45 0.5 0.58 rg 40 28 Td (${esc2('From Meniscus Rehab Tracker. Entries stay on your device unless you share them.')}) Tj ET`;
    const cs = add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cs} 0 R >>`));
  });
  objs[1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const u = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255;
  return u;
}
async function savePDF() {
  const name = `meniscus-rehab-summary-${todayKey()}.pdf`;
  const bytes = makePDF('Meniscus rehab: summary for your physio', summaryText());
  const r = await shareOrDownload(name, bytes, 'application/pdf');
  toast(r === 'shared' ? 'PDF ready to send or save' : r === 'downloaded' ? 'PDF downloaded' : r === 'cancelled' ? 'Cancelled' : 'Couldn’t save here. Copy the text instead.');
}
async function copyText(txt, ta) {
  try { await navigator.clipboard.writeText(txt); toast('Copied'); return true; }
  catch (e) { if (ta) { ta.removeAttribute('readonly'); ta.focus(); ta.select(); } toast('Select all and copy manually'); return false; }
}
async function shareOrDownload(name, data, mime) {
  const blob = new Blob([data], { type: mime });
  try {
    const file = new File([blob], name, { type: mime });
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  try { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); return 'downloaded'; } catch (e) { return 'failed'; }
}
async function exportData() {
  const name = `meniscus-rehab-backup-${todayKey()}.json`;
  const json = JSON.stringify({ app: 'meniscus-rehab', v: 1, exported: new Date().toISOString(), plan: State.plan, days: State.days }, null, 1);
  const r = await shareOrDownload(name, json, 'application/json');
  if (r === 'shared' || r === 'downloaded') { toast(r === 'shared' ? 'Backup ready to save' : 'Backup downloaded'); return; }
  if (r === 'cancelled') return;
  openSheet({ title: 'Back up', sub: name,
    render() {
      $('#sb').innerHTML = `<p class="small muted">Copy this text and keep it somewhere safe, such as a note or an email to yourself. Restore pastes it back.</p><textarea id="bkTxt" readonly style="min-height:260px;font:11.5px/1.45 ui-monospace,Menlo,monospace">${esc(json)}</textarea>`;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="copyBk">${ic('copy')}Copy backup</button>`;
    },
  });
}
function openImport() {
  openSheet({ title: 'Restore a backup', sub: 'Merges with what’s here: newer entries win',
    render() {
      $('#sb').innerHTML = `<div class="q">Paste the backup text</div><textarea id="imTxt" style="min-height:200px;font:11.5px/1.45 ui-monospace,Menlo,monospace" placeholder='{"app":"meniscus-rehab", ...}'></textarea><div class="q">Or choose the file</div><input type="file" id="imFile" accept="application/json,.json,text/plain">`;
      $('#sf').innerHTML = `<button class="btn gold block" data-a="doImport">Restore</button>`;
      $('#imFile').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { $('#imTxt').value = String(rd.result || ''); }; rd.readAsText(f); });
    },
  });
}
function doImport() {
  let o; try { o = JSON.parse($('#imTxt').value); } catch (e) { toast('That isn’t a valid backup'); return; }
  if (!o || o.app !== 'meniscus-rehab' || !o.days || !o.plan) { toast('That isn’t a valid backup'); return; }
  const remote = Object.assign({}, o.days, { plan: o.plan });
  const res = mergeAll(remote);
  saveLocal(true); res.push.forEach((id) => Cloud.mark(id)); Object.keys(o.days).forEach((id) => Cloud.mark(id)); Cloud.mark('plan');
  closeSheet(); refresh(); toast('Backup restored');
}

/* ===== Actions ===== */
const ACT = {
  tab: (d) => { if (d.t === 'today') UI.date = todayKey(); setTab(d.t); },
  day: (d) => { UI.date = addDays(UI.date, +d.n); if (UI.date > todayKey()) UI.date = todayKey(); renderView(); },
  goToday: () => { UI.date = todayKey(); renderView(); },
  goDay: (d) => { UI.date = d.d; setTab('today'); },
  morning: () => openMorning(),
  ex: (d) => { let o = {}; try { o = d.o ? JSON.parse(d.o) : {}; } catch (e) { o = {}; } openExercise(d.id, d.ctx || 'lib', !!d.view, o); },
  closeSheet: () => closeSheet(),
  pick: (d) => { const s = UI.sheet; if (!s) return; const v = isNaN(+d.v) ? d.v : +d.v; if (d.f === 'hurt') { if (s.ctx) setHurt(s.id, s.ctx, v === 1); return; } if (!s.form) return; s.form[d.f] = v; keepText(); s.render(); },
  saveMorning: () => { const F = UI.sheet.form; setSec(UI.date, 'm', F); closeSheet(); renderView(); const r = readiness(UI.date); toast(r.lvl === 'g' ? 'Green light. Go as planned.' : r.lvl === 'a' ? 'Amber: scale back today' : 'Red: take a settle day'); },
  tick: (d) => {
    const date = UI.date, ctx = d.ctx;
    if (ctx === 'e') { const e = sec(date, 'e') || {}; const st = Object.assign({}, e.st || {}); if (st[d.id] && !d.force) delete st[d.id]; else st[d.id] = 1; setSec(date, 'e', { st }); }
    else if (ctx && ctx.startsWith('s_')) { const s = sec(date, ctx) || {}; const done = Object.assign({}, s.done || {}); if (done[d.id] && !d.force) delete done[d.id]; else done[d.id] = 1; setSec(date, ctx, { done, k: ctx.slice(2), ph: phaseOn(date) }); }
    if (d.close) closeSheet();
    renderView();
  },
  set: (d) => {
    const s = UI.sheet; if (!s) return; const date = UI.date, ctx = s.ctx; const cur = sec(date, ctx) || {};
    const sets = Object.assign({}, cur.sets || {}); const n = +d.n; sets[d.id] = (sets[d.id] || 0) >= n ? n - 1 : n;
    const ex = EX[d.id]; const total = (s.opts && s.opts.sets) || ex.sets || 2;
    const patch = { sets, k: ctx.slice(2), ph: phaseOn(date) };
    if (sets[d.id] >= total) patch.done = Object.assign({}, cur.done || {}, { [d.id]: 1 });
    setSec(date, ctx, patch); renderView();
    if (sets[d.id] >= n && sets[d.id] < total) T.start(segsFor(ex), { k: s.k, title: ex.name });
    else if (sets[d.id] >= total) { toast(`${ex.name} done`); T.r && T.r.meta.k === s.k && T.stop(); }
    s.render();
  },
  load: (d) => {
    const s = UI.sheet; if (!s) return; const ex = EX[d.id]; const date = UI.date, ctx = s.ctx; const cur = sec(date, ctx) || {};
    const loads = Object.assign({}, cur.load || {}); const v = loads[d.id] != null ? loads[d.id] : (lastLoad(d.id) ?? 0);
    loads[d.id] = Math.max(0, Math.round((v + (+d.d) * ex.load.step) * 10) / 10);
    setSec(date, ctx, { load: loads, k: ctx.slice(2), ph: phaseOn(date) }); s.render();
  },
  tgo: (d) => {
    const s = UI.sheet; const ex = EX[d.id]; const date = UI.date;
    const meta = { k: s.k, title: ex.name };
    if (ex.kind === 'ice') { meta.onIce = () => { const e = sec(date, 'e') || {}; setSec(date, 'e', { ice: (e.ice || 0) + 1 }); renderView(); toast('Ice round logged. Now 20 min off.'); }; meta.onDone = () => toast('Ice round done'); }
    else if (ex.kind === 'reps') meta.onDone = () => toast('Rest over. Next set.');
    else meta.onDone = () => { toast(`${ex.name}: timer done`); if (s.ctx === 'q') { ACT.quad({}); } else if (s.ctx && s.ctx !== 'lib') { ACT.tick({ id: d.id, ctx: s.ctx, force: 1 }); if (UI.sheet) UI.sheet.render(); } };
    T.start(segsFor(ex, s.opts), meta);
  },
  tpause: () => T.pause(), tskip: () => T.skip(), tstop: () => T.stop(),
  treopen: () => { const r = T.r; if (!r) return; const [ctx, id] = r.meta.k.split(':'); openExercise(id, ctx, ctx === 'lib'); },
  quad: (d) => { const q = sec(UI.date, 'q') || {}; setSec(UI.date, 'q', { n: (q.n || 0) + 1 }); if (d && d.close) closeSheet(); renderView(); toast('Round logged'); },
  iceAdj: (d) => { const e = sec(UI.date, 'e') || {}; setSec(UI.date, 'e', { ice: Math.max(0, (e.ice || 0) + (+d.n)) }); renderView(); },
  nsaid: (d) => { setSec(UI.date, 'e', { nsaid: +d.v }); renderView(); },
  finish: () => openFinish(),
  saveFinish: () => {
    const F = UI.sheet.form; F.note = ($('#fnote') || {}).value || ''; const key = sessionKeyFor(UI.date);
    const patch = { pain: F.pain, sw: F.sw, note: F.note.slice(0, 400), fin: Date.now(), k: key, ph: phaseOn(UI.date) };
    if (key === 'run') patch.stage = State.plan.runStage;
    setSec(UI.date, 's_' + key, patch); closeSheet(); renderView();
    toast(zoneOf(F.pain, phaseOn(UI.date)) === 0 && !F.sw ? 'Saved. Nicely judged.' : 'Saved. Check how it sits tomorrow morning.');
  },
  swap: () => openSwap(),
  swapTo: (d) => { const planned = WEEK[phaseOn(UI.date)][dowIdx(UI.date)]; if (d.k === planned) delSec(UI.date, 'k'); else setSec(UI.date, 'k', { v: d.k }); closeSheet(); renderView(); },
  planPh: (d) => { UI.planPh = +d.n; renderView(); },
  check: (d) => { const checks = Object.assign({}, State.plan.checks); if (checks[d.id]) delete checks[d.id]; else checks[d.id] = todayKey(); setPlan({ checks }); renderView(); },
  slClear: () => { if (State.plan.slClear) { setPlan({ slClear: false }); renderView(); return; } dialog({ title: 'Physio cleared single-leg work?', text: 'Only tick this if a physio has watched you and said yes. Feeling good on its own doesn’t count.', ok: 'Yes, cleared', onOk: () => { setPlan({ slClear: true }); renderView(); } }); },
  landClear: () => { if (State.plan.landClear) { setPlan({ landClear: false }); renderView(); return; } dialog({ title: 'Physio OK’d landing drills?', text: 'Late Phase 3 only, with daily life comfortable and swelling settled.', ok: 'Yes', onOk: () => { setPlan({ landClear: true }); renderView(); } }); },
  movePhase: (d) => {
    const P = State.plan, next = P.phase + 1;
    const go = (why) => { const t = todayKey(); setPlan({ phase: next, phaseStart: t, hist: P.hist.concat([{ phase: next, start: t, why }]) }); UI.planPh = null; renderView(); toast(`Phase ${next}: ${PHASES[next].name}`); };
    if (d.early) dialog({ title: `Move to Phase ${next} early?`, text: 'Only with your physio’s OK. Moving on early is the most common cause of a flare. Who cleared it?', ok: 'Move on', input: 'e.g. Physio, 2 Dec', onOk: (v) => { if (!v) { toast('Add who cleared it'); return; } go('Early: ' + v); } });
    else dialog({ title: `Move to Phase ${next}?`, text: `All criteria met. Phase ${next} starts today.`, ok: 'Move on', onOk: () => go('Criteria met') });
  },
  stage: (d) => { const n = Math.max(1, Math.min(9, State.plan.runStage + (+d.n))); setPlan({ runStage: n }); renderView(); toast(`Walk-run stage ${n}`); },
  six: (d) => { setPlan({ six: { v: d.v, date: todayKey() } }); renderView(); if (d.v === 'not') toast('Noted. Book in with your GP this week.'); },
  sixBooked: () => { setPlan({ six: Object.assign({}, State.plan.six, { booked: todayKey() }) }); renderView(); },
  tableView: () => { UI.tableView = !UI.tableView; renderView(); },
  weekly: () => openWeekly(),
  saveWeekly: () => { const F = UI.sheet.form; const walk = $('#wWalk').value, kg = $('#wKg').value; setSec(UI.date, 'w', { walk: walk === '' ? null : num(walk, 0, 300, null), st: F.st, easier: ($('#wEasier').value || '').slice(0, 160), kg: kg === '' ? null : num(kg, 30, 250, null) }); closeSheet(); renderView(); toast('Check-in saved'); },
  gait: () => openGait(),
  gaitTick: (d) => { const F = UI.sheet.form; F.note = $('#gNote').value; if (F.f[d.id]) delete F.f[d.id]; else F.f[d.id] = 1; UI.sheet.render(); },
  saveGait: () => { const F = UI.sheet.form; setSec(UI.date, 'g', { f: F.f, note: ($('#gNote').value || '').slice(0, 400) }); closeSheet(); renderView(); toast('Gait check saved'); },
  summary: () => openSummary(),
  copySum: () => copyText($('#sumTxt').value, $('#sumTxt')),
  pdfSum: () => savePDF(),
  copyBk: () => copyText($('#bkTxt').value, $('#bkTxt')),
  exportData: () => exportData(),
  importData: () => openImport(),
  doImport: () => doImport(),
  setup: () => openSetup(),
  saveWelcome: () => { keepText(); const F = UI.sheet.form; const s = okDate(F.start) ? F.start : todayKey(); setPlan({ side: F.side === 'right' ? 'right' : 'left', notes: String(F.notes || '').slice(0, 600), ack: true, start: s, phaseStart: s, hist: [{ phase: 1, start: s, why: 'Started' }] }); closeSheet(); renderView(); toast('All set. Start with the morning check.'); },
  saveSetup: () => {
    keepText(); const F = UI.sheet.form, P = State.plan;
    const patch = { sound: !!+F.sound, iceTarget: num(F.ice, 7, 365, P.iceTarget) | 0, side: F.side === 'right' ? 'right' : 'left', notes: String(F.notes || '').slice(0, 600) };
    if (okDate(F.start)) patch.start = F.start;
    if (okDate(F.phaseStart)) patch.phaseStart = F.phaseStart;
    const ps = patch.phaseStart || P.phaseStart;
    if (+F.phase !== P.phase || ps !== P.phaseStart) { patch.phase = +F.phase; const hist = P.hist.filter((h) => h.start < ps); hist.push({ phase: +F.phase, start: ps, why: 'Set in settings' }); patch.hist = hist; }
    setPlan(patch); closeSheet(); renderView(); toast('Settings saved');
  },
  wipe: () => dialog({ title: 'Erase all data?', text: 'This clears every entry in this browser. Back up first if you might want them.', ok: 'Erase everything', danger: true, onOk: () => {
    State = { v: 1, plan: defaultPlan(), days: {} };
    saveLocal(true); closeSheet(true); UI.date = todayKey(); renderView(); toast('Erased'); openWelcome();
  } }),
};
function keepText() { const s = UI.sheet; if (!s || !s.form) return; document.querySelectorAll('#sb [data-k]').forEach((el) => { s.form[el.dataset.k] = el.value; }); const n = $('#fnote'); if (n) s.form.note = n.value; const g = $('#gNote'); if (g) s.form.note = g.value; }
function setHurt(id, ctx, on) {
  const date = UI.date;
  if (ctx === 'e') { const e = sec(date, 'e') || {}; const hurt = Object.assign({}, e.hurt || {}); if (on) hurt[id] = 1; else delete hurt[id]; setSec(date, 'e', { hurt }); }
  else if (ctx && ctx.startsWith('s_')) { const s = sec(date, ctx) || {}; const hurt = Object.assign({}, s.hurt || {}); if (on) hurt[id] = 1; else delete hurt[id]; setSec(date, ctx, { hurt, k: ctx.slice(2), ph: phaseOn(date) }); }
  renderView(); if (UI.sheet) UI.sheet.render();
  if (on) toast('Flagged. Use a smaller range or the easier option next time.');
}

/* ===== Boot ===== */
function boot() {
  loadLocal();
  document.body.insertAdjacentHTML('afterbegin', Fig.defs());
  $('#app').innerHTML = `<header class="top"><div class="wrap">${MARK}<div class="brand"><b>Meniscus Rehab</b><span id="topSub"></span></div><button class="iconbtn" data-a="setup" aria-label="Settings and data">${ic('gear')}</button></div></header>
    <main><div class="wrap" id="view"></div></main>
    <nav class="tabs" aria-label="Sections"><div class="wrap">${[['today', 'Today'], ['plan', 'Plan'], ['log', 'Log'], ['guide', 'Guide']].map(([t, l]) => `<button class="tab" data-a="tab" data-t="${t}" data-tab="${t}">${ic(t)}${l}</button>`).join('')}</div></nav>`;
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const fn = ACT[b.dataset.a]; if (fn) { e.preventDefault(); fn(b.dataset, b, e); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.sheet && !UI.sheet.noClose) closeSheet(); });
  const h = (location.hash || '').slice(1);
  UI.tab = ['today', 'plan', 'log', 'guide'].includes(h) ? h : 'today';
  window.addEventListener('hashchange', () => { const x = (location.hash || '').slice(1); if (['today', 'plan', 'log', 'guide'].includes(x) && x !== UI.tab) { UI.tab = x; renderView(); } });
  renderView();
  if (!State.plan.ack) openWelcome();
  let lastDay = todayKey();
  setInterval(() => { const t = todayKey(); if (t !== lastDay) { if (UI.date === lastDay) UI.date = t; lastDay = t; renderView(); } }, 60000);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    const reg = () => navigator.serviceWorker.register('sw.js').catch(() => {});
    if (document.readyState === 'complete') reg(); else window.addEventListener('load', reg);
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
