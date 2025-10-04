import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: "dwzojroob",
  api_key: "247996481866464",
  api_secret: "zBur-wIBjtM68Mk7q6-rBPwWt-c",
});

const folderPath = path.join(process.cwd(), "public"); // Adjust if needed

const mapping = {};

async function uploadFolder(folder, baseFolder) {
  const files = fs.readdirSync(folder);
  for (const file of files) {
    const fullPath = path.join(folder, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      await uploadFolder(fullPath, baseFolder);
    } else if (/\.(jpg|jpeg|png|svg)$/i.test(file)) {
      const relativeDir = path
        .relative(baseFolder, path.dirname(fullPath))
        .replace(/\\/g, "/");
      const cloudinaryFolder = relativeDir
        ? `blench-assets/${relativeDir}`
        : "blench-assets";
      const relativePath = path
        .relative(baseFolder, fullPath)
        .replace(/\\/g, "/");
      try {
        const result = await cloudinary.uploader.upload(fullPath, {
          folder: cloudinaryFolder,
        });
        mapping[relativePath] = result.secure_url;
        console.log(`Uploaded: ${relativePath} -> ${result.secure_url}`);
      } catch (err) {
        console.error(`Error uploading ${relativePath}:`, err);
      }
    }
  }
}

async function main() {
  await uploadFolder(folderPath, folderPath);
  // Write JSON mapping
  fs.writeFileSync(
    path.join(process.cwd(), "cloudinary-mapping.json"),
    JSON.stringify(mapping, null, 2),
    "utf-8"
  );
  // Write JS module mapping
  const jsModule =
    "// Auto-generated Cloudinary mapping. Do not edit manually.\n" +
    "const cloudinaryMapping = " +
    JSON.stringify(mapping, null, 2) +
    ";\n\nexport default cloudinaryMapping;\n";
  fs.writeFileSync(
    path.join(process.cwd(), "cloudinary-mapping.js"),
    jsModule,
    "utf-8"
  );
  console.log(
    "\nMapping files 'cloudinary-mapping.json' and 'cloudinary-mapping.js' created."
  );
}

main();
