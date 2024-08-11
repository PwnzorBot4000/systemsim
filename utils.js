export function decodeExeName(contents) {
  const controlCharsRange = 256 - 48 * 5;
  let datastart = 1;
  if (contents.startsWith('MZ')) {
    datastart = 3;
  } else if (contents.startsWith('ELF')) {
    datastart = 4;
  }
  const nameLength = contents.charCodeAt(datastart - 1);
  const encodedName = contents.slice(datastart, datastart + nameLength);

  const charCodes = [];
  for (let i = 0; i < encodedName.length; i++) {
    charCodes.push((encodedName.charCodeAt(i) - controlCharsRange) % 48 + 48);
  }
  const name = String.fromCharCode(...charCodes);
  return name.toLowerCase();
}

export function encodeExeName(name, trashCount = 0) {
  const controlCharsRange = 256 - 48 * 5;
  let buffer = new Uint8Array(name.length + trashCount + 1);
  // First byte is the length of the name
  buffer[0] = name.length;

  // 0-9 A-Z range
  const nameUpper = name.toUpperCase();
  for (let i = 0; i < name.length; i++) {
    const charCode = (nameUpper.charCodeAt(i) - 48) % 48;
    const rotation = Math.floor(Math.random() * 5);
    buffer[i + 1] = controlCharsRange + charCode + rotation * 48;
  }

  for (let i = 0; i < trashCount; i++) {
    buffer[name.length + i + 1] = controlCharsRange + Math.floor(Math.random() * (256 - controlCharsRange));
  }

  return buffer.reduce((str, byte) => str + String.fromCharCode(byte), '');
}

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
