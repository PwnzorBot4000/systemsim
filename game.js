import {DeskSideBags} from './desk-side-bags.js';
import {Filesystem} from './filesystem.js';
import {InputHistory} from './input-history.js';
import {Notepad} from './notepad.js';
import {longestCommonPrefixSorted, sanitizeHtml, sleep} from './utils.js';

export class Game {
  // Persistent state
  deskSideBags = new DeskSideBags();
  drawer1 = [
    {
      name: 'history-of-computer-industry', type: 'book', actions: ['open', 'move-to-bookcase'], contents: [
        {
          type: 'chapter', name: 'http-methods', contents:
            '[...] To interact with a system using the HTTP protocol, one needs to think of the system as a collection of resources.\n' +
            'A resource is an entity that can be identified by a URI (Uniform Resource Identifier), also known as a \'path\' inside the system.\n' +
            'The HTTP protocol defines a set of methods that can be used to interact with resources. These methods are:\n' +
            '- GET: Retrieve the contents of a resource\n' +
            '- POST: Create a new resource\n' +
            '- PUT: Update (replace or upsert) a resource\n' +
            '- DELETE: Delete a resource\n' +
            '- OPTIONS: Retrieve the list of methods supported by a resource\n' +
            'Accessing the resources of a system in this way comprises the \'REST\' methodology, which stands for \'REpresentational State Transfer\'.\n' +
            'This methodology defines a set of constraints that must be met by a system in order to be considered RESTful.\n' +
            'The constraints are:\n' +
            '- Client-Server: The system must be a client-server system, where the client is the user and the server is the system.\n' +
            '- Stateless: The system must be stateless, meaning that it does not maintain any information about the state of the system between requests.\n' +
            '- Uniform Interface: The system must have a uniform interface, meaning that it should have the same methods and parameters for all resources.\n' +
            '[...]\n' +
            'This is in contrast to the older \'SOAP\' methodology, which is more focused on the communication between a client and a server.\n' +
            '[...]\n' +
            '(Some hand-written notes lie at the bottom of the page:\n' +
            '"- POST can be called multiple times and a new resource will be created for each call"\n' +
            '"- e.g. POST /potatoes with body { "content": "starch" } will create potatoes 1,2,3,4,5..."\n' +
            '"- PUT will update the same resource every time, it is \'idempotent\'"\n' +
            '"- e.g. PUT /potatoes/1 with body { "content": "starch" } will always update the first potato"\n'
        },
        {
          type: 'chapter', name: 'http-headers', contents:
            '[...] The HTTP protocol defines a set of headers that can be used to provide additional information about a request or a response.\n' +
            'These headers are:\n' +
            '- Content-Type: The type of the content being sent.\n' +
            '- Last-Modified: The last modified date of the resource being created or updated.\n' +
            '- Accept: The content types that the client can accept.\n' +
            '- Accept-Encoding: The content encodings that the client can accept.\n' +
            '- Authorization: The authorization credentials of the client.\n' +
            '- True-Client-IP: The true IP address of the client.\n' +
            '- Cookie: The cookies of the client.\n' +
            '- Set-Cookie: The cookies that the server wants to set.\n' +
            '[...]\n'
        },
        {
          type: 'chapter', name: 'appendix', contents:
            '[...]\n' +
            'Library of Computer Science\n' +
            'School of Electrical and Computer Engineering\n' +
            'Technical University of Continued Education\n' +
            'cslib.ece.tuce.edu\n' +
            '[...]\n'
        },
      ]
    }
  ];
  filesystems = {
    'localhost': new Filesystem({
      pwd: '/root', fsMap: new Map([
        ['/bin', 'dir'],
        ['/bin/curl', 'exe'],
        ['/bin/nologin', 'exe'],
        ['/bin/sh', 'exe'],
        ['/boot', 'dir'],
        ['/boot/kernel', 'bin'],
        ['/boot/initrd', 'bin'],
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
        ['/srv/students/guest/m4r10k4rt.exe', 'exe'],
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
          ['/bin/curl', 'exe'],
          ['/bin/nologin', 'exe'],
          ['/bin/sh', 'exe'],
          ['/boot', 'dir'],
          ['/boot/kernel', 'bin'],
          ['/boot/initrd', 'bin'],
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
              const path = this.getArgv(1);
              if (!path) {
                this.print('cat: missing operand<br />');
              } else {
                const file = this.filesystems['localhost'].get(path);
                if (!file) this.print('cat: File not found<br />');
                else if (file === 'dir') this.print('cat: Is a directory<br />');
                else if (file === 'bin' || file === 'exe') this.print('cat: Is a binary<br />');
                else this.print(sanitizeHtml(file?.contents ?? '') + '<br />');
              }
              this.waitInput();
              break;
            }
            case 'help':
              this.print(
                'cat PATH          - Display contents of a file<br />' +
                'cd PATH           - Change directory. Use \'..\' to go up a directory<br />' +
                'help [COMMAND]    - Display help for a command<br />' +
                'ls [PATH]         - List files in current directory<br />' +
                'poweroff          - Shut down the computer<br />' +
                'rm PATH           - Remove a file<br />' +
                '<br />' +
                'All binaries located in /bin can also be executed as commands.<br /><br />');
              this.waitInput();
              break;
            case 'cd': {
              const dir = this.getArgv(1);
              if (!dir) {
                this.print('cd: missing operand<br />');
              } else if (dir === '..') {
                this.filesystems['localhost'].goUp({onerror: () => this.print(`${dir}: No such directory<br />`)});
              } else {
                this.filesystems['localhost'].goIn(dir, {onerror: () => this.print(`${dir}: No such directory<br />`)});
              }
              this.waitInput(`${this.filesystems['localhost'].pwd} # `);
              break;
            }
            case 'curl': {
              const matches = this.input.match(/curl (-[A-Za-z]+ )*([A-Z]+) ([A-Za-z0-9-.]+)(\/.+)?/);
              if (!matches) {
                this.print('Usage: curl [options] METHOD HOST[/path]<br />' +
                  'Example: curl GET www.example.com<br />' +
                  'Example: curl GET 192.168.1.1/example.html<br />');
                this.waitInput();
                break;
              }
              const fs = this.filesystems[matches[matches.length - 2]];
              if (!fs) {
                this.print('curl: server does not exist<br />');
                this.waitInput();
                break;
              }
              const path = decodeURIComponent(matches[matches.length - 1] ?? '/');
              const internalPath = fs.joinpath('/srv', path);

              let contents = '';
              const file = fs.get(internalPath);
              if (file === 'dir') {
                const indexFile = fs.get(fs.joinpath(internalPath, 'index.html'));
                if (indexFile) {
                  contents = sanitizeHtml(indexFile.contents ?? '');
                } else {
                  contents = fs.ls(internalPath).join(' ');
                }
              } else if (file) {
                contents = sanitizeHtml(file.contents ?? '');
              } else {
                const notFound = fs.get('/srv/not-found.html');
                contents = sanitizeHtml(notFound?.contents ?? '');
              }

              this.print(contents + '<br />');
              this.waitInput();
              break;
            }
            case 'ls':
              this.print(this.filesystems['localhost'].ls(this.getArgv(1)).join(' ') + '<br />');
              this.waitInput();
              break;
            case 'nologin':
            case 'sh':
              this.print('<br />');
              this.waitInput();
              break;
            case 'poweroff':
              await sleep(600);
              return await this.poweroff();
            case 'm4r10k4rt.exe':
              await sleep(2000);
              this.print('rm /boot/kernel<br />');
              this.filesystems['localhost'].rm('/boot/kernel');
              await sleep(1000);
              this.cls();
              await sleep(1000);
              for (let i = 0; i < 24; i++) {
                this.print('&gt;&gt;&gt;=================== Y0U G0T PWN3D, K1D ===================&lt;&lt;&lt;<br /><br />');
                await sleep(100);
              }
              this.print('# poweroff<br />');
              await sleep(300);
              return await this.poweroff(3000);
            default:
              this.print(`Unknown command: ${this.getArgv(0)}<br />For a list of commands, type 'help'.<br /><br />`);
              this.waitInput();
              break;
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

  async switchState(state, options = {cls: false}) {
    this.state = state;
    this.input = '';

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