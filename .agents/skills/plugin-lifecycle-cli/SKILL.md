---
name: plugin-lifecycle-cli
description: Use when registering, running, building, or deploying a SailPoint UI plugin with the `sail ui-plugins` CLI, or when unsure which command to run after editing the manifest. Covers the end-to-end lifecycle (init, create, link, start, build, deploy) and when to re-run `push-manifest` or `link` after changing scopes or security headers. It does not enumerate flags — defer to `sail ui-plugins --help` and the CLI docs for the authoritative command reference.
---

# SailPoint UI plugin lifecycle (CLI)

The `sail ui-plugins` CLI registers, links, builds, and deploys a plugin. This skill covers the workflow and the "which command now?" decisions. For the authoritative command list, flags, and usage, use the CLI's own help rather than memorizing it here:

- `sail ui-plugins --help` and `sail ui-plugins <command> --help`
- CLI docs: <https://developer.sailpoint.com/docs/tools/cli>

See `SAILPOINT_PLUGIN_GUIDE.md` (or the Angular guide) in the project root for the surrounding detail, and the `sp-ui-plugin-manifest` and `plugin-credentials-and-scopes` skills for the manifest contract and scopes.

## The loop

1. `init` — scaffold the workspace and generate `sp-ui-plugin.json`.
2. Edit `sp-ui-plugin.json` for your plugin's identity, scopes, and security fields.
3. `create` — register the plugin with your tenant.
4. `link` — link your local dev server to your identity; this also writes the effective security headers into your dev-server config (for the Angular starter, `angular.json`).
5. Start the dev server (`npm start`), then open the returned developer URL (`?spPluginDev=<alias>`) to run local code inside the live tenant with a real handshake, scoped token, and live data.
6. `npm run build`, then deploy the compiled assets with the CLI. Uploaded assets are hosted immutably on the CDN; deployment targets the plugin bound to your **alias** in the current tenant context.

## Which command after a manifest edit?

- Edited **before** `create`: just run `create`.
- Edited **after** `create`: run `push-manifest` (alias `update`) to send the `manifest` section to the tenant. If you changed security fields (`contentSecurityPolicies`, `permissionPolicy`, `iframeAllow`), also run `link` again so the CLI refreshes the dev-server headers.
- The `build` section is local-only and never sent to the tenant.

## Scopes

Add any `apiScopes` you need **before** calling the endpoint — an undeclared scope fails identically in local dev and production. If you already ran `create`, run `push-manifest` after adding the scope.

## Dev-server security headers

The CLI writes the effective `Content-Security-Policy` and `Permissions-Policy` into your dev-server config on `create`/`link`. The dev server reads them from that config (for Angular, `angular.json` → `architect.serve.options.headers`), **not** from `sp-ui-plugin.json`. If the dev server is already running when they change, restart it.

## Build/deploy gotchas

- Built assets must use **relative** paths (`baseHref`/`deployUrl` set to `./` in the Angular starter). Absolute paths like `/assets/main.js` produce a blank iframe and 404s after upload.
- Prereq: the npm install needs npm 11.12+ / Node 24.15+. The error `Cannot read properties of null (reading 'edgesOut')` means npm is too old — `npm install -g npm@latest` or move to a Node that bundles npm 11.12+. Other package managers (yarn, pnpm, bun) are unaffected.
