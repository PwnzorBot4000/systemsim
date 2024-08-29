import {sleep} from "../utils";
import {filesystemsData} from "../data/filesystems";

export async function installOs(game, computer) {
  const target = game.getArgv(1) || '/mnt';
  const targetFs = computer.fs().mounts.find((mnt) => mnt.where === target)?.what;

  if (!targetFs) {
    computer.print(`Invalid argument: ${target}<br />`);
    return;
  }

  computer.print(`Installing operating system to ${target}...<br />`);
  await sleep(1000);
  targetFs.fsMap = new Map(filesystemsData['localhost']);
  targetFs.rm('/root/notes.txt');  // You'd better have kept these notes!
  await sleep(1000);
  computer.print(`Operating system installed.<br />`);
}
