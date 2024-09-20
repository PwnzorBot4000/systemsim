import {StateManagingObject} from "./state-managing-object.js";
import {sleep} from "../utils.js";

export class Conversation extends StateManagingObject {
  determineActions() {
    return ['exit'];
  }

  getPrompt() {
    return '> [%actions%]: ';
  }
}

export class ConvenienceStoreConversation extends Conversation {
  report() {
    return async (game) => {
      game.print('You turn around to face the store\'s counter.<br />');
      await sleep(600);
      game.print('A tall, thin, pale young man with a spotted beard and a thick blond mustache is standing in front of the counter.<br />');
      game.print('You greet him.<br />');
      await sleep(600);
      game.print('- Hi James. What\'s the news today?<br />');
      await sleep(1000);
      game.print('- Hey, how are you? ...Same as usual.<br />');
      await sleep(1000);
      game.print('  It\'s havoc out there. Security breaches everywhere.<br />');
      await sleep(1000);
      game.print('  People of your sector must be having a hard time, no?<br />');
      await sleep(2000);
      game.print('- Well, not if you are careful. Did you hear anyone getting breached?<br />');
      await sleep(2000);
      game.print('- Well - you are probably looking at him!');
      await sleep(500);
      game.print(' I might be needing someone to look at my case soon.<br />');
      await sleep(1000);
      game.print('- Whoa, what happened? Did they steal money from you?<br />');
      await sleep(300);
      game.print('  Also - I can be that someone, if you want.<br />');
      await sleep(1000);
      game.print('- Oh, really? No, they didn\'t steal anything, I think.<br />');
      game.print('  But the store\'s main machine is bricked. It is constantly running, overheating, and it displays nothing.<br />');
      game.print('  Also, the store\'s network is horribly slow lately.<br />');
      await sleep(2000);
      game.print('- ...I see. You have been probably hijacked for mining or attacks.<br />');
      await sleep(3000);
      game.print('- ... What?<br />');
      await sleep(600);
      game.print('- Nothing. I can look at it if you want. When can I see it?<br />');
      await sleep(600);
      game.print('- Whenever you like, even now, if you want. I\'m here every day till the afternoon.<br />');
      await sleep(1000);
      game.print('- Great. I\'ll prepare some tools and come back.<br />');
      await sleep(600);
      game.print('- Nice! With proper pay, of course - what\'s your price?<br />');
      await sleep(1000);
      game.print('- Let\'s say 50 bucks, if I manage to fix it.<br />');
      await sleep(1000);
      game.print('- And if you don\'t?<br />');
      await sleep(1000);
      game.print('(You smile.)<br />');
      await sleep(300);
      game.print('- Then get me a beer to drown my misery.<br />');
    }
  }
}
