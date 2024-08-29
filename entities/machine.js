import {formatNumberInOrdinal, formatSize, sleep} from "../utils.js";
import {MemoryStick} from "./memory-stick.js";

export class Machine {
  game;
  shell;
  devices = [];
  specs = {
    ram: { size: 1, type: 'DDR3', frequency: 800 },
    cpu: { cores: 2, generation: 4, frequency: 2.7, cache: 2, overclock: 2.835 },
    mb: { minGen: 4, maxGen: 5, maxRam: 16, maxFrequency: 1600, usbPorts: 1 },
    disk: { size: 1000, interface: 'SATA', type: 'HDD' },
    psu: { watts: 300 }
  }
  state = 'off';
  bootFilesystem;
  storedFilesystem;

  constructor(options) {
    this.storedFilesystem = options.filesystem;
    this.game = options.game;
  }

  attach(device) {
    if (device instanceof MemoryStick) {
      const numUsbDevices = this.devices.filter((dev) => dev instanceof MemoryStick).length;

      if (numUsbDevices >= this.specs.mb.usbPorts) {
        if (this.specs.mb.usbPorts === 1) {
          // Single USB port, silently detach the first device
          this.detach(this.devices[0]);
        } else {
          // Multiple USB ports, user has to select a device to detach
          throw new Error(`Maximum number of USB devices reached.`);
        }
      }

      this.devices.push(device);
      if (this.state !== 'off') {
        this.bootFilesystem.mount(device.filesystem, '/mnt');
      }
    }
  }

  detach(device) {
    this.devices = this.devices.filter((dev) => dev !== device);
    if (this.state !== 'off') {
      this.bootFilesystem.unmount('/mnt');
    }
  }

  async executeInput() {
    switch (this.state) {
      case 'boot':
        await this.shell.executeInput();
        break;
      case 'off':
        await this.boot();
        break;
    }

    switch (this.state) {
      case 'boot':
        this.game.waitInput();
        break;
      case 'off':
        // A program has requested a shutdown.
        return this.game.switchState('init');
    }
  }

  isAttached(device) {
    return this.devices.includes(device);
  }

  fs() {
    return this.bootFilesystem;
  }

  async boot() {
    this.state = 'boot';
    // Bootloader (firmware) actions
    await sleep(300);
    const bootableDevices = this.devices.filter((dev) => dev.bootable);
    if (bootableDevices.length > 0) {
      this.bootFilesystem = bootableDevices[0].filesystem;
    } else {
      this.bootFilesystem = this.storedFilesystem;
    }
    this.print('&gt; Loading kernel... ');
    await sleep(700);
    const file = this.fs().get('/boot/kernel');
    if (!file) {
      await sleep(2000);
      this.print('MISSING<br />');
      await sleep(1000);
      this.print('&gt; Poweroff<br />');
      await sleep(1000);
      return await this.poweroff();
    }
    // Kernel actions
    this.print('OK<br />' +
      '&gt; Loading boot image... ');
    await sleep(1000);
    // Mount attached devices, or the disk filesystem if booting from USB
    if (this.devices.length > 0) {
      if (this.bootFilesystem === this.storedFilesystem) {
        this.bootFilesystem.mount(this.devices[0].filesystem, '/mnt');
      } else {
        this.bootFilesystem.mount(this.storedFilesystem, '/mnt');
      }
    }
    // Initrd actions
    this.print('OK<br />' +
      '&gt; System initialized.<br />For a list of commands, type \'help\'.<br /><br />');
    await sleep(500);
    const shellModule = await import('../programs/sh.js');
    this.shell = new shellModule.Shell();
    // Shell actions
    this.shell.init({ game: this.game, computer: this });
  }

  async poweroff(drama = 1000) {
    // Shell actions
    this.cls();
    this.game.enableInputHistory(false);
    // Kernel / initrd actions (varying by how gracefully the computer was shutdown)
    await sleep(drama);
    this.bootFilesystem.unmount('/mnt');
    // Bootloader (firmware) actions
    this.bootFilesystem = undefined;
    this.state = 'off';
  }

  cls() {
    this.game.cls();
  }

  print(text) {
    this.game.print(text);
  }

  async suspend() {
    this.state = 'suspended';
  }

  renderStats() {
    const ramSizeString = formatSize(this.specs.ram.size, 'G', {space: true});
    const ramFreqString = formatSize(this.specs.ram.frequency, 'M', {space: true});
    const cpuCoreString = this.specs.cpu.cores === 1 ? 'single' : this.specs.cpu.cores === 2 ? 'dual' : this.specs.cpu.cores;
    const cpuFreqString = formatSize(this.specs.cpu.frequency, 'G', {space: true});
    const cpuGenString = formatNumberInOrdinal(this.specs.cpu.generation);
    const cpuCacheString = formatSize(this.specs.cpu.cache, 'M', {space: true});
    const cpuOverclockString = formatSize(this.specs.cpu.overclock, 'G', {space: true});
    const mbGenSupportString = this.specs.mb.minGen === this.specs.mb.maxGen ? formatNumberInOrdinal(this.specs.mb.minGen) : `${this.specs.mb.minGen}-${formatNumberInOrdinal(this.specs.mb.maxGen)}`;
    const mbMaxRamString = formatSize(this.specs.mb.maxRam, 'G');
    const mbMaxFreqString = formatSize(this.specs.mb.maxFrequency, 'M', {space: true});
    const diskSizeString = formatSize(this.specs.disk.size, 'G');

    return `- ${ramSizeString}B of ${this.specs.ram.type} RAM @${ramFreqString}Hz.<br />` +
      `- A ${cpuCoreString}-core ${cpuGenString} generation CPU @${cpuFreqString}Hz w/ ${cpuCacheString}B cache, overclocked to ${cpuOverclockString}Hz.<br />` +
      `- A ${mbGenSupportString} gen chipset motherboard with support for up to ${mbMaxRamString}B of RAM @${mbMaxFreqString}Hz.<br />` +
      `- A ${diskSizeString}B ${this.specs.disk.type} with a ${this.specs.disk.interface} interface.<br />` +
      `- No graphics card.<br />` +
      `- A ${this.specs.psu.watts} W power supply.<br />`;
  }
}