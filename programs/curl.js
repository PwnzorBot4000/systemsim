import {sanitizeHtml} from "../utils.js";
import {Filesystem} from "../entities/filesystem.js";

export function curl(game) {
  const matches = game.input.match(/curl (-[A-Za-z]+ )*([A-Z]+) ([A-Za-z0-9-.]+)(\/.+)?/);
  if (!matches) {
    game.print('Usage: curl [options] METHOD HOST[/path]<br />' +
      'Example: curl GET www.example.com<br />' +
      'Example: curl GET 192.168.1.1/example.html<br />');
    return;
  }
  const fs = game.filesystems[matches[matches.length - 2]];
  if (!fs) {
    game.print('curl: server does not exist<br />');
    return;
  }
  const path = decodeURIComponent(matches[matches.length - 1] ?? '/');
  const internalPath = Filesystem.joinpath('/srv', path);

  let contents;
  let filename;
  const file = fs.get(internalPath);
  if (file === 'dir') {
    const indexFile = fs.get(Filesystem.joinpath(internalPath, 'index.html'));
    if (indexFile) {
      contents = sanitizeHtml(indexFile.contents ?? '');
      filename = 'index.html';
    } else {
      contents = fs.ls(internalPath).join(' ');
      filename = 'directory-listing.txt';
    }
  } else if (file) {
    contents = sanitizeHtml(file.contents ?? '');
    filename = internalPath.split('/').slice(-1)[0];
  } else {
    const notFound = fs.get('/srv/not-found.html');
    contents = sanitizeHtml(notFound?.contents ?? '');
    filename = 'not-found.html';
  }

  // Output
  if (game.getSwitch('O', 'output')) {
    game.filesystems['localhost'].put(filename, contents);
    game.print(`Downloaded ${filename} (${contents.length} bytes)<br />`);
  } else {
    game.print(contents + '<br />');
  }
}
