import {StateManagingObject} from "../entities/state-managing-object.js";
import {sleep} from "../utils.js";

export class ConvenienceStore extends StateManagingObject {
  determineActions() {
    return ['talk-cashier', 'newspapers', 'outside'];
  }

  async executeInput(game) {
    switch (game.getArgv(0)) {
      case 'newspapers':
        game.print('You look at the digital newspaper subscription ads. The headlines are:<br />' +
          '- The ePhone to replace all ePhones: Meet the new eGalaxy Cluster<br />' +
          '- Ablue vault heist - Thousands of private keys stolen - Macrosoft urges users to generate new keys<br />' +
          '- EnvyTech to invest up to $100 million in cryptocurrency - stock markets worried<br />' +
          '- Metaspace AR: Get your own digital flower with only $6/mo!<br />');
        await sleep(600);
        break;
      case 'outside':
        game.print('You exit the convenience store.<br />');
        return game.switchState('inspect-object outside');
      case 'talk-cashier':
        return game.switchState('talk convenience-store-cashier');
      default:
        game.print('Invalid action. ');
        break;
    }

    game.waitInput();
  }
}