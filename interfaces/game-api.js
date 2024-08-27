import {CommonApi} from "./common-api.js";

export class GameApi extends CommonApi {
  enableInputHistory = (value = true) => {};
  setupCompletion = (completions = ['']) => {};
  switchState = async (state = '') => {};
  waitInput = (prompt = '') => {};

  constructor(init) {
    super();
    if (!init) return;
    Object.assign(this, init);
  }
}