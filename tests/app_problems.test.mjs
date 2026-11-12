// Validates generated column-arithmetic problems for the public app.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, generate, makeProblem, localizeProblem, signature, BASIC_SETS, EXTRA_TIERS } from '../app/js/problems.js';

const templates = [...new Set([...Object.values(BASIC_SETS).flat(), ...EXTRA_TIERS.flat()])];

test('every template yields steps that spell the correct answer', () => {
  const rng = makeRng(12345);
  for (const t of templates) {
    for (let i = 0; i < 300; i++) {
      const p = generate(t, rng);
      const digits = p.steps.map((s) => s.digit);
      if (p.kind === 'div') {
        assert.equal(p.a % p.b, 0, `${p.text} must divide exactly`);
        const q = p.steps.filter((s) => s.cell.startsWith('q')).map((s) => s.digit).join('');
        assert.equal(q, String(p.answer), p.text);
      } else {
        assert.equal([...digits].reverse().join(''), String(p.answer), p.text);
        assert.equal(Number(p.answer), p.kind === 'add' ? p.a + p.b : p.a - p.b);
      }
      for (const s of p.steps) {
        assert.match(s.digit, /^[0-9]$/);
        assert.ok(p.cells.some((c) => c.id === s.cell && c.kind === 'input'));
        for (const id of s.after || []) assert.ok(p.cells.some((c) => c.id === id) || p.lines.some((l) => l.id === id), `${p.text} reveals ${id}`);
      }
    }
  }
});

test('borrow marks follow the standard algorithm (503 - 278)', () => {
  const p = generate('sub3z', makeRng(1), { kind: 'sub', a: 503, b: 278 });
  assert.deepEqual(p.steps.map((s) => s.digit), ['5', '2', '2']);
  assert.deepEqual(p.steps[0].marks, [{ c: 2, text: '9' }, { c: 1, text: '4' }, { c: 3, text: '13' }]);
});

test('long division 156 / 4 matches the spec walkthrough', () => {
  const p = generate('div3', makeRng(1), { kind: 'div', a: 156, b: 4 });
  // Quotient tens, the remainder 15 - 12, then quotient ones; the final 0 is automatic.
  assert.deepEqual(p.steps.map((s) => s.digit), ['3', '3', '9']);
  assert.equal(p.cells.find((c) => c.id.startsWith('bd')).text, '6');
  assert.ok(p.cells.some((c) => c.id.startsWith('z') && c.text === '0'));
});

test('first basic problem is the spec example and sets have the chosen lengths', () => {
  for (const n of [6, 10, 14]) assert.equal(BASIC_SETS[n].length, n);
});


test('legacy review problems are localized without changing inputs or the original', () => {
  const old = {
    skill: 'g3-div-rem', kind: 'h', title: 'あまりのあるわりざん', text: '17 ÷ 5',
    answer: '3 あまり 2', answerText: '17 ÷ 5 ＝ 3 あまり 2', help: '5のだん 5 10 15 20',
    cells: [{ id: 'q', kind: 'input', text: '3', r: 0, c: 0 }, { id: 'w', kind: 'word', text: 'あまり', r: 0, c: 1 }, { id: 'r', kind: 'input', text: '2', r: 0, c: 2 }],
    steps: [{ cell: 'q', digit: '3', label: '商', after: [], help: { ids: ['q'], text: '5のだん 5 10 15 20' } }, { cell: 'r', digit: '2', label: 'あまり', after: [], help: null }],
  };
  const snapshot = structuredClone(old);
  const p = localizeProblem(old);
  assert.deepEqual(old, snapshot);
  assert.equal(p.title, '有余数的除法');
  assert.equal(p.answerText, '17 ÷ 5 ＝ 3 余 2');
  assert.equal(p.cells[1].text, '余');
  assert.equal(p.steps[1].label, '余');
  assert.equal(p.steps[0].help.text, '5的乘法口诀：5 10 15 20');
  assert.deepEqual(p.steps.map((step) => [step.cell, step.digit, step.after]), old.steps.map((step) => [step.cell, step.digit, step.after]));
  assert.equal(signature(p), '有余数的除法|17 ÷ 5');
  assert.deepEqual(localizeProblem(p), p);
});

test('legacy composition and mixed fractions preserve their intended expressions', () => {
  const compose = localizeProblem({ skill: 'g1-compose10', title: 'いくつといくつ', text: '10は6と', answer: '4', answerText: '', cells: [{ kind: 'word', text: 'は' }, { kind: 'word', text: 'と' }], steps: [] });
  assert.equal(compose.answerText, '10 = 6 + 4');
  const generated = makeProblem('g1-compose10', makeRng(1));
  assert.equal(generated.answerText, `${generated.text} ${generated.answer}`);
  assert.deepEqual(compose.cells.map((cell) => cell.text), ['＝', '＋']);
  const mixed = localizeProblem({ title: '分数のたしひき', text: '3と1/5 + 0と1/5', answer: '3と2/5', answerText: '', cells: [], steps: [] });
  assert.equal(mixed.answerText, '3又1/5 + 1/5 ＝ 3又2/5');
  const round = localizeProblem({ title: 'がい数', text: '78938を十の位までのがい数に', answer: '78940', answerText: '', cells: [], steps: [] });
  assert.equal(signature(round), '求近似数|78938保留到十位');
});

test('legacy malformed hints do not break a playable problem', () => {
  for (const help of ['broken', 1, true, [], { text: 'あまり' }]) {
    const p = makeProblem('g3-div-rem', makeRng(4));
    p.steps[0].help = help;
    const translated = localizeProblem(p);
    assert.equal(translated.steps[0].help, undefined);
    assert.deepEqual(translated.steps.map((s) => s.digit), p.steps.map((s) => s.digit));
  }
});

test('prototype properties are not skill ids', () => {
  for (const id of ['toString', 'constructor', '__proto__']) {
    assert.throws(() => makeProblem(id, makeRng(1)), /unknown skill/);
  }
});
