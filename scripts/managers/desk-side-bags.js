import {ItemContainer} from "../entities/item-container.js";

export class DeskSideBags extends ItemContainer {
  constructor(options) {
    super([
      {
        name: 'cologne-packaging',
        description: 'A small bag containing the empty packaging of a cologne bottle.',
        trash: true
      },
      {name: 'cooler-packaging', description: 'A large bag containing the empty packaging of a CPU cooler.', trash: true},
    ], options);
  }

  report() {
    if (this.isEmpty()) {
      const prob = Math.random();
      if (prob > 0.95)
        return '(Nothing. Like your soul.)<br />';
      if (prob > 0.90)
        return '(Nothing. The mathematically perfect void emanating from the empty corner is permeating the room, giving you the creeps.)<br />';
      if (prob > 0.75)
        return '(Nothing. The empty side of your desk is staring at you, menacingly.)<br />';
      return '(Nothing, the side of your desk is clean.)<br />';
    }
    return super.report();
  }

  reportFirstTime() {
    return 'You search the bags. There is:<br />' + this.report();
  }

  reportAfterChange() {
    return 'Now there is:<br />' + this.report();
  }
}
