import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolModule } from "./types.js";
import { ok, fail } from "./types.js";
import { RelayError } from "../relay/errors.js";

export const worldsModule: ToolModule = {
  register(server: McpServer, deps: Deps): void {
    server.registerTool(
      "foundry_list_worlds",
      {
        title: "List Foundry Worlds",
        description:
          "List all Foundry VTT worlds/clients connected to the relay, including their online status, system, and version info.",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          openWorldHint: true,
        },
      },
      async () => {
        try {
          const data = await deps.callRelay("GET", "/clients", {
            rawEnvelope: true,
          } as Parameters<typeof deps.callRelay>[2] & { rawEnvelope?: boolean });
          const envelope = data as {
            clients?: unknown[];
            total?: number;
          };
          const clients = envelope.clients ?? [];
          return ok({ clients, total: envelope.total ?? clients.length });
        } catch (e) {
          if (e instanceof RelayError) return fail(e.message);
          throw e;
        }
      }
    );
  },
};

export async function checkStartupConnection(deps: Deps): Promise<void> {
  try {
    const data = (await deps.callRelay("GET", "/clients", {
      rawEnvelope: true,
    } as Parameters<typeof deps.callRelay>[2] & { rawEnvelope?: boolean })) as {
      clients?: Array<{
        clientId: string;
        worldTitle?: string;
        isOnline?: boolean;
        systemId?: string;
      }>;
    };
    const clients = data.clients ?? [];
    const online = clients.filter((c) => c.isOnline);

    if (online.length === 0) {
      process.stderr.write(
        "[foundry-mcp] Warning: No Foundry worlds are currently online.\n"
      );
    } else {
      for (const c of online) {
        const resolved =
          !deps.config.clientId || deps.config.clientId === c.clientId;
        process.stderr.write(
          `[foundry-mcp] Online world: "${c.worldTitle}" (${c.clientId}) system=${c.systemId}${resolved ? " ← active" : ""}\n`
        );
      }
      if (deps.config.clientId) {
        const match = clients.find(
          (c) => c.clientId === deps.config.clientId
        );
        if (!match) {
          process.stderr.write(
            `[foundry-mcp] Warning: FOUNDRY_CLIENT_ID="${deps.config.clientId}" not found in client list.\n`
          );
        }
      }
    }
  } catch (e) {
    process.stderr.write(
      `[foundry-mcp] Warning: Could not check relay connectivity: ${e}\n`
    );
  }
}
