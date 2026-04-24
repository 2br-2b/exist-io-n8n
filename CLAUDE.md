# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

`n8n-nodes-exist-io` is an n8n community node package for the [Exist.io](https://exist.io/) personal-analytics API (v2, base `https://exist.io/api/2`). It ships one node (`ExistIo`) and two credential types (API token + OAuth2). Build output is `dist/`, which is what n8n actually loads (see the `n8n` block in `package.json`).

## Commands

All scripts delegate to `@n8n/node-cli`, which wraps TypeScript compile + lint + asset copy for n8n nodes.

```bash
npm run build          # Compile TS + copy icons into dist/
npm run build:watch    # tsc --watch only (no asset copy)
npm run dev            # Live-reload node inside a local n8n instance
npm run lint           # n8n-node lint (extends eslint-plugin-n8n-nodes-base rules)
npm run lint:fix       # Autofix lint issues
npm run release        # release-it flow; prepublishOnly runs n8n-node prerelease
```

There is no test suite. Validate changes by running `npm run dev` and exercising the node against a real Exist.io account, or by running `npm run lint` (the n8n linter enforces many node-correctness invariants — treat its errors as build failures).

## Architecture

### Declarative node, not programmatic

`nodes/ExistIo/ExistIo.node.ts` is a **declarative** n8n node: the class only defines `description: INodeTypeDescription` and has no `execute()` method. All HTTP behavior lives in `routing` objects attached to each property / operation. Consequences:

- A new API endpoint = a new operation entry with `routing: { request: { method, url } }` under the correct `resource`.
- Query parameters are wired via `routing.request.qs`, request bodies via `routing.request.body`. Both accept n8n expression strings (`={{ ... }}`).
- Bodies built from `fixedCollection` inputs (e.g. `acquireItems`, `createItems`, `incrementItems`) use an inline expression to strip empty fields:
  ```
  ={{ ($parameter["X"].item || []).map(i => Object.fromEntries(Object.entries(i).filter(([,v]) => v !== "" && v !== null && v !== undefined))) }}
  ```
  Keep this pattern — Exist's write endpoints reject empty strings for optional fields like `template` or `group`.
- `requestDefaults.baseURL` is set on the node; operation URLs are relative paths with trailing slashes (the Exist API requires them).

### Resources and their shape

Five resources, each a `resource` option with its own `operation` dropdown and (optionally) a `filters` collection:

- `profile` — single GET.
- `attribute` — read ops (`getMany`, `getOwned`, `getTemplates`, `getValues`, `getWithValues`) plus write ops (`acquire`, `release`, `create`, `update`, `increment`). Filter visibility inside the shared `filters` collection is controlled per-field via `displayOptions.show['/operation']` so the same collection is reused across list ops.
- `insight`, `average`, `correlation` — list/GET resources. `correlation` also has `getCombo` with two required top-level string params (`comboAttribute`, `comboAttribute2`).

When adding fields to a `filters` collection shared across multiple ops, scope them with `/operation` (note the leading slash — it references the sibling `operation` parameter one level up).

### Authentication

Two credential types, selected via the `authentication` top-level parameter:

- `existIoApi` ([credentials/ExistIoApi.credentials.ts](credentials/ExistIoApi.credentials.ts)) — simple token, sent as `Authorization: Token <token>`. **Read-only** per Exist's API; use OAuth2 for writes.
- `existIoOAuth2Api` ([credentials/ExistIoOAuth2Api.credentials.ts](credentials/ExistIoOAuth2Api.credentials.ts)) — extends n8n's built-in `oAuth2Api`. Default `scope` string lists all `*_read` scopes; to enable writes the user swaps `_read` for `_write` in the scopes they need.

Both credentials reference `file:../icons/existio.svg`; the node uses `file:../../icons/existio.svg` (paths are relative to the built `dist/` file location).

### Package wiring

`package.json` → `n8n` block points n8n at the compiled `dist/credentials/*.js` and `dist/nodes/ExistIo/ExistIo.node.js`. If you add a new node or credential file, register it here or it will silently not load. `files: ["dist"]` controls what ships to npm — source is not published.

## Conventions

- **Formatting:** tabs, single quotes, trailing commas all, LF, 100-col (`.prettierrc.js`). The codebase mixes tabs and 4-space indentation inside some `fixedCollection` option blocks — prefer tabs consistently when editing.
- **Icons:** SVG in `icons/`, referenced as `file:...` paths that resolve relative to the compiled JS in `dist/`.
- **No runtime deps:** `n8n-workflow` is a peer dep; everything else is devDeps. Don't add runtime dependencies without a strong reason — n8n community nodes are expected to be dependency-light.
