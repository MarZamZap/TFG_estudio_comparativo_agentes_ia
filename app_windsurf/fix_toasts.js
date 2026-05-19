const fs = require("fs");
const path = require("path");

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith(".tsx") || dirFile.endsWith(".ts")) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync("src");
files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const regex = /toast\.error\(e\s+instanceof\s+Error\s*\?\s*e\.message\s*:\s*(["\x27][^"\x27]+["\x27])\);/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match, defaultMsg) => {
      return `if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          toast.error(parsed[0].message);
        } catch {
          toast.error(e.message);
        }
      } else {
        toast.error(${defaultMsg});
      }`;
    });
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  }
});
