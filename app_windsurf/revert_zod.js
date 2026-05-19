const fs = require("fs");
const path = require("path");
const dir = "src/actions";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts"));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");

  const lines = content.split("\n");
  const newLines = [];
  let i = 0;
  let modified = false;

  while (i < lines.length) {
    if (lines[i].includes(".safeParse(")) {
      const match = lines[i].match(/const result = (.*)\.safeParse\((.*)\);/);
      if (match) {
        newLines.push(`  const parsed = ${match[1]}.parse(${match[2]});`);
        i += 3; // skip the safeParse, the if throw, and the const parsed = result.data
        modified = true;
        continue;
      }
    }
    newLines.push(lines[i]);
    i++;
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join("\n"));
    console.log("Reverted", file);
  }
});
