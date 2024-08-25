import {sanitizeHtml} from "../utils.js";

export function curl(game) {
  const matches = game.input.match(/curl (-[A-Za-z]+ )*([A-Z]+) ([A-Za-z0-9-.]+)(\/[^ ]+)? ?(.*)?/);
  if (!matches) {
    game.print('Usage: curl [options] METHOD HOST[/path] [BODY]<br />' +
      'Example: curl GET www.example.com<br />' +
      'Example: curl GET 192.168.1.1/example.html<br />');
    return;
  }
  const serverName = matches[matches.length - 3];
  const server = game.servers[serverName];
  if (!server) {
    game.print('curl: server does not exist<br />');
    return;
  }
  const method = matches[matches.length - 4];
  const path = decodeURIComponent(matches[matches.length - 2] ?? '/');
  const body = matches[matches.length - 1] ?? '';

  const response = server.request(method, path, body);

  if (!response.body || response.status !== 200) {
    let statusText;
    switch (response.status) {
      case 200:
        statusText = 'OK';
        break;
      case 201:
        statusText = 'Created';
        break;
      case 301:
        statusText = `Moved Permanently to ${response.headers['Location']}`;
        break;
      case 302:
        statusText = `Found at ${response.headers['Location']}`;
        break;
      case 400:
        statusText = 'Bad Request';
        break;
      case 401:
        statusText = 'Unauthorized';
        break;
      case 403:
        statusText = 'Forbidden';
        break;
      case 404:
        statusText = 'Not Found';
        break;
      case 500:
        statusText = 'Internal Server Error';
        break;
      default:
        statusText = '';
        break;
    }

    game.print(`${serverName} responded with: HTTP ${response.status} ${statusText}<br />`);
    if (response.body) game.print(sanitizeHtml(response.body) + '<br />');
    return;
  }

  // Output
  if (game.getSwitch('O', 'output')) {
    game.computer.fs().put(response.filename, response.body, { type: response.headers['Content-Type'] });
    game.print(`Downloaded ${response.filename} (${response.body.length} bytes)<br />`);
  } else {
    game.print(sanitizeHtml(response.body ?? '') + '<br />');
  }
}
