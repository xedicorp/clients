import fs from "fs";
import path from "path";
import ftp from "basic-ftp";

const BUILD_DIR = "dist"; // change if your build output folder differs

// Fill with environment variables or replace with values (not recommended to hardcode)
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USERNAME;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const FTP_REMOTE_PATH = process.env.FTP_REMOTE_PATH || "/";

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error("Missing FTP credentials. Set FTP_HOST, FTP_USERNAME and FTP_PASSWORD as env variables.");
  process.exit(1);
}

async function uploadDir(client, localDir, remoteDir) {
  await client.ensureDir(remoteDir);
  await client.clearWorkingDir(); // optional: remove remote files before upload
  await client.uploadFromDir(localDir);
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: false
    });

    // Ensure build exists
    if (!fs.existsSync(BUILD_DIR)) {
      console.error(`Build directory '${BUILD_DIR}' not found. Run 'npm run build' first.`);
      process.exit(1);
    }

    console.log(`Uploading '${BUILD_DIR}' → ${FTP_HOST}:${FTP_REMOTE_PATH}`);
    await uploadDir(client, BUILD_DIR, FTP_REMOTE_PATH);
    console.log("Upload complete.");
  } catch (err) {
    console.error("FTP upload failed:", err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();