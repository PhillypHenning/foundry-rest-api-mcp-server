import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Deps } from "./types.js";
import { worldsModule } from "./worlds.js";
import { searchModule } from "./search.js";
import { entityModule } from "./entity.js";
import { creatureModule } from "./creature.js";
import { foldersModule } from "./folders.js";

export function registerAllModules(server: McpServer, deps: Deps): void {
  worldsModule.register(server, deps);
  searchModule.register(server, deps);
  entityModule.register(server, deps);
  creatureModule.register(server, deps);
  foldersModule.register(server, deps);
}
