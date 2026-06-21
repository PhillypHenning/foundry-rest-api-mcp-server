import { z } from "zod";

const ConfigSchema = z.object({
  apiKey: z.string().min(1),
  relayUrl: z.string().url().default("https://foundryrestapi.com"),
  clientId: z.string().optional(),
  userId: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const raw = {
    apiKey: process.env.FOUNDRY_API_KEY,
    relayUrl: process.env.FOUNDRY_RELAY_URL || "https://foundryrestapi.com",
    clientId: process.env.FOUNDRY_CLIENT_ID || undefined,
    userId: process.env.FOUNDRY_USER_ID || undefined,
  };

  const result = ConfigSchema.safeParse(raw);
  if (!result.success) {
    process.stderr.write(
      "Error: FOUNDRY_API_KEY is required.\n" +
        "Set it in your environment or .env file.\n" +
        "Get a key at https://foundryvtt-rest-api-relay.fly.dev\n"
    );
    process.exit(1);
  }

  return result.data;
}
