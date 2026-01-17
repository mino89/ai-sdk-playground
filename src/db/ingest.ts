import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { embedMany } from "ai";
import { client } from "./db";
import { CONFIG } from "../config";
import { QUERIES } from "./queries";

export async function ingestPdf(filePath: string) {
  const dataBuffer = await readFile(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  parser.destroy();
  // Chunking: split for paragraphs and filter the shortest (< 50)
  const chunks = data.text.split("\n\n").filter((c: any) => c.length > 50);
  if (chunks.length === 0) return;

  // Generate vectors in batches to avoid token limits
  const BATCH_SIZE = 10; // Process 5 chunks at a time
  const allEmbeddings = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: CONFIG.embeddingModel,
      values: batch,
    });
    allEmbeddings.push(...embeddings);
    console.log(
      `Processed ${Math.min(i + BATCH_SIZE, chunks.length)}/${
        chunks.length
      } chunks`
    );
  }

  // insert in local db
  for (let i = 0; i < chunks.length; i++) {
    await client.execute({
      sql: QUERIES.insertDocument,
      args: [chunks[i], JSON.stringify(allEmbeddings[i])],
    });
  }
}
