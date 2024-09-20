import {encodeExeName} from "../scripts/utils.js";

const binaries = new Map([
  ['curl', { type: 'exe', contents: 'ELF' + encodeExeName('curl', 306) }],
  ['initrd', { type: 'bin', contents: 'ELF' + encodeExeName('initrd', 3211) }],
  ['install-os', { type: 'exe', contents: 'ELF' + encodeExeName('installos', 120) }],
  ['kernel', { type: 'bin', contents: 'ELF' + encodeExeName('kernel', 2210) }],
  ['links', { type: 'exe', contents: 'ELF' + encodeExeName('links', 500) }],
  ['m4r10k4rt', { type: 'exe', contents: 'MZ' + encodeExeName('m4r10k4rt', 48) }],
  ['nologin', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 10) }],
  ['sh', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 920) }],
  ['watrar', { type: 'exe', contents: 'MZ' + encodeExeName('watrar', 48) }],
]);

export const filesystemsData = {
  'localhost': [
    ['/', 'dir'],
    ['/bin', 'dir'],
    ['/bin/curl', binaries.get('curl')],
    ['/bin/nologin', binaries.get('nologin')],
    ['/bin/sh', binaries.get('sh')],
    ['/boot', 'dir'],
    ['/boot/kernel', binaries.get('kernel')],
    ['/boot/initrd', binaries.get('initrd')],
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
  ],
  'exploit-db.com': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h1>Exploit-DB</h1>\n' +
        '<a href="/vulnerabilities/index.html">Known vulnerabilities list</a>\n' +
        '<a href="/ghacks/index.html">Vulnerable site search hacks</a>\n'
    }],
    ['/srv/vulnerabilities', 'dir'],
    ['/srv/vulnerabilities/index.html', {
      contents: '<h1>List of known vulnerabilities</h1>\n' +
        '<table>\n' +
        '  <thead>\n' +
        '    <th>ID</th><th>Software</th><th>Version</th><th>Type</th><th>Year</th><th>Title</th>\n' +
        '  </thead>\n' +
        '  <tbody>\n' +
        '    <tr><td>12804</td><td>Nginx</td><td>0.6.36</td><td>Remote</td><td>2010</td><td><a href="/vulnerabilites/12804.html">Directory Traversal</a></td></tr>\n' +
        '  </tbody>\n' +
        '</table>\n'
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
    ['/srv/ghacks/index.html', {
      contents: '<h1>Goggle search hacks for finding vulnerable sites</h1>\n' +
        '<table>\n' +
        '  <thead>\n' +
        '    <th>Type</th><th>Year</th><th>Title</th>\n' +
        '  </thead>\n' +
        '  <tbody>\n' +
        '  </tbody>\n' +
        '</table>'
    }],
  ],
  'foogal.co.uk': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h1>Foogal</h1>\n' +
        '<h2>A place for all things foogal</h2>\n' +
        '<p>Cremes and colours, crafts and bath crystals, oh my!</p>\n' +
        '<a href="/login.html">Manage my Foogal page</a>\n' +
        '<p>Meet our prominent members:</p>\n' +
        '<ul>\n' +
        '  <li><a href="/foogal/charly.html">Charly</a></li>\n' +
        '  <li><a href="/foogal/athena.html">Athena</a></li>\n' +
        '  <li><a href="/foogal/admin.html">Vickie</a></li>\n' +
        '</ul>'
    }],
    ['/srv/foogal/athena.html', {
      contents: '<h1>Foogal page</h1>\n' +
        '<p>This is a page about Athena\'s foogal fingers.</p>\n'
    }],
    ['/srv/foogal/charly.html', {
      contents: '<h1>Foogal page</h1>\n' +
        '<p>This is a page about Charly\'s colorful crafts.</p>\n'
    }],
    ['/srv/foogal/admin.html', {
      contents: '<h1>Foogal page</h1>\n' +
        '<p>This is a page about Vickie\'s administrative duties.</p>\n'
    }],
    ['/srv/login.html', {
      contents: '<form method="post">\n' +
        '  <label for="fname">Foogal login:</label><br><input type="text" id="fname" name="fname"><br>\n' +
        '  <label for="pass">Password:</label><br><input type="text" id="pass" name="pass"><br><br>\n' +
        '  <input type="submit" value="Submit">\n' +
        '</form>'}],
    ['srv/content', 'dir'],
    ['srv/content/athena', 'dir'],
    ['srv/content/charly', 'dir'],
    ['srv/content/vickie', 'dir'],
  ],
  'owasp.org': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h1>OWASP Foundation</h1>\n' +
        '<h2>Explore the world of cyber security</h2>\n' +
        '<a href="/top5.html">OWASP Top 5 list of common vulnerabilities</a>\n'
    }],
    ['/srv/top5.html', {
      contents: '<h1>OWASP Top 5 list of common vulnerabilities (2021)</h1>\n' +
        '<table>\n' +
        '  <thead>\n' +
        '    <th>#</th><th>Category</th><th>Description</th><th>Example</th>\n' +
        '  </thead>\n' +
        '  <tbody>' +
        '    <tr><td>1</td><td>Broken Access Control</td><td>The application does not properly restrict access to authenticated users.</td>' +
        '<td>User A can access user B\'s resources by guessing the user ID or the resource ID and manipulating the request URL. ' +
        'e.g.: https://example.com/user/1/resources -- change the URL to https://example.com/user/2/resources. Or: ' +
        'https://example.com/resources/1 -- change the URL to https://example.com/resources/56. ' +
        'A well-protected application would not allow user 1 to access to the latter URLs, as the resources do not belong to the user that is making the request.</td></tr>\n' +
        '    <tr><td>2</td><td>Cryptographic failures</td><td>The application does not (properly) encrypt sensitive information.</td>' +
        '<td>A file containing passwords is stored in plaintext at https://example.com/passwords-1.txt. ' +
        'An attacker can use a common paths wordlist to perform a brute force attack and retrieve the passwords.</td></tr>\n' +
        '    <tr><td>3</td><td>Injection</td><td>The application does not properly sanitize user-supplied input.</td>' +
        '<td>An attacker can input SQL statements or shell commands into a form field that will be executed by the application.</td></tr>\n' +
        '    <tr><td>4</td><td>Insecure design</td><td>The application has a feature that is not securely designed.</td>' +
        '<td>A blog has a feature for resetting passwords by answering a security question. The question is what is the user\'s favorite show.' +
        'The user\'s blog contains multiple references to the show \'star wars\'.</td></tr>\n' +
        '    <tr><td>5</td><td>Security misconfiguration</td><td>Vulnerabilities that occur when security could have been appropriately configured but was not.</td>' +
        '<td>Developer has not disabled debug mode in the application. When an attacker requests a page that does not exist, ' +
        'the application will return a debug page that contains sensitive information like the server software and version, which can be used to find exploits.</td></tr>\n' +
        '  </tbody>\n' +
        '</table>'
    }]
  ],
  'projects.mikl-ptoska.cz': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h1>Toobright labs - Projects</h1>\n' +
        '<h2>Free software - first grade</h2>\n' +
        '<ul>\n' +
        '  <li><a href="/projects/links">Links</a></li>\n' +
        '</ul>\n' +
        '<h2>Second grade - commandline skill required</h2>\n' +
        '<ul>\n' +
        '  <li><a href="/projects/jpeginsert">JpegInsert</a></li>\n' +
        '</ul>\n',
    }],
    ['/srv/projects/links', 'dir'],
    ['/srv/projects/links/index.html', {
      contents: '<h1>Links</h1>\n' +
        '<p>Web browser running in both graphics and text mode. No Flash, CSS, Javascript supported. High speed and graphics display quality</p>\n' +
        '<a href="/projects/links/links.zip">Download</a>\n',
    }],
    ['/srv/projects/links/links.zip', {
      type: 'zip',
      contents: [
        ['links', binaries.get('links')],
        ['README.txt', {
          contents: 'To install, extract the zip file to a directory, ' +
            'and copy / move the extracted \'links\' file to  your system\'s /bin directory.\n' +
            'Then run \'links (url)\' to start the browser.\n'
        }],
      ],
    }],
    ['/srv/projects/jpeginsert', 'dir'],
    ['/srv/projects/jpeginsert/index.html', {
      contents: '<h1>JpegInsert</h1>\n' +
        '<p>Insert large data into 1992 spec. JPEG files without using steganography or EXIF</p>\n' +
        '<a href="/projects/jpeginsert/jpeginsert.zip">Coming soon</a>\n',
    }],
  ],
  'www.watrar.com': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h1>Watrar</h1>\n' +
        '<p>Compression and decompression tools</p>\n' +
        '<p>Watrar can be downloaded for evaluation. It is free for non-commercial use.\n' +
        'After the trial period expires, you will be asked to buy a license.</p>\n' +
        '<a href="/watrar.exe">Download Watrar</a>\n',
    }],
    ['/srv/watrar.exe', binaries.get('watrar')],
  ],
  '104.122.199.11': [
    ['/', 'dir'],
    ['/etc', 'dir'],
    ['/etc/passwd', {
      contents: 'root:x:0:0:root:/root:/bin/sh\n' +
        'athena110717:13324:1422:1422::/:/bin/sh\n' +
        'constantin160816:121217:1421:1421::/:/bin/sh\n' +
        'hack3d222222:162:1429:1429::/:/bin/sh\n' +
        'maksim220724:223398:1432:1432::/:/bin/sh\n'
    }],
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h2>Login</h2>\n' +
        '<form method="post" action="/login.html">\n' +
        '  <label for="username">Student username:</label><br>\n' +
        '  <input type="text" id="username" name="username"><br>\n' +
        '  <label for="password">Password:</label><br>\n' +
        '  <input type="text" id="password" name="password"><br><br>\n' +
        '  <input type="submit" value="Submit">\n' +
        '</form>\n' +
        '<!-- Use username "guest" and password "guest" for guest access -->\n'
    }],
    ['/srv/not-found.html', {contents: '<p>Page not found</p><p>Nginx 0.6.2</p>'}],
    ['/students', 'dir'],
    ['/students/athena110717', 'dir'],
    ['/students/athena110717/sitse.txt', {contents: 'foogal.co.uk pass = "autumnleaves" + birthyear\nwww.watrar.com Free compressed files profram'}],
    ['/students/constantin160816', 'dir'],
    ['/students/constantin160816/todo.txt', {
      contents: 'Prepare ppt for ebikes\nProf tyranossaurus Tex asked us to install an ancient browser from projects.mikl-ptoska.cz/links\n' +
        'curl -O <rest of stuff> to download a file as A ***** FILE\nMan pages has more stuff for program options, see uni site'
    }],
    ['/students/constantin160816/ebikes.pdf', 'file'],
    ['/students/guest', 'dir'],
    ['/students/guest/m4r10k4rt.exe', { type: 'exe', contents: 'MZ' + encodeExeName('m4r10k4rt', 48) }],
    ['/students/hack3d222222', 'dir'],
    ['/students/hack3d222222/notes.txt', {
      contents: 'Lol school servers are total swiss cheese, I got in in like 3 minutes and an exploitdb search. ' +
        'Im gonna try crack the root pass, the specs are ok for a ddos zombie. Any other bros are welcome to install their own worms for attacks, it\'s not ' +
        'like this teapot can mine crypto.\n' +
        'If you are the admin reading this, upgrade your rotting nginx man, like, you\'re being paid a wage to *at least* do this once in a while.'
    }],
    ['/students/hack3d222222/wordlists', 'dir'],
    ['/students/hack3d222222/wordlists/nginx-paths.txt', 'file'],
    ['/students/hack3d222222/wordlists/admin-passes-top10000.txt', 'file'],
    ['/students/maksim220724', 'dir'],
    ['/students/maksim220724/combustion-liquid-fuel-rockets.doc', 'file'],
    ['/students/maksim220724/remote-cruise-control.doc', 'file'],
  ],
  'memorystick-1': [
    ['/', 'dir'],
    ['/bin', 'dir'],
    ['/bin/curl', binaries.get('curl')],
    ['/bin/nologin', binaries.get('nologin')],
    ['/bin/sh', binaries.get('sh')],
    ['/bin/install', binaries.get('install-os')],
    ['/boot', 'dir'],
    ['/boot/kernel', binaries.get('kernel')],
    ['/boot/initrd', binaries.get('initrd')],
    ['/mnt', 'dir'],
    ['/INSTRUCTIONS.txt', {
      contents: 'Green Fern Unix installation instructions\n' +
        '\n' +
        'Simple installation\n' +
        '==========================================\n' +
        'Attach the official USB stick to the computer, and boot from it.\n' +
        'The computer will boot into a live system, and will mount the existing disk on /mnt.\n' +
        'You can now install the operating system by running the install script:\n' +
        '/ # install\n' +
        'WARNING: This will erase all data on the system!\n' +
        'If you are simply looking to repair an existing installation after a boot failure,\n' +
        'see the instructions below.\n' +
        '\n' +
        'Multiple disks / Live USB creation\n' +
        '==========================================\n' +
        'If you have multiple disks, or want to install the live system to a USB drive,\n' +
        'ensure that your installation target is attached. On startup, it will be\n' +
        'mounted to /mnt/diskX, where X is the disk number. Then run the install script:\n' +
        '/ # install /mnt/diskX\n' +
        'Please double-check that the disk number is correct before proceeding.\n' +
        '\n' +
        'Repairing an existing installation\n' +
        '==========================================\n' +
        'If you are trying to repair your computer after a boot failure, e.g. due to an\n' +
        'incompatible kernel installation, a missing system file, or a virus infection,\n' +
        'you should not use the install script directly. Instead, you can use the following steps:\n' +
        '- Boot the computer from the USB stick.\n' +
        '- In case of an incompatible kernel: navigate to the existing filesystem located in /mnt,\n' +
        '  and delete the incompatible kernel found in /boot. Example: \n' +
        '  / # rm /mnt/boot/kernel\n' +
        '- In case of a known virus infection: navigate to the existing filesystem located in /mnt,\n' +
        '  and delete the infected files. Example: \n' +
        '  / # rm /mnt/bin/known-virus\n' +
        '- Copy the working kernel / system files from the USB stick to the existing filesystem.\n' +
        '  Example: \n' +
        '  / # cp /boot/kernel /mnt/boot\n' +
        'In the case of an unknown virus infection, where it is not known which files are infected,\n' +
        'you can try the following steps:\n' +
        '- Boot the computer from the USB stick.\n' +
        '- Attach a second, empty USB stick to the computer.\n' +
        '- Copy any important files from the existing filesystem to the empty USB stick.\n' +
        '  Example: \n' +
        '  / # cp /mnt/disk1/bin/important-file /mnt/disk2\n' +
        '  Make sure that the files that you copy are not infected.\n' +
        '  If unsure, use an antivirus software or online scanning service to scan the files.\n' +
        '- Run the install script. A fresh system will be installed to the computer.\n' +
        '- Copy your files back to the computer\'s filesystem.\n' +
        'In the rare case of a firmware-tampering virus, that may have modified the bootloader\n' +
        'and/or the firmware of any of your internal devices (drives, memory sticks, expansion cards),\n' +
        'before doing the above, to avoid further infections, you should first make sure to flash the\n' +
        'original firmware to all affected devices. Some motherboards have a firmware reset button\n' +
        'for this purpose, and there exist firmware management tools that can run during bootloader\n' +
        'time (UEFI shell) that will allow you to reset the firmware of your other devices.\n',
    }],
  ],
  'memorystick-2': [
    ['/', 'dir'],
  ],
  'memorystick-3': [
    ['/', 'dir'],
    ['/tools', 'dir'],
    ['/tools/dig', 'exe'],
    ['/tools/dig.txt', {
      contents: 'Dig - get the ip address of a website e.g. dig www.goggle.com --> 123.123.123.123\n' +
        'Supposedly can do more things like trace the process of how the domain is resolved, but I haven\'t tried it yet'
    }],
  ],
}
