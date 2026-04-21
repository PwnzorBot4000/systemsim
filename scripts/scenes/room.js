import {StateManagingObject} from "../entities/state-managing-object.js";
import {sleep} from "../utils.js";

export class Room extends StateManagingObject {
  determineActions() {
    return ['bathroom', 'bookcase', 'desk', 'kitchen', 'storeroom', 'outside'];
  }

  async executeInput(game) {
    switch (game.getArgv(0)) {
      case 'desk':
        return game.switchState('init');
      case 'bathroom':
        return game.switchState('inspect-object bathroom');
      case 'bookcase':
        return game.switchState('inspect-object bookcase');
      case 'kitchen':
        return game.switchState('inspect-object kitchen');
      case 'storeroom':
        return game.switchState('inspect-object storeroom');
      case 'outside':
        game.print('You exit the room.<br />');
        await sleep(1000);
        return game.switchState('inspect-object outside', {cls: true});
      default:
        game.print('Invalid action. ');
        break;
    }

    game.waitInput();
  }
}