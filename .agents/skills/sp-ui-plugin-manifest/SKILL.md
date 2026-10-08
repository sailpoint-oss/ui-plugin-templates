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
- **`apiScopes`** — the SailPoint API scopes the plugin may use (up to 20).
- **`permissionPolicy` / `iframeAllow` / `contentSecurityPolicies`** — declarative security fields; edit by hand as features need them. Keep them `{}` unless required. UMS merges them with the platform baseline.
- **`slots`** — where the plugin mounts (`full-page` is the only slot today).

The CLI validates the file against the schema before deploying.

## Scopes gate API calls

A call to an undeclared scope fails identically in local dev and production. The minted token is scoped and acts **on behalf of the signed-in user** — it can only narrow the user's access, never grant more, and declaring a scope does not guarantee the user holds it. See the `plugin-credentials-and-scopes` skill before trying to widen access or embed a credential.

## When a change needs `push-manifest`

- Edited **before** `create`: just run `create`.
- Edited **after** `create`: run `push-manifest` (alias `update`) to send the `manifest` section to the tenant. If you changed a security field, also run `link` again so the CLI refreshes the dev-server headers. See the `plugin-lifecycle-cli` skill.
