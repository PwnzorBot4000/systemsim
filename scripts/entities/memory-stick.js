import {Item, ItemType} from "../model.js";
import {Filesystem} from "./filesystem.js";

/** @typedef {'USB-A 3.0' | 'USB-C 3.1'} MemoryStickInterfaceType */

/** @typedef {Omit<ItemParams, 'referredAsThe' | 'type'>} MemoryStickParams
 * @property {boolean | undefined} bootable
 * @property {Filesystem} filesystem
 * @property {MemoryStickInterfaceType} interfaceType
 * @property {string} size
 */

export class MemoryStick extends Item {
  /** @param {MemoryStickParams} params */
  constructor(params) {
    super({
      ...params,
      referredAsThe: 'USB stick',
      type: ItemType.memoryStick,
    });

    this.bootable = params.bootable ?? false;
    this.filesystem = params.filesystem;
    this.interfaceType = params.interfaceType;
    this.size = params.size;
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

  static fromSave(save) {
    return new MemoryStick({
      ...save,
      filesystem: Filesystem.fromSave(save.filesystem),
    });
  }
}