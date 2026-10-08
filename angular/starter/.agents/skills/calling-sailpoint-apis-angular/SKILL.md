---
name: calling-sailpoint-apis-angular
description: Use when calling a SailPoint API from an Angular UI plugin, reading plugin/user/tenant context, or wiring the SDK. Covers the `SailpointPluginService` context signals, typed `@sailpoint/angular-sdk` partition services, the `plugin.get()`/`post()` helpers, Observable versus Promise (`firstValueFrom`) styles, raw SDK event subscriptions, and gating UI until the handshake is ready. Use it for any data fetch, mutation, or SDK interaction in this workspace.
---

# Calling SailPoint APIs from an Angular plugin

All access goes through `SailpointPluginService` (`src/app/core/`, import via the `@core` alias). It owns a single SDK instance, runs the COIP handshake exactly once, and exposes context as signals. The app initializer in `app.config.ts` awaits the handshake before the app renders, so context is available before any component loads. Never create a second SDK instance or manage the handshake yourself.

Read `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for the full SDK setup. This skill is the task-level summary.

## Reading context

Inject the service and read its signals — no promises or setup:

```ts
private readonly plugin = inject(SailpointPluginService);
readonly context = this.plugin.context; // Signal<PluginContext | null>
readonly status  = this.plugin.status;  // 'pending' | 'ready' | 'failed'
readonly user    = this.plugin.user;     // Signal<UserContext | null>
readonly tenant  = this.plugin.tenant;   // Signal<TenantContext | null>
```

Context types (`PluginContext`, `TenantContext`, `UserContext`, `PageContext`, `SlotContext`) are re-exported from `@core`.

Gate any UI that triggers an API call on `plugin.apiReady` or `plugin.status` so calls never fire before the handshake.

## Typed calls with `@sailpoint/angular-sdk`

Each API area has a partition service (`TenantService`, `IdentitiesService`, `AccountsService`, …). Inject it and declare it in the component's `providers`. `provideSailPoint()` in `app.config.ts` wires the HTTP interceptor that reads `window.sailpointConfig()` on every request — no extra install or config. Methods return `Observable<T>`.

- **Observable style:** bind with `AsyncPipe` (`svc.listIdentitiesV1({ limit: 5 })`), handling loading/error with `tap`/`catchError`/`finalize`.
- **Promise style:** for event handlers or sequential chains, wrap with `firstValueFrom()`: `await firstValueFrom(this.tenantSvc.getTenantV1())`.

## Simple calls with `get()` / `post()`

`plugin.get()` / `plugin.post()` attach the scoped bearer token and the tenant API base URL. Pass a path suffix only, never a full URL. Use when you don't need generated types:

```ts
const ids = await this.plugin.get<Identity[]>('/v3/public-identities?limit=10');
await this.plugin.post('/v3/some-resource', { name: 'example' });
```

## Raw SDK and events

For capabilities the service doesn't wrap, `plugin.sdk` exposes the underlying SDK, including events:

```ts
const unsubscribe = this.plugin.sdk.events.onViewportChange(({ width, height }) => { /* … */ });
// call unsubscribe() when done
```

`plugin.whenReady()` exists only for the app initializer; components read the `context`/`status` signals instead.

## Scopes

Every call uses the `apiScopes` in `sp-ui-plugin.json`; an undeclared scope fails identically in local dev and production. Add the scope before you call the endpoint, and run `sail ui-plugins push-manifest` if you already ran `create`. See the `sp-ui-plugin-manifest` and `plugin-credentials-and-scopes` skills — a plugin's token only narrows the signed-in user's access and never grants more.
