const loader = window.loader.withExtraPrefix( 'assets/files/owasp');

export const owaspFiles = loader.lazyList([
  '/srv/index.html',
  '/srv/top5.html',
]);