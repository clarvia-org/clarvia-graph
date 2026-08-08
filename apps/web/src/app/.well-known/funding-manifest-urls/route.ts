// SPDX-FileCopyrightText: 2025-2026 CLARVIA ASBL, Luxembourg
// SPDX-License-Identifier: Apache-2.0

/**
 * .well-known/funding-manifest-urls
 *
 * Discovery endpoint for the funding.json manifest.
 * See https://fundingjson.org/ and IANA Well-Known URIs registry.
 */
export function GET(): Response {
  return new Response("https://clarvia.org/funding.json\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
