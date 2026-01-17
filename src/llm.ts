import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  gateway,
  stepCountIs,
  streamText,
  ToolSet,
  wrapLanguageModel,
} from "ai";
import { CONFIG } from "./config";
import { dateTime } from "./tools/dateTime";
import { getInformation } from "./tools/getInformation";

const model = wrapLanguageModel({
  model: gateway(CONFIG.model),
  middleware: devToolsMiddleware(),
});

const tools: ToolSet = {
  dateTime: dateTime(),
  getInformation: getInformation(),
};

export async function askllm(prompt: string) {
  const result = streamText({
    model,
    tools,
    system: `
      Act as an a11y expert, reply in a clear and professional tone.
      Use the getInformation tool to search for specific accessibility information.
      Only respond with information related to accessibility. If asked something outside of this topic, politely refuse.
      Instructions:
      - Reply with the same language of the request.
      - When possible give me code examples in current code markdown representation \`\`\`code\`\`\`
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
