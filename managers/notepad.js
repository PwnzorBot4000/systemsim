export class Notepad {
  notes = [['[Page contains a few doodles at the top.]',
    'exploit-db.com - known vulnerabilities and vulnerable site search',
    '(must install links smh, browsing with curl is torture)']];
  page = 0;

  async goto(index) {
    if (index < 0 || index >= this.notes.length) {
      throw new Error(`Invalid page: ${index + 1}`);
    }

    this.page = index;
  }

  async next() {
    if (this.page + 1 >= this.notes.length) {
      throw new Error('This is the last page.');
    }

    this.page++;
  }

  async prev() {
    if (this.page - 1 < 0) {
      throw new Error('This is the first page.');
    }

    this.page--;
  }

  render() {
    return `The notepad is open on page ${this.page + 1}. Its contents are: <br />` +
      '<br />' +
      this.notes[this.page].join('<br />') + '<br />' +
      '<br />';
  }
}
