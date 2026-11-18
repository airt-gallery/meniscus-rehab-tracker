/*
 * End-to-end and logic checks for Meniscus Rehab Tracker.
 * Setup:  cd tests && npm install && npx playwright install chromium
 * Run:    npm test            (set CHROME_PATH to use an installed Chrome instead)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const FILE = 'file://' + path.join(ROOT, 'index.html');
let pass = 0, fail = 0; const failures = [];
const ok = (cond, msg) => { if (cond) pass++; else { fail++; failures.push(msg); } };
const launch = () => chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {});

function serve(dir) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(dir, p);
    if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => srv.listen(0, () => r(srv)));
}

async function onboard(page, side = 'right') {
  await page.click(`.sheet [data-a="pick"][data-f="side"][data-v="${side}"]`);
  await page.click('[data-a="saveWelcome"]');
  await page.waitForTimeout(300);
}

(async () => {
  const browser = await launch();

  // 1. First run, side tokens, core logic
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(FILE); await page.waitForTimeout(300);
    ok(await page.isVisible('[data-a="saveWelcome"]'), 'welcome sheet shows on first run');
    ok(await page.isDisabled('[data-a="saveWelcome"]'), 'welcome needs a knee choice');
    await onboard(page, 'right');
    const st = await page.evaluate(() => ({ side: State.plan.side, ack: State.plan.ack, sub: document.getElementById('topSub').textContent }));
    ok(st.side === 'right' && st.ack && st.sub.startsWith('Right knee'), 'onboarding saved ' + JSON.stringify(st));
    await page.evaluate(() => openExercise('heelslide', 'lib', true, {})); await page.waitForTimeout(500);
    const txt = await page.textContent('.sheet');
    ok(txt.includes('Slide the right heel') && txt.includes('Your right leg') && !txt.includes('{inj}'), 'cues use the chosen side');
    await page.click('.sheet [data-a="closeSheet"]'); await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const R = {}; const today = todayKey();
      const md = mergeDay({ m: { pain: 1, t: 5 }, e: { ice: 1, t: 7 } }, { m: { pain: 4, t: 9 } });
      R.merge = md.m.m.pain === 4 && md.m.e.ice === 1 && md.toLocal && md.toRemote;
      const rd = (m) => { State.days['2030-01-01'] = { m: Object.assign({ pain: 0, sw: 0, st: 1, cmp: 0, mech: 0, night: 0, t: 1 }, m) }; return readiness('2030-01-01').lvl; };
      R.ready = [rd({ pain: 2 }), rd({ pain: 3 }), rd({ pain: 5 }), rd({ sw: 2 }), rd({ mech: 1 }), rd({ st: 0 })].join('');
      delete State.days['2030-01-01'];
      for (let i = 0; i < 7; i++) State.days[addDays(today, -i)] = { m: { pain: 1, sw: 0, st: 1, cmp: 0, mech: 0, night: 0, t: 10 + i } };
      for (let i = 1; i <= 3; i++) State.days[addDays(today, -i)].s_home = { done: { slr: 1 }, pain: 2, sw: 0, fin: Date.now() - i * 1000, t: 20 + i };
      R.slBefore = slGate(today).open; State.plan.checks['sl-test'] = today; R.slAfter = slGate(today).open;
      State.plan.phase = 2; State.plan.hist = [{ phase: 2, start: today, why: '' }]; State.plan.checks = {};
      const su = resolveItems(2, 'strA', today).find((o) => o.id === 'stepup'); R.lock = su.locked === 'sl' && su.alt === 'sitstand';
      R.segs = segsFor(EX.quadset).length === 20 && stageSegs(1).length === 11;
      State.plan.phase = 1; State.plan.hist = [{ phase: 1, start: today, why: '' }];
      const s = summaryText(); R.sum = s.includes('Knee: Right.') && s.includes('LAST 14 DAYS') && !s.includes('{inj}');
      return R;
    });
    ok(r.merge, 'merge keeps the newest section'); ok(r.ready === 'garrra', 'readiness levels ' + r.ready);
    ok(r.slBefore === false && r.slAfter === true, 'single-leg gate'); ok(r.lock, 'single-leg exercises swap to two-leg versions');
    ok(r.segs, 'timer segments'); ok(r.sum, 'physio summary');
    ok(errs.length === 0, 'no page errors: ' + errs.join(' | '));
    await ctx.close();
  }

  // 2. Daily flow, backup round trip, PDF
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(FILE); await page.waitForTimeout(300); await onboard(page, 'left');
    await page.click('[data-a="morning"]'); await page.waitForTimeout(300);
    for (const [f, v] of [['pain', 3], ['sw', 1], ['st', 1], ['cmp', 0], ['mech', 0], ['night', 0]]) await page.click(`.sheet [data-a="pick"][data-f="${f}"][data-v="${v}"]`);
    await page.click('[data-a="saveMorning"]'); await page.waitForTimeout(300);
    ok(await page.isVisible('.banner.a'), 'amber morning shows scale-back banner');
    for (let i = 0; i < 2; i++) { const b = await page.$('.ex:not(.done) .chk[data-ctx^="s_"]'); if (b) { await b.click(); await page.waitForTimeout(120); } }
    if (await page.isEnabled('[data-a="finish"]')) {
      await page.click('[data-a="finish"]'); await page.waitForTimeout(300);
      await page.click('.sheet [data-a="pick"][data-f="pain"][data-v="2"]'); await page.click('.sheet [data-a="pick"][data-f="sw"][data-v="0"]');
      await page.click('[data-a="saveFinish"]'); await page.waitForTimeout(300);
    }
    const fin = await page.evaluate(() => sessionsDone(todayKey(), 1).length);
    ok(fin === 1 || (await page.evaluate(() => SESS[1][sessionKeyFor(todayKey())].rest)), 'session finished (or rest day)');
    await page.click('[data-a="tab"][data-t="log"]'); await page.waitForTimeout(200);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-a="exportData"]')]);
    const json = fs.readFileSync(await dl.path(), 'utf8');
    ok(JSON.parse(json).app === 'meniscus-rehab', 'backup downloads as JSON');
    await page.evaluate(() => { State.days = {}; saveLocal(true); renderView(); });
    await page.click('[data-a="importData"]'); await page.waitForTimeout(300);
    await page.fill('#imTxt', json); await page.click('[data-a="doImport"]'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => { const m = sec(todayKey(), 'm'); return !!m && m.pain === 3; }), 'restore brings entries back');
    await page.click('[data-a="summary"]'); await page.waitForTimeout(300);
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.click('[data-a="pdfSum"]')]);
    const head = fs.readFileSync(await pdf.path()).slice(0, 8).toString('latin1');
    ok(head.startsWith('%PDF-1.4'), 'physio summary PDF downloads');
    ok(errs.length === 0, 'no page errors: ' + errs.join(' | '));
    await ctx.close();
  }

  // 3. Offline install over HTTP (service worker)
  {
    const srv = await serve(ROOT); const port = srv.address().port;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(`http://localhost:${port}/`); await page.waitForTimeout(300);
    const ready = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
    ok(ready, 'service worker active');
    await page.reload(); await page.waitForTimeout(500);
    await ctx.setOffline(true);
    await page.reload(); await page.waitForTimeout(500);
    ok((await page.title()) === 'Meniscus Rehab Tracker' && await page.isVisible('.tabs'), 'app opens offline');
    await ctx.setOffline(false);
    ok(errs.length === 0, 'no page errors: ' + errs.join(' | '));
    await ctx.close(); srv.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  failures.forEach((f) => console.log('  FAIL ' + f));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
