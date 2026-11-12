import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const appRoot = fileURLToPath(new URL('../../app/', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

test('Chinese mobile practice, review, persistence, placement and extra round', { timeout: 180000 }, async (t) => {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(appRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(appRoot.endsWith(sep) ? appRoot : appRoot + sep)) throw new Error('outside app');
      res.setHeader('Content-Type', `${mime[extname(file)] || 'application/octet-stream'}; charset=utf-8`);
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const url = `http://127.0.0.1:${server.address().port}`;
  let browser;
  let page;
  const errors = [];
  try {
    // Use the installed Chrome; browser downloads are not needed for this check.
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-11-15T04:00:00Z'));
    const state = (fn) => page.evaluate(fn);
    const screen = (name) => page.waitForFunction((name) => window.__dopa?.S.screen === name, name);
    const ready = () => page.waitForFunction(() => window.__dopa?.S.screen === 'play' && window.__dopa.S.ready);
    const tap = async (selector) => {
      const element = page.locator(selector);
      if (!selector.startsWith('#pad ')) return element.tap();
      // The keypad has a 2px beat animation; real touch does not wait for it to stop.
      await element.waitFor({ state: 'visible' });
      const box = await element.boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    };
    const dismissTrophies = async () => {
      while (await state(() => window.__dopa.S.trophyOpen || window.__dopa.S.trophyQueue.length > 0)) {
        await page.locator('#trophy-got').waitFor({ state: 'visible', timeout: 5000 });
        await tap('#tg-ok');
      }
    };
    const answer = async (wrong = false) => {
      await ready();
      const before = await state(() => {
        const s = window.__dopa.S;
        return { mode: s.mode, solved: s.mode === 'extra' ? s.extra.solved : s.solved, digits: s.problem.steps.map((step) => step.digit), misses: s.misses };
      });
      if (wrong) {
        await tap(`#pad [data-key="${(Number(before.digits[0]) + 1) % 10}"]`);
        assert.equal(await state(() => window.__dopa.S.misses), before.misses + 1);
      }
      for (const digit of before.digits) await tap(`#pad [data-key="${digit}"]`);
      await page.waitForFunction(({ mode, solved }) => (mode === 'extra' ? window.__dopa.S.extra.solved : window.__dopa.S.solved) === solved + 1, before);
    };

    await t.test('Chinese onboarding and mobile pause keep input and clocks stopped', async () => {
      await page.goto(`${url}/?count=6&seed=42`);
      await page.locator('#guide-skip').waitFor({ state: 'visible' });
      assert.equal(await page.title(), '算数星球');
      assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
      await tap('#guide-skip');
      await page.locator('#bonus').waitFor({ state: 'visible' });
      await tap('#bonus-ok');
      await dismissTrophies();
      await tap('#open-settings');
      await tap('[data-count="6"]');
      await page.locator('#motion').focus();
      await page.keyboard.press('Home');
      await tap('[data-toggle="sound"]');
      await tap('#close-settings');
      assert.equal(await state(() => window.__dopa.S.reduced), true);
      await tap('[data-grade="1"]');
      await ready();
      assert.equal(await state(() => window.__dopa.S.N), 6);
      assert.equal(await state(() => [...document.querySelectorAll('#pad button, #pause-play')].every((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
      })), true);
      await tap('#pause-play');
      assert.equal(await page.locator('#confirm-title').innerText(), '练习已暂停');
      const clock = await page.locator('#clock').innerText();
      const step = await state(() => window.__dopa.S.step);
      await page.keyboard.press('1');
      await page.waitForTimeout(1100);
      assert.equal(await page.locator('#clock').innerText(), clock);
      assert.equal(await state(() => window.__dopa.S.step), step);
      await page.keyboard.press('Tab');
      assert.equal(await state(() => document.activeElement.closest('#confirm') !== null), true);
      await tap('#confirm-no');
      assert.equal(await state(() => !!window.__dopa.S.confirm), false);
    });

    await t.test('wrong answer, full basic round, review removal and reload', async () => {
      await answer(true);
      for (let i = 1; i < 6; i++) await answer();
      await screen('result');
      assert.equal(await page.locator('#r-score').innerText(), '100');
      assert.equal(await page.locator('#r-rate').innerText(), '83%');
      assert.equal(await state(() => window.__dopa.progress().review.length), 1);
      assert.equal(await state(() => window.__dopa.stats().flags.sunday), true);
      await dismissTrophies();
      await tap('#go-title');
      await dismissTrophies();
      await tap('#start-review');
      await answer();
      await screen('result');
      assert.equal(await state(() => window.__dopa.progress().review.length), 0);
      assert.equal(await page.locator('#go-again').isVisible(), false);
      await dismissTrophies();
      await tap('#go-title');
      await page.reload();
      await screen('title');
      assert.equal(await page.locator('#start-review').isVisible(), false);
      assert.equal(await state(() => window.__dopa.store.load().history.length), 2);
      assert.equal(await state(() => window.__dopa.store.settings().count), 6);
    });

    await t.test('placement recommends a skill without automatically mastering ancestors', async () => {
      await dismissTrophies();
      await tap('#open-settings');
      await tap('[data-count="14"]');
      await tap('#close-settings');
      const mastered = await state(() => Object.values(window.__dopa.progress().skills).filter((s) => s.mastered).length);
      await tap('#start');
      for (let i = 0; i < 14; i++) await answer();
      await screen('result');
      assert.equal(await state(() => window.__dopa.progress().placed), true);
      assert.ok(await state(() => window.__dopa.progress().placementSkill));
      assert.equal(await state(() => Object.values(window.__dopa.progress().skills).filter((s) => s.mastered).length), mastered);
      await dismissTrophies();
      await tap('#go-title');
      const recommended = await state(async () => { const { SKILL } = await import('/js/skills.js'); return SKILL[window.__dopa.progress().placementSkill].name; });
      assert.ok((await page.locator('#level-sub').innerText()).includes(recommended));
    });

    await t.test('invalid URL options fall back and a touch user can return home', async () => {
      for (const skill of ['missing', 'toString', 'constructor', '__proto__']) {
        await page.goto(`${url}/?count=7&seed=nope&extra=1e306&skill=${skill}`);
        await screen('title');
        await dismissTrophies();
        assert.equal(await page.locator('.pick [aria-checked="true"]').getAttribute('data-count'), '10');
        await tap('[data-grade="1"]');
        await ready();
        assert.equal(await state(() => window.__dopa.S.N), 10);
        // Exercise the parsed duration directly without replaying ten basic questions.
        await state(() => window.__dopa.startExtra());
        const left = await state(() => window.__dopa.S.extra.end - performance.now());
        assert.ok(left > 89000 && left <= 91000);
        await tap('#pause-play');
        await tap('#confirm-yes');
        await screen('title');
      }
    });

    await t.test('14 clean answers and a clean extra round earn their trophies', async () => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto(`${url}/?count=14&seed=123&extra=8`);
      await screen('title');
      await dismissTrophies();
      await tap('[data-grade="1"]');
      await ready();
      assert.equal(await state(() => {
        const p = document.querySelector('.pips').getBoundingClientRect();
        const h = document.querySelector('.hud').getBoundingClientRect();
        return p.top >= h.top && p.bottom <= h.bottom;
      }), true, 'fourteen progress dots fit inside the small-screen header');
      for (let i = 0; i < 14; i++) await answer();
      await screen('result');
      assert.equal(await state(() => window.__dopa.stats().flags.perfect14), true);
      await dismissTrophies();
      await tap('#go-extra');
      await ready();
      const deadline = await state(() => window.__dopa.S.extra.end);
      await tap('#pause-play');
      await page.waitForTimeout(1100);
      await tap('#confirm-no');
      assert.ok(await state(() => window.__dopa.S.extra.end) > deadline + 1000);
      for (let i = 0; i < 5; i++) await answer();
      await screen('final');
      assert.equal(await state(() => window.__dopa.stats().flags.extraClean), true);
      assert.equal(await state(() => window.__dopa.store.load().history.at(-1).extraOk), 5);
      assert.ok(Number((await page.locator('#f-score').innerText()).replaceAll(',', '')) > 100);
      assert.ok(await state(() => window.__dopa.trophyState().got['secret-perfect14'] && window.__dopa.trophyState().got['secret-extraClean']));
    });

    await t.test('old Japanese review snapshots remain answerable and removable', async () => {
      await state(async () => {
        const { makeProblem, makeRng } = await import('/js/problems.js');
        const p = makeProblem('g3-div-rem', makeRng(5));
        p.title = 'あまりのあるわりざん';
        p.steps.at(-1).label = 'あまり';
        p.steps[0].help = 'broken old hint';
        const st = window.__dopa.store.load();
        st.progress.review = [{ sig: `${p.title}|${p.text}`, skill: p.skill, problem: p, at: Date.now() }];
        window.__dopa.store.save();
      });
      await page.goto(url);
      await screen('title');
      await dismissTrophies();
      await tap('#start-review');
      await ready();
      assert.equal(await page.locator('#qtitle').innerText(), '有余数的除法');
      assert.doesNotMatch(await page.locator('#screen-play').innerText(), /[\u3040-\u30ff]/u);
      await answer();
      await screen('result');
      assert.equal(await state(() => window.__dopa.progress().review.length), 0);
    });

    await t.test('late animations cannot answer a new round or advance a paused question', async () => {
      await state(() => window.__dopa.store.updateSettings({ motion: 1 }));
      await page.goto(`${url}/?capture&count=6&seed=42`);
      await screen('title');
      await tap('[data-grade="1"]');
      await ready();
      const recorded = await state(() => window.__dopa.stats().problems);
      // Compress this real event sequence to exercise the animation handoff window.
      await state(() => {
        for (const step of window.__dopa.S.problem.steps) window.__dopa.press(step.digit);
        document.querySelector('#pause-play').click();
        document.querySelector('#confirm-yes').click();
        document.querySelector('[data-grade="1"]').click();
      });
      await ready();
      await page.waitForTimeout(1500);
      assert.equal(await state(() => window.__dopa.S.solved), 0);
      assert.equal(await state(() => window.__dopa.stats().problems), recorded);
      await state(() => {
        for (const step of window.__dopa.S.problem.steps) window.__dopa.press(step.digit);
        document.querySelector('#pause-play').click();
      });
      await page.waitForTimeout(1500);
      assert.deepEqual(await state(() => [window.__dopa.S.solved, window.__dopa.S.qi, window.__dopa.S.screen]), [0, 0, 'play']);
      await tap('#confirm-no');
      await page.waitForFunction(() => window.__dopa.S.solved === 1);
      await tap('#pause-play');
      await page.waitForTimeout(1000);
      assert.equal(await state(() => window.__dopa.S.qi), 0, 'question transition waits for resume');
      await tap('#confirm-no');
      for (let i = 1; i < 5; i++) await answer();
      await ready();
      const history = await state(() => window.__dopa.store.load().history.length);
      await state(() => { for (const step of window.__dopa.S.problem.steps) window.__dopa.press(step.digit); });
      await page.waitForFunction(() => window.__dopa.S.endT > 0);
      await tap('#pause-play');
      await page.waitForTimeout(4500);
      assert.equal(await state(() => window.__dopa.S.screen), 'play');
      assert.equal(await state(() => window.__dopa.store.load().history.length), history);
      await tap('#confirm-no');
      await screen('result');
      assert.equal(await state(() => window.__dopa.store.load().history.length), history + 1);
    });

    await t.test('extra deadline rejects new input but counts a previously accepted final digit', async () => {
      await page.goto(`${url}/?capture&count=6&seed=42`);
      await screen('title');
      await tap('[data-grade="1"]');
      await ready();
      await state(() => { window.__dopa.startExtra(); window.__dopa.S.extra.end = performance.now() + 1; });
      await page.waitForFunction(() => window.__dopa.S.extra.over);
      await page.waitForTimeout(900);
      assert.equal(await state(() => window.__dopa.S.ready), false);
      await state(() => window.__dopa.press(window.__dopa.S.problem.steps[0].digit));
      assert.equal(await state(() => window.__dopa.S.extra.solved), 0);
      await screen('final');

      await page.goto(`${url}/?capture&count=6&seed=42`);
      await screen('title');
      await tap('[data-grade="1"]');
      await ready();
      await state(() => window.__dopa.startExtra());
      await ready();
      await state(() => {
        const { hero, S, press } = window.__dopa;
        const carry = hero.carry.bind(hero);
        hero.carry = (from, to, digit, options) => carry(from, to, digit, { ...options, onPlace: () => setTimeout(options.onPlace, 2200) });
        S.extra.end = performance.now() + 20;
        for (const step of S.problem.steps) press(step.digit);
      });
      await page.waitForFunction(() => window.__dopa.S.extra.over);
      await page.waitForTimeout(1800);
      assert.equal(await state(() => window.__dopa.S.screen), 'play', 'settlement waits for the already accepted answer');
      await screen('final');
      assert.equal(await state(() => window.__dopa.S.extra.solved), 1);
      assert.equal(await state(() => window.__dopa.S.extra.score), 10);
    });
    assert.deepEqual(errors, [], 'browser JavaScript errors');
  } catch (error) {
    if (page) { await mkdir('.test-artifacts', { recursive: true }); await page.screenshot({ path: '.test-artifacts/core-failure.png' }).catch(() => {}); }
    throw error;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
