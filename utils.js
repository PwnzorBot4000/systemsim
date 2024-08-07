export function longestCommonPrefixSorted(strings, position = 0) {
  // recursive, sorted by length
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];
  const [first, ...rest] = strings;
  const commonPrefix = position >= 0 ? first : first.slice(0, position);
  if (commonPrefix.length === 0) return '';
  if (rest.every(s => s.startsWith(commonPrefix))) return commonPrefix;
  return longestCommonPrefixSorted(strings, position - 1);
}

export function sanitizeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');
}

export async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}
