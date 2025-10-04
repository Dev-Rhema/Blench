// Script to replace local image paths in avatar parts files with Cloudinary URLs using upload log
// Usage: node replace-local-paths-with-cloudinary.js <upload-log.txt> <AvatarPartsFile.js>

const fs = require("fs");
const path = require("path");

if (process.argv.length < 4) {
  console.error(
    "Usage: node replace-local-paths-with-cloudinary.js <upload-log.txt> <AvatarPartsFile.js>"
  );
  process.exit(1);
}

const logFile = process.argv[2];
const avatarFile = process.argv[3];

// Parse upload log into a map: filename => cloudinaryUrl
const logLines = fs.readFileSync(logFile, "utf-8").split(/\r?\n/);
const urlMap = {};
for (const line of logLines) {
  const match = line.match(
    /Uploaded: (.+\.svg|png|jpg|jpeg) -> (https:\/\/res\.cloudinary\.com\/.+)/
  );
  if (match) {
    urlMap[match[1]] = match[2];
  }
}

// Read avatar parts file
let code = fs.readFileSync(avatarFile, "utf-8");

// Replace local paths with Cloudinary URLs
code = code.replace(
  /(["'])([^"']+\/(?:[A-Za-z0-9_-]+)\.(?:svg|png|jpg|jpeg))["']/g,
  (m, quote, filePath) => {
    const fileName = path.basename(filePath);
    if (urlMap[fileName]) {
      return quote + urlMap[fileName] + quote;
    }
    return m;
  }
);

// Write back
fs.writeFileSync(avatarFile, code, "utf-8");
console.log("Updated", avatarFile, "with Cloudinary URLs.");
