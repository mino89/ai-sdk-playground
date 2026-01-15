import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  wrapLanguageModel,
  gateway,
  streamText,
  stepCountIs,
  ToolSet,
  tool,
} from "ai";
import z from "zod";

const model = wrapLanguageModel({
  model: gateway("openai/gpt-4o-mini"),
  middleware: devToolsMiddleware(),
});

const tools: ToolSet = {
  dateTime: tool({
    description: "Get the date date and time info",
    inputSchema: z.object({}),
    execute: () => new Date(),
  }),
};

export async function askllm(prompt: string) {
  const result = streamText({
    model,
    tools,
    prompt,
    stopWhen: stepCountIs(5),
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    fullText += chunk;
  }
  process.stdout.write("\n");
  return fullText.trim();
}
