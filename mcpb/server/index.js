#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createRequire } from "node:module";
import { analyze } from "./analyzer.js";

const { version } = createRequire(import.meta.url)("./package.json");

const server = new Server(
  { name: "readability", version },
  { capabilities: { tools: {} } },
);

const TOOL = {
  name: "analyze_readability",
  description:
    "Score English prose with Flesch Reading Ease (0-100, higher = easier), " +
    "MTLD, TTR, plus sentence and word stats. Call this before finalizing " +
    "any substantial prose (docs, PR descriptions, commit bodies, blog " +
    "posts). If flesch_reading_ease is below the user's threshold (default 60), " +
    "rewrite with shorter sentences and plainer words, then re-check.",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The prose to analyze. Markdown is fine — it will be stripped.",
      },
    },
    required: ["text"],
  },
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "analyze_readability") {
    return {
      content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
      isError: true,
    };
  }
  const text = request.params.arguments?.text ?? "";
  const result = analyze(text);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    ...(result.error ? { isError: true } : {}),
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
