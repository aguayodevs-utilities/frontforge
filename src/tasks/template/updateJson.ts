import fs from 'fs-extra';

export async function updateJson<T extends { [k: string]: any }>(
  file: string,
  uniqueKey: keyof T,
  entry: T
) {
  await fs.ensureFile(file);
  const arr: T[] = await fs.readJson(file).catch(() => []);
  const idx = arr.findIndex((e) => e[uniqueKey] === entry[uniqueKey]);
  idx >= 0 ? (arr[idx] = entry) : arr.push(entry);
  await fs.writeJson(file, arr, { spaces: 2 });
}
