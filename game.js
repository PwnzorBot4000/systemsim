import {DeskSideBags} from './managers/desk-side-bags.js';
import {Filesystem} from './entities/filesystem.js';
import {InputHistory} from './managers/input-history.js';
import {Notepad} from './managers/notepad.js';
import {asciiart} from './data/asciiart.js';
import {decodeExeName, longestCommonPrefixSorted, sanitizeHtml, simpleHash, sleep} from './utils.js';
import {sh} from "./programs/sh.js";
import {curl} from "./programs/curl.js";
import {m4r10k4rt} from "./programs/m4r10k4rt.js";
import {booksData} from "./data/books.js";
import {filesystemsData} from "./data/filesystems.js";
import {MemorySticks} from "./managers/memorysticks.js";
import {Book} from "./entities/book.js";
import {Server} from "./entities/server.js";
import {Machine} from "./entities/machine.js";
import {GameApi} from "./interfaces/game-api.js";

export class Game {
  api = new GameApi({
    cls: this.cls.bind(this),
    enableInputHistory: (value) => this.inputHistory.enabled = value,
    getArgv: this.getArgv.bind(this),
    getArgvInt: this.getArgvInt.bind(this),
    getSwitch: this.getSwitch.bind(this),
    print: this.print.bind(this),
    setupCompletion: (entries) => this.possibleActions = entries,
    switchState: this.switchState.bind(this),
    waitInput: this.waitInput.bind(this),
  });

