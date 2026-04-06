/** @enum {string} */
export const ItemType = {
  book: 'book',
  clothes: 'clothes',
  hygiene: 'hygiene',
  kitchen: 'kitchen',
  memoryStick: 'memory-stick',
  stationery: 'stationery',
};

/**
 * @typedef {Object} ItemParams
 * @property {string | undefined} description
 * @property {Array<Item> | undefined} dismantleTo
 * @property {string} name
 * @property {string | undefined} referredAsThe
 * @property {boolean | undefined} trash
 * @property {ItemType} type
 */

export class Item {
  /** @param {ItemParams} params */
  constructor(params) {
    this.description = params.description;
    this.dismantleTo = params.dismantleTo;
    this.name = params.name;
    this.referredAsThe = params.referredAsThe;
    this.trash = params.trash;
    this.type = params.type;
  }
}

export class PlainFile {
  /** @type {string | undefined} */
  type;
  /** @type {string | LazyFile} */
  contents;
}

export class CompressedFile {
  /** @type {'zip'} */
  type;
  /** @type {Array<[string, FsFile]>} */
  contents;
}

/** @typedef {string | PlainFile | CompressedFile} FsFile */

/** @typedef {Array<[string, FsFile]>} FilesystemData */

export class PossibleAction {
  /** @type {string} */
  render;

  /** @type {string[]} */
  actions;

  constructor(params) {
    Object.assign(this, params);
  }
}