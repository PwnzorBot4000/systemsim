export class Notepad {
  notes = [['[Page contains a few doodles at the top.]',
    'exploit-db.com - known vulnerabilities and vulnerable site search',
    '(must install links smh, browsing with curl is torture)']];
  page = 0;

  goto(index, options = {
    onerror: () => {
    }
  }) {
    if (index < 0 || index >= this.notes.length) {
      options.onerror?.();
      return false;
    }

    this.page = index;
    return true;
  }

  render() {
    return `The notepad is open on page ${this.page + 1}. Its contents are: <br />` +
      '<br />' +
      this.notes[this.page].join('<br />') + '<br />' +
      '<br />';
  }
}
