import { createClient } from "@libsql/client";
import { QUERIES } from "./queries";

// initialize the client in a local file
export const client = createClient({
  url: process.env.DB_FILE_NAME || "file:local.db",
});

export async function setupDb() {
  await client.batch(
    [QUERIES.createDocumentsTable, QUERIES.createDocumentsIndex],
    "write"
  );

  console.log("🚀 DB ready");
}
