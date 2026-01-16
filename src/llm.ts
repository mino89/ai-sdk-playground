import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  wrapLanguageModel,
  gateway,
  streamText,
  stepCountIs,
  ToolSet,
  tool,
  embed,
} from "ai";
import z from "zod";
import { client } from "./db";
import { CONFIG } from "./config";

const model = wrapLanguageModel({
  model: gateway(CONFIG.model),
  middleware: devToolsMiddleware(),
});

const tools: ToolSet = {
  dateTime: tool({
    description: "Get the date date and time info",
    inputSchema: z.object({}),
    execute: () => new Date(),
  }),
  getInformation: tool({
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
        sql: `
          SELECT content 
          FROM vector_top_k('idx_documents_embedding', vector(?), 3) 
          JOIN documents ON documents.id = vector_top_k.id
        `,
        args: [JSON.stringify(embedding)],
      });
      return result.rows.length > 0
        ? result.rows.map((r) => r.content).join("\n---\n")
        : "no information found";
    },
  }),
};

export async function askllm(prompt: string) {
  const result = streamText({
    model,
    tools,
    system: `
      Act as an a11y expert, reply in a clear and professional tone.
      Use the getInformation tool to search for specific accessibility information.
      Replay with the same language of the request.
      Only respond with information related to accessibility. If asked something outside of this topic, politely refuse.
    `,
    stopWhen: stepCountIs(5),
    prompt,
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    fullText += chunk;
  }
  process.stdout.write("\n");
  return fullText.trim();
}
