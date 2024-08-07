export class InputHistory {
  enabled = false;
  index = -1;
  history = [''];

  type(input) {
    if (!this.enabled) return;

    this.index = -1;
    this.set(this.index, input);
  }

  push(input) {
    if (!this.enabled) return;

    this.type(input);
    this.history.push('');
  }

  retrieve(offset = -1) {
    if (!this.enabled || !this.assertIndex(this.index + offset)) {
      return undefined;
    }

    // Lookup
    const prefix = this.get(-1);
    if (prefix) {
      let testIndex = this.index + offset;
      while (this.assertIndex(testIndex)) {
        const possibleMatch = this.get(testIndex);
        if (possibleMatch?.startsWith(prefix)) {
          this.index = testIndex;
          return possibleMatch;
        }
        testIndex += offset;
      }
      return undefined;
    }

    this.index += offset;
    return this.get(this.index);
  }

  // Private methods

  assertIndex(index) {
    // Negative indexes only
    return index < 0 && Math.abs(index) <= this.history.length;
  }

  get(index) {
    return this.history[this.history.length + index];
  }

  set(index, value) {
    this.history[this.history.length + index] = value;
  }
}
