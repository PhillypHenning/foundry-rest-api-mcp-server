import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallRelayFn } from "../relay/client.js";
import type { Config } from "../config.js";

export interface Deps {
  callRelay: CallRelayFn;
  config: Config;
}

export interface ToolModule {
  register(server: McpServer, deps: Deps): void;
}

export function ok(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function fail(message: string): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}
