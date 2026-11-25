import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Entry: one code-review comment, a single line of at most 140
// characters. It approves the pull request ("LGTM") while carrying
// quiet existential dread: two days of green CI and total silence,
// approved anyway, the way every incident report begins.
const MIN_CHARS = 1;
const MAX_CHARS = 140;

function buildEntry(): string {
  return "LGTM. Two days of green CI, total silence, and I approved it anyway, which is exactly how the incident report will begin.";
}

function checkLength(entry: string): number {
  const chars = [...entry].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `entry is ${chars} characters, must be ${MIN_CHARS}-${MAX_CHARS}`,
    );
  }
  return chars;
}

function checkSingleLine(entry: string): void {
  if (entry.includes("\n") || entry.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (entry.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
}

function validateEntry(entry: string): number {
  checkSingleLine(entry);
  return checkLength(entry);
}

function resolveOutputPath(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return join(dir, "entry.txt");
}

function writeEntry(path: string, entry: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, entry, "utf8");
}

function verifyEntry(path: string, entry: string): number {
  const readBack = readFileSync(path, "utf8");
  if (readBack !== entry) {
    throw new Error(
      `verification failed: read-back differs from entry (${[...readBack].length} chars read, ${[...entry].length} expected)`,
    );
  }
  return [...readBack].length;
}

function main(): void {
  const entry = buildEntry();
  validateEntry(entry);
  const path = resolveOutputPath();
  writeEntry(path, entry);
  const chars = verifyEntry(path, entry);
  console.log(`wrote ${path} (${chars} chars, verified byte-for-byte)`);
}

main();
