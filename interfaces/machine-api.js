import {CommonApi} from "./common-api.js";
import {Filesystem} from "../entities/filesystem.js";

export class MachineApi extends CommonApi {
  fs = () => { new Filesystem() };
  poweroff = async (drama = 1000) => { };

  constructor(init) {
    super();
    if (!init) return;
    Object.assign(this, init);
  }
}