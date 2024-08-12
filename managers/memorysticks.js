import {Filesystem} from "../entities/filesystem.js";
import {filesystemsData} from "../data/filesystems.js";

export class MemorySticks {
  sticks = [
    {
      size: '16GB',
      type: 'USB-A 3.0',
      readOnly: true,
      description: 'a live USB with a Linux distribution on it. It was used to originally set up the computer.',
      mounted: false,
      fs: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-1'])
      })
    },
    {
      size: '8GB', type: 'USB-A 3.0', readOnly: false, description: 'empty.', mounted: false, fs: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-2'])
      })
    },
    {
      size: '32GB',
      type: 'USB-C 3.1',
      readOnly: false,
      description: 'labeled \'Files\', and is mostly empty.',
      mounted: false,
      fs: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-3'])
      })
    },
  ];

  async eject(index) {
    if (index < 0 || index >= this.sticks.length) {
      throw new Error(`Invalid memory stick index: ${index + 1}`);
    }

    const memoryStick = this.sticks[index];
    if (!memoryStick.mounted) {
      throw new Error(`Memory stick ${index + 1} is not mounted.`);
    }

    memoryStick.mounted = false;
  }

  async mount(index) {
    if (index < 0 || index >= this.sticks.length) {
      throw new Error(`Invalid memory stick index: ${index + 1}`);
    }

    const memoryStick = this.sticks[index];
    if (memoryStick.mounted) {
      throw new Error(`Memory stick ${index + 1} is already mounted.`);
    }

    memoryStick.mounted = true;
  }

  report() {
    return `There are ${this.sticks.length} memory sticks in the pile:<br />` +
      this.sticks.map((stick, i) =>
        `- Stick ${i + 1} (${stick.size}, ${stick.type}) is ${stick.description}${stick.mounted ? ' Currently mounted.' : ''}<br />`).join('');
  }
}