import { createClient } from "@libsql/client";

// initialize the client in a local file
export const client = createClient({
  url: "file:local.db",
});

export async function setupDb() {
  // create documents table with embedding column
  await client.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      embedding FLOAT32(1536)
    );
  `);

  // creating vector index (DiskANN) for fast research
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_documents_embedding 
    ON documents (libsql_vector_idx(embedding));
  `);

  console.log("🚀 DB ready");
}
