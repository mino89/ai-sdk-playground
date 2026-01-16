import fs from "fs";
import path from "path";
import { setupDb } from "../db";
import { ingestPdf } from "../ingest";

const DOCS_DIR = "./knowledge";
async function main() {
  console.log("🚀 Start indexing");
  await setupDb();

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  for (const filename of files) {
    try {
      process.stdout.write(`🔍 processing ${filename} ...`);
      await ingestPdf(path.join(DOCS_DIR, filename));
    } catch (e) {
      console.error(`❌ error! ${e}`);
    }
  }
}

main();
