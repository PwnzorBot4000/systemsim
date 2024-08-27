import {helpData} from "../data/help.js";
import {sanitizeHtml, sleep} from "../utils.js";
import {Filesystem} from "../entities/filesystem.js";

function cat(api) {
  const path = api.getArgv(1);
  if (!path) {
    api.print('cat: missing operand<br />');
    return;
  }

  const file = api.fs().get(path);
  if (!file) api.print('cat: File not found<br />');
  else if (file === 'dir') api.print('cat: Is a directory<br />');
  else if (file === 'bin' || file === 'exe' || file.type === 'bin' || file.type === 'exe')
    api.print('cat: Is a binary<br />');
  else api.print(sanitizeHtml(file?.contents ?? '') + '<br />');
}

function cd(api) {
  const dir = api.getArgv(1);
  if (!dir) {
    api.print('cd: missing operand<br />');
  } else {
    api.fs().cd(dir, {onerror: () => api.print(`${dir}: No such directory<br />`)});
  }
}

function cp(api) {
  const src = api.getArgv(1);
  const dst = api.getArgv(2);

  if (!src || !dst) {
    api.print('cp: missing operand<br />');
    return;
  }

  const srcFile = api.fs().get(src);
  const dstFile = api.fs().get(dst);

  if (!srcFile) {
    api.print('cp: source file not found<br />');
    return;
  }

  if (srcFile === 'dir') {
    api.print('cp: source is a directory<br />');
    return;
  }

  if (dstFile !== 'dir') {
    api.print('cp: destination is not a directory<br />');
    return;
  }

  const srcFileName = src.split('/').slice(-1)[0];
  api.fs().put(Filesystem.joinpath(dst, srcFileName), srcFile.contents, { type: srcFile.type });
}

function help(api) {
  const helpTerm = api.getArgv(1) ?? '';
  const helpPage = helpData.get(helpTerm);

  if (!helpPage) {
    api.print(`Unknown command: ${helpTerm}<br />`);
    return;
  }

  api.print(helpPage);
}

function ls(api) {
  const path = api.getArgv(1) ?? '';
  api.print(api.fs().ls(path).join(' ') + '<br />');
}

async function poweroff(api) {
  await sleep(600);
  return await api.poweroff();
}

function rm(api) {
  const path = api.getArgv(1);
  if (!path) {
    api.print('rm: missing operand<br />');
    return;
  }

  api.fs().rm(path);
}

const commands = {
  cat,
  cd,
  cp,
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
