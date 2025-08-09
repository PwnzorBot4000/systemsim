export class PossibleAction {
  /** @type {string} */
  render;

  /** @type {string[]} */
  actions;

  constructor(params) {
    Object.assign(this, params);
  }
}