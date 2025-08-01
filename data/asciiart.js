import {Achievements} from "../scripts/managers/achievements.js";

const asciiart = {
  'desk-layer2-style': {
    color: '#404040',
  },
  'desk-layer3-style': {
    'padding': '0.5em',
  },
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

const parseAsciiArtFile = (name, source) => {
  if (typeof source !== 'string') throw new Error('AsciiArt source must be a string.');
  if (!source.includes('draw:')) {
    // Plain art file without logic or modifiers
    return source;
  }
  const inputLines = source.split('\n');
  const outputLayers = {};
  let outputLines = [];
  let isDrawing = false;
  let layerId = 1;
  let paddingRight = 0;
  let paddingBottom = 0;
  let remainingLines = -1;

  for (const [index, line] of inputLines.entries()) {
    // Drawing data
    if (isDrawing) {
      outputLines.push(line + ' '.repeat(paddingRight));

      if (remainingLines > 0) remainingLines--;
      if (remainingLines === 0 || index === inputLines.length - 1) {
        // Finish drawing
        remainingLines = -1;
        isDrawing = false;
        for (let i = 0; i < paddingBottom; i++) {
          outputLines.push(' ');
        }
        const result = outputLines.join('\n');
        if (layerId > 1) {
          outputLayers[`${name}-layer${layerId}`] = result;
        } else {
          outputLayers[name] = result;
        }
        outputLines = [];
      }
      continue;
    }
    // Comments
    if (line.startsWith('#')) continue;
    // Variables
    const lineParts = line.split(':').map(s => s.trim()).filter(Boolean);
    switch (lineParts[0]) {
      case 'draw':
        isDrawing = true;
        break;
      case 'height':
        remainingLines = parseInt(lineParts[1]);
        break;
      case 'layer':
        layerId = parseInt(lineParts[1]);
        break;
      case 'padding-right':
        paddingRight = parseInt(lineParts[1]);
        break;
      case 'padding-bottom':
        paddingBottom = parseInt(lineParts[1]);
        break;
    }
  }

  return outputLayers;
}

const loadAsciiArtFile = async (artName) => {
  const filename = `assets/asciiart/${artName}.txt`;

  const response = await fetch(filename);
  if (!response.ok) throw new Error(`Failed to load ascii art file ${artName}.`);

  return parseAsciiArtFile(artName, await response.text());
};

export const loadAsciiArt = async () => {
  const files = ['bookcase', 'desk', 'logo', 'memorySticks', 'notepad', 'picture'];
  const asciiArtCollection = {...asciiart};

  for (const file of files) {
    const asciiArtLayers = await loadAsciiArtFile(file);
    Object.assign(asciiArtCollection, asciiArtLayers);
  }

  return asciiArtCollection;
};