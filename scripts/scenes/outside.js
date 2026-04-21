import {StateManagingObject} from "../entities/state-managing-object.js";
import {sleep} from "../utils.js";

export class Outside extends StateManagingObject {
  determineActions() {
    return ['home', 'convenience-store', 'bills-computer-shop', 'coffee-shop', 'home-depot', 'train-station'];
  }

  getPrompt() {
    return 'Go where? [%actions%]<br /><br />Action: ';
  }

  async executeInput(game) {
    switch (game.getArgv(0)) {
      case 'home':
        game.print('You return to your home.<br />');
        await sleep(1000);
        return game.switchState('inspect-object room', {cls: true});
      case 'convenience-store':
        return game.switchState('inspect-object convenience-store');
      case 'bills-computer-shop':
        game.print('You don\'t need anything from the computer shop right now.<br />');
        break;
      // return game.switchState('bills-computer-shop');
      case 'coffee-shop':
        game.print('You don\'t need anything from the coffee shop right now.<br />');
        break;
      // return game.switchState('coffee-shop');
      case 'home-depot':
        game.print('You don\'t need anything from the home depot right now.<br />');
        break;
      // return game.switchState('home-depot');
      case 'train-station':
        game.print('You don\'t need to travel right now.<br />');
        break;
      // return game.switchState('home-depot');
      default:
        game.print('Invalid action. ');
        break;
    }

    game.waitInput();
  }
}