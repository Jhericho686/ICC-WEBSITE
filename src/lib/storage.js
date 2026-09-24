export function safeArrayParse(key) {
  try {
    const val = localStorage.getItem(key);
    if (!val || val === 'undefined' || val === 'null') return [];
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Error parsing localStorage key "${key}":`, err);
    return [];
  }
}
