import {DeskSideBags} from './managers/desk-side-bags.js';
import {Filesystem} from './entities/filesystem.js';
import {InputHistory} from './managers/input-history.js';
import {Notepad} from './managers/notepad.js';
import {asciiart} from './data/asciiart.js';
import {decodeExeName, encodeExeName, longestCommonPrefixSorted, sanitizeHtml, sleep} from './utils.js';
import {sh} from "./programs/sh.js";
import {curl} from "./programs/curl.js";
import {m4r10k4rt} from "./programs/m4r10k4rt.js";
import {booksData} from "./data/books.js";

export class Game {
  // Persistent state
  deskSideBags = new DeskSideBags();
  drawer1 = [
    {
      name: 'history-of-computer-industry',
      type: 'book',
      actions: ['open', 'move-to-bookcase'],
      contents: booksData.get('history-of-computer-industry'),
    }
  ];
  filesystems = {
    'localhost': new Filesystem({
      pwd: '/root', fsMap: new Map([
        ['/bin', 'dir'],
        ['/bin/curl', { type: 'exe', contents: 'ELF' + encodeExeName('curl', 306) }],
        ['/bin/nologin', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 10) }],
        ['/bin/sh', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 920) }],
        ['/boot', 'dir'],
        ['/boot/kernel', { type: 'bin', contents: 'ELF' + encodeExeName('kernel', 2210) }],
        ['/boot/initrd', { type: 'bin', contents: 'ELF' + encodeExeName('initrd', 3211) }],
        ['/etc', 'dir'],
        ['/etc/passwd', {
          contents: '#name:pass:uid:gid:comment:home:shell\n' +
            '# If pass == "x", the hashed password is stored in the shadow file.\n' +
            'root:x:0:0:root:/root:/bin/sh\n' +
            'bin:x:1:1::/:/bin/nologin\n' +
            'nobody:x:65534:65534:Kernel Overflow User:/:/bin/nologin'
        }],
        ['/mnt', 'dir'],
        ['/root', 'dir'],
        ['/root/notes.txt', {contents: '104.122.199.11 - local high school'}],
        ['/share', 'dir'],
        ['/share/wordlists', 'dir'],
      ])
    }),
    'exploit-db.com': new Filesystem({
      fsMap: new Map([
        ['/srv', 'dir'],
        ['/srv/index.html', {contents: '<h1>Exploit-DB</h1><a href="/vulnerabilities/index.html">Known vulnerabilities list</a><a href="/ghacks/index.html">Vulnerable site search hacks</a>'}],
        ['/srv/vulnerabilities', 'dir'],
        ['/srv/vulnerabilities/index.html', {
          contents: '<h1>List of known vulnerabilities</h1>' +
            '<table><thead><th>ID</th><th>Software</th><th>Version</th><th>Type</th><th>Year</th><th>Title</th></thead>' +
            '<tbody><td>12804</td><td>Nginx</td><td>0.6.36</td><td>Remote</td><td>2010</td><td><a href="/vulnerabilites/12804.html">Directory Traversal</a></td></tbody></table>'
        }],
        ['/srv/vulnerabilities/12804.html', {
          contents: '##[Path Traversal:]\n' +
            'A Path Traversal attack aims to access files and directories that are stored\n' +
            'outside the web root folder. By browsing the application, the attacker looks\n' +
            'for absolute links to files stored on the web server. By manipulating\n' +
            'variables that reference files with “dot-dot-slash (../)” sequences and its\n' +
            'variations, it may be possible to access arbitrary files and directories\n' +
            'stored on file system, including application source code, configuration and\n' +
            'critical system files, limited by system operational access control. The\n' +
            'attacker uses “../” sequences to move up to root directory, thus permitting\n' +
            'navigation through the file system. (owasp.org)\n' +
            '#\n' +
            'example.com/../etc/passwd\n'
        }],
        ['/srv/ghacks', 'dir'],
        ['/srv/ghacks/index.html', {contents: '<h1>Goggle search hacks for finding vulnerable sites</h1><table><thead><th>Type</th><th>Year</th><th>Title</th></thead><tbody></tbody></table>'}],
      ])
    }),
    'foogal.co.uk': new Filesystem({
      fsMap: new Map([
        ['/srv', 'dir'],
        ['/srv/index.html', {contents: '<h1>Foogal</h1><h2>A place for all things foogal</h2><p>Cremes and colours, crafts and bath crystals, oh my!</p><a href="/login.html">Manage my Foogal page</a>' +
          '<p>Meet our prominent members:</p><ul><li><a href="/foogal/charly.html">Charly</a></li><li><a href="/foogal/athena.html">Athena</a></li><li><a href="/foogal/admin.html">Vickie</a></li></ul>'}],
        ['/srv/foogal/athena.html', {contents: '<h1>Foogal page</h1><p>This is a page about Athena\'s foogal fingers.</p>'}],
        ['/srv/foogal/charly.html', {contents: '<h1>Foogal page</h1><p>This is a page about Charly\'s colorful crafts.</p>'}],
        ['/srv/foogal/admin.html', {contents: '<h1>Foogal page</h1><p>This is a page about Vickie\'s administrative duties.</p>'}],
        ['/srv/login.html', {contents: '<form method="post">' +
          '<label for="fname">Foogal login:</label><br><input type="text" id="fname" name="fname"><br>' +
          '<label for="pass">Password:</label><br><input type="text" id="pass" name="pass"><br><br>' +
          '<input type="submit" value="Submit"></form>'}],
        ['srv/content', 'dir'],
        ['srv/content/athena', 'dir'],
        ['srv/content/charly', 'dir'],
        ['srv/content/vickie', 'dir'],
      ])
    }),
    'owasp.org': new Filesystem({
      fsMap: new Map([
        ['/srv', 'dir'],
        ['/srv/index.html', {
          contents: '<h1>OWASP Foundation</h1><h2>Explore the world of cyber security</h2>' +
            '<a href="/top5.html">OWASP Top 5 list of common vulnerabilities</a>'
        }],
        ['/srv/top5.html', {
          contents: '<h1>OWASP Top 5 list of common vulnerabilities (2021)</h1>' +
            '<table><thead><th>#</th><th>Category</th><th>Description</th><th>Example</th></thead><tbody>' +
            '<tr><td>1</td><td>Broken Access Control</td><td>The application does not properly restrict access to authenticated users.</td>' +
            '<td>User A can access user B\'s resources by guessing the user ID or the resource ID and manipulating the request URL. ' +
            'e.g.: https://example.com/user/1/resources -- change the URL to https://example.com/user/2/resources. Or: ' +
            'https://example.com/resources/1 -- change the URL to https://example.com/resources/56. ' +
            'A well-protected application would not allow user 1 to access to the latter URLs, as the resources do not belong to the user that is making the request.</td></tr>' +
            '<tr><td>2</td><td>Cryptographic failures</td><td>The application does not (properly) encrypt sensitive information.</td>' +
            '<td>A file containing passwords is stored in plaintext at https://example.com/passwords-1.txt. ' +
            'An attacker can use a common paths wordlist to perform a brute force attack and retrieve the passwords.</td></tr>' +
            '<tr><td>3</td><td>Injection</td><td>The application does not properly sanitize user-supplied input.</td>' +
            '<td>An attacker can input SQL statements or shell commands into a form field that will be executed by the application.</td></tr>' +
            '<tr><td>4</td><td>Insecure design</td><td>The application has a feature that is not securely designed.</td>' +
            '<td>A blog has a feature for resetting passwords by answering a security question. The question is what is the user\'s favorite show.' +
            'The user\'s blog contains multiple references to the show \'star wars\'.</td></tr>' +
            '<tr><td>5</td><td>Security misconfiguration</td><td>Vulnerabilities that occur when security could have been appropriately configured but was not.</td>' +
            '<td>Developer has not disabled debug mode in the application. When an attacker requests a page that does not exist, ' +
            'the application will return a debug page that contains sensitive information like the server software and version, which can be used to find exploits.</td></tr>'
        }]
      ])
    }),
    '104.122.199.11': new Filesystem({
      fsMap: new Map([
        ['/', 'dir'],
        ['/etc', 'dir'],
        ['/etc/passwd', {
          contents: 'root:x:0:0:root:/root:/bin/sh\n' +
            'athena110717:x:1422:1422::/:/bin/sh\n' +
            'constantin160816:x:1421:1421::/:/bin/sh\n' +
            'hack3d222222:x:1429:1429::/:/bin/sh\n' +
            'maksim220724:x:1432:1432::/:/bin/sh\n'
        }],
        ['/srv', 'dir'],
        ['/srv/index.html', {
          contents: '<h2>Login</h2><form method="post">' +
            '<label for="fname">Student username:</label><br><input type="text" id="fname" name="fname"><br>' +
            '<label for="pass">Password:</label><br><input type="text" id="pass" name="pass"><br><br>' +
            '<input type="submit" value="Submit"></form><!-- Use username "guest" and password "guest" for guest access -->'
        }],
        ['/srv/not-found.html', {contents: '<p>Page not found</p><p>Nginx 0.6.2</p>'}],
        ['/srv/students', 'dir'],
        ['/srv/students/athena110717', 'dir'],
        ['/srv/students/athena110717/sitse.txt', {contents: 'foogal.co.uk pass = "autumnleaves" + birthyear\nwww.watrar.com Free compressed files profram'}],
        ['/srv/students/constantin160816', 'dir'],
        ['/srv/students/constantin160816/todo.txt', {
          contents: 'Prepare ppt for ebikes\nProf tyranossaurus Tex asked us to install an ancient browser from projects.mikl-ptoska.cz/links\n' +
            'curl -O <rest of stuff> to download a file as A ***** FILE\nMan pages has more stuff for program options, see uni site'
        }],
        ['/srv/students/constantin160816/ebikes.pdf', 'file'],
        ['/srv/students/guest', 'dir'],
        ['/srv/students/guest/m4r10k4rt.exe', { type: 'exe', contents: 'MZ' + encodeExeName('m4r10k4rt', 48) }],
        ['/srv/students/hack3d222222', 'dir'],
        ['/srv/students/hack3d222222/notes.txt', {
          contents: 'Lol school servers are total swiss cheese, I got in in like 3 minutes and an exploit search. ' +
            'Im gonna try crack the root pass, the specs are ok for a ddos zombie. Any other bros are welcome to install their own worms for attacks, it\'s not ' +
            'like this teapot can mine crypto.\n' +
            'If you are the admin reading this, upgrade your rotting nginx man, like, you\'re being paid a wage to *at least* do this once in a while.'
        }],
        ['/srv/students/hack3d222222/wordlists', 'dir'],
        ['/srv/students/hack3d222222/wordlists/nginx-paths.txt', 'file'],
        ['/srv/students/hack3d222222/wordlists/admin-passes-top10000.txt', 'file'],
        ['/srv/students/maksim220724', 'dir'],
        ['/srv/students/maksim220724/combustion-liquid-fuel-rockets.doc', 'file'],
        ['/srv/students/maksim220724/remote-cruise-control.doc', 'file'],
      ])
    }),
  };
  memorySticks = [
    {
      size: '16GB',
      type: 'USB-A 3.0',
      readOnly: true,
      description: 'a live USB with a Linux distribution on it. It was used to originally set up the computer.',
      mounted: false,
      fs: new Filesystem({
        fsMap: new Map([
          ['/', 'dir'],
          ['/bin', 'dir'],
          ['/bin/curl', { type: 'exe', contents: 'ELF' + encodeExeName('curl', 306) }],
          ['/bin/nologin', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 10) }],
          ['/bin/sh', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 920) }],
          ['/boot', 'dir'],
          ['/boot/kernel', { type: 'bin', contents: 'ELF' + encodeExeName('kernel', 2210) }],
          ['/boot/initrd', { type: 'bin', contents: 'ELF' + encodeExeName('initrd', 3211) }],
        ])
      })
    },
    {
      size: '8GB', type: 'USB-A 3.0', readOnly: false, description: 'empty.', mounted: false, fs: new Filesystem({
        fsMap: new Map([
          ['/', 'dir'],
        ])
      })
    },
    {
      size: '32GB',
      type: 'USB-C 3.1',
      readOnly: false,
      description: 'labeled \'Files\', and is mostly empty.',
      mounted: false,
      fs: new Filesystem({
        fsMap: new Map([
          ['/', 'dir'],
          ['/tools', 'dir'],
          ['/tools/dig', 'exe'],
          ['/tools/dig.txt', {
            contents: 'Dig - get the ip address of a website e.g. dig www.goggle.com --> 123.123.123.123\n' +
              'Supposedly can do more things like trace the process of how the domain is resolved, but I haven\'t tried it yet'
          }],
        ])
      })
    },
  ];
  notepad = new Notepad();
  state = 'init';

  // Transient state
  input = '';
  inputHistory = new InputHistory();
  possibleActions = [];
  prompt = '';
  terminalBuffer = [];
  terminalState = 'exec';

  constructor() {
  }

  async init() {
    // Game init sequence
    const terminalElem = document.getElementById('terminal');
    terminalElem.innerHTML = '';
    await sleep(100);
    terminalElem.innerHTML = 'Entering fullscreen mode...<br /><br />';
    await sleep(400);
    terminalElem.classList.add('monospace');
    await sleep(1000);
    terminalElem.classList.add('terminal12px');
    await sleep(1000);
    terminalElem.classList.add('nocursor');
    await sleep(500);
    terminalElem.innerHTML += 'No player data found. Starting new game.';
    await sleep(1500);
    terminalElem.innerHTML = '';
    await sleep(1500);

    // Bind events
    document.addEventListener('keydown', async (e) => {
      // Allow F11 fullscreen toggle
      if (e.key === 'F11') return;
      // Allow taking screenshots (print screen, ctrl+shift+p, F12)
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'KeyP') || e.key === 'F12') return;

      e.preventDefault();
      e.stopPropagation();
      if (this.terminalState !== 'input') return;

      if (/^[\w !@#$%^&*()\-+{}|~=`<>,.?/\\;:"']$/.test(e.key)) {
        this.input = this.input + e.key;
        this.inputHistory.type(this.input);
        await this.render();
      } else {
        switch (e.key) {
          case 'Enter':
            if (this.input.length <= 0) return;
            this.terminalBuffer.push(this.renderPrompt() + this.input + '<br />');
            this.inputHistory.push(this.input);
            this.terminalState = 'exec';
            await this.refresh();
            break;
          case 'Backspace':
            this.input = this.input.slice(0, -1);
            this.inputHistory.type(this.input);
            await this.render();
            break;
          case 'Tab': {
            const matches = this.possibleActions
              .flatMap(action => typeof action === 'string' ? [action] : action.actions)
              .filter(action => action.startsWith(this.input))
              .map(action => action.split(' ')[0])
              .sort((a, b) => b.length - a.length);
            const commonPrefix = longestCommonPrefixSorted(matches);

            if (commonPrefix.length > 0) {
              this.input = commonPrefix.split(' ')[0];
              this.inputHistory.type(this.input);
              await this.render();
            }
            break;
          }
          case 'ArrowUp':
            this.input = this.inputHistory.retrieve(-1) ?? this.input;
            await this.render();
            break;
          case 'ArrowDown':
            this.input = this.inputHistory.retrieve(1) ?? this.input;
            await this.render();
            break;
          default:
            console.warn(`Unhandled key: ${e.key}`);
            break;
        }
      }
    });

    // Main game loop
    await this.refresh();
  }

  async refresh() {
    if (this.terminalState === 'exec') {
      switch (this.state) {
        case 'init':
          switch (this.input) {
            case '':
              this.print('You are sitting at your desk, in front of your home computer. It is currently shut down.<br />');
              this.possibleActions = ['boot', 'inspect', 'stand'];
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'boot':
              return this.switchState('boot', {cls: true});
            case 'inspect':
              return this.switchState('inspect-desk');
            case 'stand':
              return this.switchState('inspect-room');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'inspect-desk-bags':
          switch (this.getArgv(0)) {
            case '':
              this.print('You search the bags. There is:<br />' + this.deskSideBags.render());
              this.possibleActions = ['cleanup-trash', 'back'];
              if (this.deskSideBags.areEmpty())
                this.possibleActions = this.possibleActions.filter((action) => action !== 'cleanup-trash');
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'cleanup-trash':
              this.print('You clean up the trash.<br />');
              await sleep(600);
              this.deskSideBags.cleanupTrash();
              this.print('Now there is:<br />' + this.deskSideBags.render());
              if (this.deskSideBags.areEmpty())
                this.possibleActions = this.possibleActions.filter((action) => action !== 'cleanup-trash');
              this.waitInput();
              break;
            case 'back':
              return this.switchState('inspect-desk');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'inspect-desk':
          switch (this.getArgv(0)) {
            case '': {
              this.print('You look at the desk.<br />');
              await sleep(600);
              this.setAsciiArt('desk');
              const bagsPrompt = this.deskSideBags.areEmpty() ? '' : ' Next to it a few paper bags are leaning on its side.';
              this.print('On top of it, from left to right, there is a family picture, a small pile of memory sticks, a pile of electronics, and a large notepad with a pen.<br />' +
                `It has three drawers in one side, and the computer tower on the other one.${bagsPrompt}<br />`);
              await sleep(600);
              this.possibleActions = ['picture', 'memorysticks', 'electronics', 'notepad', {
                render: 'drawer1/2/3',
                actions: ['drawer1', 'drawer2', 'drawer3']
              }, 'tower', 'bags', 'boot', 'stand'];
              if (this.deskSideBags.areEmpty())
                this.possibleActions = this.possibleActions.filter((action) => action !== 'bags');
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            }
            case 'picture':
              this.print('You look at the picture.<br />');
              await sleep(600);
              this.print(
                'It is a picture of your parents, with you in the middle. They are holding you from the hands, one hand each.<br />' +
                'The date on the photo is 2006 May 16.<br />');
              await sleep(600);
              this.waitInput();
              break;
            case 'memorysticks':
              return this.switchState('inspect-memorysticks');
            case 'electronics':
              this.print(
                'The pile of electronics contains:<br />' +
                '- 2 RFID tags, opened with their contacts exposed.<br />' +
                '- A soldering iron, solder and flux.<br />' +
                '- 1.5 meter of USB 3.0 cable.<br />' +
                '- 2 meters of low voltage cable, solid core.<br />' +
                '- A sachel of about 10 MOSFETs.<br />');
              this.waitInput();
              break;
            case 'notepad':
              this.print('A large notepad with a pen is on the desk.<br />');
              return this.switchState('inspect-notepad');
            case 'drawer1':
              this.print(
                'You open the first drawer. It contains:<br />' +
                '- A book about the history of the computer industry.<br />' +
                '- A USB-A to USB-C 3.0 cable.<br />' +
                '- A TV remote control for your monitor, unused.<br />' +
                '- 3 AAA batteries.<br />' +
                '- A box of paper clips.<br />');
              if (!this.possibleActions.includes('read-book'))
                this.possibleActions.push('read-book');
              this.waitInput();
              break;
            case 'drawer2':
              this.print(
                'You open the second drawer. It contains:<br />' +
                '- 2 AA batteries, expired.<br />' +
                '- A spoon.<br />' +
                '- A stack of sticky notes.<br />' +
                '- A syringe of thermal paste.<br />' +
                '- An old low-performance CPU cooler.<br />');
              this.waitInput();
              break;
            case 'drawer3':
              this.print(
                'You open the third drawer. It contains:<br />' +
                '- A pair of over-ear headphones. The plastic coating of the muffs is chipped.<br />' +
                '- A pair of trousers.<br />' +
                '- A fork with some steel wire wrapped around it.<br />' +
                '- A bottle of cologne.<br />' +
                '- A packet of tissues.<br />');
              this.waitInput();
              break;
            case 'tower':
              this.print(
                'You open the computer tower. It is equipped with:<br />' +
                '- 1 GB of DDR3 RAM @800 MHz.<br />' +
                '- A dual-core 4th generation CPU @2.7 GHz w/ 2MB cache, overclocked to 2.835 GHz.<br />' +
                '- A 4-5th gen chipset motherboard with support for up to 16GB of RAM @1.6 GHz.<br />' +
                '- A 1TB HDD with a SATA interface.<br />' +
                '- No graphics card.<br />' +
                '- A 300 W power supply.<br />');
              this.waitInput();
              break;
            case 'bags':
              return this.switchState('inspect-desk-bags');
            case 'boot':
              return this.switchState('boot', {cls: true});
            case 'read-book':
              this.print('You open the computer history book.<br />');
              await sleep(600);
              return this.switchState('computer-history-book');
            case 'stand':
              this.print('You stand up.<br />');
              await sleep(600);
              return this.switchState('inspect-room');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'computer-history-book':
          switch (this.getArgv(0)) {
            case '':
              this.print('The book contains the following chapters:<br />' +
                '1 - HTTP Methods<br />' +
                '2 - HTTP Headers<br />' +
                '3 - Appendix<br />');
              this.possibleActions = ['chapter [x]', 'back'];
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'chapter': {
              const book = this.drawer1[0];
              const index = this.getArgvInt(1) - 1;
              if (index < 0 || index >= book.contents.length) {
                this.print(`Invalid chapter: ${index + 1}<br />`);
              } else {
                this.print(sanitizeHtml(book.contents[index].contents) + '<br />');
                this.waitInput();
              }
              break;
            }
            case 'back':
              return this.switchState('inspect-desk');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'inspect-memorysticks':
          switch (this.getArgv(0)) {
            case '':
              this.setAsciiArt('memorySticks');
              this.print(
                `There are ${this.memorySticks.length} memory sticks in the pile:<br />` +
                this.memorySticks.map((stick, i) => `- Stick ${i + 1} (${stick.size}, ${stick.type}) is ${stick.description}${stick.mounted ? ' Currently mounted.' : ''}<br />`).join(''));
              this.possibleActions = ['eject [x]', 'mount [x]', 'back'];
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'eject': {
              const index = this.getArgvInt(1) - 1;
              if (index < 0 || index >= this.memorySticks.length) {
                this.print(`Invalid memory stick index: ${index + 1}<br />`);
              } else {
                const memoryStick = this.memorySticks[index];
                if (memoryStick.mounted) {
                  memoryStick.mounted = false;
                  this.print(`You eject memory stick ${index + 1}.<br />`);
                } else {
                  this.print(`Memory stick ${index + 1} is not mounted.<br />`);
                }
              }
              this.waitInput();
              break;
            }
            case 'mount': {
              const index = this.getArgvInt(1) - 1;
              if (index < 0 || index >= this.memorySticks.length) {
                this.print(`Invalid memory stick index: ${index + 1}<br />`);
              } else {
                const memoryStick = this.memorySticks[index];
                if (!memoryStick.mounted) {
                  memoryStick.mounted = true;
                  this.print(`You mount memory stick ${index + 1}.<br />`);
                } else {
                  this.print(`Memory stick ${index + 1} is already mounted.<br />`);
                }
              }
              this.waitInput();
              break;
            }
            case 'back':
              return this.switchState('inspect-desk');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'inspect-notepad':
          switch (this.getArgv(0)) {
            case '':
              this.print(this.notepad.render());
              this.possibleActions = ['page [x]', 'next', 'prev', 'back'];
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'next':
              this.notepad.goto(this.notepad.page + 1, {onerror: () => this.print('This is the last page.<br />')});
              this.print(this.notepad.render());
              this.waitInput();
              break;
            case 'prev':
              this.notepad.goto(this.notepad.page - 1, {onerror: () => this.print('This is the first page.<br />')});
              this.print(this.notepad.render());
              this.waitInput();
              break;
            case 'page': {
              const index = this.getArgvInt(1) - 1;
              this.notepad.goto(index, {onerror: () => this.print(`Invalid page: ${index + 1}<br />`)});
              this.print(this.notepad.render());
              this.waitInput();
              break;
            }
            case 'back':
              return this.switchState('inspect-desk');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'boot':
          switch (this.getArgv(0)) {
            case '':
              await sleep(300);
              this.print('&gt; Loading kernel... ');
              await sleep(700);
              const file = this.filesystems['localhost'].get('/boot/kernel');
              if (!file) {
                await sleep(2000);
                this.print('MISSING<br />');
                await sleep(1000);
                this.print('&gt; Poweroff<br />');
                await sleep(1000);
                return await this.poweroff();
              }
              this.print('OK<br />' +
                '&gt; Loading boot image... ');
              await sleep(1000);
              this.inputHistory.enabled = true;
              this.print('OK<br />' +
                '&gt; System initialized.<br />For a list of commands, type \'help\'.<br /><br />');
              await sleep(500);
              this.possibleActions = ['cat [path]', 'cd [path]', 'help [command]', 'ls [path]', 'poweroff'];
              this.waitInput(`${this.filesystems['localhost'].pwd} # `);
              break;
            case 'cat': {
              sh.cat(this);
              this.waitInput();
              break;
            }
            case 'help':
              sh.help(this);
              this.waitInput();
              break;
            case 'cd': {
              sh.cd(this);
              this.waitInput(`${this.filesystems['localhost'].pwd} # `);
              break;
            }
            case 'ls':
              sh.ls(this);
              this.waitInput();
              break;
            case 'poweroff':
              return await sh.poweroff(this);
            case 'rm':
              sh.rm(this);
              this.waitInput();
              break;
            default: {
              // Programs
              const localProgram = this.filesystems['localhost'].get(this.getArgv(0));
              const binProgram = this.filesystems['localhost'].get(Filesystem.joinpath('/bin', this.getArgv(0)));
              if (!localProgram && !binProgram) {
                this.print(`Unknown command: ${this.getArgv(0)}<br />For a list of commands, type 'help'.<br /><br />`);
                this.waitInput();
                break;
              }
              const programName = decodeExeName(localProgram?.contents ?? binProgram?.contents);

              switch (programName) {
                case 'curl':
                  curl(this);
                  break;
                case 'm4r10k4rt':
                  return await m4r10k4rt(this);
                case 'noop':
                  this.print('<br />');
                  this.waitInput();
                  break;
                default:
                  this.print(`${this.getArgv(0)} is not an executable file.<br /><br />`);
                  this.waitInput();
                  break;
              }

              this.waitInput();
              break;
            }
          }
          break;
        case 'inspect-room':
          switch (this.getArgv(0)) {
            case '':
              this.possibleActions = ['bookcase', 'desk', 'outside'];
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'bookcase':
              this.print('You look at the bookcase.<br />' +
                'It is a small bookcase with a few books on it, and a couple of cabinets at the bottom.<br />' +
                'The first cabinet contains monitor cables and a pair of shoes.<br />' +
                'The second cabinet contains clothes.<br />' +
                'The bookcase itself contains books about programming languages, and some novels.<br />');
              await sleep(600);
              this.waitInput();
              break;
            case 'desk':
              return this.switchState('init');
            case 'outside':
              this.print('You exit the room.<br />');
              await sleep(1000);
              return this.switchState('outside', {cls: true});
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'outside':
          switch (this.getArgv(0)) {
            case '':
              this.possibleActions = ['home', 'convenience-store', 'bills-computer-shop', 'coffee-shop', 'home-depot'];
              this.waitInput('Go where? [%actions%]<br /><br />Action: ');
              break;
            case 'home':
              this.print('You return to your home.<br />');
              await sleep(1000);
              return this.switchState('inspect-room', {cls: true});
            case 'convenience-store':
              return this.switchState('convenience-store');
            case 'bills-computer-shop':
              this.print('You don\'t need anything from the computer shop right now.<br />');
              this.waitInput();
              break;
            // return this.switchState('bills-computer-shop');
            case 'coffee-shop':
              this.print('You don\'t need anything from the coffee shop right now.<br />');
              this.waitInput();
              break;
            // return this.switchState('coffee-shop');
            case 'home-depot':
              this.print('You don\'t need anything from the home depot right now.<br />');
              this.waitInput();
              break;
            // return this.switchState('home-depot');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
        case 'convenience-store':
          switch (this.getArgv(0)) {
            case '':
              this.possibleActions = ['newspapers', 'outside'];
              this.waitInput('Possible actions: [%actions%]<br /><br />Action: ');
              break;
            case 'newspapers':
              this.print('You look at the digital newspaper subscription ads. The headlines are:<br />' +
                '- The ePhone to replace all ePhones: Meet the new eGalaxy Cluster<br />' +
                '- Ablue vault heist - Thousands of private keys stolen - Macrosoft urges users to generate new keys<br />' +
                '- EnvyTech to invest up to $100 million in cryptocurrency - stock markets worried<br />' +
                '- Metaspace AR: Get your own digital flower with only $6/mo!<br />');
              await sleep(600);
              this.waitInput();
              break;
            case 'outside':
              this.print('You exit the convenience store.<br />');
              return this.switchState('outside');
            default:
              this.print('Invalid action. ');
              this.waitInput();
              break;
          }
          break;
      }
    }
  }

  addAchievement(name) {
    const achievements = localStorage.getItem('systemsim-achievements');
    if (!achievements) {
      localStorage.setItem('systemsim-achievements', JSON.stringify([name]));
    } else {
      const achievementsList = JSON.parse(achievements);
      if (!achievementsList.includes(name)) {
        achievementsList.push(name);
        localStorage.setItem('systemsim-achievements', JSON.stringify(achievementsList));
      }
    }
  }

  cls() {
    document.getElementById('terminal').innerHTML = '';
    this.terminalBuffer = [];
  }

  getArgv(index, defaultValue = '') {
    const terms = this.input?.split(' ');
    if (!terms || terms.length === 0) return defaultValue;

    const realIndex = (index >= 0) ? index : (terms.length + index);
    return terms[realIndex] ?? defaultValue;
  }

  getArgvInt(index, defaultValue = 0) {
    return parseInt(this.getArgv(index, defaultValue.toString()));
  }

  getSwitch(short, long, defaultValue = false) {
    const terms = this.input?.split(' ');
    if (!terms || terms.length === 0) return defaultValue;

    const shortSwitchParams = terms.filter(term => term.match(/^-[a-zA-Z]+$/));
    const shortSwitches = new Set(shortSwitchParams
      .map(param => param.slice(1))
      .flatMap(param => param.split('')));
    if (shortSwitches.has(short)) return true;

    const longSwitchParams = terms.filter(term => term.match(/^--[a-zA-Z]+$/));
    const longSwitches = new Set(longSwitchParams
      .map(param => param.slice(2)));
    if (longSwitches.has(long)) return true;

    return defaultValue;
  }

  hasAchievement(name) {
    const achievements = localStorage.getItem('systemsim-achievements');
    if (!achievements) return false;
    const achievementsList = JSON.parse(achievements);
    return achievementsList.includes(name);
  }

  render() {
    const terminalElem = document.getElementById('terminal');

    if (this.terminalState === 'input') {
      terminalElem.innerHTML = this.terminalBuffer.join('') + this.renderPrompt() + this.input;
    } else {
      terminalElem.innerHTML = this.terminalBuffer.join('');
    }

    // Scroll to bottom
    terminalElem.scroll(0, terminalElem.scrollHeight);
  }

  renderPrompt() {
    let promptActions = '';
    for (let i = 0; i < this.possibleActions.length; i++) {
      const action = typeof this.possibleActions[i] === 'string' ? this.possibleActions[i] : this.possibleActions[i].render;
      promptActions += action;
      if (i < this.possibleActions.length - 1) {
        if (action.includes(' ')) {
          promptActions += ', ';
        } else {
          promptActions += ' ';
        }
      }
    }

    return this.prompt.replace('%actions%', promptActions);
  }

  print(text) {
    this.terminalBuffer.push(text);
    this.render();
  }

  async poweroff(drama = 1000) {
    this.cls();
    this.inputHistory.enabled = false;
    await sleep(drama);
    return this.switchState('init');
  }

  setAsciiArt(asciiArtId) {
    const asciiArtLayers = [document.getElementById('asciiart')];
    for (let i = 2; i <= 3; i++) {
      asciiArtLayers.push(document.getElementById(`asciiart-l${i}`))
    }

    if (!asciiArtId) {
      for (const layer of asciiArtLayers) {
        layer.innerHTML = '';
        layer.style = null;
      }
      return;
    }

    for (let i = 1; i <= 3; i++) {
      const layer = asciiArtLayers[i - 1];
      const layerId = i === 1 ? asciiArtId : `${asciiArtId}-layer${i}`;

      layer.innerHTML = asciiart[layerId] ?? '';

      const extraStyle = asciiart[`${layerId}-style`];
      const extraStyles = asciiart[`${layerId}-styles`] ?? [];
      if (extraStyle) {
        extraStyles.push(extraStyle);
      }
      for (const style of extraStyles) {
        if (style.condition) {
          if (!style.condition(this)) {
            continue;
          }
        }
        for (const key in style) {
          if (key === 'condition') continue;
          layer.style[key] = style[key];
        }
      }
    }
  }

  async switchState(state, options = {cls: false}) {
    this.state = state;
    this.input = '';
    this.setAsciiArt(undefined);

    if (options.cls) {
      this.cls();
    }

    return this.refresh();
  }

  waitInput(prompt) {
    this.input = '';
    if (prompt) {
      this.prompt = prompt;
    }

    this.terminalState = 'input';

    this.render();
  }
}