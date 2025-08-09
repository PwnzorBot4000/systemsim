/**
 * @typedef {object} StateManagingObject
 */
export class StateManagingObject {
  determineActions() {
    return ['back'];
  }

  getAsciiArtId() {
    return undefined;
  }

  getPrompt() {
    return 'Possible actions: [%actions%]<br /><br />Action: ';
  }

  async executeInput(game) {
  }

  report() {
    return '';
  }

  reportFirstTime() {
    return this.report();
  }

  reportAfterChange() {
    return this.report();
  }
}