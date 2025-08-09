import {Achievements} from "../scripts/managers/achievements.js";

const asciiart = {
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

const PARSER_MODE = {
  EXEC: 'exec',
  DRAWING: 'drawing',
  DEFINING_STYLE: 'defining_style'
};

const parseAsciiArtFile = (name, source) => {
  if (typeof source !== 'string') throw new Error('AsciiArt source must be a string.');
  if (!source.includes('draw:')) {
    // Plain art file without logic or modifiers
    return { [name]: source};
  }
  const inputLines = source.split('\n');
  const outputLayers = {};
  let outputLines = [];

  let mode = PARSER_MODE.EXEC;
  let layerId = 1;
  let paddingRight = 0;
  let paddingBottom = 0;
  let remainingLines = -1;
  let styleContent = '';

  for (const [index, line] of inputLines.entries()) {
    // Style definition accumulation
    if (mode === PARSER_MODE.DEFINING_STYLE) {
      styleContent += line;
      if (line.includes('}')) {
        mode = PARSER_MODE.EXEC;
        const styleName = layerId > 1 ? `${name}-layer${layerId}-style` : `${name}-style`;
        try {
          outputLayers[styleName] = JSON.parse(styleContent);
        } catch (e) {
          throw new Error(`Invalid JSON in style definition for ${styleName}: ${e.message} - content: ${styleContent}`);
        }
        continue;
      }
      continue;
    }
    // Drawing data
    if (mode === PARSER_MODE.DRAWING) {
      outputLines.push(line + ' '.repeat(paddingRight));

      if (remainingLines > 0) remainingLines--;
      if (remainingLines === 0 || index === inputLines.length - 1) {
        // Finish drawing
        remainingLines = -1;
        mode = PARSER_MODE.EXEC;
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
        mode = PARSER_MODE.DRAWING;
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
      case 'style':
        mode = PARSER_MODE.DEFINING_STYLE;
        styleContent = (lineParts[1] ?? '') + '\n';
        break;
    }
  }

  return outputLayers;
}

const loadAsciiArtFile = async (artName) => {
  const filename = `assets/asciiart/${artName}.txt`;

  const response = await fetch(filename);
  if (!response.ok) {
    console.error(`Failed to load ascii art file ${artName}.`);
    return {};
  }

  try {
    const content = await response.text();
    return parseAsciiArtFile(artName, content);
  } catch (e) {
    console.error(`Failed to parse ascii art file ${artName}.`);
    console.error(e);
    return {};
  }
};

export const loadAsciiArt = async () => {
  const files = ['bookcase', 'desk', 'drawer', 'logo', 'memorySticks', 'notepad', 'picture'];
  const asciiArtCollection = {...asciiart};

  for (const file of files) {
    const asciiArtLayers = await loadAsciiArtFile(file);
    Object.assign(asciiArtCollection, asciiArtLayers);
  }

  return asciiArtCollection;
};