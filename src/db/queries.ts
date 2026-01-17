export const QUERIES = {
  createDocumentsTable: `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      embedding FLOAT32(1536)
    );
  `,
  createDocumentsIndex: `
    CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents (libsql_vector_idx(embedding));
  `,
  findDocuments: `
  WITH vector_scores AS (
    SELECT
      d.id,
      d.content,
      1 - vector_distance_cos(d.embedding, vector(?)) AS similarity
    FROM documents d
    ORDER BY similarity DESC
    LIMIT ?
  )
  SELECT id, content, similarity
  FROM vector_scores
  `,
  insertDocument: `
    INSERT INTO documents (content, embedding) VALUES (?, vector(?))
  `,
};
