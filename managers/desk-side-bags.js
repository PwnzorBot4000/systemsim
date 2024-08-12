export class DeskSideBags {
  bags = [
    {
      name: 'cologne-packaging',
      description: 'A small bag containing the empty packaging of a cologne bottle.',
      trash: true
    },
    {name: 'cooler-packaging', description: 'A large bag containing the empty packaging of a CPU cooler.', trash: true},
  ];

  areEmpty() {
    return this.bags.length === 0;
  }

  cleanupTrash() {
    this.bags = this.bags.filter((bag) => !bag.trash);
  }

  render() {
    if (this.areEmpty()) {
      const prob = Math.random();
      if (prob > 0.95)
        return '(Nothing. Like your soul.)<br />';
      if (prob > 0.90)
        return '(Nothing. The mathematically perfect void emanating from the empty corner is permeating the room, giving you the creeps.)<br />';
      if (prob > 0.75)
        return '(Nothing. The empty side of your desk is staring at you, menacingly.)<br />';
      return '(Nothing, the side of your desk is clean.)<br />';
    }
    return this.bags.map((bag) => `- ${bag.description}`).join('<br />') + '<br />';
  }
}
