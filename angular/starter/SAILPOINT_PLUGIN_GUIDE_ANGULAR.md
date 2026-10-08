# SailPoint UI Plugin Guide (Angular)

> Angular-specific orientation for developing this plugin against SailPoint Identity Security. It gives the high-level picture and this project's conventions; the task-specific detail (API calls, theming, i18n, routing, animations, the CLI lifecycle, and the manifest) lives in the agent skills under `.agents/skills/`, which this guide points to.

## Context for AI assistants

- This project is a **SailPoint UI plugin**: a standalone Angular app that SailPoint Identity Security loads inside a **sandboxed iframe** at a designated UI **slot**.
- The plugin is isolated from the host. It communicates with the host only through the SailPoint UI Plugin SDK, which wraps a `postMessage` protocol (COIP). Do not assume direct DOM, cookie, or network access to the host page.
- Network calls to SailPoint APIs use a **scoped token** limited to the `apiScopes` declared in `sp-ui-plugin.json`. A call to an undeclared scope fails the same way locally as in production.
- `sp-ui-plugin.json` is the source of truth for the plugin's identity and security posture. Treat it as the contract with the backend.
- Build tooling is the Angular CLI. The SailPoint CLI orchestrates registration and deployment. The CLI does not replace `ng`.
- Agent skills live under `.agents/skills/` — for example `animating-ui-plugins` (Angular view encapsulation, `@keyframes` in production builds, verifying animations), plus shared skills such as `plugin-credentials-and-scopes`. Compatible coding agents load them automatically from `.agents/skills/`; otherwise read each `SKILL.md` directly before related work.

## Configuration: `sp-ui-plugin.json`

`sp-ui-plugin.json` is the plugin's identity and security contract with the backend. The `manifest` section is sent to the tenant; the `build` section (`outDir`, `port`) stays local. The **alias** is a stable, environment-independent key, so the same code promotes across tenants. `sail ui-plugins init` generates the file in this workspace.

For the field reference, alias rules, `apiScopes`, the declarative security fields, and when an edit needs `push-manifest`, see the **`sp-ui-plugin-manifest`** skill.

## Prerequisites

Install a current Node.js and npm before installing dependencies: **Node 24.15+ / npm 11.12+** (older npm fails during dependency resolution). The **`plugin-lifecycle-cli`** skill explains the `edgesOut` error and the fix.

## Local development

```bash
npm install
npm start   # ng serve
```

The SailPoint CLI registers the plugin and links your local server into the live tenant, so the developer URL (`?spPluginDev=<alias>`) gives you a real handshake, a scoped token, and live data. Because local dev uses a real scoped token, an endpoint you did not declare in `apiScopes` fails locally exactly as in production. The **`plugin-lifecycle-cli`** skill covers the full loop and which command to run after a manifest change.

## Local dev document headers

The plugin iframe is governed by `Content-Security-Policy` and `Permissions-Policy` headers. In production UMS stamps them on CDN assets; in local dev the dev server emits the same values, read from `angular.json` (`architect.serve.options.headers`) — **not** from `sp-ui-plugin.json`. The CLI writes them on `create`/`link`; restart the dev server if it was already running. See the **`plugin-lifecycle-cli`** skill.

## Building and deploying

```bash
npm run build   # produces build.outDir, e.g. ./dist/<your-plugin>/browser
```

Deploy the compiled assets with the SailPoint CLI; uploaded assets are hosted immutably on the CDN, targeting the plugin bound to your alias in the current tenant. Built assets must use **relative** paths (`baseHref`/`deployUrl` are `./` in this starter) — absolute paths produce a blank iframe and 404s after upload. See the **`plugin-lifecycle-cli`** skill.

## SailPoint CLI

The `sail ui-plugins` CLI registers, links, builds, and deploys the plugin. For the lifecycle and the "which command now?" decisions see the **`plugin-lifecycle-cli`** skill; for the authoritative command and flag reference use `sail ui-plugins --help` and <https://developer.sailpoint.com/docs/tools/cli>.

## SDK and SailPoint API access

All access goes through `SailpointPluginService` (`src/app/core/`, imported via `@core`). It owns a single SDK instance, runs the COIP handshake once, and exposes plugin/user/tenant context as signals; the app initializer awaits the handshake before the app renders, so components just read signals and never manage the handshake.

Typed calls use the `@sailpoint/angular-sdk` partition services; `plugin.get()` / `plugin.post()` cover untyped calls with the scoped token and tenant base URL. For the context signals, both call styles (Observable and `firstValueFrom`), raw SDK events, and handshake gating, see the **`calling-sailpoint-apis-angular`** skill.

## Routing

UI plugins use Angular routing with the **hash location strategy** (`withHashLocation()`), which works in the iframe with no server rewrites. Routes live in `app.routes.ts` with `loadComponent` lazy loading, and the starter demonstrates the ISC left-sidebar pattern. See the **`plugin-routing-angular`** skill.

## Launchers API (starting workflows)

A plugin can start a SailPoint Workflow through the Launchers API and hand interactive steps off to Launchpad (the iframe cannot render workflow forms). This is also the only way to perform an action that needs more access than the signed-in user has. See the **`plugin-credentials-and-scopes`** skill for the endpoints and the elevated-access rationale.

## Design tokens / theming

[PrimeNG](https://primeng.org/) is the component library, configured in `app.config.ts` with the SailPoint Design System theme preset, which injects design tokens as CSS variables. The iframe has its own CSS scope, so global styles go in `src/styles.scss`. See the **`plugin-theming-primeng`** skill for tokens, typography utilities, icons, and isolation details.

## Translations (i18n)

Translations use [ngx-translate](https://ngx-translate.org/) with JSON catalogs under `public/i18n/`, rendered via the `translate` pipe and keyed off `navigator.language` with an `en` fallback. See the **`plugin-translations-i18n`** skill for setup, adding labels and languages, and ISC's 22-language parity.
