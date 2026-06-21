import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Deps, ToolModule } from "./types.js";
import { ok, fail } from "./types.js";
import { RelayError } from "../relay/errors.js";

export const searchModule: ToolModule = {
  register(server: McpServer, deps: Deps): void {
    server.registerTool(
      "foundry_search",
      {
        title: "Search Foundry Entities",
        description:
          'Search for Foundry entities by name. Returns UUID, documentType, subType, and package. This is the primary way to turn a name into a UUID for use with other tools. Use filter to narrow results, e.g. "Actor" or "documentType:Item,subType:weapon".',
        inputSchema: {
          query: z.string().describe("Search term, e.g. 'goblin' or 'longsword'"),
          filter: z
            .string()
            .optional()
            .describe(
              'Simple: "Actor". Compound: "documentType:Item,subType:weapon". Keys: documentType, subType, folder, package, resultType.'
            ),
          limit: z
            .number()
            .int()
            .min(1)
            .max(500)
            .default(50)
            .describe("Maximum results (default 50, max 500)"),
          minified: z
            .boolean()
            .default(true)
            .describe(
              "Return slim results (uuid/id/name/img/documentType only). Default true."
            ),
          excludeCompendiums: z
            .boolean()
            .optional()
            .describe("Exclude compendium results"),
          clientId: z
            .string()
            .optional()
            .describe("Override the default clientId for this call"),
        },
        annotations: {
          readOnlyHint: true,
          openWorldHint: true,
        },
      },
      async (args) => {
        try {
          const query: Record<string, string | number | boolean | undefined> = {
            query: args.query,
            limit: args.limit,
            minified: args.minified,
          };
          if (args.filter) query.filter = args.filter;
          if (args.excludeCompendiums !== undefined)
            query.excludeCompendiums = args.excludeCompendiums;
          if (args.clientId) query.clientId = args.clientId;

          const data = await deps.callRelay("GET", "/search", { query });
          return ok(data);
        } catch (e) {
          if (e instanceof RelayError) return fail(e.message);
          throw e;
        }
      }
    );
  },
};
