# SailPoint UI Plugin Guide

> Framework-agnostic guide for building a SailPoint Identity Security Cloud (ISC) UI plugin and wiring the SDK into your own project. It is intentionally self-contained so both humans and AI coding assistants have full context without external lookups.
>
> Using the Angular starter? See the Angular-specific guide instead (`angular/starter/SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the `ui-plugin-templates` repository). You only need the one guide that matches how you started.

## Context for AI assistants

- This project is a **SailPoint ISC UI plugin**: a standalone frontend app that ISC loads inside a **sandboxed iframe** at a designated UI **slot**.
- The plugin is isolated from the ISC host. It communicates with the host only through the SailPoint UI Plugin SDK, which wraps a `postMessage` protocol (COIP). Do not assume direct DOM, cookie, or network access to the ISC page.
- Network calls to SailPoint APIs use a **scoped token** limited to the `apiScopes` declared in `sp-ui-plugin.json`. A call to an undeclared scope fails the same way locally as in production.
- `sp-ui-plugin.json` is the source of truth for the plugin's identity and security posture. Treat it as the contract with the backend.
- Build tooling is your framework's own. The SailPoint CLI orchestrates registration and deployment; it does not replace your bundler.

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
        "outDir": "./dist/<your-build-output>", // compiled assets uploaded on deploy
        "port": 4200                            // local dev server port
    }
}
```

- **`manifest`** is sent verbatim to the backend. **`build`** is local-only and never leaves your machine.
- Set **`build.outDir`** to your framework's compiled output directory, and **`build.port`** to the port your local dev server listens on.
- Security fields (`permissionPolicy`, `iframeAllow`, `contentSecurityPolicies`) are declarative — edit them by hand as your plugin needs them. The CLI validates the file against the expected schema before deploying.
- The **alias** is a stable, environment-independent key. The same alias maps to a different plugin instance in each tenant, so you can deploy the same code to staging and production without juggling GUIDs.

## Setup (existing project)

To turn an existing frontend project into a SailPoint plugin:

1. **Install the SDK** — add `@sailpoint/ui-plugin-sdk` to your project and initialize it (see [SDK setup](#sdk-setup)).
2. **Configure HTTPS for local development** — ISC loads plugins over HTTPS, so your local dev server must serve over `https://localhost:<port>` with a trusted certificate. Configure this in your framework's dev-server settings.
3. **Import SailPoint design tokens** — so your plugin matches ISC styling (see [Design tokens](#design-tokens--theming)).
4. **Add `sp-ui-plugin.json`** at the project root (the CLI can generate a valid starting file for you), setting `build.outDir` and `build.port` to match your project.

## Local development

The SailPoint CLI registers your plugin and links your local server for in-tenant development (see [SailPoint CLI](#sailpoint-cli)). The development loop is:

1. Register the plugin with your tenant.
2. Start your framework's dev server over HTTPS on `build.port`.
3. Link your local server to your identity, then open the returned developer URL (`?spPluginDev=<alias>`) in ISC. The host verifies the override and, if authorized, loads your local code inside the live tenant with a local-dev badge — real handshake, real scoped token, live data.

Because local dev uses a real scoped token minted from your declared `apiScopes`, an endpoint you did not declare fails locally exactly as it would in production. Add scopes to `sp-ui-plugin.json` when you need them.

For plugin-document security headers during local dev, see [Local dev document headers](#local-dev-document-headers).

## Local dev document headers

The plugin iframe is governed by plugin-document `Content-Security-Policy` and `Permissions-Policy` headers. In production, UMS stamps these on CDN assets. During local development, your dev server must emit the same headers for CSP parity.

**Source of truth for the dev server:** your framework's dev-server configuration (for example, Vite `server.headers` or Angular `angular.json` serve options). `sp-ui-plugin.json` does **not** control dev-server response headers.

### Getting the effective header values

On successful `sail ui-plugins create` or `sail ui-plugins link`, UMS returns `devDocumentHeaders` in the API response:

```json
{
  "devDocumentHeaders": {
    "Content-Security-Policy": "...",
    "Permissions-Policy": "..."
  }
}
```

Inspect this response to see the merged headers your production CDN assets will carry (platform baseline plus any author extensions from your manifest). Copy these values into your dev-server config — do not guess tenant-specific origins such as `https://<your-org>.api.cloud.sailpoint.com`.

**Restart required:** If your dev server is already running when create or link returns new headers, restart it before testing in ISC.

### Example: Vite dev server

```javascript
// vite.config.js — adapt to your stack and port
export default {
  server: {
    port: 4200, // match sp-ui-plugin.json build.port
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; connect-src 'self' https://<your-org>.api.cloud.sailpoint.com; ...",
      'Permissions-Policy': 'camera=(), microphone=(), ...'
    }
  }
};
```

Use the `Content-Security-Policy` and `Permissions-Policy` strings from `devDocumentHeaders`, not the placeholders above.

### Angular starter (CLI default)

If you scaffolded with the default `sail ui-plugins init` flow (Angular template), the CLI updates `angular.json` automatically. See `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the Angular starter — you do not need to wire headers manually.

### Existing project (`init --path`)

`sail ui-plugins init --path <dir>` adds `sp-ui-plugin.json` and this guide to an existing project but does **not** modify your dev-server config. After create/link, copy `devDocumentHeaders` into your bundler's dev-server settings yourself (Vite example above, or the equivalent for your stack).

### Manifest security fields

`sp-ui-plugin.json` `contentSecurityPolicies` and `permissionPolicy` do **not** directly configure dev-server headers. If you change manifest security fields and update the plugin instance, UMS merges those changes with the platform baseline; create/link returns updated `devDocumentHeaders` for you to apply to your dev server (or, on the Angular path, for the CLI to write into `angular.json`).

## Building and deploying

Build your project with your framework's own tooling, ensuring the output lands in `build.outDir`. Deploy the compiled assets with the SailPoint CLI (see [SailPoint CLI](#sailpoint-cli)); uploaded assets are hosted immutably on the CDN. Deployment targets the plugin instance bound to your **alias** in the CLI's current tenant context, so the same commands promote across environments.

## SailPoint CLI

These files are typically placed in your project by the SailPoint CLI (`sail ui-plugins init`), which also registers, links, builds, and deploys your plugin. For the authoritative command list, usage, and flags, use the CLI's own help and documentation rather than relying on this guide:

- `sail ui-plugins --help` (and `sail ui-plugins <command> --help`)
- CLI documentation: <https://developer.sailpoint.com/docs/tools/cli>

## SDK setup

Install the runtime SDK, create **one** instance for the life of the page, resolve the plugin context **once**, then read context, call APIs, and subscribe to host events. The SDK is framework-agnostic — the examples below are plain TypeScript; wrap them in whatever singleton your framework prefers (see [Wrapping the SDK in your framework](#wrapping-the-sdk-in-your-framework)).

### 1. Install

```bash
npm install @sailpoint/ui-plugin-sdk
# or: pnpm add @sailpoint/ui-plugin-sdk  /  yarn add @sailpoint/ui-plugin-sdk
```

### 2. Create the SDK once

Create a single instance in one module and import it everywhere:

```ts
// plugin-sdk.ts
import { createSDK } from '@sailpoint/ui-plugin-sdk';

export const sdk = createSDK();
```

The SDK resolves the App Shell origin itself — the only trusted peer for the `postMessage` handshake — from the iframe context: the `?parentOrigin` the host adds to the iframe URL, reconciled with the browser-provided ancestor origin where available, falling back to the document referrer. If the plugin is opened outside ISC and no trusted origin can be resolved, `createSDK()` throws — open it through ISC using `?spPluginDev=<alias>`. Pass `createSDK({ targetOrigin })` explicitly only for tests, mocks, or non-standard embeddings.

Create the SDK **exactly once**. App Shell completes a single handshake per iframe mount, so a second instance would send a fresh readiness request the host ignores — and that instance would never finish initializing. A module-level singleton (as above) gives you that; avoid constructing the SDK inside components that mount more than once.

### 3. Resolve the plugin context once

The handshake runs on the first `getContext()` call and yields the `tenant`, `user`, `page`, and `slot` context. Kick it off once during startup and share the resulting promise — API calls depend on it, because the SDK derives your tenant's API base from the context. Make sure it has resolved before calling `api.get` / `api.post`:

```ts
import { sdk } from './plugin-sdk';

// Kick the handshake off once; every consumer awaits this same promise.
export const ready = sdk.getContext();

// during startup, before first render / before any API call:
const context = await ready;
console.log(context.tenant.org, context.user.displayName, context.page.route);
```

### 4. Call the SailPoint API

`api.get` / `api.post` attach the plugin's scoped bearer token automatically (and keep it fresh), and resolve the request against your tenant's API base. Pass a **path suffix to a versioned endpoint** — not an absolute URL:

```ts
await ready; // ensure the handshake/context has resolved first
const identities = await sdk.api.get('/v3/public-identities?limit=10');
await sdk.api.post('/v3/some-resource', { name: 'example' });
```

Requests are limited to the `apiScopes` declared in `sp-ui-plugin.json`; a call to an undeclared scope fails locally exactly as it would in production. If you need the raw token (e.g. for a `fetch` the SDK doesn't wrap), use `sdk.api.getToken()`.

### 5. React to host events

```ts
const stopViewport = sdk.events.onViewportChange(({ width, height }) => {
  // the host viewport changed
});
const stopToken = sdk.events.onTokenUpdate((token) => {
  // a refreshed scoped token was pushed
});
// each subscription returns an unsubscribe function — call it when you're done.
```

### Wrapping the SDK in your framework

Put the "create once + resolve context once" logic in your framework's idiomatic singleton so components can read context without re-running the handshake:

- **Angular** — a `providedIn: 'root'` service that creates the SDK, resolves `getContext()` in an app initializer, and exposes context as signals (the Angular starter ships exactly this; see its guide).
- **React** — a module singleton plus a context/provider that resolves `getContext()` once (an effect, or a Suspense resource) and shares it via context.
- **Vue** — a plugin or a Pinia store initialized once at app creation.
- **Svelte** — a store populated once from `getContext()`.
- **No framework** — the `plugin-sdk.ts` module above is enough; import `sdk` and `ready` wherever you need them.

The invariants are the same everywhere: **one** SDK instance, resolve context **once** before API calls, and read context wherever you need it.

## Design tokens / theming

_TBD._ Importing SailPoint design tokens so the plugin matches ISC styling. Because the iframe's CSS is isolated, tokens must be imported explicitly.
