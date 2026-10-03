# Agent instructions

When working with EmDash, query the official EmDash documentation rather than relying on remembered APIs or examples. Never include private Woodhouse code, credentials or personal information in documentation-search queries.

## Owner / human nomenclature

- The human project owner/operator is **MP** (**Meat Proxy**).
- In agent-facing prose — status updates, hand-offs, issue/PR comments, plans, reports, and coordination — refer to the human as **MP** by default.
- **MP**, **Meat Proxy**, **owner**, and **operator** refer to the same human when the context is project control.
- Preserve literal names where required for public-facing credits, account/Git identity, legal or administrative data, quoted text, or when MP explicitly asks otherwise.
- This is a naming convention only. It does not change authority, approval, safety, security, release, deployment, or merge gates.

Read PRODUCT.md, DESIGN.md, UNSLOP.md and ARCHITECTURE.md before making product changes.

## Evidence

- Keep every project state tied to an explicit review date.
- Do not infer a production or physical claim from a passing test.
- The private repository bodies and private conversations are not public content.
- Do not add issue counts, percentages, event totals or timestamps unless they have a source in the public-safe snapshot.

## Implementation

- Prefer static Astro pages and native browser behaviour.
- Preserve meaningful HTML, keyboard operation, visible focus and reduced-motion preferences.
- Add page-specific title, description, canonical and Open Graph metadata.
- Keep generated source documents in this repository untouched unless the operator explicitly asks to publish them.
- Run the production build before deployment. Inspect representative pages at phone and desktop sizes after visual changes.

## Publishing

Deployment targets the Cloudflare Worker configured in wrangler.jsonc. A production deploy changes woodhouse.loftwah.com; report the deployed version and verify the live hostname before claiming completion.
