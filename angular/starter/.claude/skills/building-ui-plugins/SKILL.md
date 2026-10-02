---
name: building-ui-plugins
description: Use when writing or changing code in a SailPoint Identity Security UI plugin, the sandboxed full-page iframe app scaffolded by `sail ui-plugins init`. Covers the sandbox and CSP limits, the `sp-ui-plugin.json` contract, SDK usage, calling ISC APIs, routing, theming, and handling tenants with sparse data. Use it for any new page, feature, API call, or style change in this workspace, even when the request doesn't mention plugins.
---

# Building SailPoint UI plugins

This workspace is a static single-page app that SailPoint Identity Security hosts on its own CDN origin and renders in a sandboxed, cross-origin iframe. It shares no DOM, CSS, cookies, or storage with the host page. Most mistakes come from assuming it does.

Read `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for SDK setup, routing, translations, and local development. This skill adds the rules that are easy to miss and the patterns that hold up in a real tenant.

## Sandbox rules

The platform enforces these. Code that breaks them fails silently in the browser, usually as a blocked request or an image that never renders.

- **Network.** The plugin document is served with `default-src 'none'; connect-src 'self' https://{org}.api.cloud.sailpoint.com`. You can call ISC APIs and your own assets, nothing else: no third-party APIs, model APIs, CDN scripts, remote fonts, or remote images. Bundle every asset.
- **No author `connect-src`.** The platform strips it from `contentSecurityPolicies`. The only CSP additions it accepts are `script-src` nonces, hashes, or `'wasm-unsafe-eval'`, and `style-src 'unsafe-inline'`.
- **Images.** `img-src 'self'` blocks `data:` and `blob:` URLs, so generated images and some chart exports will not render.
- **No `eval` or `new Function`.** Runtime template compilers and some charting libraries depend on them.
- **Browser features.** Permissions-Policy denies every feature by default. Clipboard, camera, and similar APIs need both `permissionPolicy` and `iframeAllow` entries.
- **Slots.** `full-page` is the only slot today, mounted at `/ui/plugin/{alias}`.

## `sp-ui-plugin.json`

- `alias`: 3 to 63 characters, lowercase letters, digits, and single dashes, not shaped like a UUID, unique in the tenant. The same alias deploys to every tenant.
- `apiScopes`: up to 20. Every API the plugin calls must be covered, or the call fails the same way locally and in production. After `create`, change scopes with `sail ui-plugins push-manifest`.
- `slots[].requiredCapabilities` (all must match) and `slots[].restrictToUsers` control who sees the plugin. Leave `restrictToUsers` empty only when you intend to share.
- Keep `contentSecurityPolicies`, `permissionPolicy`, and `iframeAllow` as `{}` unless a feature needs them.

## SDK

- Use exactly one SDK instance. The starter's `SailpointPluginService` (in `src/app/core/`) creates it, and the app initializer waits for the handshake. Never call `createSDK()` again. A second instance's handshake is ignored and times out.
- Read context from the service's signals: `user` (`id`, `displayName`, `email`, `capabilities`), `tenant` (`org`, `apiUrl.idn`, `products` with licenses), and `page` (`route`, `subPath`). Fine-grained rights and the host theme are not included.
- `plugin.get(path)` and `plugin.post(path, body)` take a path such as `/v3/search`. The SDK adds the tenant API base URL and the scoped token. Use `@sailpoint/angular-sdk` for typed calls and other HTTP verbs.
- Gate UI on `user.capabilities` and tenant licenses, not on guesses about rights.

## Calling ISC APIs

See `references/isc-endpoints.md` for request and response shapes that work from a plugin: identity search, access requests, access request status, and launchers.

- Validate any value you place in a search query string. Allow ids like `[A-Za-z0-9-]` and quote them, such as `id:"<id>"`.
- Put a confirmation step in front of anything that writes (access requests, launches, revokes). The plugin acts as the signed-in user with real rights.
- Workflow forms cannot render inside the iframe. After a launch, link to `{origin}/ui/d/launchpad/interactive-processes/{id}`, where `origin` comes from `new URL(page.route).origin`.

## Routing

Use hash routing (the starter does). Report route changes with `setRoute(subPath)` once the handshake is ready, and adopt `page.subPath` on the first navigation so deep links survive a reload. Keep `baseHref` and `deployUrl` at `./`. Absolute asset paths give a blank iframe after upload.

## Theming

- Use the SailPoint Design System preset's semantic variables: `--spds-content-background`, `--spds-content-hover-background`, `--spds-content-border-color`, `--spds-text-color`, `--spds-text-muted-color`, `--spds-primary-color`, `--spds-highlight-background`. In the dark scheme, `--spds-surface-50` and `--spds-surface-100` are light colors, so don't use them as backgrounds.
- Dark mode is the `.spds-dark` class on the iframe's `<html>`. To follow the ISC theme, toggle it from `matchMedia('(prefers-color-scheme: dark)')` and listen for `change`. Inside the iframe, Chrome reports that query from the `color-scheme` the iframe inherits from ISC. Today ISC sets `color-scheme: dark` in dark mode but leaves light mode unset, so a light ISC falls back to the user's operating system setting.

## Sparse tenants

Sandbox and dev tenants often lack the data a plugin expects. The support user may have no manager, no assigned launchers, or no email. Load live data first, then fall back to clearly labeled sample data, and never send sample ids to a write API.
