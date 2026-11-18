export const books = [
  { id: "reed", title: "葦の小舟", topic: "水辺" },
  { id: "lamp", title: "坂の灯", topic: "町" },
];

export function booksFor(topic) {
  return topic ? books.filter(book => book.topic === topic) : books;
}
