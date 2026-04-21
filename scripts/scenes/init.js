import {StateManagingObject} from "../entities/state-managing-object.js";

export class Init extends StateManagingObject {
  determineActions() {
    return ['boot', 'inspect', 'stand'];
  }

  async executeInput(game) {
    switch (game.input) {
      case 'boot':
        return game.switchState('boot', {cls: true});
      case 'inspect':
        return game.switchState('inspect-object desk');
      case 'stand':
        return game.switchState('inspect-object room');
      default:
        game.print('Invalid action. ');
        break;
    }

    game.waitInput();
  }

  reportFirstTime() {
    return async (game) => {
      game.print('You are sitting at your desk, in front of your home computer. It is currently shut down.<br />');
      await game.notepad.updateNotes(game);
    }
  }
}