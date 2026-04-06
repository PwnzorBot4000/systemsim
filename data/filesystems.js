import {encodeExeName} from "../scripts/utils.js";
import {PlainFile} from "../scripts/model.js";
import {exploitDbFiles} from "../assets/files/exploitdb/index.js";
import {foogalFiles} from "../assets/files/foogal/index.js";
import {greenFernUnixUsbFiles} from "../assets/files/green-fern-unix-usb/index.js";
import {localSchoolFiles} from "../assets/files/localschool/index.js";
import {miklPtoskaFiles} from "../assets/files/miklptoska/index.js";
import {owaspFiles} from "../assets/files/owasp/index.js";
import {watRarFiles} from "../assets/files/watrar/index.js";

/** @type {Map<string, PlainFile>} */
const binaries = new Map([
  ['curl', { type: 'exe', contents: 'ELF' + encodeExeName('curl', 306) }],
  ['initrd', { type: 'bin', contents: 'ELF' + encodeExeName('initrd', 3211) }],
  ['install-os', { type: 'exe', contents: 'ELF' + encodeExeName('installos', 120) }],
  ['kernel', { type: 'bin', contents: 'ELF' + encodeExeName('kernel', 2210) }],
  ['links', { type: 'exe', contents: 'ELF' + encodeExeName('links', 500) }],
  ['m4r10k4rt', { type: 'exe', contents: 'MZ' + encodeExeName('m4r10k4rt', 48) }],
  ['mimikatz-payload-1', { type: 'bin', contents: 'ELF' + encodeExeName('soimportantmuchwow', 320) }],
  ['nologin', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 10) }],
  ['sh', { type: 'exe', contents: 'ELF' + encodeExeName('noop', 920) }],
  ['watrar', { type: 'exe', contents: 'MZ' + encodeExeName('watrar', 48) }],
]);

/** @type {Record<string, FilesystemData>} */
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
      contents: await exploitDbFiles['/srv/index.html'].read()
    }],
    ['/srv/vulnerabilities', 'dir'],
    ['/srv/vulnerabilities/index.html', {
      contents: await exploitDbFiles['/srv/vulnerabilities/index.html'].read()
    }],
    ['/srv/vulnerabilities/12804.html', {
      contents: await exploitDbFiles['/srv/vulnerabilities/12804.html'].read()
    }],
    ['/srv/ghacks', 'dir'],
    ['/srv/ghacks/index.html', {
      contents: await exploitDbFiles['/srv/ghacks/index.html'].read()
    }],
  ],
  'foogal.co.uk': [
    ['/', 'dir'],
    ['/PWN3D.txt', {
      contents: await foogalFiles['/PWN3D.txt'].read()
    }],
    ['/wat.txt', {
      contents: await foogalFiles['/wat.txt'].read()
    }],
    ['/boot', 'dir'],
    ['/boot/kernel', binaries.get('kernel')],
    ['/boot/initrd', binaries.get('initrd')],
    ['/boot/very-important-system-file-do-not-delete.mod', binaries.get('mimikatz-payload-1')],
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: await foogalFiles['/srv/index.html'].read()
    }],
    ['/srv/foogal/athena.html', {
      contents: await foogalFiles['/srv/foogal/athena.html'].read()
    }],
    ['/srv/foogal/charly.html', {
      contents: await foogalFiles['/srv/foogal/charly.html'].read()
    }],
    ['/srv/foogal/admin.html', {
      contents: await foogalFiles['/srv/foogal/admin.html'].read()
    }],
    ['/srv/login.html', {
      contents: await foogalFiles['/srv/login.html'].read()
    }],
    ['/srv/content', 'dir'],
    ['/srv/content/V1C71M5.txt', {
      contents: await foogalFiles['/srv/content/V1C71M5.txt'].read()
    }],
    ['/srv/content/athena', 'dir'],
    ['/srv/content/charly', 'dir'],
    ['/srv/content/vickie', 'dir'],
  ],
  'owasp.org': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: await owaspFiles['/srv/index.html'].read()
    }],
    ['/srv/top5.html', {
      contents: await owaspFiles['/srv/top5.html'].read()
    }]
  ],
  'projects.mikl-ptoska.cz': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: await miklPtoskaFiles['/srv/index.html'].read()
    }],
    ['/srv/projects/links', 'dir'],
    ['/srv/projects/links/index.html', {
      contents: await miklPtoskaFiles['/srv/projects/links/index.html'].read()
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
      contents: await miklPtoskaFiles['/srv/projects/jpeginsert/index.html'].read()
    }],
  ],
  'www.watrar.com': [
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: await watRarFiles['/srv/index.html'].read()
    }],
    ['/srv/watrar.exe', binaries.get('watrar')],
  ],
  '101.11.111.1': [],
  '103.203.200.162': undefined,
  '104.122.199.11': [
    ['/', 'dir'],
    ['/etc', 'dir'],
    ['/etc/passwd', {
      contents: await localSchoolFiles['/etc/passwd'].read()
    }],
    ['/srv', 'dir'],
    ['/srv/index.html', {
      contents: await localSchoolFiles['/srv/index.html'].read()
    }],
    ['/srv/not-found.html', {contents: '<p>Page not found</p><p>Nginx 0.6.2</p>'}],
    ['/students', 'dir'],
    ['/students/athena110717', 'dir'],
    ['/students/athena110717/sitse.txt', {
      contents: await localSchoolFiles['/students/athena110717/sitse.txt'].read()
    }],
    ['/students/constantin160816', 'dir'],
    ['/students/constantin160816/todo.txt', {
      contents: await localSchoolFiles['/students/constantin160816/todo.txt'].read()
    }],
    ['/students/constantin160816/ebikes.pdf', 'file'],
    ['/students/guest', 'dir'],
    ['/students/guest/m4r10k4rt.exe', { type: 'exe', contents: 'MZ' + encodeExeName('m4r10k4rt', 48) }],
    ['/students/hack3d222222', 'dir'],
    ['/students/hack3d222222/notes.txt', {
      contents: await localSchoolFiles['/students/hack3d222222/notes.txt'].read()
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
      contents: await greenFernUnixUsbFiles['/INSTRUCTIONS.txt'].read()
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
