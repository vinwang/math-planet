// Skill tree for grades 1-6 (calculation only). See docs/curriculum.md.
// Each skill: id, name (shown on screen), grade, lane (tree column),
// req (all must be mastered to unlock), gen (generator + params, problems.js).

import { t } from './i18n.js';

export const LANES = [t('加减法', 'Add & subtract'), t('乘除法', 'Multiply & divide'), t('小数与分数', 'Decimals & fractions'), t('其他', 'Other')];

// Mastery / unlock rule (provisional): 5 first-try clears in the last 6 attempts.
export const MASTERY = { window: 6, need: 5 };

export const SKILLS = [
  // ---------------------------------------------------------------- grade 1
  { id: 'g1-compose10', get name() { return t('10的分解与组成', 'Making 10'); }, grade: 1, lane: 0, req: [], gen: ['compose', { total: 10 }] },
  { id: 'g1-add-nc', get name() { return t('一位数加法（不进位）', 'Single-digit addition without carrying'); }, grade: 1, lane: 0, req: [], gen: ['hadd', { a: [1, 9], b: [1, 9], carry: 'none' }] },
  { id: 'g1-sub-nb', get name() { return t('10以内的减法', 'Subtraction within 10'); }, grade: 1, lane: 0, req: ['g1-add-nc'], gen: ['hsub', { a: [2, 10], b: [1, 9], borrow: 'none' }] },
  { id: 'g1-add-c', get name() { return t('一位数进位加法', 'Single-digit addition with carrying'); }, grade: 1, lane: 0, req: ['g1-compose10', 'g1-add-nc'], gen: ['hadd', { a: [2, 9], b: [2, 9], carry: 'yes' }] },
  { id: 'g1-sub-b', get name() { return t('20以内的退位减法', 'Subtraction within 20 with borrowing'); }, grade: 1, lane: 0, req: ['g1-add-c', 'g1-sub-nb'], gen: ['hsub', { a: [11, 18], b: [2, 9], borrow: 'yes' }] },
  { id: 'g1-add3', get name() { return t('三个数的加减', 'Adding and subtracting three numbers'); }, grade: 1, lane: 0, req: ['g1-sub-b'], gen: ['add3', {}] },
  { id: 'g1-add-2d1', get name() { return t('两位数加法口算', 'Mental addition with two-digit numbers'); }, grade: 1, lane: 0, req: ['g1-add-c'], gen: ['hadd', { a: [11, 89], b: [1, 9], carry: 'none', tensToo: true }] },
  { id: 'g1-sub-2d1', get name() { return t('两位数减法口算', 'Mental subtraction with two-digit numbers'); }, grade: 1, lane: 0, req: ['g1-sub-b', 'g1-add-2d1'], gen: ['hsub', { a: [11, 99], b: [1, 9], borrow: 'none', tensToo: true }] },

  // ---------------------------------------------------------------- grade 2
  { id: 'g2-vadd2-nc', get name() { return t('两位数加法笔算（不进位）', 'Two-digit written addition without carrying'); }, grade: 2, lane: 0, req: ['g1-add-2d1'], gen: ['vadd', { da: 2, db: 2, carry: 'none', maxDigits: 2 }] },
  { id: 'g2-vadd2-c', get name() { return t('两位数进位加法', 'Two-digit addition with carrying'); }, grade: 2, lane: 0, req: ['g2-vadd2-nc', 'g1-add-c'], gen: ['vadd', { da: 2, db: [1, 2], carry: 'some', maxDigits: 2 }] },
  { id: 'g2-vsub2-nb', get name() { return t('两位数减法笔算（不退位）', 'Two-digit written subtraction without borrowing'); }, grade: 2, lane: 0, req: ['g1-sub-2d1'], gen: ['vsub', { da: 2, db: 2, borrow: 'none' }] },
  { id: 'g2-vsub2-b', get name() { return t('两位数退位减法', 'Two-digit subtraction with borrowing'); }, grade: 2, lane: 0, req: ['g2-vsub2-nb', 'g1-sub-b'], gen: ['vsub', { da: 2, db: [1, 2], borrow: 'some' }] },
  { id: 'g2-vadd3s', get name() { return t('和超过100的加法', 'Addition with sums over 100'); }, grade: 2, lane: 0, req: ['g2-vadd2-c'], gen: ['vadd', { da: 2, db: 2, carry: 'many', maxDigits: 3 }] },
  { id: 'g2-vsub3s', get name() { return t('整百附近的减法', 'Subtraction around 100'); }, grade: 2, lane: 0, req: ['g2-vsub2-b', 'g2-vadd3s'], gen: ['vsub', { da: 3, db: 2, borrow: 'some', aMax: 199 }] },
  { id: 'g2-kuku25', get name() { return t('2和5的乘法口诀', '2 and 5 times tables'); }, grade: 2, lane: 1, req: ['g1-add-c'], gen: ['kuku', { dans: [5, 2] }] },
  { id: 'g2-kuku34', get name() { return t('3和4的乘法口诀', '3 and 4 times tables'); }, grade: 2, lane: 1, req: ['g2-kuku25'], gen: ['kuku', { dans: [3, 4] }] },
  { id: 'g2-kuku67', get name() { return t('6和7的乘法口诀', '6 and 7 times tables'); }, grade: 2, lane: 1, req: ['g2-kuku34'], gen: ['kuku', { dans: [6, 7] }] },
  { id: 'g2-kuku891', get name() { return t('1、8和9的乘法口诀', '1, 8 and 9 times tables'); }, grade: 2, lane: 1, req: ['g2-kuku67'], gen: ['kuku', { dans: [8, 9, 1] }] },
  { id: 'g2-kuku-mix', get name() { return t('乘法口诀综合练习', 'Mixed times tables'); }, grade: 2, lane: 1, req: ['g2-kuku891'], gen: ['kuku', { dans: [1, 2, 3, 4, 5, 6, 7, 8, 9] }] },
  { id: 'g3-div-basic', get name() { return t('表内除法', 'Division using times tables'); }, grade: 2, lane: 1, req: ['g2-kuku-mix'], gen: ['div', { exact: true }] },
  { id: 'g3-div-rem', get name() { return t('有余数的除法', 'Division with remainders'); }, grade: 2, lane: 1, req: ['g3-div-basic'], gen: ['divRem', {}] },

  // ---------------------------------------------------------------- grade 3
  { id: 'g2-mul-tens', get name() { return t('整十数乘一位数', 'Multiplying tens by one digit'); }, grade: 3, lane: 1, req: ['g2-kuku-mix'], gen: ['mulTens', {}] },
  { id: 'g2-frac-of', get name() { return t('认识二分之一和四分之一', 'Halves and quarters'); }, grade: 3, lane: 2, req: ['g2-kuku25'], gen: ['fracOf', { dens: [2, 4] }] },
  { id: 'g3-vadd3', get name() { return t('三位数加法', 'Three-digit addition'); }, grade: 3, lane: 0, req: ['g2-vadd3s'], gen: ['vadd', { da: 3, db: 3, carry: 'some', maxDigits: 3 }] },
  { id: 'g3-vsub3', get name() { return t('三位数减法', 'Three-digit subtraction'); }, grade: 3, lane: 0, req: ['g2-vsub3s'], gen: ['vsub', { da: 3, db: [2, 3], borrow: 'some' }] },
  { id: 'g3-vadd4', get name() { return t('四位数加法', 'Four-digit addition'); }, grade: 3, lane: 0, req: ['g3-vadd3'], gen: ['vadd', { da: 4, db: [3, 4], carry: 'many', maxDigits: 4 }] },
  { id: 'g3-vsub4', get name() { return t('四位数减法', 'Four-digit subtraction'); }, grade: 3, lane: 0, req: ['g3-vsub3'], gen: ['vsub', { da: 4, db: [3, 4], borrow: 'zero' }] },
  { id: 'g3-div-tens', get name() { return t('两位数除以一位数口算', 'Mental division of two digits by one digit'); }, grade: 3, lane: 1, req: ['g3-div-basic'], gen: ['divTens', {}] },
  { id: 'g3-vmul-2x1', get name() { return t('两位数乘一位数笔算', 'Written multiplication: two digits by one'); }, grade: 3, lane: 1, req: ['g2-mul-tens'], gen: ['vmul', { da: 2, db: 1 }] },
  { id: 'g3-vmul-3x1', get name() { return t('三位数乘一位数', 'Multiplication: three digits by one'); }, grade: 3, lane: 1, req: ['g3-vmul-2x1'], gen: ['vmul', { da: 3, db: 1 }] },
  { id: 'g3-dec-add1', get name() { return t('一位小数加法', 'Adding decimals to tenths'); }, grade: 3, lane: 2, req: ['g2-vadd2-c'], gen: ['vdec', { op: 'add', places: 1 }] },
  { id: 'g3-dec-sub1', get name() { return t('一位小数减法', 'Subtracting decimals to tenths'); }, grade: 3, lane: 2, req: ['g3-dec-add1', 'g2-vsub2-b'], gen: ['vdec', { op: 'sub', places: 1 }] },
  { id: 'g3-frac-same', get name() { return t('同分母分数加减法', 'Adding and subtracting fractions with like denominators'); }, grade: 3, lane: 2, req: ['g2-frac-of'], gen: ['frac', { op: 'addsub', same: true, maxOne: true }] },
  { id: 'g4-vdiv-2d1', get name() { return t('两位数除以一位数笔算', 'Written division: two digits by one'); }, grade: 3, lane: 1, req: ['g3-div-rem', 'g3-div-tens'], gen: ['vdiv', { dd: 2, ds: 1 }] },
  { id: 'g4-vdiv-3d1', get name() { return t('三位数除以一位数', 'Division: three digits by one'); }, grade: 3, lane: 1, req: ['g4-vdiv-2d1'], gen: ['vdiv', { dd: 3, ds: 1 }] },

  // ---------------------------------------------------------------- grade 4
  { id: 'g3-vmul-2x2', get name() { return t('两位数乘两位数', 'Multiplication: two digits by two'); }, grade: 3, lane: 1, req: ['g3-vmul-2x1'], gen: ['vmul', { da: 2, db: 2 }] },
  { id: 'g3-vmul-3x2', get name() { return t('三位数乘两位数', 'Multiplication: three digits by two'); }, grade: 4, lane: 1, req: ['g3-vmul-2x2', 'g3-vmul-3x1'], gen: ['vmul', { da: 3, db: 2 }] },
  { id: 'g4-vdiv-2d2', get name() { return t('两位数除以两位数', 'Division: two digits by two'); }, grade: 4, lane: 1, req: ['g4-vdiv-2d1', 'g3-vmul-2x1'], gen: ['vdiv', { dd: 2, ds: 2 }] },
  { id: 'g4-vdiv-3d2', get name() { return t('三位数除以两位数', 'Division: three digits by two'); }, grade: 4, lane: 1, req: ['g4-vdiv-2d2', 'g4-vdiv-3d1'], gen: ['vdiv', { dd: 3, ds: 2 }] },
  { id: 'g4-order', get name() { return t('混合运算顺序', 'Order of operations'); }, grade: 4, lane: 3, req: ['g2-kuku-mix', 'g2-vsub2-b'], gen: ['order', {}] },
  { id: 'g4-round', get name() { return t('近似数与四舍五入', 'Rounding and estimation'); }, grade: 4, lane: 3, req: ['g3-vadd4'], gen: ['round', {}] },
  { id: 'g4-dec-add2', get name() { return t('两位小数加减法', 'Adding and subtracting decimals to hundredths'); }, grade: 4, lane: 2, req: ['g3-dec-sub1'], gen: ['vdec', { op: 'addsub', places: 2 }] },

  // ---------------------------------------------------------------- grade 5
  { id: 'g4-dec-mul', get name() { return t('小数乘整数', 'Multiplying decimals by whole numbers'); }, grade: 5, lane: 2, req: ['g4-dec-add2', 'g3-vmul-2x1'], gen: ['vmul', { da: 2, db: 1, pa: 1 }] },
  { id: 'g4-dec-div', get name() { return t('小数除以整数', 'Dividing decimals by whole numbers'); }, grade: 5, lane: 2, req: ['g4-dec-mul', 'g4-vdiv-2d1'], gen: ['decDivInt', {}] },
  { id: 'g4-frac-mixed', get name() { return t('带分数加减法', 'Adding and subtracting mixed numbers'); }, grade: 5, lane: 2, req: ['g3-frac-same'], gen: ['frac', { op: 'addsub', same: true, mixed: true }] },
  { id: 'g5-dec-mul', get name() { return t('小数乘小数', 'Multiplying decimals'); }, grade: 5, lane: 2, req: ['g4-dec-mul'], gen: ['vmul', { da: 2, db: 2, pa: 1, pb: 1 }] },
  { id: 'g5-dec-div', get name() { return t('小数除以小数', 'Dividing decimals'); }, grade: 5, lane: 2, req: ['g4-dec-div', 'g5-dec-mul'], gen: ['decDivDec', {}] },
  { id: 'g5-gcd', get name() { return t('最大公因数', 'Greatest common factor'); }, grade: 5, lane: 3, req: ['g3-div-basic'], gen: ['gcdlcm', { kind: 'gcd' }] },
  { id: 'g5-lcm', get name() { return t('最小公倍数', 'Least common multiple'); }, grade: 5, lane: 3, req: ['g5-gcd'], gen: ['gcdlcm', { kind: 'lcm' }] },
  { id: 'g5-frac-reduce', get name() { return t('约分', 'Simplifying fractions'); }, grade: 5, lane: 2, req: ['g5-gcd', 'g4-frac-mixed'], gen: ['frac', { op: 'reduce' }] },
  { id: 'g5-frac-diff', get name() { return t('异分母分数加减法', 'Adding and subtracting unlike fractions'); }, grade: 5, lane: 2, req: ['g5-frac-reduce', 'g5-lcm'], gen: ['frac', { op: 'addsub', same: false }] },
  { id: 'g6-letter', get name() { return t('求未知数 x', 'Solving for x'); }, grade: 5, lane: 3, req: ['g4-order'], gen: ['letter', {}] },

  // ---------------------------------------------------------------- grade 6
  { id: 'g5-frac-int', get name() { return t('分数乘除整数', 'Multiplying and dividing fractions by whole numbers'); }, grade: 6, lane: 2, req: ['g5-frac-reduce'], gen: ['frac', { op: 'muldivInt' }] },
  { id: 'g5-percent', get name() { return t('百分数', 'Percentages'); }, grade: 6, lane: 3, req: ['g4-dec-mul'], gen: ['percent', {}] },
  { id: 'g6-frac-mul', get name() { return t('分数乘分数', 'Multiplying fractions'); }, grade: 6, lane: 2, req: ['g5-frac-int'], gen: ['frac', { op: 'mul' }] },
  { id: 'g6-frac-div', get name() { return t('分数除以分数', 'Dividing fractions'); }, grade: 6, lane: 2, req: ['g6-frac-mul'], gen: ['frac', { op: 'div' }] },
  { id: 'g6-frac-dec', get name() { return t('小数与分数的计算', 'Calculations with decimals and fractions'); }, grade: 6, lane: 2, req: ['g6-frac-div', 'g5-dec-div'], gen: ['frac', { op: 'decimal' }] },
  { id: 'g6-ratio', get name() { return t('相等的比', 'Equivalent ratios'); }, grade: 6, lane: 3, req: ['g5-lcm'], gen: ['ratio', {}] },
];

export const SKILL = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// Depth in the tree = longest prerequisite chain (roots are 0).
export const DEPTH = (() => {
  const memo = {};
  const d = (id) => memo[id] ?? (memo[id] = SKILL[id].req.length ? 1 + Math.max(...SKILL[id].req.map(d)) : 0);
  for (const s of SKILLS) d(s.id);
  return memo;
})();

export const skillsOfGrade = (g) => SKILLS.filter((s) => s.grade === g);
