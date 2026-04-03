import {Filesystem} from "../entities/filesystem.js";
import {filesystemsData} from "../../data/filesystems.js";
import {MemoryStick} from "../entities/memory-stick.js";
import {ItemContainer} from "../entities/item-container.js";

const sticks = [
  new MemoryStick({
    name: 'green-fern-unix-live-usb',
    bootable: true,
    size: '16GB',
    interfaceType: 'USB-A 3.0',
    description: 'a live USB with a Linux distribution on it. It was used to originally set up the computer.',
    filesystem: new Filesystem({
      fsMap: new Map(filesystemsData['memorystick-1']),
      readOnly: true
    })
  }),
  new MemoryStick({
    name: 'general-purpose-usb-1',
    size: '8GB',
    interfaceType: 'USB-A 3.0',
    description: 'empty.',
    filesystem: new Filesystem({
      fsMap: new Map(filesystemsData['memorystick-2'])
    })
  }),
  new MemoryStick({
    name: 'general-purpose-usb-2',
    size: '32GB',
    interfaceType: 'USB-C 3.1',
    description: 'labeled \'Files\', and is mostly empty.',
    filesystem: new Filesystem({
      fsMap: new Map(filesystemsData['memorystick-3'])
    })
  }),
];

/** @extends {ItemContainer<MemoryStick>} */
export class MemorySticks extends ItemContainer {
  constructor(options = {game: undefined}) {
    super(sticks, { allowedItemTypes: ['memory-stick'], defaultItemType: 'memory-stick', game: options.game });
  }

  assertIndex(index) {
    if (index < 0 || index >= this.items.length) {
      throw new Error(`Invalid memory stick index: ${index + 1}`);
    }
  }

  assertMounted(index, shouldBeMounted) {
    const memoryStick = this.items[index];
    const isMounted = this.game.computer.isAttached(memoryStick);
    if (shouldBeMounted && !isMounted) {
      throw new Error(`Memory stick ${index + 1} is not mounted.`);
    }
    if (!shouldBeMounted && isMounted) {
      throw new Error(`Memory stick ${index + 1} is already mounted.`);
    }
  }

  determineActions() {
    const containerActions = super.determineActions();
    const takeAction = containerActions.find((action) => typeof action !== 'string' && action.render === 'take [item]');
    if (takeAction) {
      const indexedStickActions = this.items.map((_, index) => `take stick-${index + 1}`);
      takeAction.actions = takeAction.actions.concat(indexedStickActions);
    }

    return ['eject [x]', 'mount [x]'].concat(containerActions);
  }

  async executeInput(game) {
    const index = game.getArgvInt(1) - 1;

    try {
      switch (game.getArgv(0)) {
        case 'eject': {
          await this.eject(index);
          game.print(`You eject memory stick ${index + 1}.<br />`);
          break;
        }
        case 'mount': {
          await this.mount(index);
          game.print(`You mount memory stick ${index + 1}.<br />`);
          break;
        }
        case 'take': {
          const stickId = game.getArgv(1);
          const stickMatch = stickId.match(/stick-(\d+)/);
          const stickIndex = stickMatch ? parseInt(stickMatch[1]) - 1 : undefined;
          if (isNaN(stickIndex)) {
            game.print('Invalid memory stick to take.<br />');
            break;
          }
          const stick = this.items[stickIndex];
          if (!stick) {
            game.print('Invalid memory stick to take.<br />');
            break;
          }
          await super.takeItem(stick, game);
          return;
        }
        default: {
          await super.executeInput(game);
          return;
        }
      }
    } catch (e) {
      game.print(`${e.message}<br />`);
    }

    game.waitInput();
  }

  async eject(index) {
    this.assertIndex(index);
    this.assertMounted(index, true);

    this.game.computer.detach(this.items[index]);
  }

  exportSave() {
    return this.items.map(stick => stick.exportSave());
  }

  importSave(save) {
    this.items = save.map(stickSave => MemoryStick.fromSave(stickSave));
  }

  getAsciiArtId() {
    return 'memorySticks';
  }

  async mount(index) {
    this.assertIndex(index);
    this.assertMounted(index, false);

    this.game.computer.attach(this.items[index]);
  }

  report() {
    return `There are ${this.items.length} memory sticks in the pile:<br />` +
      this.items.map((stick, i) =>
        `- Stick ${i + 1} (${stick.size}, ${stick.interfaceType}) is ${stick.description}${!!this.game.computer.isAttached(stick) ? ' Currently mounted.' : ''}<br />`).join('');
  }
}