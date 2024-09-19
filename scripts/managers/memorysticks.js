import {Filesystem} from "../entities/filesystem.js";
import {filesystemsData} from "../../data/filesystems.js";
import {MemoryStick} from "../entities/memory-stick.js";
import {StateManagingObject} from "../entities/state-managing-object.js";

export class MemorySticks extends StateManagingObject {
  machine;
  sticks = [
    new MemoryStick({
      id: 'green-fern-unix-live-usb',
      bootable: true,
      size: '16GB',
      type: 'USB-A 3.0',
      description: 'a live USB with a Linux distribution on it. It was used to originally set up the computer.',
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-1']),
        readOnly: true
      })
    }),
    new MemoryStick({
      id: 'general-purpose-usb-1',
      size: '8GB',
      type: 'USB-A 3.0',
      description: 'empty.',
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-2'])
      })
    }),
    new MemoryStick({
      id: 'general-purpose-usb-2',
      size: '32GB',
      type: 'USB-C 3.1',
      description: 'labeled \'Files\', and is mostly empty.',
      filesystem: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-3'])
      })
    }),
  ];

  constructor(options = {machine: undefined}) {
    super();
    // Memory stick pile should have a reference to the machine that owns it
    this.machine = options.machine;
  }

  assertIndex(index) {
    if (index < 0 || index >= this.sticks.length) {
      throw new Error(`Invalid memory stick index: ${index + 1}`);
    }
  }

  assertMounted(index, shouldBeMounted) {
    const memoryStick = this.sticks[index];
    const isMounted = this.machine.isAttached(memoryStick);
    if (shouldBeMounted && !isMounted) {
      throw new Error(`Memory stick ${index + 1} is not mounted.`);
    }
    if (!shouldBeMounted && isMounted) {
      throw new Error(`Memory stick ${index + 1} is already mounted.`);
    }
  }

  determineActions() {
    return ['eject [x]', 'mount [x]', 'back'];
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
      }
    } catch (e) {
      game.print(`${e.message}<br />`);
    }

    game.waitInput();
  }

  async eject(index) {
    this.assertIndex(index);
    this.assertMounted(index, true);

    this.machine.detach(this.sticks[index]);
  }

  exportSave() {
    return this.sticks.reduce((acc, stick) => ({...acc, [stick.id]: stick.exportSave()}), {});
  }

  importSave(save) {
    for (const [id, stickSave] of Object.entries(save)) {
      const stick = this.sticks.find((stick) => stick.id === id);
      if (!stick) continue;
      stick.importSave(stickSave);
    }
  }

  getAsciiArtId() {
    return 'memorySticks';
  }

  async mount(index) {
    this.assertIndex(index);
    this.assertMounted(index, false);

    this.machine.attach(this.sticks[index]);
  }

  report() {
    return `There are ${this.sticks.length} memory sticks in the pile:<br />` +
      this.sticks.map((stick, i) =>
        `- Stick ${i + 1} (${stick.size}, ${stick.type}) is ${stick.description}${!!this.machine.isAttached(stick) ? ' Currently mounted.' : ''}<br />`).join('');
  }
}