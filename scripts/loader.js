export class LazyFile {
  /** @type {string} */
  path;

  /**  @type {(string) => Promise<any>} */
  fetchFn;

  content;

  constructor(path, fetchFn) {
    this.path = path;
    this.fetchFn = fetchFn || ((path) => fetch(path).then((response) => {
      if (!response.ok) {
        console.error(`Failed to load file ${path}.`);
        return '';
      }
      return response.text();
    }).catch((error) => {
      console.error(`Failed to load file ${path}: ${error.message}`);
      return '';
    }));
  }

  async read() {
    if (this.content) return this.content;
    console.info(`Loading ${this.path}`);
    this.content = await this.fetchFn(this.path);
    return this.content;
  }
}

export class Loader {
  parent = null;

  /** @type {string} */
  rootPrefix = '.';

  constructor(params) {
    Object.assign(this, params);
  }

  withExtraPrefix(prefix) {
    return new Loader({
      ...this,
      parent: this,
      rootPrefix: prefix,
    });
  }

  getRootPrefix() {
    if (!this.parent) {
      return this.rootPrefix;
    }
    return `${this.parent.getRootPrefix()}/${this.rootPrefix}`;
  }

  lazy(path) {
    return new LazyFile(`${this.getRootPrefix()}/${path}`);
  }

  lazyMap(pathsMap) {
    return Object.fromEntries(Object.entries(pathsMap).map(([key, path]) => [key, this.lazy(path)]));
  }

  loadModule(path) {
    return import(`../${path}`);
  }
}