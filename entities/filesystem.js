export class Filesystem {
  fsMap = new Map();
  mounts = [];
  pwd = '/';
  readOnly = false;

  constructor(options = {pwd: undefined, fsMap: undefined, contents: undefined, readOnly: undefined }) {
    this.pwd = options.pwd ?? '/';
    this.readOnly = options.readOnly ?? false;
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

  cd(dir, options = {
    onerror: () => {
    }
  }) {
    const targetPath = this.abspath(dir);
    const target = this.get(targetPath);

    if (target !== 'dir') {
      options.onerror?.();
      return false;
    }

    // Add a level
    this.pwd = targetPath;
    return true;
  }

  static joinpath(base, rel) {
    let joinedPath =  base +  '/' + rel;
    while (joinedPath.includes('//')) {
      joinedPath = joinedPath.replace('//', '/');
    }
    return joinedPath;
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
    if (this.mounts.some((mnt) => mnt.where === where))
      throw new Error(`A filesystem is already mounted at ${where}`);

    this.mounts.push({ what, where });
    return true;
  }

  put(path, contents, props = {}) {
    const absPath = this.abspath(path);

    const setInMount = this.recurseMounts(absPath, (fs, innerPath) => fs.put(innerPath, contents));
    if (setInMount) return true;

    if (this.readOnly) throw new Error('put: File system is read only');

    this.fsMap.set(absPath, {contents: contents, ...props});
    return true;
  }

  recurseMounts(path, fn) {
    for (const mount of this.mounts) {
      if (path.startsWith(mount.where)) {
        return fn(mount.what, path.replace(mount.where, '') || '/');
      }
    }

    return undefined;
  }

  rm(path) {
    const absPath = this.abspath(path);
    
    const removedInMount = this.recurseMounts(absPath, (fs, innerPath) => fs.rm(innerPath));
    if (removedInMount) return true;

    if (this.readOnly) throw new Error('rm: File system is read only');
    if (!this.fsMap.has(absPath)) return false;

    const fileToDelete = this.fsMap.get(absPath);
    if (fileToDelete === 'dir') throw new Error('rm: Is a directory');

    this.fsMap.delete(absPath);
    return true;
  }

  unmount(path) {
    this.mounts = this.mounts.filter((mnt) => mnt.where !== path);
  }
}
