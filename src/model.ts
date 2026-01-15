export type ChatMessageConfig = {
  questionIndicator: string;
  answerIndicator: string;
  onMessage: (prefix: string, message: string) => Promise<any>;
  onReply: (prefix: string, message: string) => Promise<any>;
};

export type ChatConfig = {
  startingMessage: string;
  endingMessage: string;
  message: ChatMessageConfig;
};
