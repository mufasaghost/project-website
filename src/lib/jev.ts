/**
 * Jev (TypeSafe AI) integration — a small, isolated wrapper around the
 * TypeSafe AI SDK for fast, typed decisions (classification, routing,
 * scoring, yes/no verification) instead of a full free-form LLM call.
 *
 *   Product:  https://typesafe.ai
 *   Docs:     https://docs.typesafe.ai/
 *   Package:  @typesafe-ai/sdk (npm)
 *
 * This project is currently a static Astro site (see src/pages/) with no
 * server-side request handling — no API routes, no form backend, no SSR
 * adapter configured — so nothing calls this module yet. It's provided as
 * a ready-to-use building block for the first real classification/
 * routing/scoring/verification need this site grows (e.g. a future
 * contact-form endpoint that wants to auto-triage messages).
 *
 * Design:
 *  - The `@typesafe-ai/sdk` package is imported lazily (dynamically), only
 *    when a Jev call is actually made, so nothing breaks if it isn't
 *    installed.
 *  - The API key is read only from the `TYPESAFE_API_KEY` environment
 *    variable — it is never hardcoded here.
 *  - If the package isn't installed or the key isn't set, calls reject
 *    with a clear `JevUnavailableError` instead of crashing the process.
 */

import type { EntryType, Questions, SystemOneResult } from "@typesafe-ai/sdk";

/** Thrown when Jev can't be used — missing package or missing API key. */
export class JevUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JevUnavailableError";
  }
}

type JevModule = typeof import("@typesafe-ai/sdk");

let modulePromise: Promise<JevModule> | null = null;

async function loadJevModule(): Promise<JevModule> {
  if (!modulePromise) {
    // Dynamic import keeps this a no-op cost when Jev is never called, and
    // lets the rest of the app run fine even if the package isn't installed.
    modulePromise = import("@typesafe-ai/sdk").catch((err: unknown) => {
      modulePromise = null;
      throw new JevUnavailableError(
        'The "@typesafe-ai/sdk" package is not installed. Run `npm install @typesafe-ai/sdk` ' +
          `to enable Jev-powered checks. (${err instanceof Error ? err.message : String(err)})`
      );
    });
  }
  return modulePromise;
}

let clientPromise: Promise<InstanceType<JevModule["TypeSafeClient"]>> | null = null;

async function getClient() {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    throw new JevUnavailableError(
      "TYPESAFE_API_KEY is not set. Set it in the environment to enable Jev-powered checks " +
        "(see https://docs.typesafe.ai/)."
    );
  }

  if (!clientPromise) {
    clientPromise = loadJevModule()
      .then(({ TypeSafeClient }) => new TypeSafeClient({ apiKey }))
      .catch((err) => {
        clientPromise = null;
        throw err;
      });
  }

  return clientPromise;
}

/**
 * Answer named typed questions about some text/JSON `state` using Jev.
 *
 * Thin, typed pass-through to `TypeSafeClient#systemOne` that centralizes
 * the lazy import and graceful-degradation handling so callers don't have
 * to. Build questions with the `choice`, `score`, and `noul` helpers
 * exported by `@typesafe-ai/sdk` (see `src/lib/jev.example.ts`).
 *
 * @throws {JevUnavailableError} The package isn't installed, or
 *   `TYPESAFE_API_KEY` isn't set.
 */
export async function askJev<const Q extends Questions>(
  state: EntryType,
  questions: Q
): Promise<SystemOneResult<Q>> {
  const client = await getClient();
  return client.systemOne({ state, questions });
}

/** True if Jev looks usable right now (key present); does not check the package. */
export function isJevConfigured(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY);
}
