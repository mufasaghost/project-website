/**
 * EXAMPLE — not wired into the site, not run by `astro build` or `astro dev`.
 *
 * This project is a static Astro site with no server-side handler yet
 * (no contact form, no API routes) to attach a real classification use
 * case to. This file sketches the shape that use case would take once one
 * exists — e.g. a future `src/pages/api/contact.ts` endpoint that wants to
 * triage inbound messages before they hit an inbox or a database.
 *
 * Delete this file once a real caller (a form handler, an API route, etc.)
 * takes its place, or keep it around as a reference.
 *
 * Run manually to try it out (requires TYPESAFE_API_KEY and the
 * `@typesafe-ai/sdk` dependency, already listed in package.json):
 *
 *   TYPESAFE_API_KEY=... npx tsx src/lib/jev.example.ts
 */

import { choice, noul } from "@typesafe-ai/sdk";
import { askJev, isJevConfigured, JevUnavailableError } from "./jev";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ContactTriage {
  /** Coarse routing bucket for the message. */
  topic: "sales" | "support" | "bug_report" | "spam" | "other";
  /** Whether the message reads as urgent and should be prioritized. */
  urgent: boolean;
}

/**
 * Classify a contact-form submission so it can be routed and prioritized
 * without a human reading every message first.
 */
export async function triageContactMessage(
  msg: ContactMessage
): Promise<ContactTriage> {
  const { answers } = await askJev(
    { name: msg.name, email: msg.email, message: msg.message },
    {
      topic: choice("What is this message primarily about?", {
        sales: "Interested in buying or upgrading a plan",
        support: "Needs help using an existing product or account",
        bug_report: "Reporting something broken or behaving incorrectly",
        spam: "Unsolicited advertising, or unrelated to the product",
        other: null,
      }),
      urgent: noul("Does this message need a response within the next few hours?"),
    }
  );

  return {
    topic: answers.topic.choice,
    urgent: answers.urgent.noul > 0.5,
  };
}

// Manual smoke test — only runs when this file is executed directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!isJevConfigured()) {
    console.error("Set TYPESAFE_API_KEY to run this example.");
    process.exit(1);
  }

  triageContactMessage({
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Your checkout page has been throwing a 500 error since this morning — please help ASAP!",
  })
    .then((triage) => console.log(triage))
    .catch((err) => {
      if (err instanceof JevUnavailableError) {
        console.error(err.message);
        process.exit(1);
      }
      throw err;
    });
}
