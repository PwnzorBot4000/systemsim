import {StateManagingObject} from "../entities/state-managing-object.js";

export class Notepad extends StateManagingObject {
  notes = [['[Page contains a few doodles at the top.]',
    'exploit-db.com - known vulnerabilities and vulnerable site search',
    '(must install links smh, browsing with curl is torture)']];
  page = 0;

  getAsciiArtId() {
    return 'notepad';
  }

  addNote(note) {
    this.notes[this.notes.length - 1].push(note);
  }

  async goto(index) {
    if (index < 0 || index >= this.notes.length) {
      throw new Error(`Invalid page: ${index + 1}`);
    }

    this.page = index;
  }

  hasNote(name) {
    return this.notes.some(
      (page) => page.some(
        (line) => typeof line !== 'string' && line.name === name));
  }

  async next() {
    if (this.page + 1 >= this.notes.length) {
      throw new Error('This is the last page.');
    }

    this.page++;
  }

  async prev() {
    if (this.page - 1 < 0) {
      throw new Error('This is the first page.');
    }

    this.page--;
  }

  determineActions() {
    return ['page [x]', 'next', 'prev', 'back'];
  }

  async executeInput(game) {
    try {
      switch (game.getArgv(0)) {
        case 'next':
          await this.next();
          break;
        case 'prev':
          await this.prev();
          break;
        case 'page': {
          const index = game.getArgvInt(1) - 1;
          await this.goto(index);
          break;
        }
      }
    } catch (e) {
      game.print(`${e.message}<br /><br />`);
      game.print(this.report());
      game.waitInput();
      return;
    }

    game.playSfx('page-turn.ogg');
    game.print(this.report());
    game.waitInput();
  }

  report() {
    return `The notepad is open on page ${this.page + 1}. Its contents are: <br />` +
      '<br />' +
      this.notes[this.page]
        .map((line) => typeof line === 'string' ? line : line.text)
        .join('<br />') + '<br />' +
      '<br />';
  }

  reportFirstTime() {
    return async (game) => {
      game.playSfx('page-turn.ogg');
      game.print('A large notepad with a pen is on the desk.<br />' + this.report());
    }
  }
}
