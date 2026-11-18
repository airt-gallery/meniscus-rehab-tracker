/* ===== Figure engine: animated stick figures, 2-bone IK, left leg highlighted ===== */
const Fig = (() => {
  const LEN = { thigh: 30, shin: 30, uarm: 20, farm: 19, headR: 7.5, neck: 12 };
  const G = 142;
  const D = Math.PI / 180;
  const C = {
    body: '#D5DEEA', far: '#62738F', left: '#E3B04B',
    floor: '#2C3F5F', prop: '#1C2D4A', propHi: '#33507E', propLine: '#5A77A6',
    water: 'rgba(56,150,214,.17)', waterLine: 'rgba(130,200,245,.8)',
    band: '#E8875A', ice: '#A6DDF9', strap: '#C9D4E3', weight: '#8A7444', bell: '#8D9BB1'
  };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const len = (a) => Math.hypot(a[0], a[1]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const rot = (v, ang) => { const c = Math.cos(ang * D), s = Math.sin(ang * D); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const f1 = (n) => Math.round(n * 10) / 10;
  const P2 = (p) => f1(p[0]) + ',' + f1(p[1]);

  function ik(root, end, l1, l2, sign) {
    const v = sub(end, root);
    let d = len(v);
    const th0 = Math.atan2(v[1], v[0]);
    if (d >= l1 + l2 - 0.01) {
      const u = [Math.cos(th0), Math.sin(th0)];
      return [add(root, mul(u, l1)), add(root, mul(u, l1 + l2))];
    }
    d = Math.max(d, Math.abs(l1 - l2) + 0.5);
    const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const th = th0 + sign * a;
    return [add(root, [Math.cos(th) * l1, Math.sin(th) * l1]), end];
  }

  function solve(q) {
    const P = { hip: q.hip, sh: q.sh };
    P.lhp = q.lhp || q.hip; P.rhp = q.rhp || q.hip;
    P.lsh = q.lsh || q.sh; P.rsh = q.rsh || q.sh;
    P.pm = mid(P.lhp, P.rhp); P.sm = mid(P.lsh, P.rsh);
    if (q.hd) P.head = q.hd;
    else { const v = sub(P.sm, P.pm); const n = len(v) || 1; P.head = add(P.sm, mul(v, LEN.neck / n)); }
    ['l', 'r'].forEach((s) => {
      let knee, ank;
      if (q[s + 'kn']) { knee = q[s + 'kn']; ank = q[s + 'a']; }
      else if (q.straight) { ank = q[s + 'a']; knee = mid(P[s + 'hp'], ank); }
      else { [knee, ank] = ik(P[s + 'hp'], q[s + 'a'], LEN.thigh, LEN.shin, q[s + 'k'] ?? -1); }
      P[s + 'knee'] = knee; P[s + 'ank'] = ank;
      const fa = q[s + 'f'] ?? 0, fl = q.flen ?? 1;
      P[s + 'heel'] = add(ank, rot([-1 * fl, 3 * fl], fa));
      P[s + 'toe'] = add(ank, rot([9 * fl, 3 * fl], fa));
      if (q[s + 'h']) {
        let elb, hand;
        if (q[s + 'el']) { elb = q[s + 'el']; hand = q[s + 'h']; }
        else { [elb, hand] = ik(P[s + 'sh'], q[s + 'h'], LEN.uarm, LEN.farm, q[s + 'e'] ?? 1); }
        P[s + 'elb'] = elb; P[s + 'hand'] = hand;
      }
    });
    P.lthigh = mid(P.lhp, P.lknee); P.lcalf = mid(P.lknee, P.lank);
    return P;
  }

  const rect = (x, y, w, h, fill, rx = 2, stroke, sw = 1.2) =>
    `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
  const line = (a, b, col, w, extra = '') =>
    `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;
  const circ = (c, r, fill, stroke, sw = 1.2, extra = '') =>
    `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${extra}/>`;
  const poly = (pts, col, w, extra = '') =>
    `<polyline points="${pts.map(P2).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const at = (P, v) => (typeof v === 'string' ? P[v] : v);

  const PROP = {
    floor: () => line([6, G], [234, G], C.floor, 2),
    mat: (pr) => rect(pr.x ?? 34, G - 3.5, pr.w ?? 172, 3.5, '#20375A', 1.5),
    roll: (pr) => circ(pr.at, pr.r, C.propHi, C.propLine) + circ(pr.at, pr.r * 0.45, 'none', C.propLine, 1),
    cuff: (pr, P) => { const a = P.lank; return `<g opacity="${pr.op ?? 1}">${rect(a[0] - 4.5, a[1] - 4, 9, 8, C.weight, 2.5, '#C9A55A', 1)}</g>`; },
    strap: (pr, P) => line(at(P, pr.from), at(P, pr.to), C.strap, 1.8),
    wall: (pr) => rect(pr.x, 6, 9, G - 6, '#15243D', 0) + line([pr.x, 6], [pr.x, G], C.propLine, 1.4),
    rail: (pr) => line([pr.x, pr.top], [pr.x, G], C.propLine, 3) + line([pr.x - 8, pr.top], [pr.x + 5, pr.top], C.propLine, 3.5) + line([pr.x - 7, G], [pr.x + 7, G], C.propLine, 3),
    post: (pr) => rect(pr.x - 3, pr.top, 6, G - pr.top, C.propHi, 1.5, C.propLine, 1),
    band: (pr, P) => line(at(P, pr.from), at(P, pr.to), C.band, 2.4),
    step: (pr) => rect(pr.x, G - pr.h, pr.w, pr.h, C.propHi, 2, C.propLine),
    pad: (pr) => rect(pr.x, G - pr.h, pr.w, pr.h, '#2D4570', 3, C.propLine),
    pillow: (pr) => rect(pr.x, pr.y, pr.w, pr.h, '#2A4066', 6, C.propLine, 1),
    chair: (pr) => {
      const x = pr.x, sy = pr.y ?? 108, w = pr.w ?? 28;
      return rect(x, sy, w, 4, C.propHi, 1.5, C.propLine, 1) + line([x + 3, sy + 4], [x + 3, G], C.propLine, 2.4) +
        line([x + w - 3, sy + 4], [x + w - 3, G], C.propLine, 2.4) + line([x + 1.5, sy], [x - 1, sy - 40], C.propLine, 3.2);
    },
    box: (pr) => rect(pr.x, pr.y, pr.w, G - pr.y, C.propHi, 2, C.propLine),
    ledge: (pr) => rect(0, pr.y - 5, 240, 5, '#22385B', 0) + line([0, pr.y], [240, pr.y], C.propLine, 1.2),
    water: (pr) => {
      const y = pr.y, bottom = pr.bottom ?? G;
      let d = `M0,${y}`;
      for (let x = 0; x <= 240; x += 20) d += ` Q${x + 5},${y - 2.2} ${x + 10},${y} T${x + 20},${y}`;
      return `<path d="${d} L240,${bottom} L0,${bottom} Z" fill="${C.water}"/><path d="${d}" fill="none" stroke="${C.waterLine}" stroke-width="1.4"/>`;
    },
    ice: (pr, P) => {
      const k = P.lknee;
      return rect(k[0] - 8, k[1] - 9.5, 16, 8, C.ice, 3, '#E6F6FF', 1) +
        line([k[0] - 4, k[1] - 13], [k[0] - 2, k[1] - 16], '#A6DDF9', 1.2) + line([k[0] + 1, k[1] - 13], [k[0] + 3, k[1] - 17], '#A6DDF9', 1.2) +
        line([k[0] + 6, k[1] - 13], [k[0] + 8, k[1] - 16], '#A6DDF9', 1.2);
    },
    slider: (pr, P) => { const h = P[pr.on]; return `<ellipse cx="${f1(h[0])}" cy="${G - 1.6}" rx="6" ry="1.9" fill="#6A7FA3"/>`; },
    dumbbell: (pr, P) => {
      const h = P[pr.on];
      return `<g opacity="${pr.far ? 0.55 : 1}">${rect(h[0] - 1.5, h[1] - 1, 3, 9, C.bell, 1)}${rect(h[0] - 5, h[1] + 7, 10, 4.5, '#6E7D95', 1.5)}${rect(h[0] - 5, h[1] - 5, 10, 4.5, '#6E7D95', 1.5)}</g>`;
    },
    goblet: (pr, P) => { const h = mid(P.lhand, P.rhand || P.lhand); return rect(h[0] - 4, h[1] - 9, 8, 18, C.bell, 3, '#B4C0D2', 1); },
    bench: (pr) => rect(pr.x, pr.y, pr.w, 5, C.propHi, 2, C.propLine, 1) + line([pr.x + 6, pr.y + 5], [pr.x + 6, G], C.propLine, 2.4) + line([pr.x + pr.w - 6, pr.y + 5], [pr.x + pr.w - 6, G], C.propLine, 2.4),
    curlpad: (pr, P) => {
      const k = P.lknee, a = P.lank, th = Math.atan2(a[1] - k[1], a[0] - k[0]) - Math.PI / 2;
      const c = add(a, [Math.cos(th) * 7, Math.sin(th) * 7]);
      return circ(c, 5, '#3A5683', '#5E7BA8', 1.2);
    },
    legpress: (pr, P) => {
      const a = P.lank;
      const px = a[0] + 6;
      let s = '';
      s += line([64, G - 1], [222, G - 1], C.propLine, 3);
      s += line([150, 118], [222, 118], C.propLine, 3) + line([216, 118], [216, G], C.propLine, 3);
      s += line([96, 113], [96, G], C.propLine, 3);
      s += rect(82, 108, 34, 6, C.propHi, 3, C.propLine, 1);
      s += line([92, 107], [76, 62], '#2F4670', 8);
      s += rect(px, a[1] - 24, 5, 38, '#3A5683', 2, '#5E7BA8', 1);
      s += line([px + 5, a[1] - 3], [178, a[1] - 3], C.propLine, 2.2) + line([px + 5, a[1] + 8], [178, a[1] + 8], C.propLine, 2.2);
      return s;
    },
    abd: (pr, P) => {
      let s = rect(97, 50, 26, 47, '#22375A', 4);
      s += rect(88, 99, 44, 7, C.propHi, 3, C.propLine, 1);
      s += line([110, 106], [110, G], C.propLine, 3) + line([86, 135], [134, 135], C.propLine, 3);
      return s;
    },
    abdpads: (pr, P) => rect(P.lknee[0] + 2.5, P.lknee[1] - 7, 5, 13, '#3A5683', 2, '#5E7BA8', 1) + rect(P.rknee[0] - 7.5, P.rknee[1] - 7, 5, 13, '#3A5683', 2, '#5E7BA8', 1),
    bike: (pr, P, q) => {
      const c = [122, 118];
      let s = '';
      s += line([78, G - 1], [170, G - 1], C.propLine, 3.2);
      s += line([98, G - 1], [105, 80], C.propLine, 3.6);
      s += rect(94, 76, 22, 4.5, C.propHi, 2.2, C.propLine, 1);
      s += line([104, 94], c, C.propLine, 3);
      s += line([152, G - 1], [150, 57], C.propLine, 3.6) + line([142, 56], [156, 56], C.propLine, 3.6);
      s += circ([152, 114], 15, 'none', C.propLine, 2.2);
      s += circ(c, 11, 'none', 'rgba(140,160,190,.3)', 1, ' stroke-dasharray="2 3"');
      const lp = q.lpedal || c, rp = q.rpedal || c;
      s += line(c, rp, C.propLine, 2.6) + line(c, lp, '#5A759F', 2.6) + circ(c, 2.6, C.propLine);
      return s;
    },
    cones: () => '',
  };

  function codPath(p) {
    // figure-8 (lemniscate of Gerono) across two cones
    const t = p * 2 * Math.PI;
    return [120 + 78 * Math.sin(t), 82 + 34 * Math.sin(t) * Math.cos(t)];
  }

  function drawPath(q) {
    let s = line([6, 132], [234, 132], C.floor, 1.5, ' stroke-dasharray="1 5"');
    let d = '';
    for (let i = 0; i <= 64; i++) { const pt = codPath(i / 64); d += (i ? ' L' : 'M') + P2(pt); }
    s += `<path d="${d}" fill="none" stroke="rgba(213,222,234,.35)" stroke-width="1.6" stroke-dasharray="3 4"/>`;
    [[64, 82], [176, 82]].forEach((c) => { s += `<path d="M${c[0] - 7},${c[1] + 8} L${c[0]},${c[1] - 10} L${c[0] + 7},${c[1] + 8} Z" fill="#E8875A"/>`; });
    for (let k = 6; k >= 1; k--) { const pt = codPath((q._p - k * 0.012 + 1) % 1); s += circ(pt, 2.2, C.left, null, 0, ` opacity="${(0.12 * (7 - k)).toFixed(2)}"`); }
    s += circ(codPath(q._p), 5.5, C.left, '#0B1424', 1.5);
    return s;
  }

  function draw(q, props) {
    if (q.mode === 'path') return drawPath(q);
    const P = solve(q);
    const back = [], fore = [];
    (props || []).forEach((pr) => { const fn = PROP[pr.t]; if (!fn) return; (pr.front ? fore : back).push(fn(pr, P, q)); });
    let s = back.join('');
    if (q.glow > 0.02 && q.glowAt) {
      const g = add(typeof q.glowAt === 'string' ? P[q.glowAt] : q.glowAt, q.glowOff || [0, 0]);
      s += circ(g, 14, `url(#${q.glowCol === 'blue' ? 'figGlowB' : 'figGlow'})`, null, 0, ` opacity="${f1(Math.min(1, q.glow))}"`);
    }
    const legR = () => poly([P.rhp, P.rknee, P.rank], C.far, 6) + poly([P.rank, P.rheel, P.rtoe], C.far, 4);
    const legL = () => poly([P.lhp, P.lknee, P.lank], C.left, 6.5) + poly([P.lank, P.lheel, P.ltoe], C.left, 4.2);
    const armR = () => (P.rhand ? poly([P.rsh, P.relb, P.rhand], C.far, 5) : '');
    const armL = () => (P.lhand ? poly([P.lsh, P.lelb, P.lhand], C.body, 5) : '');
    const torso = () => {
      let t = poly([P.pm, P.sm], C.body, 9.5);
      if (q.lhp || q.rhp) t += poly([P.lhp, P.rhp], C.body, 7);
      if (q.lsh || q.rsh) t += poly([P.lsh, P.rsh], C.body, 7);
      return t;
    };
    const head = circ(P.head, LEN.headR, C.body);
    if (q.order === 'leftBehind') s += legL() + armR() + legR() + torso() + head + armL();
    else s += armR() + legR() + torso() + head + legL() + armL();
    s += fore.join('');
    s += circ(P.lknee, 6.4, 'none', C.left, 1.3, ' opacity=".9" stroke-dasharray="2.2 1.6"');
    return s;
  }

  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  function lerpQ(a, b, t) {
    const o = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach((k) => {
      const va = a[k], vb = b[k];
      if (Array.isArray(va) && Array.isArray(vb)) o[k] = [va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t];
      else if (typeof va === 'number' && typeof vb === 'number') o[k] = va + (vb - va) * t;
      else o[k] = t < 0.5 ? (va ?? vb) : (vb ?? va);
    });
    return o;
  }
  function poseAt(spec, time) {
    if (spec.gen) { const p = ((time / (spec.period || 1.2)) % 1 + 1) % 1; const q = spec.gen(p); q._p = p; return q; }
    const keys = spec.keys;
    if (keys.length === 1) return keys[0].p;
    let total = 0;
    keys.forEach((k) => { total += (k.hold ?? 0.6) + (k.move ?? 1); });
    let t = time % total;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i], h = k.hold ?? 0.6, m = k.move ?? 1;
      if (t < h) return k.p;
      t -= h;
      if (t < m) return lerpQ(k.p, keys[(i + 1) % keys.length].p, ease(t / m));
      t -= m;
    }
    return keys[0].p;
  }
  function staticPose(spec, which) {
    if (spec.gen) { const p = which === 'a' ? 0 : spec.thumbP ?? 0.25; const q = spec.gen(p); q._p = p; return q; }
    if (which === 'a') return spec.keys[0].p;
    const i = spec.thumb ?? (spec.keys.length > 2 ? spec.keys.length - 1 : 1);
    return spec.keys[Math.min(i, spec.keys.length - 1)].p;
  }
  const PROPB = {
    step: (p) => [[p.x - 2, G - p.h - 2], [p.x + p.w + 2, G]], box: (p) => [[p.x - 2, p.y - 2], [p.x + p.w + 2, G]], pad: (p) => [[p.x, G - p.h], [p.x + p.w, G]],
    chair: (p) => [[p.x - 3, (p.y ?? 108) - 42], [p.x + (p.w ?? 28) + 2, G]], wall: (p) => [[p.x + 10, 70]], rail: (p) => [[p.x + 7, p.top - 2]],
    post: (p) => [[p.x + 5, p.top - 2]], pillow: (p) => [[p.x - 2, p.y - 2], [p.x + p.w + 2, p.y + p.h]], roll: (p) => [[p.at[0] - p.r - 2, p.at[1] - p.r - 2], [p.at[0] + p.r + 2, p.at[1] + p.r]],
    bench: (p) => [[p.x - 2, p.y - 2], [p.x + p.w + 2, G]], abd: () => [[86, 48], [134, G]], bike: () => [[76, 52], [170, G]], legpress: () => [[70, 58], [184, G]],
  };
  const VBS = new WeakMap();
  function fitBox(spec) {
    if (spec.vb) return spec.vb;
    if (VBS.has(spec)) return VBS.get(spec);
    const qs = spec.gen ? [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((p) => { const q = spec.gen(p); q._p = p; return q; }) : spec.keys.map((k) => k.p);
    let vb;
    if (qs[0].mode === 'path') vb = '0 7 240 150';
    else {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const inc = (pt, r = 0) => { if (!pt) return; x0 = Math.min(x0, pt[0] - r); y0 = Math.min(y0, pt[1] - r); x1 = Math.max(x1, pt[0] + r); y1 = Math.max(y1, pt[1] + r); };
      qs.forEach((q) => { const P = solve(q); ['hip', 'sh', 'lknee', 'rknee', 'lank', 'rank', 'lheel', 'rheel', 'ltoe', 'rtoe', 'lelb', 'relb', 'lhand', 'rhand', 'lhp', 'rhp', 'lsh', 'rsh'].forEach((k) => inc(P[k], 4)); inc(P.head, LEN.headR + 2); });
      (spec.props || []).forEach((p) => { const f = PROPB[p.t]; if (f) f(p).forEach((pt) => inc(pt)); });
      const floor = (spec.props || []).some((p) => p.t === 'floor');
      x0 -= 12; x1 += 12; y0 -= 10; y1 += 4;
      if (floor) y1 = Math.max(y1, G + 5);
      const A = 1.6; let w = x1 - x0, h = y1 - y0;
      if (w / h > A) { const nh = w / A; y0 -= nh - h; h = nh; } else { const nw = h * A; x0 -= (nw - w) / 2; w = nw; }
      const minW = 240 / 1.8;
      if (w < minW) { const nw = minW, nh = nw / A; x0 -= (nw - w) / 2; y0 -= nh - h; w = nw; h = nh; }
      if (floor) y0 = G + 5 - h;
      vb = `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
    }
    VBS.set(spec, vb);
    return vb;
  }
  function svgString(spec, which, cls) {
    return `<svg class="${cls || 'fig'}" viewBox="${fitBox(spec)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${draw(staticPose(spec, which), spec.props)}</svg>`;
  }
  function defs() {
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="figGlow"><stop offset="0" stop-color="#F2C35B" stop-opacity=".75"/><stop offset="1" stop-color="#F2C35B" stop-opacity="0"/></radialGradient>
<radialGradient id="figGlowB"><stop offset="0" stop-color="#8FD3F7" stop-opacity=".8"/><stop offset="1" stop-color="#8FD3F7" stop-opacity="0"/></radialGradient>
</defs></svg>`;
  }
  function mount(el, spec, opts = {}) {
    el.innerHTML = `<svg class="fig" viewBox="${fitBox(spec)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${opts.label || ''}"></svg>`;
    const s = el.firstChild;
    let reduce = false;
    try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }
    if (reduce || opts.still) { s.innerHTML = draw(staticPose(spec, 'b'), spec.props); return () => {}; }
    let raf = 0, alive = true, last = 0;
    const t0 = performance.now();
    const tick = (now) => {
      if (!alive) return;
      if (now - last > 30) { last = now; s.innerHTML = draw(poseAt(spec, (now - t0) / 1000), spec.props); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }
  return { draw, poseAt, staticPose, svgString, defs, mount, fitBox, G };
})();

/* ===== Poses (side view faces right; supine lies head-left; gold = injured leg) ===== */
const FIGS = (() => {
  const G = 142;
  const ST = (o = {}) => Object.assign({ hip: [110, 78], sh: [111, 42], la: [111, 138], ra: [105, 138], lh: [109, 80], rh: [104, 80], lf: 0, rf: 0, glow: 0 }, o);
  const SU = (o = {}) => Object.assign({ hip: [110, 136], sh: [74, 136], hd: [61, 134.5], lh: [112, 139.5], rh: [110, 140], la: [170, 137], ra: [169, 138], lf: -90, rf: -90, glow: 0 }, o);
  const F = (props) => [{ t: 'floor' }].concat(props || []);
  const kf = (...ps) => ps.map(([p, hold, move]) => ({ p, hold, move }));
  const X = (base, o) => Object.assign({}, base, o);
  const S = {};

  // ---- Phase 1: lying work ----
  S.quadset = { props: F([{ t: 'mat' }, { t: 'roll', at: [140, 137.5], r: 4.5 }]),
    keys: kf([SU({ la: [169.4, 136], glowAt: 'lthigh' }), 0.8, 0.5], [SU({ la: [170, 136.4], glow: 1, glowAt: 'lthigh' }), 1.8, 0.6]) };
  S.slr = { props: F([{ t: 'mat' }, { t: 'cuff', op: 0.6 }]),
    keys: kf([SU({ ra: [148, 138], rf: 0, la: [170, 136.5], glowAt: 'lthigh' }), 0.7, 1.1], [SU({ ra: [148, 138], rf: 0, la: [162, 106], lf: -120, glow: 0.8, glowAt: 'lthigh' }), 1.0, 1.5]) };
  S.saq = { props: F([{ t: 'mat' }, { t: 'roll', at: [138, 131], r: 7 }, { t: 'cuff', op: 0.6 }]),
    keys: kf([SU({ la: [164, 138], lf: -70, glowAt: 'lthigh' }), 0.6, 0.9], [SU({ la: [165, 112], lf: -113, glow: 1, glowAt: 'lthigh' }), 1.4, 1.2]) };
  S.heelslide = { props: F([{ t: 'mat' }]),
    keys: kf([SU({ la: [170, 137], lf: -90 }), 0.5, 1.5], [SU({ la: [146, 139], lf: -30 }), 0.8, 1.5]) };
  const brA = SU({ la: [148, 138], ra: [146, 138.5], lf: 0, rf: 0, glowAt: 'hip', glowOff: [0, 6] });
  const brB = SU({ hip: [112, 121], sh: [78, 135], hd: [64, 134], la: [148, 138], ra: [146, 138.5], lf: 0, rf: 0, lh: [114, 139.5], rh: [112, 140], glow: 1, glowAt: 'hip', glowOff: [0, 6] });
  S.bridge = { props: F([{ t: 'mat' }]), keys: kf([brA, 0.6, 1.0], [brB, 1.4, 1.2]) };
  S.bridge1 = { props: F([{ t: 'mat' }]),
    keys: kf([X(brA, { ra: [162, 106], rf: -120 }), 0.6, 1.0], [X(brB, { ra: [167.5, 98.2], rf: -112 }), 1.3, 1.2]) };

  const side = { hip: [110, 131], sh: [76, 128], hd: [62, 119], rh: [60, 124.5], rel: [64, 139], lh: [90, 139.5], le: -1, ra: [170, 138], rf: 0, lf: 0, flen: 0.45, glow: 0 };
  S.sideabd = { props: F([{ t: 'mat' }]),
    keys: kf([X(side, { la: [170, 131], glowAt: 'hip', glowOff: [3, -5] }), 0.6, 1.0], [X(side, { la: [164.4, 105.6], glow: 1, glowAt: 'hip', glowOff: [3, -5] }), 1.0, 1.3]) };
  S.clam = { props: F([{ t: 'mat' }]),
    keys: kf([X(side, { ra: [152, 138], rkn: [131, 139], la: [152, 132], lkn: [131, 133], glowAt: 'hip', glowOff: [3, -4] }), 0.6, 0.9],
      [X(side, { ra: [152, 138], rkn: [131, 139], la: [152, 132], lkn: [127, 110], glow: 1, glowAt: 'hip', glowOff: [3, -4] }), 1.0, 1.2]) };

  // ---- standing basics ----
  const crA = ST({ sh: [113, 42], hd: [115, 30], lh: [139, 72], rh: [137, 73], glowAt: 'lcalf' });
  const crB = ST({ hip: [110, 73.4], sh: [113, 37.4], hd: [115, 25.4], la: [111, 133.4], ra: [105, 133.4], lf: 35, rf: 35, lh: [139, 72], rh: [137, 73], glow: 1, glowAt: 'lcalf' });
  S.calfraise2 = { props: F([{ t: 'rail', x: 142, top: 70 }]), keys: kf([crA, 0.6, 0.8], [crB, 0.9, 1.7]) };
  S.calfraise1 = { props: F([{ t: 'rail', x: 142, top: 70 }]),
    keys: kf([X(crA, { ra: [96, 116] }), 0.6, 0.8], [X(crB, { ra: [96, 111.4], rf: 0 }), 0.9, 1.7]) };

  // ---- stretches ----
  S.hamstretch = { props: F([{ t: 'mat' }, { t: 'strap', from: 'lhand', to: 'ltoe' }]),
    keys: kf([SU({ la: [144.4, 86.9], lf: -145, lh: [96, 104], rh: [94, 105], glowAt: 'lthigh' }), 0.6, 1.5], [SU({ la: [130.5, 79.6], lf: -160, lh: [93, 101], rh: [91, 102], glow: 0.9, glowAt: 'lthigh' }), 2.0, 1.5]) };
  S.calfstretch = { props: F([{ t: 'wall', x: 172 }]),
    keys: kf([ST({ hip: [122, 84], sh: [140, 52.8], hd: [146, 42.4], la: [96, 138], ra: [140, 138], lh: [170, 54], rh: [169, 56], glowAt: 'lcalf' }), 0.6, 1.5],
      [ST({ hip: [125, 86], sh: [146.2, 56.9], hd: [153.2, 47.2], la: [96, 138], ra: [140, 138], lh: [170, 58], rh: [169, 60], glow: 1, glowAt: 'lcalf' }), 2.0, 1.5]) };
  const tfA = { hip: [110, 81], lhp: [117, 81], rhp: [103, 81], sh: [110, 44], lsh: [121, 46], rsh: [99, 46], hd: [110, 32], la: [97, 138], ra: [103, 138], lh: [152, 50], rh: [97, 82], lf: 90, rf: 90, flen: 0.5, straight: true, order: 'leftBehind', glow: 0, glowAt: 'lhp', glowOff: [5, 3] };
  const tfB = X(tfA, { hip: [119, 82], lhp: [126, 82], rhp: [112, 82], sh: [113, 45], lsh: [124, 48], rsh: [102, 44], hd: [111, 33], lh: [152, 50], rh: [101, 82], glow: 1 });
  S.tflstretch = { props: F([{ t: 'wall', x: 156 }]), keys: kf([tfA, 0.6, 1.5], [tfB, 2.0, 1.5]) };
  S.hipflexor = { props: F([{ t: 'rail', x: 141, top: 78 }]),
    keys: kf([ST({ hip: [112, 86], sh: [113, 50], hd: [114, 38], la: [86, 138], lf: 18, ra: [138, 138], lh: [138, 79], rh: [136, 80], glowAt: 'lhp', glowOff: [4, -3] }), 0.6, 1.5],
      [ST({ hip: [118, 88], sh: [117, 52], hd: [117, 40], la: [86, 138], lf: 18, ra: [138, 138], lh: [138, 79], rh: [136, 80], glow: 1, glowAt: 'lhp', glowOff: [4, -3] }), 2.0, 1.5]) };
  S.glutestretch = { props: F([{ t: 'mat' }]),
    keys: kf([SU({ la: [134.3, 101.3], lf: -80, lh: [107, 121], rh: [105, 122], glowAt: 'hip', glowOff: [-2, 5] }), 0.6, 1.5],
      [SU({ la: [121, 95], lf: -100, lh: [102, 122], rh: [100, 123], glow: 1, glowAt: 'hip', glowOff: [-2, 5] }), 2.0, 1.5]) };
  const rlA = { hip: [114, 123], sh: [80, 116], hd: [68, 108], lel: [82, 139], lh: [66, 139.5], rh: [104, 128], la: [173.5, 136], rkn: [140, 112], ra: [134, 139.5], lf: 0, rf: 0, flen: 0.45, glow: 0.6, glowAt: 'hip', glowOff: [2, 3] };
  const rlB = X(rlA, { hip: [106, 123], sh: [72, 116], hd: [60, 108], lel: [74, 139], lh: [58, 139.5], rh: [96, 128], la: [165.5, 136], rkn: [132, 112], ra: [126, 139.5] });
  S.roll = { props: F([{ t: 'roll', at: [112, 132.5], r: 8.5 }]), keys: kf([rlA, 0.2, 1.4], [rlB, 0.2, 1.4]) };

  // ---- gym ----
  const lp = { hip: [100, 104], sh: [86, 70], hd: [82, 58], lh: [106, 110], rh: [104, 111], lf: -100, rf: -100, glowAt: 'lthigh' };
  const lpTop = X(lp, { la: [158.5, 91.6], ra: [156.5, 92.6], glow: 0.3 });
  S.minipress = { props: F([{ t: 'legpress' }]), keys: kf([lpTop, 0.5, 1.2], [X(lp, { la: [154.2, 92.5], ra: [152.2, 93.5], glow: 1 }), 0.3, 1.0]) };
  S.pressiso = { props: F([{ t: 'legpress' }]), keys: kf([lpTop, 0.5, 1.0], [X(lp, { la: [155.2, 92.3], ra: [153.2, 93.3], glow: 1 }), 2.6, 1.0]) };
  S.legpress = { props: F([{ t: 'legpress' }]), keys: kf([lpTop, 0.5, 1.4], [X(lp, { la: [148.1, 93.8], ra: [146.1, 94.8], glow: 1 }), 0.3, 1.1]) };
  const ab = { hip: [110, 96], lhp: [117, 96], rhp: [103, 96], sh: [110, 60], lsh: [121, 62], rsh: [99, 62], hd: [110, 48], lh: [129, 94], rh: [91, 94], lf: 90, rf: 90, flen: 0.5, glowAt: 'lhp', glowOff: [6, 0] };
  S.hipabdmachine = { props: F([{ t: 'abd' }, { t: 'abdpads', front: true }]),
    keys: kf([X(ab, { lkn: [116, 104], rkn: [104, 104], la: [116, 131], ra: [104, 131], glow: 0 }), 0.5, 1.0], [X(ab, { lkn: [131, 103], rkn: [89, 103], la: [123, 131], ra: [97, 131], glow: 1 }), 0.6, 1.3]) };
  S.rdl = { props: F([{ t: 'dumbbell', on: 'rhand', far: true }, { t: 'dumbbell', on: 'lhand', front: true }]),
    keys: kf([ST({ hip: [110, 80], sh: [112, 44], hd: [113, 32], la: [112, 138], ra: [107, 138], lh: [114, 82], rh: [111, 82], glowAt: 'lthigh', glowOff: [-5, 0] }), 0.5, 1.6],
      [ST({ hip: [98, 84], sh: [127.5, 63.4], hd: [137.5, 56.5], la: [112, 138], ra: [107, 138], lh: [128, 101], rh: [125, 101], glow: 1, glowAt: 'lthigh', glowOff: [-5, 0] }), 0.6, 1.6]) };
  const hc = { hip: [110, 104], sh: [74, 104], hd: [60, 103], lh: [72, 124], rh: [70, 125], lkn: [140, 104], rkn: [139, 105], glowAt: 'lthigh', glowOff: [0, -4] };
  S.hamcurl = { props: F([{ t: 'bench', x: 50, y: 109, w: 98 }, { t: 'curlpad', front: true }]),
    keys: kf([X(hc, { la: [170, 104], ra: [169, 105], lf: 90, rf: 90, glow: 0 }), 0.5, 1.2], [X(hc, { la: [145.2, 74.5], ra: [144.2, 75.5], lf: 10, rf: 10, glow: 1 }), 0.6, 1.7]) };

  // ---- pool ----
  const water = { t: 'water', y: 57, front: true };
  function walkGen(o = {}) {
    return (p) => {
      const A = o.stride ?? 20, L = o.lift ?? 7, hx = 112;
      const ph = 2 * Math.PI * p;
      const lx = hx + A * Math.sin(ph), ly = 138 - L * Math.max(0, Math.cos(ph));
      const rx = hx + A * Math.sin(ph + Math.PI), ry = 138 - L * Math.max(0, Math.cos(ph + Math.PI));
      const bob = 1.2 * Math.cos(2 * ph), sw = 11 * Math.sin(ph + Math.PI);
      return { hip: [hx, 79 + bob], sh: [hx + 3, 43 + bob], hd: [hx + 5, 31 + bob], la: [lx, ly], ra: [rx, ry], lf: 0, rf: 0,
        lh: [hx + 3 + sw, 80 + bob], rh: [hx + 3 - sw, 80 + bob], le: -1, re: -1, glow: 0 };
    };
  }
  S.walk = { props: F(), period: 1.3, gen: walkGen(), thumbP: 0.25 };
  S.poolwalk = { props: F([water]), period: 1.9, gen: walkGen({ stride: 17, lift: 6 }), thumbP: 0.25 };
  S.poolswing = { props: F([{ t: 'ledge', y: 64 }, water]),
    keys: kf([ST({ la: [135.4, 132.4], lf: -15, ra: [108, 138], lh: [118, 64], rh: [104, 64], glowAt: 'lhp', glowOff: [2, 3] }), 0.3, 1.2],
      [ST({ la: [89.5, 134.4], lf: 15, ra: [108, 138], lh: [118, 64], rh: [104, 64], glow: 0.8, glowAt: 'lhp', glowOff: [-4, 3] }), 0.3, 1.2]) };
  S.poolminisquat = { props: F([{ t: 'ledge', y: 64 }, water]),
    keys: kf([ST({ lh: [120, 64], rh: [106, 64], glowAt: 'lthigh' }), 0.6, 1.3], [ST({ hip: [104, 87], sh: [112, 52], hd: [116, 41], lh: [120, 64], rh: [106, 64], glow: 1, glowAt: 'lthigh' }), 0.8, 1.3]) };
  S.poolcalf = { props: F([{ t: 'ledge', y: 64 }, water]),
    keys: kf([X(crA, { lh: [122, 64], rh: [118, 64] }), 0.6, 0.8], [X(crB, { lh: [122, 64], rh: [118, 64] }), 0.9, 1.7]) };
  S.swim = { props: [{ t: 'water', y: 55, front: true, bottom: 150 }], period: 2.4, thumbP: 0.1,
    gen: (p) => {
      const ph = 2 * Math.PI * p, k = 3 * ph;
      const c = [140, 62];
      const hand = (a) => [c[0] + 40 * Math.cos(a), c[1] + 14 * Math.sin(a)];
      return { hip: [96, 64], sh: [132, 61], hd: [145, 63], la: [38, 66 + 6 * Math.sin(k)], ra: [38, 66 - 6 * Math.sin(k)],
        lf: 175, rf: 175, lh: hand(ph), rh: hand(ph + Math.PI), le: -1, re: -1, glow: 0 };
    } };
  S.ice = { props: F([{ t: 'mat' }, { t: 'pillow', x: 146, y: 124, w: 34, h: 15 }, { t: 'ice', front: true }]),
    keys: kf([SU({ la: [172, 121], lf: -80, glowAt: 'lknee', glowCol: 'blue', glow: 0.25 }), 1.2, 1.2], [SU({ la: [172, 121], lf: -80, glowAt: 'lknee', glowCol: 'blue', glow: 1 }), 1.2, 1.2]) };

  // ---- bike ----
  S.bike = { props: F([{ t: 'bike' }]), period: 1.6, thumbP: 0.6,
    gen: (p) => {
      const c = [122, 118], r = 11, th = p * 2 * Math.PI;
      const lp2 = [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)], rp2 = [c[0] - r * Math.cos(th), c[1] - r * Math.sin(th)];
      return { hip: [104, 74], sh: [124.6, 44.5], hd: [131.5, 34.7], lh: [148, 57], rh: [147, 58], la: [lp2[0] - 1, lp2[1] - 3], ra: [rp2[0] - 1, rp2[1] - 3],
        lf: 8, rf: 8, glow: 0, lpedal: lp2, rpedal: rp2 };
    } };

  // ---- Phase 2 ----
  S.sitstand = { props: F([{ t: 'chair', x: 78, y: 108, w: 28 }]),
    keys: kf([ST({ hip: [100, 104], sh: [110, 70], hd: [114, 58], la: [128, 138], ra: [124, 138.5], lh: [124, 80], rh: [122, 81], le: -1, re: -1, glowAt: 'lthigh' }), 0.6, 1.3],
      [ST({ hip: [124, 78], sh: [126, 42], hd: [127, 30], la: [128, 138], ra: [124, 138.5], lh: [137, 54], rh: [135, 55], le: -1, re: -1, glow: 1, glowAt: 'lthigh' }), 0.7, 2.1]) };
  S.wallsit = { props: F([{ t: 'wall', x: 63 }]),
    keys: kf([ST({ hip: [80, 80], sh: [79, 44], hd: [79, 32], la: [104, 138], ra: [100, 138.5], lh: [84, 92], rh: [82, 93], glowAt: 'lthigh' }), 0.5, 1.5],
      [ST({ hip: [80, 93], sh: [79, 57], hd: [79, 45], la: [104, 138], ra: [100, 138.5], lh: [90, 99], rh: [88, 100], glow: 1, glowAt: 'lthigh' }), 2.4, 1.5]) };
  S.tke = { props: F([{ t: 'post', x: 184, top: 92 }, { t: 'band', from: [184, 106], to: 'lknee' }]),
    keys: kf([ST({ hip: [110, 80], la: [114, 138], ra: [104, 138], glowAt: 'lthigh' }), 0.5, 0.9], [ST({ hip: [110, 78], la: [113, 138], ra: [104, 138], glow: 1, glowAt: 'lthigh' }), 1.4, 1.0]) };
  S.hamslider = { props: F([{ t: 'mat' }, { t: 'slider', on: 'lheel', front: true }, { t: 'slider', on: 'rheel' }]),
    keys: kf([SU({ hip: [112, 121], sh: [78, 135], hd: [64, 134], la: [148, 136], ra: [146, 136.5], lf: -55, rf: -55, lh: [114, 139.5], rh: [112, 140], glowAt: 'lthigh', glowOff: [0, 4] }), 0.5, 1.7],
      [SU({ hip: [110, 127], sh: [76, 136], hd: [62, 134.5], la: [168, 136], ra: [166, 136.5], lf: -80, rf: -80, glow: 1, glowAt: 'lthigh', glowOff: [0, 4] }), 0.6, 1.7]) };
  S.balance = { props: F([{ t: 'rail', x: 142, top: 70 }]),
    keys: kf([ST({ hip: [111, 78], lh: [139, 72], rh: [104, 80], glowAt: 'lhp', glowOff: [4, 2] }), 0.8, 1.0], [ST({ hip: [111, 78], ra: [100, 122], rf: 0, lh: [139, 72], rh: [104, 80], glow: 1, glowAt: 'lhp', glowOff: [4, 2] }), 2.4, 1.0]) };
  S.stepup = { props: F([{ t: 'step', x: 124, w: 44, h: 20 }]),
    keys: kf([ST({ hip: [118, 80], sh: [122, 44], hd: [124, 32], la: [142, 118], ra: [104, 138], lh: [118, 82], rh: [114, 82], glowAt: 'lthigh' }), 0.5, 1.4],
      [ST({ hip: [140, 60], sh: [141, 24], hd: [142, 12], la: [142, 118], ra: [136, 118], lh: [140, 62], rh: [136, 62], glow: 1, glowAt: 'lthigh' }), 0.6, 1.7]) };
  const ssA = ST({ hip: [110, 82], sh: [111, 46], hd: [112, 34], la: [132, 138], ra: [88, 134], rf: 30, lh: [112, 84], rh: [108, 84], glowAt: 'lthigh' });
  S.splitsquat = { props: F(), keys: kf([ssA, 0.5, 1.3], [X(ssA, { hip: [110, 96], sh: [111, 60], hd: [112, 48], lh: [112, 98], rh: [108, 98], glow: 1 }), 0.6, 1.3]) };
  S.reverselunge = { props: F([{ t: 'pad', x: 104, w: 22, h: 8 }]),
    keys: kf([X(ssA, { ra: [84, 134] }), 0.5, 1.4], [X(ssA, { hip: [106, 104], sh: [109, 68], hd: [110, 56], ra: [84, 134], lh: [108, 106], rh: [104, 106], glow: 1 }), 0.5, 1.4]) };

  // ---- Phase 3 ----
  S.stepdown = { props: F([{ t: 'step', x: 92, w: 40, h: 14 }]),
    keys: kf([ST({ hip: [112, 64], sh: [113, 28], hd: [114, 16], la: [112, 124], ra: [132, 120], lh: [114, 66], rh: [110, 66], glowAt: 'lthigh' }), 0.5, 1.6],
      [ST({ hip: [108, 84], sh: [114, 49], hd: [117, 37], la: [112, 124], ra: [141, 137], rf: -15, lh: [116, 86], rh: [112, 86], glow: 1, glowAt: 'lthigh' }), 0.5, 1.4]) };
  const spB = { hip: [118, 124], sh: [83, 115.5], hd: [71.5, 112.5], rel: [84, 139], rh: [100, 139.5], lh: [114, 117], le: -1, la: [176.6, 137], ra: [176.6, 139], lf: 0, rf: 0, flen: 0.45, glow: 1, glowAt: 'hip', glowOff: [0, -5] };
  S.sideplank = { props: F([{ t: 'mat' }]), keys: kf([X(spB, { hip: [118, 134], sh: [84, 117], la: [177.5, 137], ra: [177.5, 139.5], glow: 0 }), 0.6, 1.0], [spB, 2.2, 1.0]) };
  S.gobletbox = { props: F([{ t: 'box', x: 78, y: 110, w: 26 }, { t: 'goblet', front: true }]),
    keys: kf([ST({ hip: [124, 78], sh: [126, 42], hd: [127, 30], la: [128, 138], ra: [124, 138.5], lh: [134, 58], rh: [132, 59], le: -1, re: -1, glowAt: 'lthigh' }), 0.5, 1.6],
      [ST({ hip: [100, 105], sh: [112, 72], hd: [117, 61], la: [128, 138], ra: [124, 138.5], lh: [124, 84], rh: [122, 85], le: -1, re: -1, glow: 1, glowAt: 'lthigh' }), 0.5, 1.5]) };
  const rfA = ST({ hip: [100, 84], sh: [102, 48], hd: [103, 36], la: [126, 138], ra: [72, 125], rf: 160, lh: [102, 86], rh: [98, 86], glowAt: 'lthigh' });
  S.rfess = { props: F([{ t: 'step', x: 52, w: 28, h: 14 }]), keys: kf([rfA, 0.5, 1.4], [X(rfA, { hip: [100, 98], sh: [103, 62], hd: [104, 50], lh: [102, 100], rh: [98, 100], glow: 1 }), 0.6, 1.4]) };
  S.slrdl = { props: F([{ t: 'dumbbell', on: 'lhand', front: true }]),
    keys: kf([ST({ hip: [110, 80], sh: [112, 44], hd: [113, 32], la: [112, 138], ra: [106, 132], rf: 20, lh: [113, 82], rh: [109, 82], glowAt: 'lthigh', glowOff: [-5, 0] }), 0.5, 1.7],
      [ST({ hip: [104, 82], sh: [138.8, 72.7], hd: [150, 69], la: [112, 138], ra: [46, 97.5], rf: 75, lh: [138, 108], rh: [135, 108], glow: 1, glowAt: 'lthigh', glowOff: [-5, 0] }), 0.6, 1.7]) };
  const sqA = ST({ hip: [102, 90], sh: [116, 57], hd: [121, 46], la: [112, 138], ra: [107, 138], lh: [100, 90], rh: [97, 90], glowAt: 'lthigh' });
  const sqB = ST({ hip: [111, 73.4], sh: [113, 37.4], hd: [114, 25.4], la: [112, 133.4], ra: [107, 133.4], lf: 35, rf: 35, lh: [138, 22], rh: [135, 23], glow: 1, glowAt: 'lcalf' });
  S.squatrise = { props: F(), keys: kf([sqA, 0.6, 0.7], [sqB, 0.4, 0.7]) };
  const hA = ST({ hip: [110, 82], sh: [113, 46], hd: [115, 34], la: [112, 138], ra: [107, 138], lh: [104, 84], rh: [101, 84] });
  const hAir = ST({ hip: [110, 68], sh: [112, 32], hd: [113, 20], la: [111, 126], ra: [106, 126], lf: 25, rf: 25, lh: [124, 60], rh: [121, 60] });
  const hLand = ST({ hip: [104, 90], sh: [114, 56], hd: [118, 45], la: [112, 138], ra: [107, 138], lh: [124, 78], rh: [121, 78], glow: 1, glowAt: 'lknee' });
  S.hopstick = { props: F(), thumb: 2, keys: kf([hA, 0.4, 0.22], [hAir, 0.0, 0.22], [hLand, 1.3, 0.8]) };
  const sh2 = (q, dx, dy = 0) => { const o = {}; Object.keys(q).forEach((k) => { o[k] = Array.isArray(q[k]) ? [q[k][0] + dx, q[k][1] + dy] : q[k]; }); return o; };
  S.landing = { props: F(), thumb: 2, keys: kf([sh2(hA, -12), 0.4, 0.26], [sh2(hAir, 2, -2), 0.0, 0.26], [sh2(hLand, 16), 1.2, 0.9]) };
  S.stephop = { props: F([{ t: 'step', x: 116, w: 48, h: 10 }]), thumb: 2, keys: kf([sh2(hA, -18), 0.4, 0.26], [sh2(hAir, -2, -8), 0.0, 0.26], [sh2(hLand, 26, -10), 1.2, 0.9]) };

  // ---- Phase 4 ----
  S.run = { props: F(), period: 0.8, thumbP: 0.3,
    gen: (p) => {
      const ph = 2 * Math.PI * p, hx = 112;
      const leg = (q) => { const x = hx + 24 * Math.sin(q); const y = 138 - (Math.cos(q) > 0 ? 17 * Math.cos(q) : 0); return [x, y]; };
      const bob = 2.5 * Math.cos(2 * ph), sw = 12 * Math.sin(ph + Math.PI);
      return { hip: [hx, 80 + bob], sh: [hx + 8, 45 + bob], hd: [hx + 11, 33.5 + bob], la: leg(ph), ra: leg(ph + Math.PI), lf: 0, rf: 0,
        lh: [hx + 14 + sw, 68 + bob], rh: [hx + 14 - sw, 68 + bob], le: -1, re: -1, glow: 0 };
    } };
  S.cod = { props: [], period: 7, thumbP: 0.15, gen: () => ({ mode: 'path' }) };
  S.cardio = S.bike;

  return S;
})();
