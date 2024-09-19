import {sleep} from "../utils.js";

export async function watrar(game) {
  const matches = game.input.match(/[^ ]+ +(-[A-Za-z]+ )* *(.+)/);
  if (!matches) {
    game.print('Usage: watrar.exe [options] PATH<br />' +
      'Decompress: watrar.exe example.zip<br />' +
      'Compression formats supported: ZIP, RAR<br />');
    return;
  }
  const path = matches[matches.length - 1];
  const file = game.computer.fs().get(path);
  if (!file) {
    game.print('watrar.exe: file not found<br />');
    return;
  }
  if (file.type !== 'zip' && file.type !== 'rar') {
    game.print('watrar.exe: unsupported file type<br />');
    return;
  }
  game.print('watrar.exe: Trial period is active. Consider purchasing a license from watrar.com.<br />');
  game.print('watrar.exe: decompressing<br />');
  for (const item of file.contents) {
    game.print(`watrar.exe: decompressing ${item[0]}<br />`);
    await sleep(50);
    game.computer.fs().put(item[0], item[1].contents, { type: item[1].type });
  }
  game.print('watrar.exe: done<br />');
}