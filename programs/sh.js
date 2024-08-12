import {helpData} from "../data/help.js";
import {sanitizeHtml, sleep} from "../utils.js";

function cat(game) {
  const path = game.getArgv(1);
  if (!path) {
    game.print('cat: missing operand<br />');
    return;
  }

  const file = game.filesystems['localhost'].get(path);
  if (!file) game.print('cat: File not found<br />');
  else if (file === 'dir') game.print('cat: Is a directory<br />');
  else if (file === 'bin' || file === 'exe' || file.type === 'bin' || file.type === 'exe')
    game.print('cat: Is a binary<br />');
  else game.print(sanitizeHtml(file?.contents ?? '') + '<br />');
}

function cd(game) {
  const dir = game.getArgv(1);
  if (!dir) {
    game.print('cd: missing operand<br />');
  } else if (dir === '..') {
    game.filesystems['localhost'].goUp({onerror: () => game.print(`${dir}: No such directory<br />`)});
  } else {
    game.filesystems['localhost'].goIn(dir, {onerror: () => game.print(`${dir}: No such directory<br />`)});
  }
}

function help(game) {
  const helpTerm = game.getArgv(1) ?? '';
  const helpPage = helpData.get(helpTerm);

  if (!helpPage) {
    game.print(`Unknown command: ${helpTerm}<br />`);
    return;
  }

  game.print(helpPage);
}

function ls(game) {
  const path = game.getArgv(1) ?? '';
  game.print(game.filesystems['localhost'].ls(path).join(' ') + '<br />');
}

async function poweroff(game) {
  await sleep(600);
  return await game.poweroff();
}

function rm(game) {
  const path = game.getArgv(1);
  if (!path) {
    game.print('rm: missing operand<br />');
    return;
  }

  game.filesystems['localhost'].rm(path);
}

const commands = {
  cat,
  cd,
  help,
  ls,
  poweroff,
  rm,
};

function hasCommand(command) {
  return !!commands[command];
}

export const sh = {
  ...commands,
  hasCommand,
};
