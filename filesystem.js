export class Filesystem {
  fsMap = new Map();
  pwd = '/';

  constructor(options = {pwd: '/', fsMap: undefined, contents: undefined}) {
    if (options?.pwd) this.pwd = options.pwd;
    if (options?.fsMap) this.fsMap = options.fsMap;
    // TODO contents sugar
  }

  abspath(path) {
    const absPath1 = path.startsWith('/') ? path : this.joinpath(this.pwd, path);

    // Process "../" paths
    const parts = absPath1.split('/');
    let newParts = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '') continue;
      if (parts[i] === '..') {
        if (newParts.length > 0) {
          newParts.pop();
        }
      } else {
        newParts.push(parts[i]);
      }
    }

    const absPath2 = '/' + newParts.join('/');

    return absPath2 === '/' ? absPath2 : absPath2.replace(/\/$/, '');
  }

  get(path) {
    return this.fsMap.get(this.abspath(path));
  }

  goIn(dir, options = {
    onerror: () => {
    }
  }) {
    const target = this.joinpath(this.pwd, dir);
    if (!this.fsMap.has(target) || this.fsMap.get(target) !== 'dir') {
      options.onerror?.();
      return false;
    }

    // Add a level
    this.pwd = target;
    return true;
  }

  goUp(options = {
    onerror: () => {
    }
  }) {
    if (this.pwd === '/') {
      options.onerror?.();
      return false;
    }

    // Remove a level
    this.pwd = '/' + this.pwd.split('/').slice(0, -1).join('/');
    return true;
  }

  joinpath(base, rel) {
    return base + (base.endsWith('/') || rel.startsWith('/') ? '' : '/') + rel;
  }

  ls(path) {
    const prefix = path ? this.abspath(path) : this.pwd;

    return [...this.fsMap.keys()]
      .filter(key => key.startsWith(prefix))
      .map(key => key.replace(prefix, ''))
      .filter(key => key.match(/^\/?[^\/]+$/))
      .map(key => key.replace(/^\/?/, ''));
  }

  put(path, contents) {
    const absPath = this.abspath(path);
    this.fsMap.set(absPath, {contents: contents});
  }

  rm(path) {
    const absPath = this.abspath(path);
    if (this.fsMap.has(absPath)) {
      this.fsMap.delete(absPath);
      return true;
    }
    return false;
  }
}