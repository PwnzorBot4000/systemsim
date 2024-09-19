import {asciiart} from "../../data/asciiart.js";

const numLayers = 4;

export class AsciiArtLayer {
  id;
  styles;
  index;

  constructor(init) {
    Object.assign(this, init);
  }

  getElementId() {
    return AsciiArtLayer.getElementIdByIndex(this.index);
  }

  static getElementIdByIndex(index) {
    if (index === 1) return 'asciiart';
    return `asciiart-l${index}`;
  }

  static getLayerIdByIndex(artId, index) {
    if (index === 1) return artId;
    return `${artId}-layer${index}`;
  }
}

export class AsciiArtManager {
  asciiArtId;
  asciiArtSource = asciiart;
  game;

  constructor(game, options = {asciiArtSource: undefined}) {
    this.game = game;

    if (options?.asciiArtSource) {
      this.asciiArtSource = options.asciiArtSource;
    }
  }

  clear() {
    const asciiArtLayerElems = document.getElementsByClassName('asciiart');
    for (const layerElem of asciiArtLayerElems) {
      if (!layerElem.id.startsWith('asciiart')) continue;
      layerElem.innerHTML = '';
      layerElem.style = null;
    }

    this.asciiArtId = undefined;
  }

  getCharacter(x, y, layer) {
    const layerId = AsciiArtLayer.getLayerIdByIndex(this.asciiArtId, layer);
    const layerData = this.asciiArtSource[layerId];
    if (!layerData) return '';

    const lines = layerData.split('\n');
    if (lines.length <= Math.abs(y)) return '';
    const line = lines[lines.length + y - 2];
    if (line.length <= Math.abs(x)) return '';
    return line[line.length + x - 1];
  }

  getList() {
    return [...new Set(Object.keys(this.asciiArtSource).map(key => key.split('-')[0]))];
  }

  getLayers(asciiArtId) {
    const layers = [];

    for (let i = 1; i <= numLayers; i++) {
      const layerId = i === 1 ? asciiArtId : `${asciiArtId}-layer${i}`;
      const layerStyles = [{ 'z-index': i }];

      const extraStyle = this.asciiArtSource[`${layerId}-style`];
      const extraStyles = this.asciiArtSource[`${layerId}-styles`] ?? [];
      if (extraStyle) {
        layerStyles.push(extraStyle);
      }
      layerStyles.push(...extraStyles);

      layers.push(new AsciiArtLayer({ id: layerId, styles: layerStyles, index: i }));
    }

    return layers;
  }

  getLayerText(asciiArtId, layerIndex) {
    const layerId = AsciiArtLayer.getLayerIdByIndex(asciiArtId, layerIndex);
    return this.asciiArtSource[layerId];
  }

  set(asciiArtId) {
    this.clear();
    if (!asciiArtId) return;

    const layers = this.getLayers(asciiArtId);

    for (const layer of layers) {
      const layerElem = document.getElementById(layer.getElementId());

      layerElem.innerHTML = this.asciiArtSource[layer.id] ?? '';
      layer.styles
        .filter((style) => {
          if (style.condition) {
            let conditionResult;
            try {
              conditionResult = style.condition(this.game);
            } catch (e) {
              conditionResult = false;
            }
            return conditionResult;
          }
          return true;
        })
        .forEach((style) => {
          for (const key in style) {
            if (key === 'condition') continue;
            layerElem.style[key] = style[key];
          }
        });
    }

    this.asciiArtId = asciiArtId;
  }

  setCharacter(char, x, y, layerIndex) {
    const layerId = AsciiArtLayer.getLayerIdByIndex(this.asciiArtId, layerIndex);
    const layerData = this.asciiArtSource[layerId];
    if (!layerData) return;

    const lines = layerData.split('\n');
    if (lines.length <= Math.abs(y)) return;
    const line = lines[lines.length + y - 2];
    if (line.length <= Math.abs(x)) return;
    lines[lines.length + y - 2] = line.slice(0, line.length + x - 1) + char + line.slice(line.length + x);

    this.asciiArtSource[AsciiArtLayer.getLayerIdByIndex(this.asciiArtId, layerIndex)] = lines.join('\n');

    const layerElem = document.getElementById(AsciiArtLayer.getElementIdByIndex(layerIndex));
    layerElem.innerHTML = this.asciiArtSource[AsciiArtLayer.getLayerIdByIndex(this.asciiArtId, layerIndex)];
  }
}