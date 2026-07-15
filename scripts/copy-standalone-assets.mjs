import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  throw new Error("No se encontró .next/standalone después del build.");
}

const targets = [
  [join(root, ".next", "static"), join(standalone, ".next", "static")],
  [join(root, "public"), join(standalone, "public")],
  [join(root, "db"), join(standalone, "db")],
];

for (const [source, destination] of targets) {
  if (!existsSync(source)) continue;
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}
