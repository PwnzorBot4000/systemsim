import {DeskSideBags} from './managers/desk-side-bags.js';
import {Filesystem} from './entities/filesystem.js';
import {InputHistory} from './managers/input-history.js';
import {Notepad} from './managers/notepad.js';
import {formatNumberInOrdinalFull, longestCommonPrefixSorted, simpleHash, sleep} from './utils.js';
import {booksData} from "../data/books.js";
import {filesystemsData} from "../data/filesystems.js";
import {MemorySticks} from "./managers/memorysticks.js";
import {Server} from "./entities/server.js";
import {Machine} from "./entities/machine.js";
import {Menu} from "./managers/menu.js";
import {Drawer} from "./entities/drawer.js";
import {Bookcase} from "./entities/bookcase.js";
import {AsciiArtManager} from "./managers/asciiart.js";
import {ItemContainer} from "./entities/item-container.js";
import {ConvenienceStoreConversation} from "./entities/conversation.js";
import {AudioManager} from "./managers/audio.js";

export class Game {
  // Persistent state
  bathroom = new ItemContainer([], { defaultItemType: 'hygiene' });
  bookcase = new Bookcase([], { defaultItemTypes: ['book', 'clothes'] });
  computer = new Machine({
    filesystem: new Filesystem({
      pwd: '/root', fsMap: new Map(filesystemsData['localhost'])
    }),
    game: this,
  });
  deskSideBags = new DeskSideBags();
  drawers = [
    new Drawer([
      booksData.get('history-of-computer-industry'),
      { description: 'A USB-A to USB-C 3.0 cable.' },
      { description: 'A TV remote control for your monitor, unused.', sellPrice: 10, sellChance: 0.5 },
      { description: '3 AAA batteries.' },
      { description: 'A box of paper clips.', type: 'stationery' },
    ], { defaultItemType: 'stationery' }),
    new Drawer([
      { description: '2 AA batteries, expired.', trash: true },
      { description: 'A spoon.', type: 'kitchen' },
      { description: 'A stack of sticky notes.', type: 'stationery' },
      { description: 'A syringe of thermal paste.' },
      { description: 'An old low-performance CPU cooler.', sellPrice: 5, sellChance: 1 },
    ]),
      new Drawer([
      {
        description: 'A pair of over-ear headphones. The plastic coating of the muffs is chipped.',
        sellPrice: 3,
        sellChance: 0,
        sellPriceAfterRepair: 25,
        sellChanceAfterRepair: 1,
        repairMaterials: [
          { name: 'knife', type: 'kitchen', consume: false, processDescription: 'You scrape the coating off the muffs.' },
          { quantity: 0.1, name: 'black enamel paint', type: 'crafting', processDescription: 'You quickly submerge the muffs into the paint and let them dry.' },
        ],
      },
      { description: 'A pair of trousers.', type: 'clothes' },
      {
        description: 'A fork with some steel wire wrapped around it.',
        dismantleTo: [
          { description: 'A fork.', type: 'kitchen', name: 'fork' },
          { description: 'Some steel wire.', name: 'steel wire', quantity: 1 },
        ],
        name: 'fork-with-steel-wire',
        referredAsThe: 'fork with the steel wire',
        type: 'kitchen'
      },
      { description: 'A bottle of cologne.', type: 'hygiene' },
      { description: 'A packet of tissues.', type: 'hygiene' },
    ]),
  ];
  kitchen = new ItemContainer([
    { description: 'A knife.', type: 'kitchen', name: 'knife' },
    { description: 'A water glass.', type: 'kitchen' },
    { description: 'A set of wine glasses.', type: 'kitchen' },
  ], { defaultItemType: 'kitchen' });
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
    'projects.mikl-ptoska.cz': new Server({
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['projects.mikl-ptoska.cz'])
      }),
    }),
    'www.watrar.com': new Server({
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['www.watrar.com'])
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
          regex: /^GET \/student-data\/([^\/]+)(\/.+)?$/,
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
        },
        {
          regex: /^.*$/,
          handler: (server) => {
            return server.serveStaticContent('index.html');
          }
        }
      ],
    }),
  }
  storeroom = new ItemContainer([], { defaultItemType: 'crafting' });

  // Transient state
  asciiart = new AsciiArtManager(this);
  audio = new AudioManager(this);
  currentConversation = undefined;
  input = '';
  inputHistory = new InputHistory();
  menu = new Menu(this);
  possibleActions = [];
  previousState = undefined;
  prompt = '';
  state = 'init';
  terminalBuffer = [];
  terminalState = 'exec';
  capsLockActive = false;

  // Helpers
  conversationsMap = {
    'convenience-store-cashier': new ConvenienceStoreConversation(),
  };
  containers = {
    bathroom: this.bathroom,
    bookcase: this.bookcase,
    deskSideBags: this.deskSideBags,
    drawer1: this.drawers[0],
    drawer2: this.drawers[1],
    drawer3: this.drawers[2],
    kitchen: this.kitchen,
    storeroom: this.storeroom,
  };
  inspectableObjectsMap = {
    memorySticks: this.memorySticks,
    notepad: this.notepad,
    tower: this.computer.specs,
    ...this.containers,
  };

  constructor() {
  }

  async init() {
    // Game init sequence
    this.audio.init();
    this.asciiart.set(undefined);
    document.getElementById('init-ui').style.display = 'none';
    const terminalElem = document.getElementById('terminal');
    terminalElem.innerHTML = '';
    if (this.isFullscreen()) {
      await sleep(100);
      terminalElem.innerHTML = 'Searching for player data...<br /><br />';
      await sleep(1500);
    } else {
      await this.enableFullscreen();
      document.getElementById('esc-ui').style.display = null;
      await sleep(100);
      terminalElem.innerHTML = 'Entering fullscreen mode...<br /><br />';
      await sleep(400);
      terminalElem.classList.add('monospace');
      await sleep(1000);
      terminalElem.classList.add('terminal12px');
      await sleep(1000);
      terminalElem.classList.add('nocursor');
      await sleep(500);
    }
    await this.load('current', async (stage) => {
      switch (stage) {
        case 'init':
          terminalElem.innerHTML += 'Saved player data found. Resuming...<br /><br />';
          await sleep(500);
          break;
        case 'fail':
          terminalElem.innerHTML += 'No player data found. Starting new game.';
          await sleep(1000);
          break;
        default:
          terminalElem.innerHTML += `Loading ${stage}...<br />`;
          await sleep(100);
          break;
      }
    });
    await sleep(500);
    terminalElem.innerHTML = '';
    await sleep(1500);

    // Bind events
    document.addEventListener('keydown', this.keyDownHandler);

    // Main game loop
    await this.refresh();

    // Show keyboard
    await sleep(1000);
    this.initVKeyboard();
  }

  initVKeyboard() {
    const virtualKeys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
      ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
      ['Tab', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Enter'],
      ['shift', 'ctrl', ' ', 'alt', '`'],
    ]
    const vkTranslations = {
      'Backspace': '⌫',
      'Enter': '↵',
      'Tab': '⇥',
      'capslock': '⇪',
      'shift': '⇧',
      'ctrl': '⌃',
      'alt': '⌥',
      ' ': '&nbsp;&nbsp;&nbsp;␣&nbsp;&nbsp;&nbsp;',
      '`': '&#x2630;'
    };
    const primaryVks = new Set(['capslock', 'Tab', 'Backspace', 'shift', 'ctrl', 'alt', 'Enter', '`'])
    const vkRowElements = [1, 2, 3, 4, 5]
      .map(n => document.getElementById(`vk-row${n}`));
    for (const [index, vkRowElement] of vkRowElements.entries()) {
      for (const vk of virtualKeys[index]) {
        const vkElem = document.createElement('button');
        const translation = vkTranslations[vk];
        vkElem.innerHTML = translation || vk;
        if (primaryVks.has(vk))
          vkElem.setAttribute('primary', 'true');
        vkElem.addEventListener('click', async () => {

          if (vk === 'capslock') {
            this.capsLockActive = !this.capsLockActive;
            document.querySelectorAll('#vk-row3 button[primary="true"]').forEach(btn => {
              btn.classList.toggle('active', this.capsLockActive);
            });
          } else {
            let key = vk;
            if (this.capsLockActive && vk.length === 1) {
              key = vk.toUpperCase();
            }
            await this.keyDownHandler({key});
          }
        });
        vkRowElement.appendChild(vkElem);
      }
    }
  }

  async terminate() {
    // Unbind events
    document.removeEventListener('keydown', this.keyDownHandler);
  }

  async restart() {
    await this.terminate();
    window.game = new Game();
    await window.game.init();
  }

  async refresh() {
    if (this.terminalState === 'exec') {
      try {
        await this.executeState();
      } catch (e) {
        console.warn(e);
        this.print(e.message + '<br />');
        this.waitInput();
      }

      this.save('autosave');
    }
  }

  keyDownHandler = async (e) => {
    // Allow F11 fullscreen toggle
    if (e.key === 'F11') return;
    // Allow taking screenshots (print screen, ctrl+shift+p, F12)
    if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'KeyP') || e.key === 'F12') return;
    // Allow dev tools (ctrl+shift+i, F12)
    if (e.ctrlKey && e.shiftKey && e.key === 'KeyI') return;
    // Allow pasting
    if (e.key === 'Paste' || e.key === 'KeyV' && e.ctrlKey) return;
    // Allow writing when we are in a UI input field
    if (e.target?.closest('.ui input')) return;

    e.preventDefault?.();
    e.stopPropagation?.();

    if (this.terminalState === 'conversation') {
      await this.currentConversation.processConversationModeInput(this, e.key);
      return;
    }

    if (this.terminalState !== 'input') return;

    if (/^[\w !@#$%^&*()\-+{}|=<>,.?/\\;:"']$/.test(e.key)) {
      this.input = this.input + e.key;
      this.inputHistory.type(this.input);
      await this.render();
    } else {
      switch (e.key) {
        case '`':
          this.menu.toggle();
          break;
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
  }

  async executeState() {
    switch (this.state.split(' ')[0]) {
      case 'init':
        switch (this.input) {
          case '':
            this.print('You are sitting at your desk, in front of your home computer. It is currently shut down.<br />');
            if (this.conversationsMap['convenience-store-cashier'].completedCaptions.has('introAboutBreach') && !this.notepad.hasNote('convenienceStoreBreach')) {
              this.notepad.addNote({
                name: 'convenienceStoreBreach',
                text: 'Need to have a linux live usb with me to check James\' pc for backdoors, and an empty usb to store his files while I format.'
              });
              this.playSfx('pencil-writing-on-paper.ogg').catch(console.warn);
              await sleep(1200);
              this.print('You jolted down something on your notepad.<br />');
              await sleep(1200);
            }
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
      case 'inspect-desk':
        switch (this.getArgv(0)) {
          case '': {
            this.print('You look at the desk.<br />');
            await sleep(600);
            this.asciiart.set('desk');
            const bagsPrompt = this.deskSideBags.isEmpty() ? '' : ' Next to it a few paper bags are leaning on its side.';
            this.print('On top of it, from left to right, there is a family picture, a small pile of memory sticks, a pile of electronics, and a large notepad with a pen.<br />' +
              `It has three drawers in one side, and the computer tower on the other one.${bagsPrompt}<br />`);
            await sleep(600);
            this.possibleActions = ['picture', 'memorysticks', 'electronics', 'notepad', {
              render: 'drawer1/2/3',
              actions: ['drawer1', 'drawer2', 'drawer3']
            }, 'tower', 'bags', 'boot', 'stand'];
            if (this.deskSideBags.isEmpty())
              this.possibleActions = this.possibleActions.filter((action) => action !== 'bags');
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          }
          case 'picture':
            this.print('You look at the picture.<br />');
            await sleep(600);
            this.asciiart.set('picture');
            this.print(
              'It is a picture of your parents, with you in the middle. They are holding you from the hands, one hand each.<br />' +
              'The date on the photo is 2006 May 16.<br />');
            await sleep(600);
            this.waitInput();
            break;
          case 'memorysticks':
            return this.switchState('inspect-object memorySticks');
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
            return this.switchState('inspect-object notepad');
          case 'drawer1':
          case 'drawer2':
          case 'drawer3': {
            const index = parseInt(this.getArgv(0).slice(-1));
            if (index < 1 || index > this.drawers.length) {
              this.print('Invalid drawer index.<br />');
              break;
            }
            this.print(`You open the ${formatNumberInOrdinalFull(index)} drawer. `);
            return this.switchState(`inspect-drawer ${index}`);
          }
          case 'tower':
            return this.switchState('inspect-object tower');
          case 'bags':
            return this.switchState('inspect-object deskSideBags');
          case 'boot':
            return this.switchState('boot', {cls: true});
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
      case 'talk': {
        const personName = this.state.split(' ')[1];
        const conversation = this.conversationsMap[personName];

        return this.executeConversation(conversation, this.previousState);
      }
      case 'inspect-object': {
        const objectName = this.state.split(' ')[1];
        const object = this.inspectableObjectsMap[objectName];

        return this.executeInspectObject(object, this.previousState);
      }
      case 'inspect-drawer': {
        const index = parseInt(this.state.slice(-1));
        const drawer = this.drawers[index - 1];

        return this.executeInspectObject(drawer, 'inspect-desk');
      }
      case 'read-book': {
        const bookName = this.state.split(' ')[1];
        const book = booksData.get(bookName);

        return this.executeInspectObject(book, 'inspect-desk');
      }
      case 'boot':
        return await this.computer.executeInput();
      case 'inspect-room':
        switch (this.getArgv(0)) {
          case '':
            this.possibleActions = ['bathroom', 'bookcase', 'desk', 'kitchen', 'storeroom', 'outside'];
            this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
            break;
          case 'desk':
            return this.switchState('init');
          case 'bathroom':
            return this.switchState('inspect-object bathroom');
          case 'bookcase':
            return this.switchState('inspect-object bookcase');
          case 'kitchen':
            return this.switchState('inspect-object kitchen');
          case 'storeroom':
            return this.switchState('inspect-object storeroom');
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
            this.possibleActions = ['talk-cashier', 'newspapers', 'outside'];
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
          case 'talk-cashier':
            return this.switchState('talk convenience-store-cashier');
          default:
            this.print('Invalid action. ');
            this.waitInput();
            break;
        }
        return;
    }
  }

  async executeConversation(conversation, prevState) {
    const command = this.getArgv(0);
    this.currentConversation = conversation;

    switch (command) {
      case '': {
        if (conversation.getAsciiArtId?.())
          this.asciiart.set(conversation.getAsciiArtId());
        const report = conversation.reportFirstTime();
        await report(this);
        if (this.terminalState === 'conversation') {
          // Let conversation handle input and commands
          return;
        }
        this.possibleActions = conversation.determineActions();
        this.waitInput(conversation.getPrompt());
        break;
      }
      case 'exit':
        this.currentConversation = null;
        return this.switchState(prevState);
      default:
        if (this.possibleActions.some(action => action.split(' ')[0] === command)) {
          conversation.executeInput(this);
          if (conversation.getAsciiArtId?.())
            this.asciiart.set(conversation.getAsciiArtId());
          if (this.terminalState === 'conversation') {
            // Let conversation handle input and commands
            return;
          }
          this.possibleActions = conversation.determineActions();
          this.waitInput(conversation.getPrompt());
          return;
        }
        this.print('Invalid choice.<br />');
        this.waitInput();
        break;
    }
  }


  async executeInspectObject(object, prevState) {
    const command = this.getArgv(0);

    switch (command) {
      case '': {
        if (object.getAsciiArtId?.())
          this.asciiart.set(object.getAsciiArtId());
        const report = object.reportFirstTime();
        if (typeof report === 'string') {
          this.print(report);
        } else {
          await report(this);
        }
        this.possibleActions = object.determineActions();
        this.waitInput(object.getPrompt());
        break;
      }
      case 'back':
        return this.switchState(prevState);
      default:
        if (this.possibleActions.some(action => action.split(' ')[0] === command)) {
          return object.executeInput(this);
        }
        this.print('Invalid action. ');
        this.waitInput();
        break;
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

  isFullscreen() {
    const fsElm = document.body;
    return !!fsElm.closest(':is(:fullscreen, :-webkit-full-screen, :-moz-full-screen, :-ms-fullscreen)');

  }

  enableInputHistory(value) {
    this.inputHistory.enabled = value;
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

    switch (this.terminalState) {
      case 'input':
        terminalElem.innerHTML = this.terminalBuffer.join('') + this.renderPrompt() + this.input;
        break;
      case 'conversation':
        terminalElem.innerHTML = this.terminalBuffer.join('') + this.renderPrompt();
        break;
      default:
        terminalElem.innerHTML = this.terminalBuffer.join('');
        break;
    }

    // Scroll to bottom
    terminalElem.scroll(0, terminalElem.scrollHeight);
  }

  renderPrompt() {
    if (this.terminalState === 'conversation') {
      return this.currentConversation?.getConversingPrompt() ?? '';
    }

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

  async playSfx(name) {
    await this.audio.load(name);
    await this.audio.play(name);
  }

  print(text) {
    this.terminalBuffer.push(text);
    this.render();
  }

  // Dramatic text printer, useful for conversations
  // Accepts command strings that control drama enclosed by percent marks %
  // Use double percent %% to insert actual percent mark
  // %s30% set print speed interval to 30 ms
  // %p300% pause for 300 ms
  async printSlowly(text, interval = 30) {
    for (let i = 0; i < text.length; i++) {
      switch (text[i]) {
        case '%':
          let commandSequence = '';
          i++;
          while (i < text.length && text[i] !== '%') {
            commandSequence += text[i];
            i++;
          }
          // Parse command, it should be in the format ([alpha]+)([nonalpha].*)
          const commandParts = commandSequence.match(/^([a-zA-Z]+)(.*)$/);
          const command = commandParts[1];
          const commandArgs = commandParts[2];
          switch (command) {
            case 'p':
              // Pause
              const pauseDuration = parseInt(commandArgs);
              if (!isNaN(pauseDuration)) {
                await sleep(pauseDuration);
              }
              break;
            case 's':
              // Control print speed
              const parsedInterval = parseInt(commandArgs);
              if (!isNaN(parsedInterval)) {
                interval = parsedInterval;
              }
              break;
            case '':
              // Insert actual percent mark
              this.terminalBuffer.push('%');
              break;
            default:
              console.warn(`Unknown command %${command}${commandArgs}%`);
              break;
          }
          break;
        case '\n':
          this.terminalBuffer.push('<br />');
          break;
        default:
          this.terminalBuffer.push(text[i]);
          break;
      }
      this.render();
      await sleep(interval);
    }
  }

  async load(saveIndex = 'current', dramaFunction = async (_stage) => {}) {
    const saveKey = `systemsim-save-${saveIndex}`;
    const saveJson = localStorage.getItem(saveKey);
    if (!saveJson) {
      await dramaFunction('fail');
      return false;
    }

    await dramaFunction('init');
    const save = JSON.parse(saveJson);

    await dramaFunction('machine state');
    this.computer.importSave(save.computer);

    await dramaFunction('room state');
    for (const [name, container] of Object.entries(this.containers)) {
      if (!!save[name]) {
        container.importSave(save[name]);
      }
    }

    await dramaFunction('devices');
    this.memorySticks.importSave(save.memorySticks);
    await dramaFunction('servers');
    for (const [name, serverSave] of Object.entries(save.servers)) {
      const server = this.servers[name];
      if (!server) continue;
      server.filesystem.importSave(serverSave.filesystem);
    }

    return true;
  }

  save(saveType = 'autosave', message = '') {
    const data = {
      ...Object.entries(this.containers).reduce(
        (acc, entry) => ({...acc, [entry[0]]: entry[1].exportSave()}),
        {}
      ),
      computer: this.computer.exportSave(),
      memorySticks: this.memorySticks.exportSave(),
      servers: Object.entries(this.servers)
        .reduce((acc, [name, server]) => ({...acc, [name]: {
          filesystem: server.filesystem.exportSave()
        }}), {}),
    };

    let saveKey = 'systemsim-save-current';
    if (saveType !== 'autosave') {
      const metadataJson = localStorage.getItem('systemsim-saves-metadata');
      const metadata = metadataJson ? JSON.parse(metadataJson) : {};

      const saveIndex = (Object.keys(metadata)
        .map((k) => parseInt(k.replace('systemsim-save-', '')))
        .sort((a, b) => a - b).pop() ?? 0) + 1;

      metadata[`systemsim-save-${saveIndex}`] = {saveType, message, timestamp: Date.now()};
      saveKey = `systemsim-save-${saveIndex}`;

      localStorage.setItem('systemsim-saves-metadata', JSON.stringify(metadata));
    }

    localStorage.setItem(saveKey, JSON.stringify(data));
  }

  setupCompletion(entries) {
    this.possibleActions = entries;
  }

  async switchState(state, options = {cls: false}) {
    this.previousState = this.state;
    this.state = state;
    this.input = '';
    this.asciiart.set(undefined);

    if (options.cls) {
      this.cls();
    }

    return this.refresh();
  }

  async showDialog(options) {
    const dialogElm = document.getElementById('dialog-ui');
    const dialogTitleElm = document.getElementById('dialog-ui-title');
    const dialogTextElm = document.getElementById('dialog-ui-text');
    const dialogButtonsElm = document.getElementById('dialog-ui-buttons');
    const dialogErrorElm = document.getElementById('dialog-ui-error');

    return new Promise((resolve) => {
      dialogTitleElm.style = null;
      dialogTitleElm.className = null;
      if (typeof options.title === 'string') {
        dialogTitleElm.innerHTML = options.title;
      } else {
        options.title?.(dialogTitleElm);
      }

      dialogTextElm.style = null;
      dialogTextElm.className = null;
      if (typeof options.text === 'string') {
        dialogTextElm.innerHTML = options.text;
      } else {
        options.text?.(dialogTextElm);
      }

      dialogErrorElm.style.display = 'none';

      dialogButtonsElm.innerHTML = '';
      for (const button of options.buttons) {
        const buttonElm = document.createElement('button');
        buttonElm.innerHTML = button.text;
        for (const [key, value] of Object.entries(button.attributes ?? {})) {
          buttonElm.setAttribute(key, value);
        }
        buttonElm.addEventListener('click', async () => {
          try {
            buttonElm.disabled = true;
            resolve(await button.callback?.());
            dialogElm.style.display = 'none';
          } catch (e) {
            dialogErrorElm.style.display = null;
            dialogErrorElm.innerHTML = e.message;
          } finally {
            buttonElm.disabled = false;
          }
        });
        dialogButtonsElm.appendChild(buttonElm);
      }

      dialogElm.style.display = null;
    });
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