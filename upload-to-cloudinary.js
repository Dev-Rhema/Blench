import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: "dwzojroob",
  api_key: "247996481866464",
  api_secret: "zBur-wIBjtM68Mk7q6-rBPwWt-c",
});

const folderPath = path.join(process.cwd(), "public"); // Adjust if needed

function uploadFolder(folder) {
  fs.readdirSync(folder).forEach((file) => {
    const fullPath = path.join(folder, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      uploadFolder(fullPath);
    } else if (/\.(jpg|jpeg|png|svg)$/i.test(file)) {
      cloudinary.uploader
        .upload(fullPath, { folder: "your-folder-name" })
        .then((result) =>
          console.log(`Uploaded: ${file} -> ${result.secure_url}`)
        )
        .catch((err) => console.error(`Error uploading ${file}:`, err));
    }
  });
}

uploadFolder(folderPath);
