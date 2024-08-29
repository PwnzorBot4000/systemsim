import {helpData} from "../data/help.js";
import {decodeExeName, sanitizeHtml, sleep} from "../utils.js";
import {Filesystem} from "../entities/filesystem.js";

export class Shell {
  game;
  computer;

  init(ctx) {
    this.game = ctx.game;
    this.computer = ctx.computer;

    this.game.enableInputHistory(true);
    this.game.setupCompletion(['cat [path]', 'cd [path]', 'help [command]', 'ls [path]', 'poweroff', 'rm [path]']);
    this.game.waitInput(`%pwd% # `);
  }

  async executeInput() {
    // Commands

    if (this.hasCommand(this.game.getArgv(0))) {
      return await this.getCommandsDict()[this.game.getArgv(0)]();
    }

    // Programs

    const localProgram = this.computer.fs().get(this.game.getArgv(0));
    const binProgram = this.computer.fs().get(Filesystem.joinpath('/bin', this.game.getArgv(0)));

    if (!localProgram && !binProgram) {
      this.computer.print(`Unknown command: ${this.game.getArgv(0)}<br />For a list of commands, type 'help'.<br /><br />`);
      return;
    }

    const programName = decodeExeName(localProgram?.contents ?? binProgram?.contents);
    await this.executeProgram(programName);
  }

  async executeProgram(programName) {
    // Dynamically import programs, to make initial load faster and for realism
    switch (programName) {
      case 'curl':
        const curlModule = await import('./curl.js');
        curlModule.curl(this.game);
        break;
      case 'm4r10k4rt':
        const m4r10k4rtModule = await import('./m4r10k4rt.js');
        await m4r10k4rtModule.m4r10k4rt(this.game);
        break;
      case 'noop':
        this.computer.print('<br />');
        break;
      case 'installos': {
        const installOsModule = await import('./install-os.js');
        await installOsModule.installOs(this.game, this.computer);
        break;
      }
      default:
        this.computer.print(`${this.game.getArgv(0)} is not an executable file.<br /><br />`);
        break;
    }
  }

  // Commands

  async cat() {
    const path = this.game.getArgv(1);
    if (!path) {
      this.computer.print('cat: missing operand<br />');
      return;
    }

    const file = this.computer.fs().get(path);
    if (!file) this.computer.print('cat: File not found<br />');
    else if (file === 'dir') this.computer.print('cat: Is a directory<br />');
    else this.computer.print(sanitizeHtml(file?.contents ?? '') + '<br />');
  }

  async cd() {
    const dir = this.game.getArgv(1);
    if (!dir) {
      this.computer.print('cd: missing operand<br />');
    } else {
      this.computer.fs().cd(dir, {onerror: () => this.computer.print(`${dir}: No such directory<br />`)});
    }
  }

  async cp() {
    const src = this.game.getArgv(1);
    const dst = this.game.getArgv(2);

    if (!src || !dst) {
      this.computer.print('cp: missing operand<br />');
      return;
    }

    const srcFile = this.computer.fs().get(src);
    const dstFile = this.computer.fs().get(dst);

    if (!srcFile) {
      this.computer.print('cp: source file not found<br />');
      return;
    }

    if (srcFile === 'dir') {
      this.computer.print('cp: source is a directory<br />');
      return;
    }

    if (dstFile !== 'dir') {
      this.computer.print('cp: destination is not a directory<br />');
      return;
    }

    const srcFileName = src.split('/').slice(-1)[0];
    this.computer.fs().put(Filesystem.joinpath(dst, srcFileName), srcFile.contents, { type: srcFile.type });
  }

  async help() {
    const helpTerm = this.game.getArgv(1) ?? '';
    const helpPage = helpData.get(helpTerm);

    if (!helpPage) {
      this.computer.print(`Unknown command: ${helpTerm}<br />`);
      return;
    }

    this.computer.print(helpPage);
  }

  async ls() {
    const path = this.game.getArgv(1) ?? '';
    this.computer.print(this.computer.fs().ls(path).join(' ') + '<br />');
  }

  async poweroff() {
    await sleep(600);
    return await this.computer.poweroff();
  }

  async rm() {
    const path = this.game.getArgv(1);
    if (!path) {
      this.computer.print('rm: missing operand<br />');
      return;
    }

    this.computer.fs().rm(path);
  }

  getCommandsDict() {
    return {
      cat: this.cat.bind(this),
      cd: this.cd.bind(this),
      cp: this.cp.bind(this),
      help: this.help.bind(this),
      ls: this.ls.bind(this),
      poweroff: this.poweroff.bind(this),
      rm: this.rm.bind(this),
    };
  }

  hasCommand(command) {
    return !!this.getCommandsDict()[command];
  }
}
