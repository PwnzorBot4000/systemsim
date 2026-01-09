import {Item} from "../model.js";

export class MemoryStick extends Item {
  bootable = false;
  filesystem;
  size;
  interfaceType;

  constructor(params) {
    super();
    Object.assign(this, params);
    this.bootable = params.bootable ?? false;
    this.referredAsThe = 'USB stick';
    this.type = 'memory-stick';
  }

  exportSave() {
    return {
      ...this,
      filesystem: this.filesystem.exportSave(),
    };
  }

  importSave(save) {
    this.bootable = save.bootable;
    this.filesystem.importSave(save.filesystem);
    this.size = save.size;
    this.interfaceType = save.interfaceType;
    this.description = save.description;
  }
}