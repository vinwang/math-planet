import test from 'node:test';
import assert from 'node:assert/strict';
import { setLanguage } from '../app/js/i18n.js';

// The application reloads after a language change, so catalogues are built in
// the selected language before they are imported here.
setLanguage('en');
const quests = await import('../app/js/quests.js');
const trophies = await import('../app/js/trophies.js');
const unlocks = await import('../app/js/unlocks.js');
const eastAsianText = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

test('English reward catalogues contain translated labels and descriptions', () => {
  for (const series of trophies.SERIES) assert.doesNotMatch(series.title, eastAsianText, series.key);
  for (const trophy of trophies.TROPHIES) {
    assert.doesNotMatch(`${trophy.name}${trophy.desc}`, eastAsianText, trophy.id);
  }
  for (const cat of trophies.CATS) assert.doesNotMatch(trophies.catLabel(cat), eastAsianText, cat);
  for (const rank of Object.values(trophies.RANK_NAME)) assert.doesNotMatch(rank, eastAsianText);
  for (const cat of unlocks.CATS) assert.doesNotMatch(cat.name, eastAsianText, cat.key);
  for (const item of unlocks.ITEMS) assert.doesNotMatch(item.name, eastAsianText, item.id);
  for (const quest of quests.QUESTS) assert.doesNotMatch(quests.questText(quest), eastAsianText, quest.id);
  assert.doesNotMatch(quests.questText({ id: 'polish', skill: 'g2-kuku25' }), eastAsianText);
});

test('English rewards preserve IDs and show readable numbers and plurals', () => {
  assert.equal(trophies.TROPHY['dopa-4'].name, '10K Star Power');
  assert.equal(trophies.TROPHY['dopa-8'].name, '100M Star Power');
  assert.equal(trophies.TROPHY['dopa-9'].name, '1B Star Power');
  assert.equal(trophies.TROPHY['problems-10000'].name, '10,000 questions completed');
  assert.equal(trophies.TROPHY['plays-1'].name, '1 practice session');
  assert.equal(trophies.TROPHY['plays-3'].name, '3 practice sessions');
  assert.equal(trophies.TROPHY['catComplete-3'].name, '3 collections complete');
  assert.equal(trophies.TROPHY['catComplete-3'].desc, 'Complete 3 collection categories');
  assert.equal(trophies.catLabel('ひみつ'), 'Secrets');
  assert.equal(unlocks.ITEM['costume:cap'].trophy, 'days-1');
  assert.equal(trophies.TROPHY['days-1'].reward, 'costume:cap');
  assert.equal(quests.questText({ id: 'extra5' }), 'Complete 5 questions in the Bonus Round');
  assert.match(quests.questText({ id: 'polish', skill: 'g2-kuku25' }), /2 and 5/);
});
