import {Achievements} from "../managers/achievements.js";

export async function links(game) {
  const matches = game.input.match(/[^ ]+ (.*)/);
  if (!matches) {
    game.print('Usage: links URL<br />' +
      'Open a URL in a browser<br />' +
      'Example: links https://www.goggle.com<br />');
    return;
  }
  const url = matches[matches.length - 1];

  Achievements.add('links');
  game.print(`<i>This feature is still under development. Thanks for playing!</i><br />`);
}