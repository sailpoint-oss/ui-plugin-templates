# SailPoint UI Plugin Guide (Angular)

> Angular-specific guide for developing this plugin against SailPoint Identity
> Security Cloud (ISC). It is intentionally self-contained so both humans and AI
> coding assistants have full context without external lookups. This is the only
> plugin guide you need when starting from the Angular starter.

## Context for AI assistants

- This project is a **SailPoint ISC UI plugin**: a standalone Angular app that
  ISC loads inside a **sandboxed iframe** at a designated UI **slot**.
- The plugin is isolated from the ISC host. It communicates with the host only
  through the SailPoint UI Plugin SDK, which wraps a `postMessage` protocol
  (COIP). Do not assume direct DOM, cookie, or network access to the ISC page.
- Network calls to SailPoint APIs use a **scoped token** limited to the
  `apiScopes` declared in `sp-ui-plugin.json`. A call to an undeclared scope
  fails the same way locally as in production.
- `sp-ui-plugin.json` is the source of truth for the plugin's identity and
  security posture. Treat it as the contract with the backend.
- Build tooling is the Angular CLI. The SailPoint CLI orchestrates registration
  and deployment; it does not replace `ng`.

## The configuration file: `sp-ui-plugin.json`

```jsonc
{
    "version": 1,
    "manifest": {
        "alias": "",                    // tenant-unique, path-safe key (lowercase,
                                        // alphanumeric + dashes, 3-63 chars)
        "name": { "en": "" },           // localized display name
        "description": { "en": "" },    // localized description
        "apiScopes": ["sp:scopes:all"], // SailPoint API scopes the plugin may use
        "permissionPolicy": {},         // Permissions-Policy directives
        "iframeAllow": {},              // iframe `allow` directives (object form)
        "contentSecurityPolicies": {},  // CSP directives for the plugin's assets
        "slots": [{ "slotId": "full-page" }]
    },
    "build": {
        "outDir": "./dist/<your-plugin>/browser", // compiled assets uploaded on deploy
        "port": 4200                              // local dev server port
    }
}
```

- **`manifest`** is sent verbatim to the backend. **`build`** is local-only and
  never leaves your machine. For the Angular starter, `outDir` defaults to
  `./dist/<your-plugin>/browser` (Angular's `dist/<project>/browser` output).
- Security fields (`permissionPolicy`, `iframeAllow`, `contentSecurityPolicies`)
  are declarative — edit them by hand as your plugin needs them. The CLI
  validates the file against the expected schema before deploying.
- The **alias** is a stable, environment-independent key. The same alias maps to
  a different plugin instance in each tenant, so you can deploy the same code to
  staging and production without juggling GUIDs.

## Local development

```bash
npm install
```

The SailPoint CLI registers your plugin and links your local server for
in-tenant development (see [SailPoint CLI](#sailpoint-cli)). The development loop
is:

1. Register the plugin with your tenant.
2. Start the Angular dev server — `npm start` (`ng serve`).
3. Link your local server to your identity, then open the returned developer URL
   (`?spPluginDev=<alias>`) in ISC. The host verifies the override and, if
   authorized, loads your local code inside the live tenant with a local-dev
   badge — real handshake, real scoped token, live data.

Because local dev uses a real scoped token minted from your declared
`apiScopes`, an endpoint you did not declare fails locally exactly as it would
in production. Add scopes to `sp-ui-plugin.json` when you need them.

For plugin-document security headers during local dev, see
[Local dev document headers](#local-dev-document-headers).

## Local dev document headers

The plugin iframe is governed by plugin-document `Content-Security-Policy` and
`Permissions-Policy` headers. In production, UMS stamps these on CDN assets. During
local development, your dev server must emit the same headers — otherwise API calls
(for example, fetches to your tenant API) may be blocked by CSP.

**Source of truth for the dev server:** `angular.json` →
`projects.<your-plugin>.architect.serve.options.headers`. The dev server does
**not** read security headers from `sp-ui-plugin.json`.

### Automatic setup (normal workflow)

After you register the plugin, the SailPoint CLI writes the effective headers into
`angular.json` when you run:

- `sail ui-plugins create`
- `sail ui-plugins link`

You do not need to hand-edit these values under the normal CLI workflow.

**Restart required:** If `npm start` (or `ng serve`) is already running when
create or link updates `angular.json`, restart the dev server so the new headers
take effect.

### Example (after create or link)

```json
"headers": {
  "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://<your-org>.api.cloud.sailpoint.com; ...",
  "Permissions-Policy": "camera=(), microphone=(), ..."
}
```

The CLI populates real values for your tenant. The snippet above uses
placeholders only.

### Manifest security fields

`sp-ui-plugin.json` `contentSecurityPolicies` and `permissionPolicy` do **not**
directly configure dev-server headers. If you change manifest security fields and
update the plugin instance in your tenant, UMS merges your changes with the
platform baseline; the CLI refreshes `angular.json` on the next create or link.

## Building and deploying

```bash
npm run build        # produces build.outDir (e.g. ./dist/<your-plugin>/browser)
```

Deploy the compiled assets with the SailPoint CLI (see
[SailPoint CLI](#sailpoint-cli)); uploaded assets are hosted immutably on the
CDN. Deployment targets the plugin instance bound to your **alias** in the CLI's
current tenant context, so the same commands promote across environments.

## SailPoint CLI

These files are typically placed in your project by the SailPoint CLI
(`sail ui-plugins init`), which also registers, links, builds, and deploys your
plugin. For the authoritative command list, usage, and flags, use the CLI's own
help and documentation rather than relying on this guide:

- `sail ui-plugins --help` (and `sail ui-plugins <command> --help`)
- CLI documentation: <https://developer.sailpoint.com/docs/tools/cli>

## SDK setup

_TBD._ Installing and initializing `@sailpoint/ui-plugin-sdk`, obtaining plugin
context, calling SailPoint APIs, and using UI controls (popups, asides, height).

## Design tokens / theming

_TBD._ Importing SailPoint design tokens so the plugin matches ISC styling.
Because the iframe's CSS is isolated, tokens must be imported explicitly.

## Customizing this starter

This starter ships with placeholder content (the app title, headings, and their
tests reference the starter's default name). Rename these to your plugin as you
build out real functionality.
