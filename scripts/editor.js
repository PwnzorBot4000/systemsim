import {AsciiArtLayer, AsciiArtManager} from "./managers/asciiart.js";

export class AsciiArtEditor {
  cursor = {x: 0, y: 0, layer: 1, elem: undefined};
  manager;

  constructor() {
    this.cursor.elem = document.getElementById('editor-cursor');
  }

  async init() {
    this.manager = new AsciiArtManager();
    await this.manager.init();

    this.load();

    const artPieces = this.manager.getList();
    const artListElem = document.getElementById('editor-artlist-list');
    artListElem.innerHTML = artPieces.map((piece) => `<button onclick="editor.handleClickAsciiArt('${piece}')">${piece}</button>`).join('');

    // Bind events
    document.addEventListener('keydown', this.keyDownHandler);

    this.refresh();
  }

  keyDownHandler = async (e) => {
    switch (e.key) {
      case 'ArrowUp':
        this.moveCursor(this.cursor.x, this.cursor.y - 1);
        break;
      case 'ArrowDown':
        this.moveCursor(this.cursor.x, this.cursor.y + 1);
        break;
      case 'ArrowLeft':
        this.moveCursor(this.cursor.x - 1, this.cursor.y);
        break;
      case 'ArrowRight':
        this.moveCursor(this.cursor.x + 1, this.cursor.y);
        break;
      case 'Backspace':
      case 'Delete':
        this.drawCharacter(' ');
        break;
      case 'Enter':
        this.moveCursor(this.cursor.x, this.cursor.y + 1);
        break;
      default:
        if (e.key === 'c' && e.ctrlKey) {
          const currentChar = this.manager.getCharacter(this.cursor.x, this.cursor.y, this.cursor.layer);
          await navigator.clipboard.writeText(currentChar);
          break;
        }
        if (e.key === 'v' && e.ctrlKey) {
          navigator.clipboard.readText().then(text => {
            if (text.length < 1) return;
            this.drawCharacter(text[0]);
          });
          break;
        }
        if (/^[\w `~!@#$%^&*()\-_+=\[\]{}\\|<>,.?/;:"']$/.test(e.key) ||
          e.key.length === 1 && e.key.charCodeAt(0) >= 32) {
          this.drawCharacter(e.key);
        }
        break;
    }
  }

  copyLayer() {
    const copyAsJs = document.getElementById('editor-copy-as-js').checked;
    const layerText = this.manager.getLayerText(this.manager.asciiArtId, this.cursor.layer);
    let textToCopy = layerText;

    if (copyAsJs) {
      textToCopy = `  ${AsciiArtLayer.getLayerIdByIndex(this.manager.asciiArtId, this.cursor.layer)}:\n` +
        layerText
          .split('\n')
          .filter(line => !!line)
          .map(line => `    '${line}\\n'`)
          .join(' +\n') +
        ',';
    }

    navigator.clipboard.writeText(textToCopy);
  }

  drawCharacter(char) {
    if (!char) return;
    this.manager.setCharacter(char, this.cursor.x, this.cursor.y, this.cursor.layer);
  }

  handleClickAsciiArt(piece) {
    this.setAsciiArt(piece);
    this.save();
  }

  handleClickLayer(layerId) {
    this.setActiveLayer(layerId);
    this.save();
  }

  load() {
    const saveKey = `asciiedit-session`;
    const saveJson = sessionStorage.getItem(saveKey);
    const save = saveJson && JSON.parse(saveJson);

    if (!save?.['asciiArtId']) {
      this.setAsciiArt('logo');
      return;
    }

    this.setAsciiArt(save['asciiArtId']);
    this.setActiveLayer(save['layerId'] ?? 1);
    this.moveCursor(save['cursorX'], save['cursorY']);
  }

  moveCursor(x, y) {
    if (x > 0) x = 0;
    if (y > 0) y = 0;

    this.cursor.x = x;
    this.cursor.y = y;
    this.refresh();
  }

  refresh() {
    this.cursor.elem.style.right = `calc(${-this.cursor.x}ch - 2px)`;
    this.cursor.elem.style.bottom = `calc(1.12 * (${-this.cursor.y}em) - 2px)`;
  }

  save() {
    const save = {
      'asciiArtId': this.manager.asciiArtId,
      'layerId': this.cursor.layer,
      'cursorX': this.cursor.x,
      'cursorY': this.cursor.y,
    };
    const saveKey = `asciiedit-session`;
    sessionStorage.setItem(saveKey, JSON.stringify(save));
  }

  setActiveLayer(layerIndex) {
    this.cursor.layer = layerIndex;

    for (let i = 1; i <= 4; i++) {
      const layerBtn = document.getElementById(`editor-layer-btn-${i}`);
      if (i === layerIndex) {
        layerBtn.classList.add('selected');
      } else {
        layerBtn.classList.remove('selected');
      }
    }
  }

  setAsciiArt(asciiArtId) {
    this.manager.set(asciiArtId);

    const layersListElem = document.getElementById('editor-layers-list');
    layersListElem.innerHTML = this.manager.getLayers(asciiArtId)
      .map((layer) => `<button id="editor-layer-btn-${layer.index}" onclick="editor.handleClickLayer(${layer.index})">Layer ${layer.index}</button>`)
      .join('');

    this.moveCursor(0, 0);
    this.setActiveLayer(1);
  }
}
