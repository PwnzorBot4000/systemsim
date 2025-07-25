import {StateManagingObject} from "./state-managing-object.js";
import {sleep} from "../utils.js";

export class ItemContainer extends StateManagingObject{
  items = [];
  defaultItemTypes = new Set();

  constructor(items, options = undefined) {
    super();
    this.items = items;

    const in_defaultItemTypes = options?.defaultItemTypes ?? options?.defaultItemType;
    if (in_defaultItemTypes) {
      if (Array.isArray(in_defaultItemTypes)) {
        this.defaultItemTypes = new Set(in_defaultItemTypes);
      } else {
        this.defaultItemTypes = new Set([in_defaultItemTypes]);
      }
    }
  }

  cleanupTrash() {
    this.items = this.items.filter((item) => !item.trash);
  }

  determineActions() {
    const actions = [];

    const books = this.items.filter(item => item.type === 'book');
    if (books.length === 1)
      actions.push('read-book');
    else if (books.length > 1) {
      for (const book of books) {
        actions.push(`read-book ${book.name}`);
      }
    }

    const destructibles = this.items.filter(item => !!item.dismantleTo);
    destructibles.forEach((destructible) => {
      actions.push(`dismantle ${destructible.name}`);
    });

    if (this.items.some(item => item.trash))
      actions.push('cleanup-trash');

    if (this.items.some(item => item.type === 'book') && !this.defaultItemTypes.has('book'))
      actions.push('move-books-to-bookcase');

    if (this.items.some(item => item.type === 'clothes') && !this.defaultItemTypes.has('clothes'))
      actions.push('move-clothes-to-cabinets');

    if (this.items.some(item => item.type === 'hygiene') && !this.defaultItemTypes.has('hygiene'))
      actions.push('move-hygienics-to-bathroom');

    if (this.items.some(item => item.type === 'kitchen') && !this.defaultItemTypes.has('kitchen'))
      actions.push('move-utensils-to-kitchen');

    if (this.items.some(item => item.type === 'stationery') && !this.defaultItemTypes.has('stationery'))
      actions.push('move-stationery-to-drawer1');

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
      case 'dismantle': {
        const destructible = this.items.find(item => item.name === game.getArgv(1));
        if (!destructible || !destructible.dismantleTo) {
          game.print('Invalid item to dismantle.<br />');
          game.waitInput();
          break;
        }
        game.print(`You dismantle the ${destructible.referredAsThe}.<br />`);
        await sleep(1200);
        this.dismantleItem(destructible);
        game.print(this.reportAfterChange());
        game.possibleActions = this.determineActions();
        game.waitInput();
        break;
      }
      case 'move-books-to-bookcase':
        game.print('You move the books to the bookcase.<br />');
        await sleep(600);
        this.moveItemsTo('book', game.bookcase);
        game.print(this.reportAfterChange());
        game.possibleActions = this.determineActions();
        game.waitInput();
        break;
      case 'move-clothes-to-cabinets':
        game.print('You move the clothes to the bookcase\'s bottom cabinets.<br />');
        await sleep(600);
        this.moveItemsTo('clothes', game.bookcase);
        game.print(this.reportAfterChange());
        game.possibleActions = this.determineActions();
        game.waitInput();
        break;
      case 'move-hygienics-to-bathroom':
        game.print('You move the hygienics to the bathroom.<br />');
        await sleep(600);
        this.moveItemsTo('hygiene', game.bathroom);
        game.print(this.reportAfterChange());
        game.possibleActions = this.determineActions();
        game.waitInput();
        break;
      case 'move-stationery-to-drawer1':
        game.print('You move the stationery to the first drawer.<br />');
        await sleep(600);
        this.moveItemsTo('stationery', game.drawers[0]);
        game.print(this.reportAfterChange());
        game.possibleActions = this.determineActions();
        game.waitInput();
        break;
      case 'move-utensils-to-kitchen':
        game.print('You move the utensils to the kitchen.<br />');
        await sleep(600);
        this.moveItemsTo('kitchen', game.kitchen);
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
            game.waitInput();
            break;
          }
        } else {
          book = books.find(item => item.name === bookName);
        }

        if (!book) {
          game.print('Invalid book id.<br />');
          game.waitInput();
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

  dismantleItem(item) {
    if (!item?.dismantleTo) return;
    const dismantledItems = item.dismantleTo;
    this.items = this.items.filter(i => i !== item);
    this.items.push(...dismantledItems);
  }

  moveItemsTo(type, destination) {
    const items = this.items.filter(item => item.type === type);
    if (items.length === 0) return;

    this.items = this.items.filter(item => item.type !== type);

    destination.items.push(...items);
  }

  report() {
    return this.items.map((item) => `- ${item.description}`).join('<br />') + '<br />';
  }

  reportFirstTime() {
    if (this.items.length === 0) return 'It is empty.<br />';
    return `It contains:<br />` + this.report();
  }

  reportAfterChange() {
    return 'Now it contains:<br />' + this.report();
  }
}
