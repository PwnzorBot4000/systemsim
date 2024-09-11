import {StateManagingObject} from "./state-managing-object.js";
import {sleep} from "../utils.js";

export class ItemContainer extends StateManagingObject{
  items = [];

  constructor(items) {
    super();
    this.items = items;
  }

  cleanupTrash() {
    this.items = this.items.filter((item) => !item.trash);
  }

  determineActions() {
    const actions = [];

    const books = this.items.filter(item => item.type === 'book');
    if (books.length === 1)
      actions.push('read-book');
    else if (books.length > 1)
      for (const book of books) {
        actions.push(`read-book ${book.name}`);
      }

    if (this.items.some(item => item.trash))
      actions.push('cleanup-trash');

    actions.push('back');
    return actions;
  }

  async executeInput(game) {
    switch (game.getArgv(0)) {
      case 'cleanup-trash':
        game.print('You clean up the trash.<br />');
        await sleep(600);
        this.cleanupTrash();
        game.print(this.reportAfterChange());
        game.possibleActions = this.determineActions();
        game.waitInput();
        break;
      case 'read-book': {
        const books = this.items.filter(item => item.type === 'book');
        const bookName = game.getArgv(1);

        let book;
        if (!bookName) {
          if (books.length === 1) {
            book = books[0];
          } else {
            game.print('You need to specify which book to open.<br />');
            break;
          }
        } else {
          book = books.find(item => item.name === bookName);
        }

        if (!book) {
          game.print('Invalid book id.<br />');
          break;
        }

        game.print(`You open the ${book.referredAsThe}.<br />`);
        await sleep(600);
        return game.switchState(`read-book ${book.name}`);
      }
    }
  }

  importSave(save) {
    this.items = save;
  }

  exportSave() {
    return [...this.items];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  report() {
    return this.items.map((item) => `- ${item.description}`).join('<br />') + '<br />';
  }

  reportFirstTime() {
    return `It contains:<br />` + this.report();
  }
}
