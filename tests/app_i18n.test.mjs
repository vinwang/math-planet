import test from 'node:test';
import assert from 'node:assert/strict';
import { getLanguage, setLanguage, t, locale } from '../app/js/i18n.js';
import * as store from '../app/js/store.js';

test('language selection defaults to Chinese and formats English explicitly', () => {
  try {
    assert.equal(getLanguage(), 'zh-CN');
    assert.equal(t('答对', 'Correct'), '答对');
    setLanguage('en');
    assert.equal(t('答对', 'Correct'), 'Correct');
    assert.equal(locale(), 'en-US');
    setLanguage('unsupported');
    assert.equal(getLanguage(), 'zh-CN');
  } finally { setLanguage('zh-CN'); }
});

test('language persists alongside existing settings, history and skill progress', () => {
  const data = new Map();
  const storage = { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  store.reset(null);
  const state = store.load(storage);
  state.history.push({ mode: 'grade', grade: 3, score: 100 });
  state.progress = { placed: true, skills: { 'g1-add-nc': { mastered: true, stars: 2 } }, review: [] };
  state.settings.language = 'en';
  store.save(storage);
  store.reset(null);
  assert.equal(store.load(storage).settings.language, 'en');
  assert.equal(store.load().history[0].score, 100);
  assert.equal(store.load().progress.skills['g1-add-nc'].stars, 2);
  store.updateSettings({ language: 'invalid' });
  assert.equal(store.settings().language, 'zh-CN');
  assert.equal(store.load().history.length, 1);
  store.reset(null);
});

test('startup honours the saved language and tolerates corrupt or blocked storage', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    for (const [value, expected] of [
      [JSON.stringify({ version: 1, settings: { language: 'en' } }), 'en'],
      [JSON.stringify({ version: 1, settings: { language: 'fr' } }), 'zh-CN'],
      [JSON.stringify({ version: 2, settings: { language: 'en' } }), 'zh-CN'],
      ['{broken', 'zh-CN'],
    ]) {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => value } });
      const fresh = await import(`../app/js/i18n.js?test=${encodeURIComponent(value)}`);
      assert.equal(fresh.getLanguage(), expected);
    }
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
    assert.equal((await import('../app/js/i18n.js?test=blocked')).getLanguage(), 'zh-CN');
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
