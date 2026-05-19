const fs = require("fs");
const path = require("path");
const dir = "src/actions";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts"));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");

  content = content.replace(/result\.error\.errors\[0\]\.message/g, "result.error.issues[0]?.message || \"Error de validación\"");
  fs.writeFileSync(filePath, content);
  console.log("Fixed", file);
});
