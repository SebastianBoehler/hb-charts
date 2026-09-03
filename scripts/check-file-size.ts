import { readdir } from "node:fs/promises";
import { join } from "node:path";

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }));
  return nested.flat();
}

const offenders: string[] = [];
for (const path of await files("src")) {
  if (!path.endsWith(".ts") && !path.endsWith(".tsx")) continue;
  const lines = (await Bun.file(path).text()).split("\n").length;
  if (lines > 300) offenders.push(`${path}: ${lines} lines`);
}
if (offenders.length) {
  console.error(offenders.join("\n"));
  process.exit(1);
}
