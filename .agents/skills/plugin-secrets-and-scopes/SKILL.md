---
name: plugin-secrets-and-scopes
description: Use when a SailPoint UI plugin needs to authenticate, call a SailPoint API, reach a third-party or external service, or access data the signed-in user may not have — and especially when tempted to hardcode a password, personal access token (PAT), API key, client secret, OAuth token, or any credential in plugin source. Covers why embedding secrets is unsafe, how manifest `apiScopes` mint a token scoped to and acting on behalf of the signed-in user (scope only narrows, never grants), how a plugin reaches external services, and how to store passwords/tokens/credentials securely in SailPoint Parameter Storage and use them from a Privileged Task Automation workflow triggered via the Launchers API.
---

# Secrets and scopes in SailPoint UI plugins

A plugin is static code served to the browser and running inside the signed-in user's own session. Anything you put in the bundle — passwords, tokens, keys, secrets — ships to every user and is readable with `view source` or devtools. Treat the entire bundle as public.

## Never embed credentials or secrets

- Do not hardcode a password, personal access token (PAT), API key, OAuth client id/secret, bearer token, or any long-lived credential in source, in build-time config, or in `sp-ui-plugin.json`. It is not hidden by minification or the build — it ships verbatim.
- A leaked credential carries its owner's full access (often an admin or service account) to anyone who can load the plugin, with no audit trail that distinguishes the plugin from the owner. This is the "full-scope token sharing" antipattern the plugin authentication design explicitly rules out.
- Embedding a credential to reach an API the signed-in user cannot access is never the right fix. Use scopes (below) for SailPoint APIs; for an external service or genuine elevation, use a workflow backed by Parameter Storage (below).

## Use manifest scopes for SailPoint APIs

- Declare the APIs the plugin needs in `sp-ui-plugin.json` under `apiScopes`. When the plugin loads, App Shell mints a plugin-specific, scoped access token from the signed-in user's session, and the SDK uses it automatically. You never handle a raw credential.
- The token acts **on behalf of the signed-in user**, and scope is enforced when the token is minted — not by the plugin trusting itself.
- Scopes can only **narrow** access, never widen it. `apiScopes` reduces what the user already has; it can never grant access the user lacks.
- Declaring a scope does **not** guarantee the user holds it. A call still fails if the user does not have that access. Gate the UI on the user's actual capabilities (for example, present a regular-user view versus an admin view based on `user.capabilities`), not on the presence of a scope in the manifest.

## Reaching an external service or an elevated action: use a workflow

A plugin's browser-side code can call **SailPoint APIs only**. The plugin document's CSP allows the tenant API origin (and `'self'`); an arbitrary cross-origin `fetch` to a third-party host is blocked, and the manifest cannot open `connect-src` to external hosts today. So two things must happen server-side, through a workflow — never from the iframe:

- **Calling a third-party / external service** — a vendor API, a system behind a login, anything off-tenant.
- **Performing an action that needs more access than the signed-in user has** — a plugin can never give a user more access than they already hold.

Trigger a SailPoint workflow (Launchers API, below). It runs under its author's credentials, can perform internal and external operations, and returns results to the plugin. This is powerful but not fast or interactive — expect asynchronous, non-responsive timing. Use it only when truly required, and put a confirmation step in front of anything that writes.

## Store the external credential in Parameter Storage

The credential a workflow needs to authenticate with an external or privileged system belongs in **Parameter Storage**, never in the plugin:

- **Parameter Storage** is SailPoint's managed, encrypted store for privileged credentials (passwords, secrets, tokens). A **Privileged Task Automation (PTA)** workflow references a stored value by name and uses it at run time to authenticate with the target system; the secret never reaches the browser or the plugin bundle. Admins set up the credential and the workflow out-of-band — see the references for setup detail.
- The plugin author's side is only the trigger: plugin → workflow (Launchers API) → Parameter Storage credential → external service → results back to the plugin. Every secret stays server-side and auditable.

### Triggering a workflow via the Launchers API

A plugin starts a SailPoint Workflow through the Launchers API. These are `beta` paths — verify against the current Launchers API docs before relying on them:

- **List the user's assigned launchers** (the same list Launchpad shows) with the `my/assigned` endpoint, e.g. `plugin.get('/beta/launchers/my/assigned?limit=100&sorters=name')` and read `items`. (Angular SDK note: `LaunchersService.getLaunchersV1()` returns *all tenant launchers*, an admin scope — use the `my/assigned` path for the signed-in user's list.)
- **Start a launcher** with `plugin.post('/beta/launchers/<id>/launch', {})` (encode the id); the response carries an `interactiveProcessId`. The workflow runs server-side under its author's credentials.
- **Hand off interactive steps to Launchpad.** The iframe cannot render workflow forms, so link the user out: `<origin>/ui/d/launchpad/interactive-processes/<processId>`, where `origin` is `new URL(page.route).origin` from the plugin context. Encode the process id.

## References

- Plugin authentication architecture — scoped tokens, mint-time scope enforcement: Confluence page `4732190936`.
- SailPoint Parameter Storage: https://documentation.sailpoint.com/saas/help/parameter_storage/index.html
- SailPoint Privileged Task Automation (building PTA workflows): https://documentation.sailpoint.com/saas/help/privilege/privileged_task_automation.html#building-privileged-task-automation-workflows
- SailPoint Workflows: https://documentation.sailpoint.com/saas/help/workflows/index.html
- The plugin guide in the project root (`SAILPOINT_PLUGIN_GUIDE.md`, or `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the Angular starter) for manifest and SDK basics.
