export class Book {
  name;
  contents;

  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }

  readChapter(index) {
    if (index < 0 || index >= this.contents.length) {
      throw new Error(`Invalid chapter: ${index + 1}`);
    }

    return this.contents[index].contents;
  }

  report() {
    return 'The book contains the following chapters:<br />' +
      this.contents
        .map((chapter, i) => `${i + 1} - ${chapter.title}<br />`)
        .join('');
  }
}