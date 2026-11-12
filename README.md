# 算数星球

支持简体中文和英文切换的小学计算练习游戏。每完成一道题，星仔、音乐和画面会一起庆祝；答错可以继续尝试，没有游戏结束惩罚。

## 内容与玩法

- 58 个计算技能，按中国大陆小学常见教学进度安排到一至六年级，涵盖加减乘除、竖式中间步骤、小数、分数、近似数、百分数、比和简单方程。
- “适合我的练习”先推荐练习起点，再结合掌握情况安排练习。首次测评不直接授予掌握或星级；通常需要最近 6 题中至少 5 题首次答对。
- 支持按年级练习、技能树练习和错题复习。完成基础题获得 100 分；首次正确率达到 80% 可进入限时加赛。
- 每日任务、签到、奖杯、装扮和背景收集用于鼓励持续练习。
- 手机使用屏幕数字键，电脑也可用数字键和退格键。左上角暂停按钮或 Esc 可暂停、继续或返回首页。
- 声音和动画强度可调整；首次启动尊重系统的“减少动态效果”偏好。

本应用只覆盖部分计算内容，不是完整教材或正式能力测评。具体课程映射、生成范围及教材差异见 [课程说明](docs/curriculum.md)。

## 中英文切换

在首页打开“设置”，通过“语言 / Language”选择简体中文或 English。切换后页面重新载入，语言偏好与原有学习记录保存在同一浏览器中；错题、技能进度、奖杯和收藏不会因切换语言被清空。首次使用默认简体中文。若浏览器无法保存语言设置，会显示提示并保留当前页面和本次访问中的进度。

英文名称为 **Math Planet**，伙伴为 **Nova**。两种语言共用同一套题目和中国大陆小学年级安排；英文版不代表美国、英国或其他国家的课程映射。题目原始数据与错题签名保持不变，英文只用于显示，因此可以跨语言继续复习同一道题。

**English:** Open **Settings → Language → English** on the home screen. The page reloads with your chosen language while keeping your local progress, mistakes, trophies and collection. The curriculum follows the same mainland China grade sequence in both languages.

## 本地运行

应用没有运行时依赖，也不需要构建。用 HTTP 静态服务提供 `app/` 即可：

```bash
python3 -m http.server 8000 --bind 127.0.0.1 -d app
```

打开 `http://127.0.0.1:8000/`。ES Modules 不能通过直接双击 HTML 的 `file://` 方式运行。

## 测试

使用 Node.js 20 或更新版本。逻辑测试不需要安装依赖：

```bash
node --test tests/*.test.mjs
```

浏览器回归测试使用 Playwright 和本机 Google Chrome。测试会创建独立浏览器数据、临时本机服务，并在结束时关闭：

```bash
npm ci
npm run test:browser
```

覆盖中英文切换、跨语言错题复习、存储失败保护、58项技能英文题面、中文引导、手机暂停、输入与纠错、基础结算、错题清除、刷新恢复、测评推荐、非法 URL 参数、加赛、隐藏奖杯及旧日文错题兼容。浏览器测试依赖仅用于开发，不会打包到网页中。

## 记录与隐私

记录保存在当前浏览器的 localStorage，不上传学习记录，无账号、广告或跨设备同步。清除浏览器数据或使用“全部重置”会删除记录；浏览器禁用或限制存储时，记录可能无法保存。

为保留已有学习记录，沿用存储键 `dopa-drill:v1` 和既有技能、奖杯 ID。旧错题及时间胶囊题目在读取时转换为中文，原有数字、答题步骤和进度保留。年级映射改变后，既有年级完赛次数仍按当时记录保留。

## 结构与品牌

- `app/js/main.js`：页面、输入、计时与演出协调。
- `skills.js` / `problems.js` / `session.js`：课程、题目生成、掌握与出题计划。
- `growth.js` / `quests.js` / `trophies.js` / `unlocks.js`：成长、任务、奖杯和收藏。
- `store.js`：存档、设置校验、签到与重置。
- `dopakichi.js` / `bg.js` / `fx.js` / `audio.js`：星仔、背景、粒子与合成音频。历史模块名保留以减少接口变化。
- [功能说明](docs/SPEC.md)、[星仔造型](docs/star-pal.svg)、[来源与素材说明](NOTICE.md)。

本项目基于 [grmchn/dopa-drill](https://github.com/grmchn/dopa-drill) 改编，保留上游 MIT 版权声明。当前界面使用新的“算数星球”名称、中文标题图形和星仔造型；原品牌与角色的授权限制仍见 [LICENSE](LICENSE)。