  // Persistent state
  computer = new Machine({
    filesystem: new Filesystem({
      pwd: '/root', fsMap: new Map(filesystemsData['localhost'])
    }),
    gameApi: this.api,
  });
  deskSideBags = new DeskSideBags();
  drawer1 = [
    new Book('history-of-computer-industry', booksData.get('history-of-computer-industry')),
  ];
  memorySticks = new MemorySticks({ machine: this.computer });
  notepad = new Notepad();
  servers = {
    'exploit-db.com': new Server({
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['exploit-db.com'])
      }),
    }),
    'foogal.co.uk': new Server({
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['foogal.co.uk'])
      }),
    }),
    'owasp.org': new Server({
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['owasp.org'])
      }),
    }),
    '104.122.199.11': new Server({
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['104.122.199.11'])
      }),
      routes: [
        {
          regex: /^POST \/login.html$/,
          handler: (server, method, path, body) => {
            const response = {
              status: 302,
              body: 'Login successful. Redirecting you to your home folder.',
            };

            try {
              const json = JSON.parse(body);
              const passwdFile = server.filesystem.get('/etc/passwd');
              const passwdLines = passwdFile.contents.split('\n');
              const userIndex = passwdLines.findIndex(line => line.startsWith(json.username));
              // Guest access
              if (json.username === 'guest' && json.password === 'guest') {
                server.ipWhitelist = [...(server.ipWhitelist ?? []), 'localhost'];  // Heh, I know
                response.headers = { 'Location': `/student-data/guest` };
                return response;
              }
              // Standard user access
              if (userIndex < 0) {
                return {
                  status: 404,
                  body: 'User not found.',
                };
              }
              if (passwdLines[userIndex].split(':')[2] !== simpleHash(json.password)) {
                return {
                  status: 401,
                  body: 'Incorrect password.',
                };
              }
              server.ipWhitelist = [...(server.ipWhitelist ?? []), 'localhost'];
              response.headers = { 'Location': `/student-data/${json.username}` };
              return response;
            } catch (e) {
              return {
                status: 400,
                body: 'Incorrectly formatted JSON body.',
              };
            }
          }
        },
        {
          regex: /^GET \/student-data\/(.*)$/,
          handler: (server, method, path) => {
            const innerPath = path.replace(/^\/student-data\//, '');

            if (!server.ipWhitelist || !server.ipWhitelist.includes('localhost')) {
              return {
                status: 403,
                body: 'Access denied.',
              };
            }

            return server.serveStaticContent(innerPath, {staticRoot: `/students`});
          }
        }
      ],
    }),
  }
  state = 'init';

  // Transient state
  input = '';
  inputHistory = new InputHistory();
  possibleActions = [];
  prompt = '';
  terminalBuffer = [];
  terminalState = 'exec';

  constructor() {
  }

  async init() {
    // Game init sequence
    const terminalElem = document.getElementById('terminal');
    terminalElem.innerHTML = '';
    await sleep(100);
    terminalElem.innerHTML = 'Entering fullscreen mode...<br /><br />';
    await sleep(400);
    terminalElem.classList.add('monospace');
    await sleep(1000);
    terminalElem.classList.add('terminal12px');
    await sleep(1000);
    terminalElem.classList.add('nocursor');
    await sleep(500);
    terminalElem.innerHTML += 'No player data found. Starting new game.';
    await sleep(1500);
    terminalElem.innerHTML = '';
    await sleep(1500);

    // Bind events
    document.addEventListener('keydown', async (e) => {
      // Allow F11 fullscreen toggle
      if (e.key === 'F11') return;
      // Allow taking screenshots (print screen, ctrl+shift+p, F12)
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'KeyP') || e.key === 'F12') return;
      // Allow dev tools (ctrl+shift+i, F12)
      if (e.ctrlKey && e.shiftKey && e.key === 'KeyI') return;

      e.preventDefault();
      e.stopPropagation();
      if (this.terminalState !== 'input') return;

      if (/^[\w !@#$%^&*()\-+{}|~=`<>,.?/\\;:"']$/.test(e.key)) {
        this.input = this.input + e.key;
        this.inputHistory.type(this.input);
        await this.render();
      } else {
        switch (e.key) {
          case 'Enter':
            if (this.input.length <= 0) return;
            this.terminalBuffer.push(this.renderPrompt() + this.input + '<br />');
            this.inputHistory.push(this.input);
            this.terminalState = 'exec';
            await this.refresh();
            break;
          case 'Backspace':
            this.input = this.input.slice(0, -1);
            this.inputHistory.type(this.input);
            await this.render();
            break;
          case 'Tab': {
            const matches = this.possibleActions
              .flatMap(action => typeof action === 'string' ? [action] : action.actions)
              .filter(action => action.startsWith(this.input))
              .map(action => action.split(' ')[0])
              .sort((a, b) => b.length - a.length);
            const commonPrefix = longestCommonPrefixSorted(matches);

            if (commonPrefix.length > 0) {
              this.input = commonPrefix.split(' ')[0];
              this.inputHistory.type(this.input);
              await this.render();
            }
            break;
          }
          case 'ArrowUp':
            this.input = this.inputHistory.retrieve(-1) ?? this.input;
            await this.render();
            break;
          case 'ArrowDown':
            this.input = this.inputHistory.retrieve(1) ?? this.input;
            await this.render();
            break;
          default:
            console.warn(`Unhandled key: ${e.key}`);
            break;
        }
      }
    });

    // Main game loop
    await this.refresh();
  }

  async refresh() {
    if (this.terminalState === 'exec') {
      try {
        return await this.executeState();
      } catch (e) {
        this.print(e.message + '<br />');
        this.waitInput();
      }
    }
  }

  async executeState() {
    switch (this.state) {
      case 'init':
        switch (this.input) {
          case '':
            this.print('You are sitting at your desk, in front of your home computer. It is currently shut down.<br />');
            this.possibleActions = ['boot', 'inspect', 'stand'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'boot':
            return this.switchState('boot', {cls: true});
          case 'inspect':
            return this.switchState('inspect-desk');
          case 'stand':
            return this.switchState('inspect-room');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'inspect-desk-bags':
        switch (this.getArgv(0)) {
          case '':
            this.print('You search the bags. There is:<br />' + this.deskSideBags.render());
            this.possibleActions = ['cleanup-trash', 'back'];
            if (this.deskSideBags.areEmpty())
              this.possibleActions = this.possibleActions.filter((action) => action !== 'cleanup-trash');
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'cleanup-trash':
            this.print('You clean up the trash.<br />');
            await sleep(600);
            this.deskSideBags.cleanupTrash();
            this.print('Now there is:<br />' + this.deskSideBags.render());
            if (this.deskSideBags.areEmpty())
              this.possibleActions = this.possibleActions.filter((action) => action !== 'cleanup-trash');
            this.waitInput();
            break;
          case 'back':
            return this.switchState('inspect-desk');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'inspect-desk':
        switch (this.getArgv(0)) {
          case '': {
            this.print('You look at the desk.<br />');
            await sleep(600);
            this.setAsciiArt('desk');
            const bagsPrompt = this.deskSideBags.areEmpty() ? '' : ' Next to it a few paper bags are leaning on its side.';
            this.print('On top of it, from left to right, there is a family picture, a small pile of memory sticks, a pile of electronics, and a large notepad with a pen.<br />' +
              `It has three drawers in one side, and the computer tower on the other one.${bagsPrompt}<br />`);
            await sleep(600);
            this.possibleActions = ['picture', 'memorysticks', 'electronics', 'notepad', {
              render: 'drawer1/2/3',
              actions: ['drawer1', 'drawer2', 'drawer3']
            }, 'tower', 'bags', 'boot', 'stand'];
            if (this.deskSideBags.areEmpty())
              this.possibleActions = this.possibleActions.filter((action) => action !== 'bags');
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          }
          case 'picture':
            this.print('You look at the picture.<br />');
            await sleep(600);
            this.setAsciiArt('picture');
            this.print(
              'It is a picture of your parents, with you in the middle. They are holding you from the hands, one hand each.<br />' +
              'The date on the photo is 2006 May 16.<br />');
            await sleep(600);
            this.waitInput();
            break;
          case 'memorysticks':
            return this.switchState('inspect-memorysticks');
          case 'electronics':
            this.print(
              'The pile of electronics contains:<br />' +
              '- 2 RFID tags, opened with their contacts exposed.<br />' +
              '- A soldering iron, solder and flux.<br />' +
              '- 1.5 meter of USB 3.0 cable.<br />' +
              '- 2 meters of low voltage cable, solid core.<br />' +
              '- A sachel of about 10 MOSFETs.<br />');
            this.waitInput();
            break;
          case 'notepad':
            this.print('A large notepad with a pen is on the desk.<br />');
            return this.switchState('inspect-notepad');
          case 'drawer1':
          case 'drawer2':
          case 'drawer3': {
            const index = parseInt(this.getArgv(0).slice(-1));
            switch (index) {
              case 1:
                this.print(
                  'You open the first drawer. It contains:<br />' +
                  '- A book about the history of the computer industry.<br />' +
                  '- A USB-A to USB-C 3.0 cable.<br />' +
                  '- A TV remote control for your monitor, unused.<br />' +
                  '- 3 AAA batteries.<br />' +
                  '- A box of paper clips.<br />');
                if (!this.possibleActions.includes('read-book'))
                  this.possibleActions.push('read-book');
                break;
              case 2:
                this.print(
                  'You open the second drawer. It contains:<br />' +
                  '- 2 AA batteries, expired.<br />' +
                  '- A spoon.<br />' +
                  '- A stack of sticky notes.<br />' +
                  '- A syringe of thermal paste.<br />' +
                  '- An old low-performance CPU cooler.<br />');
                break;
              case 3:
                this.print(
                  'You open the third drawer. It contains:<br />' +
                  '- A pair of over-ear headphones. The plastic coating of the muffs is chipped.<br />' +
                  '- A pair of trousers.<br />' +
                  '- A fork with some steel wire wrapped around it.<br />' +
                  '- A bottle of cologne.<br />' +
                  '- A packet of tissues.<br />');
                break;
              default:
                this.print('Invalid drawer index.<br />');
                break;
            }
            this.waitInput();
            break;
          }
          case 'tower':
            this.print(
              'You open the computer tower. It is equipped with:<br />' +
              this.computer.renderStats());
            this.waitInput();
            break;
          case 'bags':
            return this.switchState('inspect-desk-bags');
          case 'boot':
            return this.switchState('boot', {cls: true});
          case 'read-book':
            this.print('You open the computer history book.<br />');
            await sleep(600);
            return this.switchState('computer-history-book');
          case 'stand':
            this.print('You stand up.<br />');
            await sleep(600);
            return this.switchState('inspect-room');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'computer-history-book':
        switch (this.getArgv(0)) {
          case '':
            this.print(this.drawer1[0].report());
            this.possibleActions = ['chapter [x]', 'back'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'chapter': {
            const book = this.drawer1[0];
            const index = this.getArgvInt(1) - 1;
            try {
              this.print(sanitizeHtml(book.readChapter(index)) + '<br />');
            } catch (e) {
              this.print(`${e.message}<br />`);
            }
            this.waitInput();
            break;
          }
          case 'back':
            return this.switchState('inspect-desk');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'inspect-memorysticks':
        switch (this.getArgv(0)) {
          case '':
            this.setAsciiArt('memorySticks');
            this.print(this.memorySticks.report());
            this.possibleActions = ['eject [x]', 'mount [x]', 'back'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'eject': {
            const index = this.getArgvInt(1) - 1;
            await this.memorySticks.eject(index)
              .then(() => this.print(`You eject memory stick ${index + 1}.<br />`))
              .catch(e => this.print(`${e.message}<br />`));
            this.waitInput();
            break;
          }
          case 'mount': {
            const index = this.getArgvInt(1) - 1;
            await this.memorySticks.mount(index)
              .then(() => this.print(`You mount memory stick ${index + 1}.<br />`))
              .catch(e => this.print(`${e.message}<br />`));
            this.waitInput();
            break;
          }
          case 'back':
            return this.switchState('inspect-desk');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'inspect-notepad':
        switch (this.getArgv(0)) {
          case '':
            this.print(this.notepad.render());
            this.possibleActions = ['page [x]', 'next', 'prev', 'back'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'next':
            await this.notepad.next()
              .catch(e => this.print(`${e.message}<br /><br />`));
            this.print(this.notepad.render());
            this.waitInput();
            break;
          case 'prev':
            await this.notepad.prev()
              .catch(e => this.print(`${e.message}<br /><br />`));
            this.print(this.notepad.render());
            this.waitInput();
            break;
          case 'page': {
            const index = this.getArgvInt(1) - 1;
            await this.notepad.goto(index)
              .catch(e => this.print(`${e.message}<br /><br />`));
            this.print(this.notepad.render());
            this.waitInput();
            break;
          }
          case 'back':
            return this.switchState('inspect-desk');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'boot':
        switch (this.getArgv(0)) {
          case '':
            return await this.computer.boot();
          case 'cat': {
            sh.cat(this.computer.api);
            this.waitInput();
            break;
          }
          case 'help':
            sh.help(this.computer.api);
            this.waitInput();
            break;
          case 'cd': {
            sh.cd(this.computer.api);
            this.waitInput();
            break;
          }
          case 'cp': {
            sh.cp(this.computer.api);
            this.waitInput();
            break;
          }
          case 'ls':
            sh.ls(this.computer.api);
            this.waitInput();
            break;
          case 'poweroff':
            return await sh.poweroff(this.computer.api);
          case 'rm':
            sh.rm(this.computer.api);
            this.waitInput();
            break;
          default: {
            // Programs
            const localProgram = this.computer.fs().get(this.getArgv(0));
            const binProgram = this.computer.fs().get(Filesystem.joinpath('/bin', this.getArgv(0)));
            if (!localProgram && !binProgram) {
              this.print(`Unknown command: ${this.getArgv(0)}<br />For a list of commands, type 'help'.<br /><br />`);
              this.waitInput();
              break;
            }
            const programName = decodeExeName(localProgram?.contents ?? binProgram?.contents);

            switch (programName) {
              case 'curl':
                curl(this);
                break;
              case 'm4r10k4rt':
                return await m4r10k4rt(this);
              case 'noop':
                this.print('<br />');
                break;
              default:
                this.print(`${this.getArgv(0)} is not an executable file.<br /><br />`);
                break;
            }

            this.waitInput();
            break;
          }
        }
        return;
      case 'inspect-room':
        switch (this.getArgv(0)) {
          case '':
            this.possibleActions = ['bookcase', 'desk', 'outside'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'bookcase':
            this.print('You look at the bookcase.<br />' +
              'It is a small bookcase with a few books on it, and a couple of cabinets at the bottom.<br />' +
              'The first cabinet contains monitor cables and a pair of shoes.<br />' +
              'The second cabinet contains clothes.<br />' +
              'The bookcase itself contains books about programming languages, and some novels.<br />');
            await sleep(600);
            this.waitInput();
            break;
          case 'desk':
            return this.switchState('init');
          case 'outside':
            this.print('You exit the room.<br />');
            await sleep(1000);
            return this.switchState('outside', {cls: true});
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'outside':
        switch (this.getArgv(0)) {
          case '':
            this.possibleActions = ['home', 'convenience-store', 'bills-computer-shop', 'coffee-shop', 'home-depot'];
            this.waitInput('Go where? [%actions%]<br /><br />Action: ');
            break;
          case 'home':
            this.print('You return to your home.<br />');
            await sleep(1000);
            return this.switchState('inspect-room', {cls: true});
          case 'convenience-store':
            return this.switchState('convenience-store');
          case 'bills-computer-shop':
            this.print('You don\'t need anything from the computer shop right now.<br />');
            this.waitInput();
            break;
          // return this.switchState('bills-computer-shop');
          case 'coffee-shop':
            this.print('You don\'t need anything from the coffee shop right now.<br />');
            this.waitInput();
            break;
          // return this.switchState('coffee-shop');
          case 'home-depot':
            this.print('You don\'t need anything from the home depot right now.<br />');
            this.waitInput();
            break;
          // return this.switchState('home-depot');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
      case 'convenience-store':
        switch (this.getArgv(0)) {
          case '':
            this.possibleActions = ['newspapers', 'outside'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'newspapers':
            this.print('You look at the digital newspaper subscription ads. The headlines are:<br />' +
              '- The ePhone to replace all ePhones: Meet the new eGalaxy Cluster<br />' +
              '- Ablue vault heist - Thousands of private keys stolen - Macrosoft urges users to generate new keys<br />' +
              '- EnvyTech to invest up to $100 million in cryptocurrency - stock markets worried<br />' +
              '- Metaspace AR: Get your own digital flower with only $6/mo!<br />');
            await sleep(600);
            this.waitInput();
            break;
          case 'outside':
            this.print('You exit the convenience store.<br />');
            return this.switchState('outside');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
    }
  }

  cls() {
    document.getElementById('terminal').innerHTML = '';
    this.terminalBuffer = [];
  }

  async enableFullscreen() {
    const fsElm = document.body;
    if (fsElm.requestFullscreen) {
      await fsElm.requestFullscreen();
    } else if (fsElm.msRequestFullscreen) {
      fsElm.msRequestFullscreen();
    } else if (fsElm.mozRequestFullScreen) {
      fsElm.mozRequestFullScreen();
    } else if (fsElm.webkitRequestFullScreen) {
      fsElm.webkitRequestFullScreen();
    }
  }

  getArgv(index, defaultValue = '') {
    const terms = this.input?.split(' ');
    if (!terms || terms.length === 0) return defaultValue;

    const realIndex = (index >= 0) ? index : (terms.length + index);
    return terms[realIndex] ?? defaultValue;
  }

  getArgvInt(index, defaultValue = 0) {
    return parseInt(this.getArgv(index, defaultValue.toString()));
  }

  getSwitch(short, long, defaultValue = false) {
    const terms = this.input?.split(' ');
    if (!terms || terms.length === 0) return defaultValue;

    const shortSwitchParams = terms.filter(term => term.match(/^-[a-zA-Z]+$/));
    const shortSwitches = new Set(shortSwitchParams
      .map(param => param.slice(1))
      .flatMap(param => param.split('')));
    if (shortSwitches.has(short)) return true;

    const longSwitchParams = terms.filter(term => term.match(/^--[a-zA-Z]+$/));
    const longSwitches = new Set(longSwitchParams
      .map(param => param.slice(2)));
    if (longSwitches.has(long)) return true;

    return defaultValue;
  }

  render() {
    const terminalElem = document.getElementById('terminal');

    if (this.terminalState === 'input') {
      terminalElem.innerHTML = this.terminalBuffer.join('') + this.renderPrompt() + this.input;
    } else {
      terminalElem.innerHTML = this.terminalBuffer.join('');
    }

    // Scroll to bottom
    terminalElem.scroll(0, terminalElem.scrollHeight);
  }

  renderPrompt() {
    let promptActions = '';
    for (let i = 0; i < this.possibleActions.length; i++) {
      const action = typeof this.possibleActions[i] === 'string' ? this.possibleActions[i] : this.possibleActions[i].render;
      promptActions += action;
      if (i < this.possibleActions.length - 1) {
        if (action.includes(' ')) {
          promptActions += ', ';
        } else {
          promptActions += ' ';
        }
      }
    }

    return this.prompt
      .replace('%actions%', promptActions)
      .replace('%pwd%', this.computer.fs()?.pwd ?? '');
  }

  print(text) {
    this.terminalBuffer.push(text);
    this.render();
  }

  setAsciiArt(asciiArtId) {
    const numLayers = 4;
    const asciiArtLayers = [document.getElementById('asciiart')];
    for (let i = 2; i <= numLayers; i++) {
      asciiArtLayers.push(document.getElementById(`asciiart-l${i}`))
    }

    if (!asciiArtId) {
      for (const layer of asciiArtLayers) {
        layer.innerHTML = '';
        layer.style = null;
      }
      return;
    }

    for (let i = 1; i <= numLayers; i++) {
      const layer = asciiArtLayers[i - 1];
      const layerId = i === 1 ? asciiArtId : `${asciiArtId}-layer${i}`;

      layer.innerHTML = asciiart[layerId] ?? '';

      const extraStyle = asciiart[`${layerId}-style`];
      const extraStyles = asciiart[`${layerId}-styles`] ?? [];
      if (extraStyle) {
        extraStyles.push(extraStyle);
      }
      for (const style of extraStyles) {
        if (style.condition) {
          if (!style.condition(this)) {
            continue;
          }
        }
        for (const key in style) {
          if (key === 'condition') continue;
          layer.style[key] = style[key];
        }
      }
    }
  }

  async switchState(state, options = {cls: false}) {
    this.state = state;
    this.input = '';
    this.setAsciiArt(undefined);

    if (options.cls) {
      this.cls();
    }

    return this.refresh();
  }

  waitInput(prompt) {
    this.input = '';
    if (prompt) {
      this.prompt = prompt;
    }

    this.terminalState = 'input';

    this.render();
  }
}