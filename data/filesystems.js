import {encodeExeName} from "../utils.js";

const binaries = new Map([
  ['curl', { type: 'exe', contents: 'ELF' + encodeExeName('curl', 306) }],
  ['nologin', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 10) }],
  ['sh', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 920) }],
  ['kernel', { type: 'bin', contents: 'ELF' + encodeExeName('kernel', 2210) }],
  ['initrd', { type: 'bin', contents: 'ELF' + encodeExeName('initrd', 3211) }],
  ['m4r10k4rt', { type: 'exe', contents: 'MZ' + encodeExeName('m4r10k4rt', 48) }],
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
  ],
  'foogal.co.uk': [
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
  ],
  'owasp.org': [
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
  ],
  '104.122.199.11': [
    ['/', 'dir'],
    ['/etc', 'dir'],
    ['/etc/passwd', {
      contents: 'root:x:0:0:root:/root:/bin/sh\n' +
        'athena110717:x:1422:1422::/:/bin/sh\n' +
        'constantin160816:x:1421:1421::/:/bin/sh\n' +
        'maksim220724:x:1432:1432::/:/bin/sh\n'
    }],
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: '<h2>Login</h2>\n<form method="post" action="/login.html">\n' +
        '<label for="username">Student username:</label><br>\<input type="text" id="username" name="username"><br>\n' +
        '<label for="password">Password:</label><br>\n<input type="text" id="password" name="password"><br><br>\n' +
        '<input type="submit" value="Submit">\n</form>\n<!-- Use username "guest" and password "guest" for guest access -->\n'
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
      contents: 'Lol school servers are total swiss cheese, I got in in like 3 minutes and an exploit search. ' +
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
    ['/boot', 'dir'],
    ['/boot/kernel', binaries.get('kernel')],
    ['/boot/initrd', binaries.get('initrd')],
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
