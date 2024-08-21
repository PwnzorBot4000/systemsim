export class Filesystem {
  fsMap = new Map();
  mounts = [];
  pwd = '/';

  constructor(options = {pwd: undefined, fsMap: undefined, contents: undefined}) {
    this.pwd = options.pwd ?? '/';
    if (options?.fsMap) this.fsMap = options.fsMap;
    // TODO contents sugar
  }

  abspath(path) {
    const absPath1 = path.startsWith('/') ? path : Filesystem.joinpath(this.pwd, path);

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
    const absPath = this.abspath(path);

    const mountsFile = this.recurseMounts(absPath, (fs, innerPath) => fs.get(innerPath));
    if (mountsFile) return mountsFile;

    return this.fsMap.get(absPath);
  }

  goIn(dir, options = {
    onerror: () => {
    }
  }) {
    const targetPath = Filesystem.joinpath(this.pwd, dir);
    const target = this.get(targetPath);

    if (target !== 'dir') {
      options.onerror?.();
      return false;
    }

    // Add a level
    this.pwd = targetPath;
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

  static joinpath(base, rel) {
    return base + (base.endsWith('/') || rel.startsWith('/') ? '' : '/') + rel;
  }

  ls(path) {
    const prefix = path ? this.abspath(path) : this.pwd;

    const lsInMount = this.recurseMounts(prefix, (fs, innerPath) => fs.ls(innerPath));
    if (lsInMount) return lsInMount;

    return [...this.fsMap.keys()]
      .filter(key => key.startsWith(prefix))
      .map(key => key.replace(prefix, ''))
      .filter(key => key.match(/^\/?[^\/]+$/))
      .map(key => key.replace(/^\/?/, ''));
  }

  mount(what, where) {
    if (this.mounts.some((mnt) => mnt.where === where) return false;

    this.mounts.push({ what, where });
    return true;
  }

  put(path, contents) {
    const absPath = this.abspath(path);

    const setInMount = this.recurseMounts(absPath, (fs, innerPath) => fs.put(innerPath, contents));
    if (setInMount) return true;

    this.fsMap.set(absPath, {contents: contents});
    return true;
  }

  recurseMounts(path, fn) {
    for (const mount of this.mounts) {
      if (path.startsWith(mount.where)) {
        return fn(mount.what, path.replace(mount.where, ''));
      }
    }

    return undefined;
  }

  rm(path) {
    const absPath = this.abspath(path);
    
    const removedInMount = this.recurseMounts(absPath, (fs, innerPath) => fs.rm(innerPath));
    if (removedInMount) return;
    
    if (this.fsMap.has(absPath)) {
      this.fsMap.delete(absPath);
      return true;
    }

    return false;
  }

  unmount(path) {
    this.mounts = this.mounts.filter((mnt) => mnt.where !== path);
  }
}
