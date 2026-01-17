import { tool } from "ai";
import z from "zod";

export function dateTime() {
  return tool({
    description: "Get the date date and time info",
    inputSchema: z.object({}),
    execute: () => new Date(),
  });
}
