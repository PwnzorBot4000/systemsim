const loader = window.loader.withExtraPrefix( 'assets/files/localschool');

export const localSchoolFiles = loader.lazyList([
  '/etc/passwd',
  '/srv/index.html',
  '/students/athena110717/sitse.txt',
  '/students/constantin160816/todo.txt',
  '/students/hack3d222222/notes.txt',
]);