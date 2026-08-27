# SailPoint UI Plugin Guide (Angular)

> Angular-specific guide for developing this plugin against SailPoint Identity Security. It is intentionally self-contained so both humans and AI coding assistants have full context without external lookups.

## Context for AI assistants

- This project is a **SailPoint UI plugin**: a standalone Angular app that SailPoint Identity Security loads inside a **sandboxed iframe** at a designated UI **slot**.
- The plugin is isolated from the host. It communicates with the host only through the SailPoint UI Plugin SDK, which wraps a `postMessage` protocol (COIP). Do not assume direct DOM, cookie, or network access to the host page.
- Network calls to SailPoint APIs use a **scoped token** limited to the `apiScopes` declared in `sp-ui-plugin.json`. A call to an undeclared scope fails the same way locally as in production.
- `sp-ui-plugin.json` is the source of truth for the plugin's identity and security posture. Treat it as the contract with the backend.
- Build tooling is the Angular CLI. The SailPoint CLI orchestrates registration and deployment. The CLI does not replace `ng`.

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

- **`manifest`** is sent verbatim to the backend. **`build`** is local-only and never leaves your machine. For the Angular starter, `outDir` defaults to `./dist/<your-plugin>/browser` (Angular's `dist/<project>/browser` output).
- Security fields (`permissionPolicy`, `iframeAllow`, `contentSecurityPolicies`) are declarative — edit them by hand as your plugin needs them. The CLI validates the file against the expected schema before deploying.
- The **alias** is a stable, environment-independent key. The same alias maps to a different plugin instance in each tenant, so you can deploy the same code to staging and production without juggling GUIDs.

### Updating the manifest

`sail ui-plugins init` generates `sp-ui-plugin.json` in this workspace. Review the file and edit it as your plugin needs.

| When you edit | What to do |
|---|---|
| After `init`, before `create` | Edit `sp-ui-plugin.json`. Then run `sail ui-plugins create`. |
| After `create` | Edit `sp-ui-plugin.json`. Then run `sail ui-plugins push-manifest` (alias `update`) to send the updated `manifest` section to the tenant. |

The `build` section is local only. If you change manifest security fields after `create`, run `push-manifest`. Then run `link` again so the CLI refreshes `angular.json` with updated `devDocumentHeaders`.

## Local development

```bash
npm install
```

The SailPoint CLI registers your plugin and links your local server for in-tenant development (see [SailPoint CLI](#sailpoint-cli)). The development loop is:

1. Register the plugin with your tenant.
2. Start the Angular dev server — `npm start` (`ng serve`).
3. Link your local server to your identity. Open the returned developer URL (`?spPluginDev=<alias>`). If you are authorized, the host loads your local code inside the live tenant with a local-dev badge. You get a real handshake, a real scoped token, and live data.

Because local dev uses a real scoped token minted from your declared `apiScopes`, an endpoint you did not declare fails locally exactly as it would in production. Add scopes to `sp-ui-plugin.json` before you call an endpoint. If you already ran `create`, run `push-manifest` after you add scopes.

For plugin-document security headers during local dev, see [Local dev document headers](#local-dev-document-headers).

## Local dev document headers

The plugin iframe is governed by plugin-document `Content-Security-Policy` and `Permissions-Policy` headers. In production, a SailPoint service, UMS, stamps these on CDN assets. During local development, your dev server must emit the same headers. If it does not, API calls (for example, fetches to your tenant API) can be blocked by CSP.

**Source of truth for the dev server:** `angular.json` → `projects.<your-plugin>.architect.serve.options.headers`. The dev server does **not** read security headers from `sp-ui-plugin.json`.

### Automatic setup (normal workflow)

After you register the plugin, the SailPoint CLI writes the effective headers into `angular.json` when you run:

- `sail ui-plugins create`
- `sail ui-plugins link`

You do not need to hand-edit these values under the normal CLI workflow.

**Restart required:** If `npm start` (or `ng serve`) is already running when create or link updates `angular.json`, restart the dev server so the new headers take effect.

### Example (after create or link)

```json
"headers": {
  "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://<your-org>.api.cloud.sailpoint.com; ...",
  "Permissions-Policy": "camera=(), microphone=(), ..."
}
```

The CLI populates real values for your tenant. The snippet above uses placeholders only.

### Manifest security fields

`sp-ui-plugin.json` `contentSecurityPolicies` and `permissionPolicy` do **not** directly configure dev-server headers. If you change manifest security fields after `create`, run `push-manifest`. UMS merges your changes with the platform baseline. Then the CLI refreshes `angular.json` on the next create or link.

## Building and deploying

```bash
npm run build        # produces build.outDir (for example, ./dist/<your-plugin>/browser)
```

Deploy the compiled assets with the SailPoint CLI (see [SailPoint CLI](#sailpoint-cli)). Uploaded assets are hosted immutably on the CDN. Deployment targets the plugin instance bound to your **alias** in the CLI's current tenant context. The same commands promote across environments.

### Relative asset paths

SailPoint Identity Security serves production plugin assets from a CDN URL. Built assets must use **relative** paths, not absolute paths like `/assets/main.js`. This starter sets `baseHref: "./"` and `deployUrl: "./"` in `angular.json` build options so production output is CDN-safe. Do not change these to root-absolute values before you upload.

If script or stylesheet URLs in the built `index.html` start with `/`, the plugin can fail to load after upload. The browser console shows 404 errors for JS or CSS.

## SailPoint CLI

These files are typically placed in your project by the SailPoint CLI (`sail ui-plugins init`), which also registers, links, builds, and deploys your plugin. For the authoritative command list, usage, and flags, use the CLI's own help and documentation rather than relying on this guide:

- `sail ui-plugins --help` (and `sail ui-plugins <command> --help`)
- CLI documentation: <https://developer.sailpoint.com/docs/tools/cli>

## SDK setup

This starter is already wired up with the SDK. All access goes through the `SailpointPluginService` in `src/app/core/`. Import it via the `@core` path alias. The service owns a single SDK instance. It runs the COIP handshake exactly once. It exposes the plugin context as signals. The app initializer in `src/app/app.config.ts` awaits the handshake before the app renders. Context is available before any component loads. Components read signals. They never manage the handshake themselves.

### Reading plugin context

Inject the service and read its signals. You do not need promises or setup:

```ts
import { Component, inject } from '@angular/core';
import { SailpointPluginService } from '@core';

@Component({
  selector: 'app-example',
  template: `
    @if (context(); as ctx) {
      <p>{{ ctx.user.displayName }} — {{ ctx.tenant.org }}</p>
    } @else {
      <p>Connecting to the App Shell…</p>
    }
  `,
})
export class Example {
  private readonly plugin = inject(SailpointPluginService);

  protected readonly context = this.plugin.context; // Signal<PluginContext | null>
  protected readonly status = this.plugin.status; // 'pending' | 'ready' | 'failed'
  protected readonly tenant = this.plugin.tenant; // Signal<TenantContext | null>
  protected readonly user = this.plugin.user; // Signal<UserContext | null>
}
```

The context types (`PluginContext`, `TenantContext`, `UserContext`, `PageContext`, `SlotContext`) are re-exported from `@core`, so import them from one place:

```ts
import { PluginContext } from '@core';
```

### Calling the SailPoint API

The app initializer waits for the App Shell handshake before the app renders. After that, you can call the API from an event handler or a service. Requests use the scopes in `sp-ui-plugin.json`. If a scope is not declared, the call fails in local dev and in production.

#### Typed calls with `SailpointApiService`

Install the SailPoint TypeScript SDK package:

```bash
npm install sailpoint-api-client
```

`SailpointApiService` in `src/app/core/` owns one shared `Configuration.autoconfigure()` after the handshake. Call `getApi()` or `getApi$()` with any partition API class so components do not call autoconfigure directly. The UI Plugin SDK registers `window.sailpointConfig()`; the API client reads it on each request.

Import API classes from a partition sub-path (for example `sailpoint-api-client/tenant/api`). This keeps your bundle smaller than a root import.

##### Promise style: `getApi()`

Use `getApi()` when you prefer `async`/`await` or Promise-based control flow (event handlers, sequential chains, or `resource()` loaders):

```ts
import { inject } from '@angular/core';
import { SailpointApiService } from '@core';
import { TenantApi } from 'sailpoint-api-client/tenant/api';
import { IdentitiesApi } from 'sailpoint-api-client/identities/api';

const api = inject(SailpointApiService);

try {
  const tenantApi = await api.getApi(TenantApi);
  const tenant = (await tenantApi.getTenantV1()).data;

  const identitiesApi = await api.getApi(IdentitiesApi);
  // await identitiesApi.someMethod(...);
} catch (err) {
  console.error(err);
}
```

##### Observable style: `getApi$()`

Use `getApi$()` when you prefer RxJS pipelines. It emits one configured client, then completes. SDK endpoint methods still return Promises — wrap them with `from()` inside `switchMap` to include the HTTP call in the stream:

```ts
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap, map, take, finalize } from 'rxjs/operators';
import { SailpointApiService } from '@core';
import { IdentitiesApi } from 'sailpoint-api-client/identities/api';

const api = inject(SailpointApiService);

api.getApi$(IdentitiesApi).pipe(
  switchMap(identitiesApi => from(identitiesApi.listIdentitiesV1({ limit: 5 }))),
  map(response => response.data),
  take(1),
  finalize(() => { /* clear loading signal */ }),
).subscribe({
  next: identities => { /* write to a signal or handle inline */ },
  error: err => console.error(err),
});
```

The starter example in `src/app/app.ts` demonstrates both patterns side by side:

- **`promiseApiCall()`** — `TenantApi` via `getApi()` with `async`/`await`.
- **`observableApiCall()`** — `IdentitiesApi` via `getApi$()`, then `switchMap` and `from()` for the HTTP call.

In a zoneless app, Observable callbacks do not trigger change detection by themselves. The starter writes results to **signals** inside `subscribe` (or you can bind with **`AsyncPipe`** in the template). Read `apiReady` or `plugin.status` before you enable UI that triggers API calls.

Add the API scopes you need to `sp-ui-plugin.json` before you call an endpoint. If you already ran `create`, run `push-manifest` after you add scopes.

#### Simple calls with `get()` and `post()`

`SailpointPluginService` also exposes `get()` and `post()`. They attach the scoped bearer token and use your tenant API base URL. Pass a path suffix only, not a full URL:

```ts
const identities = await this.plugin.get<Identity[]>('/v3/public-identities?limit=10');
await this.plugin.post('/v3/some-resource', { name: 'example' });
```

Use this approach when you do not need generated types or method names from the API client.

### Events and the raw SDK

For capabilities not wrapped by the service, `plugin.sdk` exposes the underlying SDK — including event subscriptions:

```ts
const unsubscribe = this.plugin.sdk.events.onViewportChange(({ width, height }) => {
  // react to host viewport changes
});
// call unsubscribe() when done
```

`plugin.whenReady()` exists only so the app initializer can gate bootstrap on the handshake. Components read the `context` / `status` signals instead of calling it.

## Design tokens / theming

_TBD._ Importing SailPoint design tokens so the plugin matches host styling. Because the iframe's CSS is isolated, tokens must be imported explicitly.
