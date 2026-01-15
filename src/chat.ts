import * as readline from "node:readline/promises";
import { ChatConfig, ChatMessageConfig } from "./model";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

export async function ask(content: string): Promise<string | void> {
  try {
    return await rl.question(content);
  } catch (error: any) {
    return handleError(error);
  }
}

export async function res(content: string) {
  return process.stdout.write(content + "\n");
}

async function chat(options: ChatMessageConfig) {
  const q = await options.onMessage(`${options.questionIndicator} `, "");
  if (!q || q.trim() === "") {
    return;
  }
  await options.onReply(options.answerIndicator, q);
  chat(options);
}

export async function runChat(options: ChatConfig) {
  try {
    console.log(options.startingMessage + "\n");
    process.on("SIGINT", () => {
      console.log("\n" + options.endingMessage);
      end();
    });
    chat(options.message);
  } catch (error) {
    handleError(error);
  }
}

export function end() {
  rl.close();
  process.exit(0);
}

function handleError(error: any) {
  if (error.code === "ABORT_ERR" || error.name === "AbortError") {
    end();
    process.exit(0);
  }
  throw error;
}
