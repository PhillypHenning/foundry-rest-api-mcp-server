import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRequire } from "module";
import type { Config } from "./config.js";
import { makeCallRelay } from "./relay/client.js";
import { registerAllModules } from "./tools/registry.js";
import type { Deps } from "./tools/types.js";
import { checkStartupConnection } from "./tools/worlds.js";

const require = createRequire(import.meta.url);

function getVersion(): string {
  try {
    const pkg = require("../package.json") as { version: string };
    return pkg.version;
  } catch {
    return "0.1.0";
  }
}

export async function createServer(config: Config): Promise<McpServer> {
  const server = new McpServer({ name: "foundry-relay", version: getVersion() });
  const callRelay = makeCallRelay(config);
  const deps: Deps = { callRelay, config };

  registerAllModules(server, deps);

  // Non-blocking startup connectivity check
  checkStartupConnection(deps).catch(() => {
    /* warnings already logged in checkStartupConnection */
  });

  return server;
}
