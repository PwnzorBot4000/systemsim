import {ItemContainer} from "./item-container.js";

export class Drawer extends ItemContainer {
  getAsciiArtId() {
    return 'drawer';
  }

  reportAfterChange() {
    return 'Now the drawer contains:<br />' + this.report();
  }
}