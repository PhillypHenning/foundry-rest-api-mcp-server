import type { Config } from "../config.js";
import { mapHttpError, RelayError } from "./errors.js";
import { unwrapEnvelope } from "./envelope.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface CallRelayOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** When true, return the full envelope rather than unwrapping it. */
  rawEnvelope?: boolean;
}

export type CallRelayFn = (
  method: HttpMethod,
  path: string,
  opts?: CallRelayOptions
) => Promise<unknown>;

export function makeCallRelay(config: Config): CallRelayFn {
  return async function callRelay(
    method: HttpMethod,
    path: string,
    opts: CallRelayOptions = {}
  ): Promise<unknown> {
    const { query = {}, body, timeoutMs = 30_000, rawEnvelope = false } = opts;

    const url = new URL(path, config.relayUrl);

    // clientId and userId always go in query string
    if (config.clientId) url.searchParams.set("clientId", config.clientId);
    if (config.userId) url.searchParams.set("userId", config.userId);

    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const signal = opts.signal
      ? anySignal([opts.signal, controller.signal])
      : controller.signal;

    const headers: Record<string, string> = {
      "x-api-key": config.apiKey,
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });
    } finally {
      clearTimeout(timer);
    }

    let responseBody: unknown;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      throw mapHttpError(response.status, responseBody);
    }

    // Also treat success:false as an error
    if (
      responseBody != null &&
      typeof responseBody === "object" &&
      "success" in (responseBody as object) &&
      (responseBody as Record<string, unknown>).success === false
    ) {
      throw new RelayError(
        200,
        "success_false",
        `Relay returned success:false: ${JSON.stringify(responseBody)}`,
        responseBody
      );
    }

    if (rawEnvelope) return responseBody;
    return unwrapEnvelope(responseBody);
  };
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort(sig.reason);
      return controller.signal;
    }
    sig.addEventListener("abort", () => controller.abort(sig.reason), {
      once: true,
    });
  }
  return controller.signal;
}
