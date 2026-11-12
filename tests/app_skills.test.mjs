// Skill tree data integrity (id019).
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, SKILL, DEPTH, LANES } from '../app/js/skills.js';

test('ids are unique and prerequisites exist', () => {
  assert.equal(new Set(SKILLS.map((s) => s.id)).size, SKILLS.length);
  for (const s of SKILLS) for (const r of s.req) assert.ok(SKILL[r], `${s.id} needs ${r}`);
});

test('prerequisites never come from a later grade and the graph is acyclic', () => {
  for (const s of SKILLS) for (const r of s.req) assert.ok(SKILL[r].grade <= s.grade, `${s.id} <- ${r}`);
  for (const s of SKILLS) assert.ok(Number.isFinite(DEPTH[s.id]));
});

test('every grade and lane is populated', () => {
  for (let g = 1; g <= 6; g++) assert.ok(SKILLS.some((s) => s.grade === g), `grade ${g}`);
  LANES.forEach((_, i) => assert.ok(SKILLS.some((s) => s.lane === i), `lane ${i}`));
  assert.ok(SKILLS.length >= 50);
});


test('curriculum grades match the intended mainland learning sequence', () => {
  const grades = {
    'g3-div-basic': 2, 'g3-div-rem': 2,
    'g4-vdiv-2d1': 3, 'g4-vdiv-3d1': 3,
    'g3-vmul-2x2': 3, 'g3-vmul-3x2': 4,
    'g4-dec-mul': 5, 'g4-dec-div': 5, 'g5-dec-mul': 5, 'g5-dec-div': 5,
    'g6-letter': 5, 'g5-percent': 6, 'g5-frac-int': 6, 'g6-frac-mul': 6, 'g6-frac-div': 6,
  };
  for (const [id, grade] of Object.entries(grades)) assert.equal(SKILL[id].grade, grade, id);
  for (const skill of SKILLS) assert.doesNotMatch(skill.name, /[\u3040-\u30ff]/, skill.id);
});
