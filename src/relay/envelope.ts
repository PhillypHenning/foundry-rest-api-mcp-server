// Known payload keys per operation, in priority order.
const PAYLOAD_KEYS = ["data", "uuid", "entity", "results", "clients", "filter"] as const;

export function unwrapEnvelope(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  // /clients has no type/requestId envelope — just return as-is
  if ("clients" in obj && "total" in obj) return obj;

  // Session endpoints are bare objects
  if (!("type" in obj) && !("requestId" in obj)) return obj;

  // Return the first known payload key present
  for (const key of PAYLOAD_KEYS) {
    if (key in obj) return obj[key];
  }

  // Fallback: strip envelope metadata and return the rest
  const { type: _t, requestId: _r, ...rest } = obj;
  return rest;
}
