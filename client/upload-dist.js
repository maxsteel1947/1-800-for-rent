const fs = require("fs");
const path = require("path");
const { NFTStorage, File } = require("nft.storage");

const token = process.env.NFT_STORAGE_API_KEY;
if (!token) {
  console.error("Set NFT_STORAGE_API_KEY env var before running.");
  process.exit(1);
}

function walkDir(dir, base = "") {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files.push(...walkDir(filePath, path.join(base, name)));
    } else {
      const content = fs.readFileSync(filePath);
      files.push(new File([content], path.join(base, name)));
    }
  }
  return files;
}

(async () => {
  try {
    const client = new NFTStorage({ token });
    const files = walkDir(path.join(__dirname, "dist"));
    console.log("Uploading", files.length, "files...");
    const cid = await client.storeDirectory(files);
    console.log("Upload complete.");
    console.log("CID:", cid);
    console.log("Gateway URL: https://dweb.link/ipfs/" + cid + "/");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
