---
name: sp-ui-plugin-manifest
description: Use when editing `sp-ui-plugin.json`, choosing a plugin alias, declaring `apiScopes`, or configuring the plugin's security fields (Content-Security-Policy, Permissions-Policy, iframe allow). Explains the manifest-versus-build split, alias rules, how declared scopes gate API calls, and when a change requires `push-manifest`. Use it for any change to the plugin manifest.
---

# The `sp-ui-plugin.json` manifest

`sp-ui-plugin.json` is the source of truth for the plugin's identity and security posture — treat it as the contract with the backend. This skill is the field reference; the plugin guide in the project root (`SAILPOINT_PLUGIN_GUIDE.md`, or `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the Angular starter) gives the surrounding context.

## Two sections

- **`manifest`** is sent verbatim to the backend.
- **`build`** (`outDir`, `port`) is local-only and never leaves your machine.

## Fields

- **`alias`** — tenant-unique, path-safe key: lowercase alphanumeric and dashes, 3–63 characters, not shaped like a UUID. It is a stable, environment-independent key: the same alias maps to a different plugin instance in each tenant, so the same code promotes across staging and production.
- **`name` / `description`** — localized display strings (`{ "en": "…" }`).
- **`apiScopes`** — the SailPoint API scopes the plugin's calls may use (up to 20); see below.
- **`permissionPolicy` / `iframeAllow` / `contentSecurityPolicies`** — declarative security fields; edit by hand as features need them. Keep them `{}` unless required. UMS merges them with the platform baseline.
- **`slots`** — where the plugin mounts (`full-page` is the only slot today).

The CLI validates the file against the schema before deploying.

## `apiScopes`: what the plugin can do, not who can load it

`apiScopes` limits only what the plugin's API calls can reach — it does **not** control who can open the plugin. Every user who can reach the slot loads the plugin, whatever their access. A call to an undeclared scope then fails identically in local dev and production.

The minted token is scoped and acts **on behalf of the signed-in user**: it can only narrow the user's access, never grant more, and declaring a scope does not guarantee the user holds it — a call still fails when the user lacks that access.

Because loading is never gated by access, the plugin owns its own access-denied experience. Read the signed-in user's capabilities from the COIP handshake context (`user.capabilities`, e.g. `isOrgAdmin`) and render the right view — a privileged view, a regular-user view, or an explicit error/empty state — rather than assuming a declared scope means the user is privileged. See the `plugin-credentials-and-scopes` skill before trying to widen access or embed a credential.

## When a change needs `push-manifest`

- Edited **before** `create`: just run `create`.
- Edited **after** `create`: run `push-manifest` (alias `update`) to send the `manifest` section to the tenant. If you changed a security field, also run `link` again so the CLI refreshes the dev-server headers. See the `plugin-lifecycle-cli` skill.
