export class MemoryStick {
  id;
  bootable = false;
  filesystem;
  size;
  type;
  description;

  constructor(options) {
    this.id = options.id;
    this.bootable = options.bootable ?? false;
    this.size = options.size;
    this.type = options.type;
    this.description = options.description;
    this.filesystem = options.filesystem;
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
    this.type = save.type;
    this.description = save.description;
  }
}