import {formatNumberInOrdinal, formatSize} from "../utils.js";

export class Machine {
  specs = {
    ram: { size: 1, type: 'DDR3', frequency: 800 },
    cpu: { cores: 2, generation: 4, frequency: 2.7, cache: 2, overclock: 2.835 },
    mb: { minGen: 4, maxGen: 5, maxRam: 16, maxFrequency: 1600 },
    disk: { size: 1000, interface: 'SATA', type: 'HDD' },
    psu: { watts: 300 }
  }
  state = 'off';

  poweroff() {
    this.state = 'off';
  }

  suspend() {
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