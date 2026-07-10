const fs = require("fs");
const path = require("path");

const TARGET_DIRS = [
  path.join("src", "pages"),
  path.join("src", "components"),
];

const WRITE = process.argv.includes("--write");

const REPLACEMENTS = [
  [/bg-\[#f8fafc\]/g, "bg-surface"],
  [/bg-white(?!\/)/g, "bg-card"],
  [/bg-gray-50(?!\d)/g, "bg-surface"],
  [/bg-gray-100(?!\d)/g, "bg-hover"],
  [/bg-gray-700\/50/g, "bg-hover"],
  [/bg-gray-700(?!\d)/g, "bg-hover"],
  [/bg-gray-800(?!\d)/g, "bg-card"],
  [/bg-gray-900(?!\d)/g, "bg-surface"],
  [/text-gray-900(?!\d)/g, "text-primary"],
  [/text-gray-100(?!\d)/g, "text-primary"],
  [/text-gray-500(?!\d)/g, "text-secondary"],
  [/text-gray-400(?!\d)/g, "text-secondary"],
  [/border-gray-100(?!\d)/g, "border-subtle"],
  [/border-gray-200(?!\d)/g, "border-subtle"],
  [/border-gray-600(?!\d)/g, "border-strong"],
  [/border-gray-700(?!\d)/g, "border-strong"],
  [/divide-gray-200(?!\d)/g, "divide-subtle"],
  [/divide-gray-700(?!\d)/g, "divide-subtle"],
];

const DEAD_DARK_VARIANTS = [
  /\sdark:bg-gray-\d{2,3}(\/\d+)?/g,
  /\sdark:bg-\[#f8fafc\]/g,
  /\sdark:text-gray-\d{2,3}/g,
  /\sdark:border-gray-\d{2,3}/g,
  /\sdark:divide-gray-\d{2,3}/g,
  /\sdark:hover:bg-gray-\d{2,3}/g,
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let updated = original;

  for (const [pattern, replacement] of REPLACEMENTS) {
    updated = updated.replace(pattern, replacement);
  }
  for (const pattern of DEAD_DARK_VARIANTS) {
    updated = updated.replace(pattern, "");
  }

  if (updated !== original) {
    const changeCount = (original.match(/bg-white|bg-gray-|text-gray-|border-gray-|divide-gray-|bg-\[#f8fafc\]/g) || []).length;
    console.log(`${WRITE ? "Updated" : "Would update"}: ${filePath} (${changeCount} matches)`);
    if (WRITE) fs.writeFileSync(filePath, updated, "utf8");
    return true;
  }
  return false;
}

function main() {
  const allFiles = TARGET_DIRS.flatMap((d) => walk(d));
  if (allFiles.length === 0) {
    console.log("No files found. Check that src/pages or src/components exists relative to where you ran this script.");
    return;
  }

  let changed = 0;
  for (const file of allFiles) {
    if (processFile(file)) changed++;
  }

  console.log(`\n${changed} of ${allFiles.length} files ${WRITE ? "modified" : "would be modified"}.`);
  if (!WRITE) {
    console.log("This was a dry run. Re-run with --write to apply changes.");
  }
}

main();