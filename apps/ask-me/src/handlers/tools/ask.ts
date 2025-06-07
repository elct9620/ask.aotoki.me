import { z } from "zod";

export const AskTool = {
  name: "ask",
  description: "Query the article is written by Aotokitsuruya",
  inputSchema: { query: z.string().min(1, "Query is required") },
};

export async function askToolHandler(input: { query: string }) {
  return {
    isError: false,
    content: [],
  };
}
