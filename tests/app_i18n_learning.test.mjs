import test from 'node:test';
import assert from 'node:assert/strict';
import { setLanguage } from '../app/js/i18n.js';
import { SKILLS } from '../app/js/skills.js';
import { makeProblem, makeRng, displayProblem, signature } from '../app/js/problems.js';
import { nextStar } from '../app/js/session.js';
import { fmtDopa, unitLabel, unitOf } from '../app/js/scoring.js';

const hanOrKana = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const english = (value, where) => {
  if (typeof value === 'string') assert.doesNotMatch(value, hanOrKana, `${where}: ${value}`);
};

test('all skills display English problems without changing the saved problem or its answer steps', () => {
  try {
    setLanguage('en');
    for (const skill of SKILLS) {
      english(skill.name, `${skill.id} name`);
      for (let seed = 1; seed <= 30; seed++) {
        const source = makeProblem(skill.id, makeRng(seed));
        const original = structuredClone(source);
        const shown = displayProblem(source);
        const where = `${skill.id} seed ${seed}`;
        for (const key of ['title', 'text', 'answer', 'answerText', 'help']) english(shown[key], `${where} ${key}`);
        for (const cell of shown.cells) english(cell.text, `${where} cell ${cell.id}`);
        for (const step of shown.steps) {
          english(step.label, `${where} step label`);
          english(step.hint, `${where} step hint`);
          english(step.help?.text, `${where} step help`);
        }
        assert.deepEqual(source, original, `${where} mutated its source`);
        assert.equal(signature(source), signature(original), where);
        assert.deepEqual([shown.rows, shown.cols, shown.lines, shown.bracket], [source.rows, source.cols, source.lines, source.bracket], where);
        assert.deepEqual(shown.cells.map(({ text, ...cell }) => cell), source.cells.map(({ text, ...cell }) => cell), where);
        assert.deepEqual(shown.steps.map(({ cell, digit, after }) => ({ cell, digit, after })), source.steps.map(({ cell, digit, after }) => ({ cell, digit, after })), where);
      }
    }
  } finally { setLanguage('zh-CN'); }
});

test('the skill tree starts with English lanes when English is selected', async () => {
  try {
    setLanguage('en');
    const { LANES } = await import('../app/js/skills.js?english-startup');
    assert.deepEqual(LANES, ['Add & subtract', 'Multiply & divide', 'Decimals & fractions', 'Other']);
  } finally { setLanguage('zh-CN'); }
});

test('fraction, remainder, rounding and older saved problems use understandable English', () => {
  try {
    setLanguage('en');
    const fraction = displayProblem(makeProblem('g2-frac-of', makeRng(3)));
    assert.match(fraction.text, /^\d+ × 1\/[24]$/);
    assert.deepEqual(fraction.cells.filter((c) => c.kind === 'word').map((c) => c.text), ['×', '＝']);
    const remainder = displayProblem(makeProblem('g3-div-rem', makeRng(3)));
    assert.match(remainder.answerText, /\d+ remainder \d+$/);
    assert.equal(remainder.cells.find((c) => c.kind === 'word').text, 'R');
    assert.equal(remainder.steps.at(-1).label, 'Remainder');
    const rounded = displayProblem(makeProblem('g4-round', makeRng(3)));
    assert.match(rounded.text, /^Round \d+ to the nearest (ten|hundred|thousand)$/);
    assert.match(rounded.cells.find((c) => c.kind === 'word').text, /^≈(?:10|100|1000)$/);
    const old = { skill: 'g2-frac-of', title: 'ぶんすう', text: '12の1/2', answer: '6', answerText: '12の1/2 = 6', cells: [{ id: 'w', kind: 'word', text: 'の' }], steps: [{ cell: 'x', digit: '6', label: 'こたえ', after: [] }] };
    const shown = displayProblem(old);
    assert.equal(shown.text, '12 × 1/2');
    assert.equal(shown.answerText, '12 × 1/2 ＝ 6');
    assert.equal(shown.steps[0].label, 'Answer');
    assert.equal(old.text, '12の1/2');
  } finally { setLanguage('zh-CN'); }
});

test('star requirements and milestone labels follow the selected language', () => {
  try {
    setLanguage('en');
    for (let stars = 1; stars <= 4; stars++) {
      const prog = { skills: { 'g1-add-nc': { mastered: true, stars, starDay: { 3: '2026-11-01' }, times: [{ t: 1200, c: 1, f: 1, d: '2026-11-02' }] } } };
      const next = nextStar(prog, 'g1-add-nc', '2026-11-02');
      english(next.text, `star ${stars + 1} requirement`);
      english(next.now, `star ${stars + 1} status`);
    }
    assert.equal(fmtDopa(4), '10K');
    assert.equal(fmtDopa(6), '1.0M');
    assert.equal(unitLabel(unitOf(4.1)), '10K');
    assert.equal(unitLabel(unitOf(8.1)), '100M');
    assert.equal(unitLabel('∞'), '∞');
    setLanguage('zh-CN');
    assert.equal(fmtDopa(4), '1.0万');
    assert.equal(unitLabel(unitOf(8.1)), '1亿');
  } finally { setLanguage('zh-CN'); }
});
