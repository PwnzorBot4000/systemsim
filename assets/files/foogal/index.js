const loader = window.loader.withExtraPrefix( 'assets/files/foogal');

export const foogalFiles = loader.lazyList([
  'srv/index.html',
  'srv/login.html',
  'srv/foogal/admin.html',
  'srv/foogal/athena.html',
  'srv/foogal/charly.html',
]);