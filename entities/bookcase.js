import {ItemContainer} from "./item-container.js";
import {sleep} from "../utils.js";

export class Bookcase extends ItemContainer {
  report() {
    return async (game) => {
      const parts = [];
      parts.push('The first cabinet contains monitor cables and a pair of shoes.');

      const clothes = this.items.filter(item => item.type === 'clothes');
      if (clothes.length === 0) {
        parts.push('The second cabinet contains clothes.');
      } else {
        parts.push('The second cabinet contains clothes, including:');
        parts.push(clothes.map((item) => `- ${item.description}`).join('<br />'));
      }

      const books = this.items.filter(item => item.type === 'book');
      if (books.length === 0) {
        parts.push('The bookcase itself contains books about programming languages, and some novels.');
      } else {
        parts.push('The bookcase itself contains books about programming languages, some novels, and:');
        parts.push(books.map((item) => `- ${item.description}`).join('<br />'));
      }

      game.print(parts.join('<br />') + '<br />');
      await sleep(600);
    };
  }

  reportFirstTime() {
    return async (game) => {
      game.print('You look at the bookcase.<br />');
      await sleep(600);
      game.print('It is a small bookcase with a few books on it, and a couple of cabinets at the bottom.<br />');
      await this.report()(game);
    }
  }
}