import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../../app/', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

test('language switching keeps records and localizes English practice on a small phone', { timeout: 180000 }, async (t) => {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
      if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('outside app');
      res.setHeader('Content-Type', `${mime[extname(file)] || 'application/octet-stream'}; charset=utf-8`);
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const url = `http://127.0.0.1:${server.address().port}/?capture&count=6&seed=42&extra=4`;
  let browser; let page;
  const errors = [];
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    const state = (fn) => page.evaluate(fn);
    const screen = (value) => page.waitForFunction((value) => window.__dopa?.S.screen === value, value);
    const ready = () => page.waitForFunction(() => window.__dopa?.S.screen === 'play' && window.__dopa.S.ready);
    const tap = (selector) => page.locator(selector).tap();
    const englishOnly = async (selector = 'body') => {
      const result = await page.locator(selector).evaluate((el) => {
        return [...el.querySelectorAll('*'), el].filter((e) => !['OPTION', 'SCRIPT', 'STYLE'].includes(e.tagName) && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').flatMap((e) => {
          const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent);
          return [...own, e.getAttribute('aria-label') || ''];
        }).filter((text) => /[\u3400-\u9fff\u3040-\u30ff]/u.test(text));
      });
      assert.deepEqual(result, [], `untranslated visible text in ${selector}`);
    };
    const answer = async (wrong = false) => {
      await ready();
      const before = await state(() => ({ solved: window.__dopa.S.solved, digits: window.__dopa.S.problem.steps.map((s) => s.digit) }));
      if (wrong) await tap(`#pad [data-key="${(Number(before.digits[0]) + 1) % 10}"]`);
      for (const digit of before.digits) {
        const box = await page.locator(`#pad [data-key="${digit}"]`).boundingBox();
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      }
      await page.waitForFunction((n) => window.__dopa.S.solved === n + 1, before.solved);
    };

    await t.test('change language using settings without resetting existing learning records', async () => {
      await page.goto(url);
      await screen('title');
      assert.equal(await page.title(), '算数星球');
      // Supply a real saved problem, as a previous visit would have done.
      await state(async () => {
        const { makeProblem, makeRng, signature } = await import('/js/problems.js');
        const st = window.__dopa.store.load();
        const p = makeProblem('g3-div-rem', makeRng(5));
        st.history.push({ id: 'before-language', at: Date.now(), day: window.__dopa.store.dayKey(), mode: 'grade', grade: 2, score: 100, ok: 6, timeMs: 12000 });
        st.progress = { placed: true, skills: { 'g1-add-nc': { mastered: true, stars: 2, n: 6, hist: [1,1,1,1,1,1], recent: [] } }, review: [{ sig: signature(p), skill: p.skill, problem: p, at: Date.now() }] };
        st.guideSeen = true;
        window.__dopa.store.updateSettings({ motion: 0, sound: false });
      });
      await tap('#open-settings');
      await Promise.all([page.waitForEvent('load'), page.locator('#language').selectOption('en')]);
      await screen('title');
      assert.equal(await page.title(), 'Math Planet');
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(await state(() => window.__dopa.store.settings().language), 'en');
      assert.equal(await state(() => window.__dopa.store.load().history[0].id), 'before-language');
      assert.equal(await state(() => window.__dopa.progress().skills['g1-add-nc'].stars), 2);
      assert.equal(await state(() => window.__dopa.progress().review.length), 1);
      await englishOnly('#screen-title');
      assert.equal(await state(() => [...document.querySelectorAll('.grades button small')].every((e) => {
        const r = e.getBoundingClientRect(), button = e.parentElement.getBoundingClientRect();
        return r.left >= button.left && r.right <= button.right && r.top >= button.top && r.bottom <= button.bottom;
      })), true, 'English grade numbers fit their buttons');
      await tap('.game-notes summary');
      await englishOnly('.game-notes');
      await tap('.game-notes summary');
      await page.reload(); await screen('title');
      assert.equal(await page.title(), 'Math Planet');
      await tap('#open-guide');
      await page.locator('#guide').waitFor({ state: 'visible' });
      await englishOnly('#guide');
      await tap('#guide-skip');
    });

    await t.test('English help, skills, trophies, collection and confirmations have translated labels', async () => {
      await tap('#open-tree'); await screen('tree');
      await englishOnly('#screen-tree');
      assert.match(await page.locator('.node[data-id="g1-add-nc"]').innerText(), /addition/i);
      await tap('.node[data-id="g1-add-nc"]');
      await page.locator('#skill-info').waitFor({ state: 'visible' });
      await englishOnly('#skill-info'); await tap('#si-close'); await tap('#tree-back');
      await tap('#open-trophy'); await screen('trophy'); await englishOnly('#screen-trophy');
      await tap('[data-f="soon"]'); await englishOnly('#screen-trophy'); await tap('#trophy-back');
      await tap('#open-collect'); await screen('collect'); await englishOnly('#screen-collect');
      await tap('[data-cat="costume"]'); await englishOnly('#screen-collect'); await tap('#collect-back');
      await tap('#open-settings'); await englishOnly('#settings');
      assert.equal(await state(() => [...document.querySelectorAll('.pick button small')].every((e) => {
        const r = e.getBoundingClientRect(), button = e.parentElement.getBoundingClientRect();
        return r.left >= button.left && r.right <= button.right && r.top >= button.top && r.bottom <= button.bottom;
      })), true, 'English question-count labels fit their buttons');
      await tap('#reset-data'); await englishOnly('#confirm');
      await tap('#confirm-yes'); await englishOnly('#confirm');
      await tap('#confirm-no');
      assert.equal(await state(() => window.__dopa.store.load().history[0].id), 'before-language');
    });

    await t.test('English review uses the same answer steps and removes the existing Chinese wrong problem', async () => {
      await tap('#start-review'); await ready();
      await englishOnly('#screen-play');
      assert.match(await page.locator('#qtitle').innerText(), /Division|division/);
      await answer(); await screen('result'); await englishOnly('#screen-result');
      assert.equal(await state(() => window.__dopa.progress().review.length), 0);
      await tap('#go-title');
    });

    await t.test('English basic and extra rounds fit small screens and retain canonical saved questions', async () => {
      await tap('[data-grade="1"]'); await ready();
      assert.equal(await state(() => [...document.querySelectorAll('#pad button,#pause-play,#mute')].every((e) => { const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight; })), true);
      await tap('#pause-play'); await englishOnly('#confirm'); await tap('#confirm-no');
      await answer(true);
      for (let i=1;i<6;i++) await answer();
      await screen('result'); await englishOnly('#screen-result');
      assert.equal(await page.locator('#r-rate').innerText(), '83%');
      assert.equal(await state(() => window.__dopa.progress().review.length), 1);
      assert.match(await state(() => window.__dopa.progress().review[0].problem.title), /[\u3400-\u9fff]/u);
      await tap('#go-extra'); await ready(); await englishOnly('#screen-play');
      await screen('final'); await englishOnly('#screen-final'); await tap('#again');
      await tap('#open-settings');
      await Promise.all([page.waitForEvent('load'), page.locator('#language').selectOption('zh-CN')]);
      await screen('title'); assert.equal(await page.title(), '算数星球');
      assert.equal(await state(() => window.__dopa.progress().review.length), 1);
      await tap('#start-review'); await answer(); await screen('result');
      assert.equal(await state(() => window.__dopa.progress().review.length), 0);
    });

    await t.test('every skill has an English problem view without changing its answer inputs', async () => {
      await tap('#go-title');
      await tap('#open-settings');
      await Promise.all([page.waitForEvent('load'), page.locator('#language').selectOption('en')]);
      await screen('title');
      const ids = await state(async () => (await import('/js/skills.js')).SKILLS.map((s) => s.id));
      for (const id of ids) {
        await page.evaluate((id) => window.__dopa.startGame('practice', id), id);
        await ready();
        await englishOnly('#screen-play');
        if (['g6-frac-div', 'g4-round'].includes(id)) {
          await state(() => {
            const wrong = String((Number(window.__dopa.S.problem.steps[0].digit) + 1) % 10);
            for (let i = 0; i < 3; i++) window.__dopa.press(wrong);
          });
          await englishOnly('#screen-play');
        }
        const layout = await state(() => {
          const sheet = document.querySelector('#sheet');
          const r = sheet.getBoundingClientRect();
          return { width: sheet.scrollWidth, available: sheet.parentElement.clientWidth, left: r.left, right: r.right };
        });
        assert.ok(layout.width <= layout.available + 2 && layout.left >= 0 && layout.right <= 320, `${id} fits: ${JSON.stringify(layout)}`);
        await tap('#pause-play'); await tap('#confirm-yes'); await screen('title');
      }
    });

    await t.test('failed storage prevents a language reload from losing this visit’s progress', async () => {
      await tap('#open-settings');
      await state(() => {
        window.__languageTestVisit = true;
        window.__savedStorageWrite = Storage.prototype.setItem;
        Storage.prototype.setItem = () => { throw new Error('storage blocked'); };
        window.__dopa.store.load().history.push({ id: 'unsaved-progress' });
      });
      try {
        await page.locator('#language').selectOption('zh-CN');
        assert.equal(await state(() => window.__languageTestVisit), true, 'the visit was not reloaded');
        assert.equal(await page.title(), 'Math Planet');
        assert.equal(await page.locator('#language').inputValue(), 'en');
        assert.equal(await state(() => window.__dopa.store.load().history.at(-1).id), 'unsaved-progress');
        assert.match(await page.locator('#language-status').innerText(), /could not save/);
      } finally {
        await state(() => { Storage.prototype.setItem = window.__savedStorageWrite; delete window.__savedStorageWrite; delete window.__languageTestVisit; });
      }
    });
    assert.deepEqual(errors, []);
  } catch (error) {
    if (page) { await mkdir('.test-artifacts', { recursive: true }); await page.screenshot({ path: '.test-artifacts/language-failure.png' }).catch(() => {}); }
    throw error;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
