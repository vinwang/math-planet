import { getLanguage } from './i18n.js';

// Translate existing text nodes without replacing buttons or their dynamic children.
export function translateStaticPage() {
  if (getLanguage() !== 'en') return;
  document.documentElement.lang = 'en';
  const strings = {
    '算数星球': 'Math Planet', '算数': 'Math ', '星球': 'Planet', '每天几道题，点亮一颗星': 'Practice a little, shine a lot',
    'Language / 语言': 'Language', '设置': 'Settings', '玩法说明': 'How to Play', '适合我的练习': 'My Practice', '先做初始测评': 'Start with a placement quiz',
    '错题复习': 'Mistake Review', '按年级选择': 'Choose a grade', '年级': 'Grade', '技能树': 'Skill Tree', '奖杯': 'Trophies', '收藏': 'Collection',
    '今日任务': 'Daily Quests', '上个月': 'Previous month', '下个月': 'Next month', '练习日历': 'Practice Calendar',
    '日': 'Sun', '一': 'Mon', '二': 'Tue', '三': 'Wed', '四': 'Thu', '五': 'Fri', '六': 'Sat',
    '也可以使用数字键和退格键操作': 'You can also use number keys and Backspace.',
    '关于算数星球与玩法': 'About Math Planet', '用游戏练习小学计算': 'Practice math through play',
    '算数星球是一款浏览器计算练习游戏。答题时，伙伴星仔会和你一起庆祝。58项技能按中国大陆小学常见教学进度分配到一至六年级，具体学习顺序请以实际教材为准。': 'Math Planet is a browser-based math game. Your friend Nova celebrates with you as you practice. Its 58 skills follow the usual primary-school curriculum in mainland China for grades 1–6; follow your own textbook for the exact learning sequence.',
    '练习内容': 'What you can practice',
    '内容包括加减乘除、竖式、小数和分数计算、近似数、因数与倍数、百分数、比和含字母的计算。本游戏仅覆盖计算练习，不包含图形、测量、统计图或应用题等全部小学数学内容。': 'Practice addition, subtraction, multiplication, division, written calculations, decimals, fractions, rounding, factors and multiples, percentages, ratios and expressions with letters. The game focuses on calculation and does not cover all primary-school topics such as geometry, measurement, charts or word problems.',
    '开始与操作': 'Getting started',
    '选择年级，或从“适合我的练习”的初始测评开始。初始测评只用于推荐练习，不是能力认证。也可以在技能树中选择已解锁的技能练习。': 'Choose a grade or start the placement quiz in My Practice. The quiz recommends practice and is not a formal assessment. You can also choose an unlocked skill from the Skill Tree.',
    '使用屏幕上的数字按钮或键盘数字键输入答案，按退格键删除。竖式题需要按顺序填写中间步骤。': 'Enter answers using the on-screen keypad or your keyboard. Use Backspace to delete. Fill in written calculation steps in order.',
    '完成全部基础题即可获得100分。包括中间步骤在内的首次正确率达到80%时，可以进入限时加赛。答错的题目可以在“错题复习”中重做。': 'Complete all basic questions to earn 100 points. Get at least 80% correct on the first try, including intermediate steps, to unlock the timed Bonus Round. Retry missed questions in Mistake Review.',
    '在“设置”中可以调整题数、声音和动画强度。动画强度为0%时，主要的晃动、闪光和移动效果会停止。练习中点击左上角暂停按钮，可继续练习或返回首页；键盘也可以按 Esc。': 'Adjust question count, sound and animation in Settings. At 0% animation, the main shaking, flashing and movement effects stop. During practice, use the pause button or Esc to continue or return home.',
    '练习记录': 'Practice History',
    '日历、得分、答对与答错次数、用时、技能进度和奖杯保存在本机浏览器中，不支持账号注册或跨设备同步。清除浏览器数据或在设置中重置会删除记录；浏览器限制存储时，记录可能无法保存。演示不计入记录。': 'Your calendar, scores, answers, time, skill progress and trophies are saved in this browser. Accounts and cross-device sync are not supported. Clearing browser data or resetting in Settings deletes your history; browser storage restrictions may prevent saving. Demo plays are not recorded.',
    '返回': 'Back', '点击练习，已掌握的技能可查看星级条件；长按可删除进度': 'Select a skill to practice or view star goals; press and hold to delete progress.',
    '筛选': 'Filter', '全部': 'All', '已获得': 'Earned', '未获得': 'Locked', '即将获得': 'Almost earned', '类别': 'Category',
    '练习界面': 'Practice', '暂停练习': 'Pause practice', '目标 2:40': 'Goal 2:40', '关闭声音': 'Mute sound',
    '答对': 'Correct', '答错': 'Mistakes', '连对': 'Streak', '星能': 'Star Power', '加法': 'Addition', '第1题': 'Question 1',
    '计算': 'Calculation', '个位': 'Ones', '还差一位': 'One digit left', '输入数字': 'Enter a number', '删除一位': 'Delete a digit',
    '基础练习完成': 'Basic practice complete', '分': 'pts', '10题': '10 questions', '0次': '0', '0题': '0 questions', '首次正确率': 'First-try accuracy',
    '用时': 'Time', '进入加赛': 'Bonus Round', '90秒': '90 sec', '重做错题': 'Retry mistakes', '查看技能树': 'Skill Tree', '再来一次': 'Play again', '结束': 'Finish',
    '加赛结束': 'Bonus Round complete', '基础 100 ＋ 加赛 0': 'Basic 100 + Bonus 0', '加赛答对': 'Bonus correct', '加赛答错': 'Bonus mistakes', '基础答错': 'Basic mistakes', '基础用时': 'Basic time',
    '题目数量': 'Questions', '题数': 'Question count', '题': 'questions', '声音': 'Sound', '开启': 'On', '音量': 'Volume', '动画强度': 'Animation intensity',
    '设为0%时停止晃动、闪光、彩纸和移动效果': 'At 0%, shaking, flashing, confetti and movement stop.', '演示': 'Demo', '▶ 观看自动演示': '▶ Watch demo',
    '点击屏幕或按任意键结束（不保存记录）': 'Tap or press any key to stop. Demo progress is not saved.', '数据': 'Data', '重置全部数据': 'Reset all data',
    '删除所有数据并恢复初始状态': 'Delete all data and restore defaults', '关闭': 'Close', '每日签到奖励': 'Daily check-in reward', '领取': 'Claim',
    '开始练习': 'Start practice', '获得奖杯！': 'Trophy earned!', '太棒了！': 'Great!', '补签锤': 'Streak Hammer', '暂不使用': 'Not now', '使用': 'Use',
    '删除技能进度': 'Delete skill progress', '取消': 'Cancel', '删除': 'Delete', '此游戏需要启用 JavaScript。': 'This game requires JavaScript.',
    '面向小学一至六年级的计算练习游戏，涵盖四则运算、竖式、小数和分数。练习记录保存在本机浏览器中。': 'A math practice game for grades 1–6, covering arithmetic, written calculations, decimals and fractions. Progress is saved in this browser.',
  };
  const walk = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const node = walk.currentNode;
    const key = node.nodeValue.trim();
    if (Object.hasOwn(strings, key)) node.nodeValue = node.nodeValue.replace(key, strings[key]);
  }
  document.querySelectorAll('[data-grade]').forEach((button) => {
    button.firstChild.nodeValue = 'Grade ';
    button.querySelector('small').textContent = button.dataset.grade;
  });
  document.querySelectorAll('[aria-label], meta[name="description"]').forEach((el) => {
    const attr = el.hasAttribute('aria-label') ? 'aria-label' : 'content';
    if (Object.hasOwn(strings, el.getAttribute(attr))) el.setAttribute(attr, strings[el.getAttribute(attr)]);
  });
}
