import {Achievements} from "../scripts/managers/achievements.js";

const asciiart = {
  'bookcase-layer2':
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n',
  'bookcase-layer2-style': {
    'padding-bottom': '0.6em',
    'padding-right': '0.5ch'
  },
  'desk-layer2':
    '                                                   \n' +
    '             ╔═════════════╗                       \n' +
    '             ║             ║                       \n' +
    '             ║             ║                       \n' +
    '             ║             ║                       \n' +
    '       ╔═══╗ ║             ║                       \n' +
    '      ─║   ║─               ──────────┐            \n' +
    '    ╱                     _    ┉┄┈    │            \n' +
    '   ╷                                  │            \n' +
    '   │                                  │            \n' +
    '   │░░░░░░                 ▖          │            \n' +
    '   │░░░░░░                ▝           │            \n' +
    '   │         ┌──────────── ░░░░░░     │            \n' +
    '   │░░░░░░   │             ░░░░░░      =           \n' +
    '   │░░░░░░   │             ░░░░░░      │           \n' +
    '   │         ╵             ░░░░░░       ╲          \n' +
    '   │░░░░░░                 ░░░░░░        ▕         \n' +
    '   │░░░░░░                 ░░░░░░        ▕         \n' +
    '   │                       ░░░░░░                  \n' +
    '   ╵                                               \n' +
    '                                                   \n',
  'desk-layer2-style': {
    color: '#404040',
  },
  'desk-layer3':
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '             ╻                                     \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '                                                   \n' +
    '             ╱                                     \n' +
    '            ╱                                      \n' +
    '                                                   \n',
  'desk-layer3-style': {
    'padding': '0.5em',
  },
  logo:
    '                               \n' +
    '   ╔═══════════════════════╗   \n' +
    '   ║                       ║   \n' +
    '   ║ ██████ ██   ██ ██████ ║   \n' +
    '   ║ ██  ██ ██   ██ ██  ██ ║   \n' +
    '   ║ ██     ███ ███ ██     ║   \n' +
    '   ║ ██████  ██ ██  ██████ ║   \n' +
    '   ║     ██   ███       ██ ║   \n' +
    '   ║ ██  ██   ███   ██  ██ ║   \n' +
    '   ║ ██████   ███   ██████ ║   \n' +
    '   ║                       ║   \n' +
    '   ╚═══════════════════════╝   \n' +
    '                               \n',
  'logo-layer2':
    '                               \n' +
    '   ╔═══════════════════════╗   \n' +
    '    ║                       ║   \n' +
    '   ║ ██████ ██   ██ ██████ ║   \n' +
    '  ║ ██  ██ ██   ██ ██  ██ ║   \n' +
    '   ║ ██     ███ ███ ██     ║   \n' +
    '   ║ ██████  ██ ██  ██████ ║   \n' +
    '  ║     ██   ███       ██ ║   \n' +
    '   ║ ██  ██   ███   ██  ██ ║   \n' +
    '    ║ ██████   ███   ██████ ║   \n' +
    '   ║                       ║   \n' +
    '  ╚═══════════════════════╝   \n' +
    '                               \n',
  'logo-layer2-styles': [
    {
      padding: '1em',
      color: '#ff000048',
      animation: 'static-crackle 6s infinite',
      'animation-timing-function': 'steps(1, end)',
    },
    {
      condition: () => Achievements.has('deepnet'),
      padding: '0 1em',
    }
  ],
  'logo-layer3':
    '                               \n' +
    '   ╔═══════════════════════╗   \n' +
    '    ║                       ║   \n' +
    '   ║ ██████ ██   ██ ██████ ║   \n' +
    '  ║ ██  ██ ██   ██ ██  ██ ║   \n' +
    '   ║ ██     ███ ███ ██     ║   \n' +
    '   ║ ██████  ██ ██  ██████ ║   \n' +
    '  ║     ██   ███       ██ ║   \n' +
    '   ║ ██  ██   ███   ██  ██ ║   \n' +
    '    ║ ██████   ███   ██████ ║   \n' +
    '   ║                       ║   \n' +
    '  ╚═══════════════════════╝   \n' +
    '                               \n',
  'logo-layer3-styles': [
    {
      color: '#00000000',
    },
    {
      condition: () => Achievements.has('deepnet'),
      color: '#0099ff48',
      animation: 'neon-ripple 0.5s infinite',
      'animation-timing-function': 'ease-in-out',
    }
  ],
  'logo-layer4':
    '                               \n' +
    '   ╔═══════════════════════╗   \n' +
    '   ║                       ║   \n' +
    '   ║ ██████ ██   ██ ██████ ║   \n' +
    '   ║ ██  ██ ██   ██ ██  ██ ║   \n' +
    '   ║ ██     ███ ███ ██     ║   \n' +
    '   ║ ██████  ██ ██  ██████ ║   \n' +
    '   ║     ██   ███       ██ ║   \n' +
    '   ║ ██  ██   ███   ██  ██ ║   \n' +
    '   ║ ██████   ███   ██████ ║   \n' +
    '   ║                       ║   \n' +
    '   ╚═══════════════════════╝   \n' +
    '                               \n',
  'logo-layer4-styles': [
    {
      color: '#00000000',
    },
    {
      condition: () => !Achievements.has('deepnet'),
      color: '#0000ff80',
      animation: 'periodic-ripple 14s infinite',
      'animation-timing-function': 'ease-in-out',
    }
  ],
};

const parseAsciiArtFile = (source) => {
  if (typeof source !== 'string') throw new Error('AsciiArt source must be a string.');
  if (!source.includes('draw:')) {
    // Plain art file without logic or modifiers
    return source;
  }
  const inputLines = source.split('\n');
  const outputLines = [];
  let isDrawing = false;
  let paddingRight = 0;
  let paddingBottom = 0;

  for (const line of inputLines) {
    // Drawing data
    if (isDrawing) {
      outputLines.push(line + ' '.repeat(paddingRight));
      continue;
    }
    // Comments
    if (line.startsWith('##')) continue;
    // Variables
    const lineParts = line.split(' ').filter(Boolean);
    switch (lineParts[0]) {
      case 'draw:':
        isDrawing = true;
        break;
      case 'padding-right:':
        paddingRight = parseInt(lineParts[1]);
        break;
      case 'padding-bottom:':
        paddingBottom = parseInt(lineParts[1]);
        break;
    }
  }

  for (let i = 0; i < paddingBottom; i++) {
    outputLines.push(' ');
  }

  return outputLines.join('\n');
}

const loadAsciiArtFile = async (filename) => {
  const response = await fetch(filename);
  if (!response.ok) throw new Error(`Failed to load ascii art file ${filename}.`);
  return parseAsciiArtFile(await response.text());
};

export const loadAsciiArt = async () => {
  const bookcase = await loadAsciiArtFile('assets/asciiart/bookcase.txt');
  const desk = await loadAsciiArtFile('assets/asciiart/desk.txt');
  const memorySticks = await loadAsciiArtFile('assets/asciiart/memory-sticks.txt');
  const notepad = await loadAsciiArtFile('assets/asciiart/notepad.txt');
  const picture = await loadAsciiArtFile('assets/asciiart/picture.txt');
  return {...asciiart, desk, bookcase, memorySticks, notepad, picture};
};