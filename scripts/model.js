export class Item {
  /** @type {string | undefined} */
  description;

  /** @type {Array<Item> | undefined} */
  dismantleTo;

  /** @type {string} */
  name;

  /** @type {string | undefined} */
  referredAsThe;

  /** @type {boolean | undefined} */
  trash;

  /** @type {string} */
  type;
}

export class PossibleAction {
  /** @type {string} */
  render;

  /** @type {string[]} */
  actions;

  constructor(params) {
    Object.assign(this, params);
  }
}
