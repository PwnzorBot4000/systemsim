import {Filesystem} from "./filesystem.js";

export class Server {
  filesystem;
  routes = [];
  isStaticContentServed = true;

  constructor(options = {filesystem: undefined, routes: undefined}) {
    if (options?.routes) this.routes = options.routes;
    if (options?.filesystem) this.filesystem = options.filesystem;
  }

  request(method, path, body) {
    const response = {};

    for (const route of this.routes) {
      if (!route.regex.test(`${method} ${path}`)) continue;
      const response = route.handler(this, method, path, body);
      if (response) return response;
    }

    if (this.isStaticContentServed) {
      const response = this.serveStaticContent(path);
      if (response) return response;
    }

    const notFound = this.filesystem.get('/srv/not-found.html');
    response.status = 404;
    response.body = notFound?.contents ?? '';
    response.filename = 'not-found.html';
    response.headers = {
      'Content-Type': 'text/html',
    };
    return response;
  }

  serveStaticContent(path, options = {staticRoot: '/srv'}) {
    const response = { status: 200 };

    const internalPath = Filesystem.joinpath(options.staticRoot, path);
    const file = this.filesystem.get(internalPath);
    if (file === 'dir') {
      const indexFile = this.filesystem.get(Filesystem.joinpath(internalPath, 'index.html'));
      if (indexFile) {
        response.body = indexFile.contents ?? '';
        response.filename = 'index.html';
        response.headers = {
          'Content-Type': 'text/html',
        };
      } else {
        response.body = `Directory listing for ${internalPath}:<br />\n` +
          this.filesystem.ls(internalPath).join(' ');
        response.filename = 'directory-listing.txt';
        response.headers = {
          'Content-Type': 'text/plain',
        };
      }
      return response;
    } else if (file) {
      response.body = file.contents;
      response.filename = path.split('/').slice(-1)[0];
      response.headers = {
        'Content-Type': file.type,
      };
      return response;
    }

    return undefined;
  }
}