// Read before the UI catalogues are built. Switching language reloads the page.
let language = 'zh-CN';
try {
  const saved = JSON.parse(globalThis.localStorage?.getItem('dopa-drill:v1') || 'null');
  if (saved?.version === 1 && saved.settings?.language === 'en') language = 'en';
} catch { /* Storage can be unavailable or contain invalid JSON. */ }

export const getLanguage = () => language;
export function setLanguage(value) { language = value === 'en' ? 'en' : 'zh-CN'; }
export const t = (zh, en) => language === 'en' ? en : zh;
export const locale = () => language === 'en' ? 'en-US' : 'zh-CN';
