import { embed, tool } from "ai";
import z from "zod";
import { CONFIG } from "../config";
import { client } from "../db/db";
import { QUERIES } from "../db/queries";

export function getInformation() {
  return tool({
    description: "Search information about accesibility",
    inputSchema: z.object({
      query: z.string().describe("The string for semantic search"),
    }),
    execute: async ({ query }) => {
      const { embedding } = await embed({
        model: CONFIG.embeddingModel,
        value: query,
      });

      const result = await client.execute({
        sql: QUERIES.findDocuments,
        args: [JSON.stringify(embedding), 5],
      });

      return result.rows.length > 0
        ? result.rows.map((r) => JSON.stringify(r.content)).join("\n---\n")
        : "no information found";
    },
  });
}
