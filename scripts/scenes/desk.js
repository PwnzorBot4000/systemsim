import {StateManagingObject} from "../entities/state-managing-object.js";
import {formatNumberInOrdinalFull, sleep} from "../utils.js";

export class Desk extends StateManagingObject {
  determineActions() {
    const possibleActions = ['picture', 'memorysticks', 'electronics', 'notepad', {
      render: 'drawer1/2/3',
      actions: ['drawer1', 'drawer2', 'drawer3']
    }, 'tower'];
    if (!game.deskSideBags.isEmpty())
      possibleActions.push('bags');
    possibleActions.push('boot', 'stand');

    return possibleActions;
  }

  async executeInput(game) {
    switch (game.getArgv(0)) {
      case 'picture':
        game.print('You look at the picture.<br />');
        await sleep(600);
        game.asciiart.set('picture');
        game.print(
          'It is a picture of your parents, with you in the middle. They are holding you from the hands, one hand each.<br />' +
          'The date on the photo is 2006 May 16.<br />');
        await sleep(600);
        break;
      case 'memorysticks':
        return game.switchState('inspect-object memorySticks');
      case 'electronics':
        game.asciiart.set('electronics');
        game.print(
          'The pile of electronics contains:<br />' +
          '- 2 RFID tags, opened with their contacts exposed.<br />' +
          '- A soldering iron, solder and flux.<br />' +
          '- 1.5 meter of USB 3.0 cable.<br />' +
          '- 2 meters of low voltage cable, solid core.<br />' +
          '- A sachel of about 10 MOSFETs.<br />');
        break;
      case 'notepad':
        return game.switchState('inspect-object notepad');
      case 'drawer1':
      case 'drawer2':
      case 'drawer3': {
        const index = parseInt(game.getArgv(0).slice(-1));
        if (index < 1 || index > game.drawers.length) {
          game.print('Invalid drawer index.<br />');
          break;
        }
        game.print(`You open the ${formatNumberInOrdinalFull(index)} drawer. `);
        return game.switchState(`inspect-drawer ${index}`);
      }
      case 'tower':
        return game.switchState('inspect-object tower');
      case 'bags':
        return game.switchState('inspect-object deskSideBags');
      case 'boot':
        return game.switchState('boot', {cls: true});
      case 'stand':
        game.print('You stand up.<br />');
        game.playSfx('chair_stand_up.ogg');
        await sleep(600);
        return game.switchState('inspect-object room');
      default:
        game.print('Invalid action. ');
        break;
    }

    game.waitInput();
  }

  reportFirstTime() {
    return async (game) => {
      game.print('You look at the desk.<br />');
      await sleep(600);
      game.asciiart.set('desk');
      const bagsPrompt = game.deskSideBags.isEmpty() ? '' : ' Next to it a few paper bags are leaning on its side.';
      game.print('On top of it, from left to right, there is a family picture, a small pile of memory sticks, a pile of electronics, and a large notepad with a pen.<br />' +
        `It has three drawers on the one side, and the computer tower on the other one.${bagsPrompt}<br />`);
      await sleep(600);
    }
  }
}