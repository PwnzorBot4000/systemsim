import {helpData} from "../data/help.js";
import {decodeExeName, printBinaryObject, sanitizeHtml, sleep} from "../utils.js";
import {Filesystem} from "../entities/filesystem.js";

const completionsMap = {
  cat: 'cat PATH',
  cd: 'cd PATH',
  cp: 'cp PATH PATH',
  help: 'help [COMMAND]',
  ls: 'ls [PATH]',
  poweroff: 'poweroff',
  rm: 'rm PATH',
  // Note: actual exec name is replaced in the list below
  curl: 'curl [-O] METHOD',
  links: 'links URL',
  m4r10k4rt: 'm4r10k4rt',
  noop: 'noop',
  installos: 'installos [PATH]',
}

export class Shell {
  game;
  computer;

  init(ctx) {
    this.game = ctx.game;
    this.computer = ctx.computer;

    this.game.enableInputHistory(true);
    this.refreshCompletions();
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

    // Cleanup
    if (!this.computer.fs()) return;  // Nothing to do, last command has shut down the pc / unmounted the fs
    this.refreshCompletions();
  }

  async executeProgram(programName) {
    // Dynamically import programs, to make initial load faster and for realism
    switch (programName) {
      case 'curl': {
        const curlModule = await import('./curl.js');
        curlModule.curl(this.game);
        break;
      }
      case 'installos': {
        const installOsModule = await import('./install-os.js');
        await installOsModule.installOs(this.game, this.computer);
        break;
      }
      case 'links': {
        const linksModule = await import('./links.js');
        await linksModule.links(this.game);
        break;
      }
      case 'm4r10k4rt': {
        const m4r10k4rtModule = await import('./m4r10k4rt.js');
        await m4r10k4rtModule.m4r10k4rt(this.game);
        break;
      }
      case 'noop':
        this.computer.print('<br />');
        break;
      case 'watrar': {
        const watrarModule = await import('./watrar.js');
        await watrarModule.watrar(this.game);
        break;
      }
      default:
        this.computer.print(`${this.game.getArgv(0)} is not an executable file.<br /><br />`);
        break;
    }
  }

  refreshCompletions() {
    const completions = Object.keys(this.getCommandsDict()).map((c) => completionsMap[c]);

    const localFiles = this.computer.fs().ls();
    const binFiles = this.computer.fs().ls('/bin');

    const programFiles = [
      ...localFiles.map((f) => ({ name: f, path: this.computer.fs().abspath(f) })),
      ...binFiles.map((f) => ({ name: f, path: this.computer.fs().abspath(Filesystem.joinpath('/bin', f)) })),
    ];

    for (const file of programFiles) {
      const program = this.computer.fs().get(file.path);
      if (!program || program.type !== 'exe') continue;
      const programName = decodeExeName(program.contents);
      let completion = completionsMap[programName];
      if (!completion) continue;
      completion = completion.replace(programName, file.name);
      completions.push(completion);
    }

    this.game.setupCompletion([...new Set(completions.filter((c) => !!c))]);
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
    else if (!file.contents) this.computer.print('<br />');
    else if (typeof file.contents === 'string') this.computer.print(sanitizeHtml(file.contents) + '<br />');
    else this.computer.print(sanitizeHtml(printBinaryObject(file.contents)) + '<br />');
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
