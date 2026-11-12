// Unlockable show (id041): backgrounds, correct marks, particles, music,
// Dopakichi's costume and colour, the crowd and the finale. Each item is the
// reward of one trophy (never random), so what is unlocked follows from the
// trophies earned; only the player's choice per category is saved.
import { TROPHY } from './trophies.js';
import { t } from './i18n.js';

export const CATS = [
  { key: 'bg', name: t('背景', 'Background') },
  { key: 'mark', name: t('答对标记', 'Correct mark') },
  { key: 'particle', name: t('飘落特效', 'Falling effects') },
  { key: 'music', name: t('音乐', 'Music') },
  { key: 'costume', name: t('装扮', 'Costumes') },
  { key: 'color', name: t('星仔的颜色', 'Nova’s color') },
  { key: 'crowd', name: t('观众', 'Audience') },
  { key: 'finale', name: t('庆祝表演', 'Celebration') },
];

// base: available from the start. trophy: the trophy whose reward it is.
export const ITEMS = [];
export const ITEM = {};
export function addItems(list) {
  for (const it of list) {
    ITEMS.push(it); ITEM[it.id] = it;
    if (it.trophy && TROPHY[it.trophy]) TROPHY[it.trophy].reward = it.id;
  }
}
addItems([
  { id: 'bg:classic', cat: 'bg', name: t('放射光', 'Sunburst'), base: true },
  { id: 'mark:hanamaru', cat: 'mark', name: t('小红花', 'Flower stamp'), base: true },
  { id: 'particle:classic', cat: 'particle', name: t('彩纸', 'Confetti'), base: true },
  { id: 'music:classic', cat: 'music', name: t('马林巴进行曲', 'Marimba march'), base: true },
  { id: 'costume:none', cat: 'costume', name: t('无', 'None'), base: true },
  { id: 'color:pink', cat: 'color', name: t('粉色', 'Pink'), base: true },
  { id: 'crowd:classic', cat: 'crowd', name: t('彩色观众', 'Colorful audience'), base: true },
  { id: 'finale:classic', cat: 'finale', name: t('大星仔', 'Giant Nova'), base: true },
]);
// id041: one sample per category, to prove the pipeline end to end.
// Rewards follow effort and coming back (plays, days, streaks, stars earned by
// practice), not the placement check, which can master many skills at once.
addItems([
  { id: 'costume:cap', cat: 'costume', name: t('帽子', 'Cap'), trophy: 'days-1' },
  { id: 'particle:note', cat: 'particle', name: t('音符', 'Music notes'), trophy: 'days-3' },
  { id: 'mark:stamp', cat: 'mark', name: t('答对印章', 'Correct stamp'), trophy: 'plays-3' },
  { id: 'bg:night', cat: 'bg', name: t('夜空', 'Night sky'), trophy: 'streak-3' },
  { id: 'color:blue', cat: 'color', name: t('蓝色', 'Blue'), trophy: 'plays-5' },
  { id: 'finale:fireworks', cat: 'finale', name: t('烟花秀', 'Fireworks show'), trophy: 'extras-5' },
  { id: 'music:chip', cat: 'music', name: t('8位旋律', '8-bit tune'), trophy: 'plays-10' },
  { id: 'crowd:costume', cat: 'crowd', name: t('装扮观众', 'Dressed-up audience'), trophy: 'firstTry-50' },
]);
// id042: backgrounds, correct marks and particles.
addItems([
  { id: 'bg:sea', cat: 'bg', name: t('大海与泡泡', 'Ocean bubbles'), trophy: 'problems-100' },
  { id: 'bg:festival', cat: 'bg', name: t('节日', 'Festival'), trophy: 'days-15' },
  { id: 'bg:paper', cat: 'bg', name: t('纸艺', 'Paper craft'), trophy: 'problems-200' },
  { id: 'bg:space', cat: 'bg', name: t('宇宙', 'Space'), trophy: 'extras-10' },
  { id: 'mark:medal', cat: 'mark', name: t('奖牌', 'Medal'), trophy: 'streak-7' },
  { id: 'mark:crown', cat: 'mark', name: t('皇冠', 'Crown'), trophy: 'perfects-3' },
  { id: 'mark:ring', cat: 'mark', name: t('烟花圆环', 'Firework ring'), trophy: 'combo-30' },
  { id: 'particle:petal', cat: 'particle', name: t('花瓣', 'Petals'), trophy: 'stickers-7' },
  { id: 'particle:digit', cat: 'particle', name: t('数字', 'Numbers'), trophy: 'cells-1000' },
  { id: 'particle:bubble', cat: 'particle', name: t('泡泡', 'Bubbles'), trophy: 'review-10' },
  { id: 'particle:candy', cat: 'particle', name: t('糖果', 'Candy'), trophy: 'extraBest-10' },
]);
// id043: songs (8ビット is the id041 sample).
addItems([
  { id: 'music:matsuri', cat: 'music', name: t('节日乐曲', 'Festival tune'), trophy: 'streak-5' },
  { id: 'music:brass', cat: 'music', name: t('铜管乐队', 'Brass band'), trophy: 'days-5' },
  { id: 'music:electro', cat: 'music', name: t('电子乐', 'Electro'), trophy: 'extras-3' },
]);
// id044: costumes, colours, crowd and finales (id045 moved three rewards to the new series).
addItems([
  { id: 'costume:hachimaki', cat: 'costume', name: t('运动头带', 'Sports headband'), trophy: 'problems-50' },
  { id: 'costume:cape', cat: 'costume', name: t('披风', 'Cape'), trophy: 'combo-20' },
  { id: 'costume:glasses', cat: 'costume', name: t('圆眼镜', 'Round glasses'), trophy: 'firstTry-100' },
  { id: 'costume:ribbon', cat: 'costume', name: t('蝴蝶结', 'Bow'), trophy: 'stickers-14' },
  { id: 'costume:crown', cat: 'costume', name: t('皇冠', 'Crown'), trophy: 'streak-14' },
  { id: 'costume:wizard', cat: 'costume', name: t('魔法帽', 'Wizard hat'), trophy: 'star5-1' },
  { id: 'costume:headphones', cat: 'costume', name: t('耳机', 'Headphones'), trophy: 'capsules-1' },
  { id: 'color:mint', cat: 'color', name: t('绿色', 'Green'), trophy: 'days-7' },
  { id: 'color:snow', cat: 'color', name: t('雪白色', 'Snow white'), trophy: 'questDays-7' },
  { id: 'color:yellow', cat: 'color', name: t('黄色', 'Yellow'), trophy: 'problems-300' },
  { id: 'color:violet', cat: 'color', name: t('紫色', 'Purple'), trophy: 'extraSolved-100' },
  { id: 'color:gold', cat: 'color', name: t('金色', 'Gold'), trophy: 'streak-30' },
  { id: 'color:rainbow', cat: 'color', name: t('彩虹色', 'Rainbow'), trophy: 'days-100' },
  { id: 'crowd:rainbow', cat: 'crowd', name: t('彩虹观众', 'Rainbow audience'), trophy: 'days-30' },
  { id: 'crowd:twins', cat: 'crowd', name: t('同款观众', 'Matching audience'), trophy: 'starsTotal-100' },
  { id: 'finale:parade', cat: 'finale', name: t('欢乐巡游', 'Happy parade'), trophy: 'streak-10' },
  { id: 'finale:rocket', cat: 'finale', name: t('火箭', 'Rocket'), trophy: 'extras-20' },
]);

export const isUnlocked = (it, got = {}) => !!(it && (it.base || (it.trophy && got[it.trophy])));
export const unlockedIn = (cat, got) => ITEMS.filter((it) => it.cat === cat && isUnlocked(it, got));
export const defaultEquip = () => Object.fromEntries(CATS.map((c) => [c.key, 'auto']));

// The look for one play: fixed choices stay; "auto" picks among the unlocked
// ones so every play can look and sound a little different.
export function pickLook(equip = {}, got = {}, rng = Math.random) {
  const look = {};
  for (const { key } of CATS) {
    const want = equip[key];
    const own = unlockedIn(key, got);
    if (want && want !== 'auto' && own.some((it) => it.id === want)) look[key] = want;
    else look[key] = own[Math.floor(rng() * own.length)].id;
  }
  return look;
}
// The part after "cat:" (what the show modules switch on).
export const variant = (id) => (id ? id.split(':')[1] : 'classic');
