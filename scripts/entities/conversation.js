import {StateManagingObject} from "./state-managing-object.js";

export class Conversation extends StateManagingObject {
  isConversing = false;
  activeCaptions;
  async converse(game) {}

  determineActions() {
    return ['exit'];
  }

  getConversingPrompt() {
    if (this.isConversing) return '';
    return '&gt; <i style="color: gray; font-weight: lighter">[&lt;Enter&gt;: continue &lt;s&gt;: skip &lt;q&gt;: quit]</i>';
  }

  getPrompt() {
    return '> [%actions%]: ';
  }

  async processConversationModeInput(game, key) {
    if (this.isConversing) return;

    switch (key) {
      case 'Enter':
      case ' ':
        await this.converse(game);
        break;
      case 's':
        await this.skipConversation(game);
        break;
      case 'q':
        await this.quitConversation(game);
        break;
      default:
        break;
    }
  }

  async quitConversation(game) {}

  async skipConversation(game) {}
}

const convenienceStoreCaptions = {
  introAboutBreach: [
    'You turn around to face the store\'s counter.\n%p1000%' +
    'A tall,%p200% thin,%p200% pale young man%p100% with a spotted beard%p200% and a thick blond mustache%p100% ' +
    'is standing in front of the counter.\n%p600%' +
    'You greet him.\n%p1000%' +
    '- %voice1%Hi James. What\'s the news today?\n%p500%',
    '- %voice2%Hey, how are you?%p300% ...Same as usual.\n' +
    '  It\'s havoc out there. Security breaches everywhere.\n%p1000%' +
    '  People of your sector must be having a hard time, no?\n%p500%',
    '- %voice1%Well,%p300% not if you are careful.%p500% Did you hear anyone getting breached?%p300%\n',
    '- %voice2%Well - you are probably looking at him!%p1000% I might be needing someone to look at my case soon.\n',
    '- %voice1%Whoa, what happened? Did they steal money from you?%p500%\n' +
    '  Also - I can be that someone, if you want.%p300%\n',
    '- %voice2%Oh, really?%p300% No, they didn\'t steal anything, I think.%p500%\n' +
    '  But the store\'s main machine is bricked. It is constantly running, overheating, and it displays nothing.%p500%\n' +
    '  Also, the store\'s network is horribly slow lately.%p500%\n',
    '- %voice1%%s60%...%p300%%s30%I see.%p400% You have been probably hijacked for mining or attacks.%p500%\n',
    '- %voice2%%s400%...%s30%What?%p300%\n',
    '- %voice1%Nothing.%p300% I can look at it if you want.%p300% When can I see it?%p300%\n',
    '- %voice2%Whenever you like, even now, if you want.%p200% I\'m here every day till the afternoon.%p300%\n',
    '- %voice1%Great.%p200% I\'ll prepare some tools and come back.%p300%\n',
    '- %voice2%Nice!%p400% With proper pay, of course -%p300% what\'s your price?\n%p500%',
    '- %voice1%Let\'s say 50 bucks, if I manage to fix it.\n%p500%',
    '- %voice2%And if you don\'t?\n%p300%',
    '%p500%(You smile.)\n%p500%' +
    '- %voice1%Then get me a beer to drown my misery.%p500%\n'
  ],
  introGeneric1: [
    'James is observing the customers circling around the product stalls.\n%p700%'
  ],
  introGeneric2: [
    'James is doing some math.%p400% Weird stuff.\n%p700%'
  ],
  introGeneric3: [
    'James is reading a newspaper.\n%p700%'
  ],
  introGeneric4: [
    'James is scanning some product labels.\n%p700%'
  ],
  introGeneric5: [
    'James is staring into the void.\n%p700%'
  ]
}

export class ConvenienceStoreConversation extends Conversation {
  convStep = 0;
  prompt = null;
  showPromptTimeout = null;

  // Persisted
  completedCaptions = new Set();

  async converse(game) {
    if (this.showPromptTimeout) {
      clearTimeout(this.showPromptTimeout);
      this.showPromptTimeout = null;
    }
    this.prompt = null;
    this.isConversing = true;

    const captions = convenienceStoreCaptions[this.activeCaptions];
    await game.printSlowly(captions[this.convStep]);

    this.convStep++;
    if (this.convStep >= captions.length) {
      this.convStep = 0;
      this.completedCaptions.add(this.activeCaptions);
      this.activeCaptions = undefined;
      game.possibleActions = this.determineActions();
      game.waitInput(this.getPrompt());
      return;
    }

    this.prompt = '&gt;';
    this.isConversing = false;
    game.render();
    this.showPromptTimeout = setTimeout(() => {
      this.prompt = null;
      game.render();
    }, 5000);
  }

  determineActions() {
    const actions = [];

    if (this.completedCaptions.has('introAboutBreach')) {
      actions.push('repeat intro-about-breach');
    }
    actions.push(...super.determineActions());

    return actions;
  }

  async executeInput(game) {
    const command = game.getArgv(0);

    if (command === 'repeat') {
      const repeat = game.getArgv(1);
      if (repeat === 'intro-about-breach') {
        game.terminalState = 'conversation';
        this.activeCaptions = 'introAboutBreach';
        await this.converse(game);
      } else {
        game.print('Invalid conversation to repeat.<br />');
      }
    } else {
      await super.executeInput(game);
    }
  }

  getConversingPrompt() {
    if (!this.prompt) return super.getConversingPrompt();
    return this.prompt;
  }

  report() {
    return async (game) => {
      game.terminalState = 'conversation';
      const rand = Math.floor(Math.random() * 5);
      this.activeCaptions = `introGeneric${rand + 1}`;
      await this.converse(game);
    }
  }

  reportFirstTime() {
    if (this.completedCaptions.has('introAboutBreach')) return this.report();
    return async (game) => {
      game.terminalState = 'conversation';
      this.activeCaptions = 'introAboutBreach';
      await this.converse(game);
    }
  }

  async quitConversation(game) {
    this.convStep = 0;
    this.activeCaptions = undefined;
    game.currentConversation = null;
    game.terminalState = 'exec';
    await game.switchState(game.prevState);
  }

  async skipConversation(game) {
    this.convStep = 0;
    if (this.activeCaptions) {
      this.completedCaptions.add(this.activeCaptions);
      this.activeCaptions = undefined;
    }
    game.possibleActions = this.determineActions();
    game.waitInput(this.getPrompt());
  }
}
