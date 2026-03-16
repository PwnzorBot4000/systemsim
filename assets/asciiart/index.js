const loader = window.loader.withExtraPrefix( 'assets/asciiart');

export const asciiArtFiles = loader.lazyMap({
  bookcase: 'bookcase.txt',
  desk: 'desk.txt',
  drawer: 'drawer.txt',
  electronics: 'electronics.txt',
  'items/battery': 'items/battery.txt',
  'items/spoon': 'items/spoon.txt',
  logo: 'logo.txt',
  memorySticks: 'memorySticks.txt',
  notepad: 'notepad.txt',
  picture: 'picture.txt',
})