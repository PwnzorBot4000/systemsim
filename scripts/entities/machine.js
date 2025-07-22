import {formatNumberInOrdinal, formatSize, sleep} from "../utils.js";
import {MemoryStick} from "./memory-stick.js";
import {StateManagingObject} from "./state-managing-object.js";

class MachineSpecs extends StateManagingObject {
  ram;
  cpu;
  mb;
  disk;
  gpu;
  psu;

  constructor(options) {
    super();
    Object.assign(this, options);
  }

  importSave(save) {
    this.ram = save.ram;
    this.cpu = save.cpu;
    this.mb = save.mb;
    this.disk = save.disk;
    this.gpu = save.gpu;
    this.psu = save.psu;
  }

  exportSave() {
    return {
      ram: this.ram,
      cpu: this.cpu,
      mb: this.mb,
      disk: this.disk,
      gpu: this.gpu,
      psu: this.psu,
    };
  }

  report() {
    const specStrings = []

    if (this.ram?.size) {
      const ramSizeString = formatSize(this.ram.size, 'G', {space: true});
      const ramFreqString = formatSize(this.ram.frequency, 'M', {space: true});
      specStrings.push(`- ${ramSizeString}B of ${this.ram.type} RAM @${ramFreqString}Hz.`)
    } else {
      specStrings.push(`- No RAM installed.`);
    }

    if (this.cpu?.cores) {
      const cpuCoreString = this.cpu.cores === 1 ? 'single' : this.cpu.cores === 2 ? 'dual' : this.cpu.cores;
      const cpuFreqString = formatSize(this.cpu.frequency, 'G', {space: true});
      const cpuGenString = formatNumberInOrdinal(this.cpu.generation);
      const cpuCacheString = formatSize(this.cpu.cache, 'M', {space: true});
      const cpuOverclockString = formatSize(this.cpu.overclock, 'G', {space: true});
      specStrings.push(
        `- A ${cpuCoreString}-core ${cpuGenString} generation CPU @${cpuFreqString}Hz w/ ${cpuCacheString}B cache, overclocked to ${cpuOverclockString}Hz.`,
      );
    } else {
      specStrings.push(`- No CPU installed.`);
    }

    const mbGenSupportString = this.mb.minGen === this.mb.maxGen ? formatNumberInOrdinal(this.mb.minGen) : `${this.mb.minGen}-${formatNumberInOrdinal(this.mb.maxGen)}`;
    const mbMaxRamString = formatSize(this.mb.maxRam, 'G');
    const mbMaxFreqString = formatSize(this.mb.maxFrequency, 'M', {space: true});
    specStrings.push(
      `- A ${mbGenSupportString} gen chipset motherboard with support for up to ${mbMaxRamString}B of RAM @${mbMaxFreqString}Hz.`,
    );

    const diskSizeString = formatSize(this.disk.size, 'G');
    specStrings.push(
      `- A ${diskSizeString}B ${this.disk.type} with a ${this.disk.interface} interface.`,
      `- No graphics card.`,
      `- A ${this.psu.watts} W power supply.`
    );
    return specStrings.join('<br />') + '<br />';
  }

  reportFirstTime() {
    return 'You open the computer tower. It is equipped with:<br />' + this.report();
  }
}

export class Machine {
  game;
  shell;
  devices = [];
  specs = new MachineSpecs({
    ram: { size: 1, type: 'DDR3', frequency: 800 },
    cpu: { cores: 2, generation: 4, frequency: 2.7, cache: 2, overclock: 2.835 },
    mb: { minGen: 4, maxGen: 5, maxRam: 16, maxFrequency: 1600, usbPorts: 1 },
    disk: { size: 1000, interface: 'SATA', type: 'HDD' },
    gpu: undefined,
    psu: { watts: 300 }
  });
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
    // Firmware actions, POST
    await sleep(300);
    if (!this.specs.cpu?.cores || this.specs.cpu['damage']) {
      for (let i = 0; i < 14; i++) {
        this.game.playSfx('beep_hf.ogg');
        await sleep(150);
        this.game.playSfx('beep_ok.ogg');
        await sleep(150);
      }
      this.state = 'off';
      await sleep(1500);
      this.game.print('The computer was unable to boot.<br />');
      await sleep(1500);
      return;
    }
    if (!this.specs.ram?.size || this.specs.ram['damage']) {
      for (let i = 0; i < 5; i++) {
        this.game.playSfx('beep_long.ogg');
        await sleep(1000);
      }
      this.state = 'off';
      await sleep(500);
      this.game.print('The computer was unable to boot.<br />');
      await sleep(1500);
      return;
    }
    this.game.playSfx('beep_ok.ogg');
    const bootableDevices = this.devices.filter((dev) => dev.bootable);
    if (bootableDevices.length > 0) {
      this.bootFilesystem = bootableDevices[0].filesystem;
    } else {
      this.bootFilesystem = this.storedFilesystem;
    }
    // Bootloader actions
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

  exportSave() {
    return {
      filesystem: this.storedFilesystem.exportSave(),
      specs: this.specs.exportSave(),
    };
  }

  importSave(save) {
    this.storedFilesystem.importSave(save.filesystem);
    this.specs.importSave(save.specs);
  }
}