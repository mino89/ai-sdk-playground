import { ask, runChat } from "./chat";
import { askllm } from "./llm";

runChat({
  startingMessage: "Welcome to the chatbot",
  endingMessage: "Goodbye",
  message: {
    questionIndicator: "🙋:",
    answerIndicator: "🧑‍🏫:",
    onMessage: (pref, message) => {
      return ask(pref + message);
    },
    onReply: async (prefix, message) => {
      process.stdout.write(prefix);
      return askllm(message);
    },
  },
});
