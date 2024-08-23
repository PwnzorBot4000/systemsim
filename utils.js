export function decodeExeName(contents) {
  const controlCharsRange = 256 - 48 * 5;
  let datastart = 1;
  if (!contents) return undefined;
  if (contents.startsWith('MZ')) {
    datastart = 3;
  } else if (contents.startsWith('ELF')) {
    datastart = 4;
  }
  else return undefined;
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

export function formatNumberInOrdinal(number) {
  const mod10 = number % 10;
  const mod100 = number % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${number}st`;
  }
  if (mod10 === 2 && mod100 !== 12) {
    return `${number}nd`;
  }
  if (mod10 === 3 && mod100 !== 13) {
    return `${number}rd`;
  }

  return `${number}th`;
}

export function formatSize(input, inputMultiplier = 'M', options = {binary: undefined, space: undefined}) {
  const binary = !!options.binary;
  const multipliers = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const inputExponent = multipliers.indexOf(inputMultiplier);
  const bytes = Math.pow(binary ? 1024 : 1000, inputExponent) * input;
  const outputExponent = Math.floor(Math.log(bytes) / Math.log(binary ? 1024 : 1000));
  return `${bytes / Math.pow(binary ? 1024 : 1000, outputExponent)}${!!options.space ? ' ' : ''}${multipliers[outputExponent]}`;
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
  if (!html) return '';
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');
}

export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return hash;
}

export async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}
