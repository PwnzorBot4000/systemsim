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

const PARSER_MODE = Object.freeze({
  EXEC: 'exec',
  DRAWING: 'drawing',
  DEFINING_STYLE: 'defining_style'
});

class AsciiArtLoadingContext {
  artName = '';
  artSource = '';
  layerId = 0;
  parserMode = PARSER_MODE.EXEC;
  paddingBottom = 0;
  paddingRight = 0;
  rootPrefix = '';

  constructor(context) {
    Object.assign(this, context);
  }
}

/**
 * @param {AsciiArtLoadingContext} context
 * @param {AsciiArtLoadingContext} parentContext
 * @returns {Promise<{[layerId: string]: any}>}
 */
const parseAsciiArtFile = async (
  context,
  parentContext,
) => {
  if (typeof context.artSource !== 'string') throw new Error('AsciiArt source must be a string.');
  if (!context.artSource.includes('draw:')) {
    // Plain art file without logic or modifiers
    return { [context.artName]: context.artSource };
  }
  const inputLines = context.artSource.split('\n');
  const outputLayers = {};
  let outputLines = [];

  let remainingLines = -1;
  let styleContent = '';

  for (const [index, line] of inputLines.entries()) {
    // Style definition accumulation
    if (context.parserMode === PARSER_MODE.DEFINING_STYLE) {
      styleContent += line;
      if (line.includes('}')) {
        context.parserMode = PARSER_MODE.EXEC;
        const styleName = context.layerId > 1 ? `${context.artName}-layer${context.layerId}-style` : `${context.artName}-style`;
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
    if (context.parserMode === PARSER_MODE.DRAWING) {
      outputLines.push(line + ' '.repeat(parentContext.paddingRight + context.paddingRight));

      if (remainingLines > 0) remainingLines--;
      if (remainingLines === 0 || index === inputLines.length - 1) {
        // Finish drawing
        remainingLines = -1;
        context.parserMode = PARSER_MODE.EXEC;
        for (let i = 0; i < (parentContext.paddingBottom + context.paddingBottom); i++) {
          outputLines.push(' ');
        }
        const result = outputLines.join('\n');
        if (context.layerId > 1) {
          outputLayers[`${context.artName}-layer${context.layerId}`] = result;
        } else {
          outputLayers[context.artName] = result;
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
        context.parserMode = PARSER_MODE.DRAWING;
        break;
      case 'height':
        remainingLines = parseInt(lineParts[1]);
        break;
      case 'include': {
        const childLayers = await loadAsciiArtFile(new AsciiArtLoadingContext({
          artName: lineParts[1],
          rootPrefix: context.rootPrefix,
        }), {...context, layerId: context.layerId - 1});
        for (const [childKey, childLayer] of Object.entries(childLayers)) {
          const key = context.artName + childKey.slice(lineParts[1].length);
          outputLayers[key] = childLayer;
        }
        break;
      }
      case 'layer': {
        const layerValue = lineParts[1] === 'next' ?
          context.layerId + 1 :
          parseInt(lineParts[1]);
        context.layerId = parentContext.layerId + layerValue;
        break;
      }
      case 'padding-right':
        context.paddingRight = parseInt(lineParts[1]);
        break;
      case 'padding-bottom':
        context.paddingBottom = parseInt(lineParts[1]);
        break;
      case 'style':
        context.parserMode = PARSER_MODE.DEFINING_STYLE;
        styleContent = (lineParts[1] ?? '') + '\n';
        break;
    }
  }

  return outputLayers;
}

/**
 * @param {AsciiArtLoadingContext} context
 * @param {AsciiArtLoadingContext} parentContext
 * @returns {Promise<{[p: string]: *}|{}>}
 */
const loadAsciiArtFile = async (
  context,
  parentContext = new AsciiArtLoadingContext(),
) => {
  const filename = `${context.rootPrefix}assets/asciiart/${context.artName}.txt`;
  console.info(`Loading ${filename}`);

  const response = await fetch(filename);
  if (!response.ok) {
    console.error(`Failed to load ascii art file ${context.artName}.`);
    return {};
  }

  try {
    const content = await response.text();
    return await parseAsciiArtFile(new AsciiArtLoadingContext({
      artName: context.artName,
      artSource: content,
      layerId: 1,
      rootPrefix: context.rootPrefix,
    }), parentContext);
  } catch (e) {
    console.error(`Failed to parse ascii art file ${context.artName}.`);
    console.error(e);
    return {};
  }
};

export const loadAsciiArt = async (options = { prefix: '' }) => {
  const files = [
    'bookcase', 'desk', 'drawer', 'logo', 'memorySticks', 'notepad', 'picture', 'items/spoon', 'items/battery'
  ];
  const asciiArtCollection = {...asciiart};

  for (const file of files) {
    const asciiArtLayers = await loadAsciiArtFile(new AsciiArtLoadingContext({
      artName: file,
      rootPrefix: options.prefix,
    }));
    Object.assign(asciiArtCollection, asciiArtLayers);
  }

  return asciiArtCollection;
};