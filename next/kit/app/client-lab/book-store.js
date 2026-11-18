import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function readBook(id) {
  const file = join(process.cwd(), "app", "client-lab", "inventory.json");
  const books = JSON.parse(await readFile(file, "utf8"));
  return books.find(book => book.id === id) ?? books[0];
}
