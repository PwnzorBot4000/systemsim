import {StateManagingObject} from "./state-managing-object.js";
import {sanitizeHtml} from "../utils.js";

export class Book extends StateManagingObject {
  contents;
  description;
  name;
  referredAsThe = 'book';
  type = 'book';

  constructor(options) {
    super();
    this.contents = options.contents;
    this.description = options.description;
    this.name = options.name;
  }

  determineActions() {
    return ['chapter [x]', 'back'];
  }

  executeInput(game) {
    // Execute 'chapter [x]' action
    const index = game.getArgvInt(1) - 1;

    try {
      game.print(sanitizeHtml(this.readChapter(index)) + '<br />');
    } catch (e) {
      game.print(`${e.message}<br />`);
    }

    game.waitInput();
  }

  readChapter(index) {
    if (index < 0 || index >= this.contents.length) {
      throw new Error(`Invalid chapter: ${index + 1}`);
    }

    return this.contents[index].contents;
  }

  report() {
    return 'The book contains the following chapters:<br />' +
      this.contents
        .map((chapter, i) => `${i + 1} - ${chapter.title}<br />`)
        .join('');
  }
}