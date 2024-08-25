export class MemoryStick {
  bootable = false;
  filesystem;
  size;
  type;
  description;

  constructor(options) {
    this.bootable = options.bootable ?? false;
    this.size = options.size;
    this.type = options.type;
    this.description = options.description;
    this.filesystem = options.filesystem;
  }
}