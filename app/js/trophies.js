// Trophies (id036): many small achievements, like the ones in mobile games.
// Each series is one measure with rising steps; every step is a trophy.
// Days and streaks get dense steps; volume series get wide ones so long
// sessions are not pushed too hard (docs/SPEC.md 14.7). Nothing is
// random, conditions are always shown (except a few secrets), and a trophy,
// once earned, is kept.
import { SKILLS, LANES } from './skills.js';
import { isUnlocked, isMastered, starsOf } from './session.js';
import { t, getLanguage } from './i18n.js';

export const CATS = ['坚持', '积累', '技能', '成长', '加赛', '连对', '准确', '星能', '错题复习', '年级', '收藏', 'ひみつ'];
const CAT_EN = { '坚持': 'Consistency', '积累': 'Progress', '技能': 'Skills', '成长': 'Growth', '加赛': 'Bonus Round', '连对': 'Streaks', '准确': 'Accuracy', '星能': 'Star Power', '错题复习': 'Mistake Review', '年级': 'Grades', '收藏': 'Collection', 'ひみつ': 'Secrets' };
export const catLabel = (cat) => t(cat === 'ひみつ' ? '秘密' : cat, CAT_EN[cat] || cat);

const fmt = (n) => (getLanguage() === 'zh-CN' && n >= 10000 && n % 10000 === 0 ? `${n / 10000}万` : n.toLocaleString(getLanguage() === 'en' ? 'en-US' : 'zh-CN'));
const count = (n, one, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;
const DOPA_LABEL = t({ 2: '100', 3: '1000', 4: '1万', 5: '10万', 6: '100万', 7: '1000万', 8: '1亿', 9: '10亿' }, { 2: '100', 3: '1K', 4: '10K', 5: '100K', 6: '1M', 7: '10M', 8: '100M', 9: '1B' });
const RANKS = ['bronze', 'silver', 'gold', 'rainbow'];
export const RANK_NAME = t({ bronze: '铜', silver: '银', gold: '金', rainbow: '彩虹', secret: '秘密' }, { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', rainbow: 'Rainbow', secret: 'Secret' });

// Rank by position in its series: first ~30% bronze, then silver, gold, and the last step rainbow.
function rankAt(i, n) {
  if (n === 1) return 'gold';
  if (i === n - 1) return 'rainbow';
  return RANKS[Math.min(2, Math.floor((i / (n - 1)) * 3.3))];
}

// A series: { key, cat, title, metric, steps, name(v), desc(v) } or explicit items.
const SERIES_DEFS = [
  { key: 'streak', cat: '坚持', title: t('连续练习', 'Practice streak'), metric: 'bestStreak', steps: [3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 365], name: (v) => t(`连续${v}天`, `${count(v, 'day')} in a row`), desc: (v) => t(`连续练习${v}天`, `Practice ${count(v, 'day')} in a row`) },
  { key: 'days', cat: '坚持', title: t('练习天数', 'Practice days'), metric: 'days', steps: [1, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 365, 500, 730, 1000], name: (v) => t(`练习${fmt(v)}天`, `${count(v, 'day')} practiced`), desc: (v) => t(`累计练习${fmt(v)}天`, `Practice on ${count(v, 'day')} in total`) },
  { key: 'stickers', cat: '坚持', title: t('签到贴纸', 'Check-in stickers'), metric: 'stickers', steps: [1, 7, 14, 30, 50, 100, 200, 365], name: (v) => t(`${v}张贴纸`, `${count(v, 'sticker')}`), desc: (v) => t(`收集${v}张签到贴纸`, `Collect ${count(v, 'check-in sticker')}`) },
  { key: 'crowns', cat: '坚持', title: t('皇冠贴纸', 'Crown stickers'), metric: 'crowns', steps: [1, 3, 5, 10, 20, 52], name: (v) => t(`${v}张皇冠贴纸`, `${count(v, 'crown sticker')}`), desc: (v) => t(`收集${v}张第7天的皇冠贴纸`, `Collect ${count(v, 'day-seven crown sticker')}`) },
  { key: 'problems', cat: '积累', title: t('完成的题目', 'Questions completed'), metric: 'problems', steps: [10, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 20000, 30000, 50000, 100000], name: (v) => t(`完成${fmt(v)}题`, `${count(v, 'question')} completed`), desc: (v) => t(`累计完成${fmt(v)}道题`, `Complete ${count(v, 'question')} in total`) },
  { key: 'cells', cat: '积累', title: t('输入的数字', 'Digits entered'), metric: 'cells', steps: [100, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000], name: (v) => t(`输入${fmt(v)}位数字`, `${count(v, 'digit')} entered`), desc: (v) => t(`累计正确输入${fmt(v)}位数字`, `Enter ${count(v, 'digit')} correctly in total`) },
  { key: 'plays', cat: '积累', title: t('练习次数', 'Practice sessions'), metric: 'plays', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000], name: (v) => t(`练习${fmt(v)}次`, `${count(v, 'practice session')}`), desc: (v) => t(`累计完成${fmt(v)}次练习`, `Complete ${count(v, 'practice session')} in total`) },
  { key: 'minutes', cat: '积累', title: t('练习时间', 'Practice time'), metric: 'minutes', steps: [10, 30, 60, 120, 300, 600, 1200, 3000], name: (v) => t((v >= 60 ? `累计${v / 60}小时` : `累计${v}分钟`), `${v >= 60 ? count(v / 60, 'hour') : count(v, 'minute')}`), desc: (v) => t(`累计练习${v >= 60 ? `${v / 60}小时` : `${v}分钟`}`, `Practice for ${v >= 60 ? count(v / 60, 'hour') : count(v, 'minute')} in total`) },
  { key: 'unlocked', cat: '技能', title: t('解锁技能', 'Skills unlocked'), metric: 'unlocked', steps: [3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 58], name: (v) => t(`解锁${v}项`, `${count(v, 'skill')} unlocked`), desc: (v) => t(`解锁${v}项技能`, `Unlock ${count(v, 'skill')}`) },
  { key: 'mastered', cat: '技能', title: t('掌握技能', 'Skills mastered'), metric: 'mastered', steps: [1, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 58], name: (v) => t(`掌握${v}项`, `${count(v, 'skill')} mastered`), desc: (v) => t(`掌握${v}项技能`, `Master ${count(v, 'skill')}`) },
  { key: 'gradeDone', cat: '技能', title: t('掌握全年级技能', 'Master all grade skills'), items: [1, 2, 3, 4, 5, 6].map((g) => ({ id: `gradeDone-${g}`, metric: `gradeDone${g}`, need: 1, name: t(`掌握${g}年级技能`, `Master Grade ${g}`), desc: t(`掌握${g}年级的全部技能`, `Master all Grade ${g} skills`) })) },
  { key: 'laneDone', cat: '技能', title: t('掌握整条技能线', 'Master a skill path'), items: LANES.map((l, i) => ({ id: `laneDone-${i}`, metric: `laneDone${i}`, need: 1, name: t(`掌握${l}`, `Master ${l}`), desc: t(`掌握「${l}」的全部技能`, `Master all ${l} skills`) })) },
  { key: 'extras', cat: '加赛', title: t('进入加赛', 'Bonus Rounds entered'), metric: 'extras', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300], name: (v) => t(`加赛${v}次`, `${count(v, 'Bonus Round')}`), desc: (v) => t(`进入加赛${v}次`, `Enter the Bonus Round ${count(v, 'time')}`) },
  { key: 'extraBest', cat: '加赛', title: t('单次加赛纪录', 'Best Bonus Round'), metric: 'extraBest', steps: [3, 5, 7, 10, 12, 15, 18, 20, 23, 25, 30], name: (v) => t(`单次完成${v}题`, `${count(v, 'question')} in one round`), desc: (v) => t(`在一次加赛中完成${v}题`, `Complete ${count(v, 'question')} in one Bonus Round`) },
  { key: 'extraSolved', cat: '加赛', title: t('加赛题数', 'Bonus Round questions'), metric: 'extraSolved', steps: [10, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000], name: (v) => t(`加赛${fmt(v)}题`, `${count(v, 'Bonus Round question')}`), desc: (v) => t(`在加赛中累计完成${fmt(v)}题`, `Complete ${count(v, 'question')} in Bonus Rounds in total`) },
  { key: 'combo', cat: '连对', title: t('连对', 'Correct-answer streak'), metric: 'maxCombo', steps: [5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300], name: (v) => t(`${v}连对`, `${v} correct in a row`), desc: (v) => t(`达成${v}连对`, `Get ${v} correct answers in a row`) },
  { key: 'perfects', cat: '准确', title: t('全对通关', 'Perfect sessions'), metric: 'perfects', steps: [1, 3, 5, 10, 20, 30, 50, 100, 200, 300], name: (v) => t(`全对${v}次`, `${count(v, 'perfect session')}`), desc: (v) => t(`首次正确率达到100%并完成练习${v}次`, `Complete ${count(v, 'practice session')} with every question correct on the first try`) },
  { key: 'firstTry', cat: '准确', title: t('首次答对', 'First-try answers'), metric: 'firstTry', steps: [10, 50, 100, 300, 500, 1000, 3000, 5000, 10000, 30000], name: (v) => t(`首次答对${fmt(v)}题`, `${count(v, 'first-try answer')}`), desc: (v) => t(`累计首次答对${fmt(v)}道题`, `Answer ${count(v, 'question')} correctly on the first try in total`) },
  { key: 'dopa', cat: '星能', title: t('星能', 'Star Power'), metric: 'bestDopaL', steps: [2, 3, 4, 5, 6, 7, 8, 9], name: (v) => t(`${DOPA_LABEL[v]}星能`, `${DOPA_LABEL[v]} Star Power`), desc: (v) => t(`单次练习的星能达到${DOPA_LABEL[v]}`, `Reach ${DOPA_LABEL[v]} Star Power in one practice session`) },
  { key: 'review', cat: '错题复习', title: t('错题复习', 'Mistake Review'), metric: 'reviewSolved', steps: [1, 5, 10, 30, 50, 100, 200, 300], name: (v) => t(`复习${v}道错题`, `${count(v, 'missed question')} reviewed`), desc: (v) => t(`重新练习${v}道错题`, `Review ${count(v, 'missed question')}`) },
  ...[1, 2, 3, 4, 5, 6].map((g) => ({ key: `grade${g}`, cat: '年级', title: t(`${g}年级练习`, `Grade ${g} practice`), metric: `gradePlays${g}`, steps: [1, 10, 30], name: (v) => t(`${g}年级${v}次`, `Grade ${g}: ${count(v, 'session')}`), desc: (v) => t(`完成${v}次${g}年级练习`, `Complete ${count(v, 'Grade ' + g + ' practice session')}`) })),
  { key: 'secret', cat: 'ひみつ', title: t('秘密', 'Secrets'), items: [
    { id: 'secret-perfect14', metric: 'flag:perfect14', need: 1, name: t('14题全对', 'Perfect 14'), desc: t('14道题全部一次答对', 'Answer all 14 questions correctly on the first try'), secret: true },
    { id: 'secret-extraClean', metric: 'flag:extraClean', need: 1, name: t('加赛全对', 'Perfect Bonus Round'), desc: t('加赛完成至少5题，全部一次答对', 'Complete at least 5 Bonus Round questions, all correct on the first try'), secret: true },
    { id: 'secret-sunday', metric: 'flag:sunday', need: 1, name: t('周日数学', 'Sunday math'), desc: t('在周日完成练习', 'Complete a practice session on a Sunday'), secret: true },
    { id: 'secret-newyear', metric: 'flag:newyear', need: 1, name: t('新年练习', 'New Year practice'), desc: t('在1月1日完成练习', 'Complete a practice session on January 1'), secret: true },
    { id: 'secret-comeback', metric: 'flag:comeback', need: 1, name: t('欢迎回来！', 'Welcome back!'), desc: t('间隔至少一周后再次练习', 'Practice again after a break of at least one week'), secret: true },
    { id: 'secret-allmodes', metric: 'allModes', need: 1, name: t('尝试所有玩法', 'Try every mode'), desc: t('体验适合我的练习、年级练习、技能练习和错题复习', 'Try My Practice, grade practice, skill practice, and Mistake Review'), secret: true },
  ] },
];

// Other features add their own series (id045). Keep this list append-only.
export const SERIES = [];
export const TROPHIES = [];
export const TROPHY = {};
export function addSeries(def) {
  const items = def.items
    ? def.items.map((it, i, a) => ({ rank: it.secret ? 'secret' : rankAt(i, a.length), ...it }))
    : def.steps.map((v, i, a) => ({ id: `${def.key}-${v}`, metric: def.metric, need: v, name: def.name(v), desc: def.desc(v), rank: rankAt(i, a.length) }));
  const series = { key: def.key, cat: def.cat, title: def.title, items: items.map((it) => ({ ...it, series: def.key, cat: def.cat, reward: it.reward || null })) };
  SERIES.push(series);
  for (const it of series.items) { TROPHIES.push(it); TROPHY[it.id] = it; }
  return series;
}
SERIES_DEFS.forEach(addSeries);

// id045: the features added after id036 (stars, quests, hammer, rust,
// time capsule, "のびたよ", collection).
[
  { key: 'questDays', cat: '坚持', title: t('完成每日任务', 'Daily quests completed'), metric: 'questDays', steps: [1, 3, 7, 14, 30, 50, 100, 200, 365], name: (v) => t(`完成${v}天`, `${count(v, 'quest day')} completed`), desc: (v) => t(`累计${v}天完成全部每日任务`, `Complete all daily quests on ${count(v, 'day')} in total`) },
  { key: 'questRun', cat: '坚持', title: t('连续完成任务', 'Daily quest streak'), metric: 'questRun', steps: [2, 3, 5, 7, 14, 30], name: (v) => t(`连续完成${v}天`, `${count(v, 'quest day')} in a row`), desc: (v) => t(`连续${v}天完成全部每日任务`, `Complete all daily quests for ${count(v, 'day')} in a row`) },
  { key: 'hammer', cat: '坚持', title: t('补签锤', 'Make-up hammer'), metric: 'hammerUsed', steps: [1, 3, 10], name: (v) => t((v === 1 ? '首次补签' : `补签${v}次`), v === 1 ? 'First make-up' : `${count(v, 'make-up')}`), desc: (v) => t(`使用补签锤${v}次`, `Use a make-up hammer ${count(v, 'time')}`) },
  { key: 'starsTotal', cat: '技能', title: t('星星总数', 'Skill stars'), metric: 'starsTotal', steps: [5, 10, 25, 50, 75, 100, 150, 200, 250, 290], name: (v) => t(`${v}颗星`, `${count(v, 'star')}`), desc: (v) => t(`累计收集${v}颗技能星`, `Collect ${count(v, 'skill star')} in total`) },
  { key: 'star5', cat: '技能', title: t('五星技能', 'Five-star skills'), metric: 'star5', steps: [1, 3, 5, 10, 20, 30, 58], name: (v) => t(`${v}项五星技能`, `${count(v, 'five-star skill')}`), desc: (v) => t(`将${v}项技能练到五星`, `Reach five stars in ${count(v, 'skill')}`) },
  { key: 'gradeStar3', cat: '技能', title: t('全年级三星', 'Three stars for a grade'), items: [1, 2, 3, 4, 5, 6].map((g) => ({ id: `gradeStar3-${g}`, metric: `gradeStar3${g}`, need: 1, name: t(`${g}年级全部三星`, `Grade ${g}: three stars`), desc: t(`${g}年级的全部技能达到三星或以上`, `Earn at least three stars in every Grade ${g} skill`) })) },
  { key: 'polished', cat: '成长', title: t('重温技能', 'Skills refreshed'), metric: 'polished', steps: [1, 3, 5, 10, 30, 50], name: (v) => t(`重温${v}次`, `${count(v, 'skill review')}`), desc: (v) => t(`重温生疏的技能${v}次`, `Refresh a rusty skill ${count(v, 'time')}`) },
  { key: 'capsules', cat: '成长', title: t('时间胶囊', 'Time capsules'), metric: 'capsules', steps: [1, 3, 5, 10, 30], name: (v) => t(`${v}个胶囊`, `${count(v, 'capsule')}`), desc: (v) => t(`打开${v}个时间胶囊`, `Open ${count(v, 'time capsule')}`) },
  { key: 'capsuleFaster', cat: '成长', title: t('比以前更快', 'Faster than before'), metric: 'capsuleFaster', steps: [1, 5, 10], name: (v) => t(`进步${v}次`, `${count(v, 'improvement')}`), desc: (v) => t(`在时间胶囊中比以前答得更快${v}次`, `Answer faster than before in a time capsule ${count(v, 'time')}`) },
  { key: 'grew', cat: '成长', title: t('进步啦！', 'Improved!'), metric: 'grew', steps: [1, 5, 10, 30, 50, 100], name: (v) => t(`进步${v}次`, `${count(v, 'improvement')}`), desc: (v) => t(`结算时出现${v}次「进步啦！」`, `See “Improved!” in the results ${count(v, 'time')}`) },
  { key: 'items', cat: '收藏', title: t('收藏', 'Collection'), metric: 'itemsOwned', steps: [10, 20, 30, 40, 47], name: (v) => t(`收藏${v}件`, `${count(v, 'item')} collected`), desc: (v) => t(`收集${v}件藏品`, `Collect ${count(v, 'item')}`) },
  { key: 'catComplete', cat: '收藏', title: t('集齐收藏', 'Complete collections'), metric: 'catComplete', steps: [1, 3, 5, 8], name: (v) => t(`集齐${v}类`, `${count(v, 'collection')} complete`), desc: (v) => t(`集齐${v}类藏品`, `Complete ${count(v, 'collection category', 'collection categories')}`) },
].forEach(addSeries);

// Numbers every trophy is measured against, from the saved state.
// snap: { stats, prog, bestStreak, stickers, crowns, ...extra metrics }
export function trophyMetrics(snap) {
  const s = snap.stats || {};
  const prog = snap.prog || { skills: {} };
  const m = {
    bestStreak: snap.bestStreak || 0, days: s.days || 0, stickers: snap.stickers || 0, crowns: snap.crowns || 0,
    problems: s.problems || 0, cells: s.cells || 0, plays: s.plays || 0, minutes: Math.floor((s.playMs || 0) / 60000),
    unlocked: SKILLS.filter((x) => isUnlocked(prog, x.id)).length, mastered: SKILLS.filter((x) => isMastered(prog, x.id)).length,
    extras: s.extras || 0, extraBest: s.extraBest || 0, extraSolved: s.extraSolved || 0, maxCombo: s.maxCombo || 0,
    perfects: s.perfects || 0, firstTry: s.firstTry || 0, bestDopaL: Math.floor((s.bestDopaL || 0) + 1e-9), reviewSolved: s.reviewSolved || 0,
  };
  const stars = Object.fromEntries(SKILLS.map((x) => [x.id, starsOf(prog, x.id)]));
  m.starsTotal = Object.values(stars).reduce((a, b) => a + b, 0);
  m.star5 = Object.values(stars).filter((n) => n >= 5).length;
  m.polished = s.polished || 0; m.capsules = s.capsules || 0; m.capsuleFaster = s.capsuleFaster || 0; m.grew = s.grew || 0;
  for (let g = 1; g <= 6; g++) {
    m[`gradeStar3${g}`] = SKILLS.filter((x) => x.grade === g).every((x) => stars[x.id] >= 3) ? 1 : 0;
    m[`gradeDone${g}`] = SKILLS.filter((x) => x.grade === g).every((x) => isMastered(prog, x.id)) ? 1 : 0;
    m[`gradePlays${g}`] = (s.grades || {})[g] || 0;
  }
  LANES.forEach((_, i) => { m[`laneDone${i}`] = SKILLS.filter((x) => x.lane === i).every((x) => isMastered(prog, x.id)) ? 1 : 0; });
  for (const [k, v] of Object.entries(s.flags || {})) if (v) m[`flag:${k}`] = 1;
  const modes = s.modes || {};
  m.allModes = ['level', 'grade', 'practice', 'review'].every((k) => modes[k]) ? 1 : 0;
  Object.assign(m, snap.extra || {});
  return m;
}
export const valueOf = (m, metric) => m[metric] || 0;

// Earn every trophy whose condition is met. Returns the new ones (in list order).
// `state` is the saved { got: { id: time } }; the first call earns what the
// existing records already reach and marks them as a batch.
export function evaluate(state, metrics, at = Date.now()) {
  state.got = state.got || {};
  const fresh = [];
  for (const t of TROPHIES) {
    if (state.got[t.id]) continue;
    if (valueOf(metrics, t.metric) >= t.need) { state.got[t.id] = at; fresh.push(t); }
  }
  if (!state.init) { state.init = true; state.batch = fresh.map((t) => t.id); return []; }
  return fresh;
}

export const earnedCount = (state) => TROPHIES.filter((t) => state.got && state.got[t.id]).length;

// Progress of one series for the list screen.
export function seriesView(series, state, metrics) {
  const got = series.items.filter((t) => state.got && state.got[t.id]);
  const next = series.items.find((t) => !(state.got && state.got[t.id]));
  const top = got[got.length - 1] || null;
  return { series, got, next, top, value: next ? valueOf(metrics, next.metric) : null };
}
