import {sleep} from "../utils.js";

export async function m4r10k4rt(game) {
  await sleep(2000);
  game.print('rm /boot/kernel<br />');
  game.computer.fs().rm('/boot/kernel');
  await sleep(1000);
  game.cls();
  await sleep(1000);
  for (let i = 0; i < 24; i++) {
    game.print('&gt;&gt;&gt;=================== Y0U G0T PWN3D, K1D ===================&lt;&lt;&lt;<br /><br />');
    await sleep(100);
  }
  game.print('# poweroff<br />');
  await sleep(300);
  return await game.computer.poweroff(3000);
}
