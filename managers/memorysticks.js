import {Filesystem} from "../entities/filesystem.js";
import {filesystemsData} from "../data/filesystems.js";

export class MemorySticks {
  sticks = [
    {
      size: '16GB',
      type: 'USB-A 3.0',
      readOnly: true,
      description: 'a live USB with a Linux distribution on it. It was used to originally set up the computer.',
      mountPoint: undefined,
      fs: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-1'])
      })
    },
    {
      size: '8GB',
      type: 'USB-A 3.0',
      readOnly: false,
      description: 'empty.',
      mountPoint: undefined,
      fs: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-2'])
      })
    },
    {
      size: '32GB',
      type: 'USB-C 3.1',
      readOnly: false,
      description: 'labeled \'Files\', and is mostly empty.',
      mountPoint: undefined,
      fs: new Filesystem({
        fsMap: new Map(filesystemsData['memorystick-3'])
      })
    },
  ];

  assertIndex(index) {
    if (index < 0 || index >= this.sticks.length) {
      throw new Error(`Invalid memory stick index: ${index + 1}`);
    }
  }

  assertMounted(index, shouldBeMounted) {
    const memoryStick = this.sticks[index];
    const isMounted = this.isMounted(memoryStick);
    if (shouldBeMounted && !isMounted) {
      throw new Error(`Memory stick ${index + 1} is not mounted.`);
    }
    if (!shouldBeMounted && isMounted) {
      throw new Error(`Memory stick ${index + 1} is already mounted.`);
    }
  }

  async eject(index) {
    this.assertIndex(index);
    this.assertMounted(index, true);

    const memoryStick = this.sticks[index];

    memoryStick.mountPoint.filesystem.unmount(memoryStick.mountPoint.where);
    delete memoryStick.mountPoint;
  }

  isMounted(memoryStick) {
    if (!memoryStick.mountPoint) return false;

    // Validate weak reference of mountPoint with the actual mount on the target filesystem
    if (memoryStick.mountPoint.filesystem.mounts.some((mnt) => mnt.where === memoryStick.mountPoint.where && mnt.what === memoryStick.fs)) {
      return true;
    }

    // Update weak reference of mountPoint, some other entity may have ejected it
    delete memoryStick.mountPoint;
    return false;
  }

  async mount(index, filesystem, where = '/mnt') {
    this.assertIndex(index);
    this.assertMounted(index, false);

    const memoryStick = this.sticks[index];

    filesystem.unmount(where);
    filesystem.mount(memoryStick.fs, where);
    memoryStick.mountPoint = { filesystem, where };
  }

  report() {
    return `There are ${this.sticks.length} memory sticks in the pile:<br />` +
      this.sticks.map((stick, i) =>
        `- Stick ${i + 1} (${stick.size}, ${stick.type}) is ${stick.description}${!!this.isMounted(stick) ? ' Currently mounted.' : ''}<br />`).join('');
  }
}