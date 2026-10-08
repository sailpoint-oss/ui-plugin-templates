---
name: plugin-credentials-and-scopes
description: Use when a SailPoint UI plugin needs to authenticate, call a SailPoint API, or reach data the signed-in user may not have — and especially when tempted to hardcode a personal access token (PAT), API key, client secret, or any credential in plugin source to get around an access limit. Explains why embedding credentials is unsafe, how the manifest `apiScopes` mint a token scoped to and acting on behalf of the signed-in user, why a plugin can only narrow a user's access and never grant more, and when triggering a workflow is the only way to perform an elevated action.
---

# Credentials and scopes in SailPoint UI plugins

A plugin is static code served to the browser and running inside the signed-in user's own session. Anything you put in the bundle — tokens, keys, secrets — ships to every user and is readable with `view source` or devtools. Treat the entire bundle as public.

## Never embed credentials

- Do not hardcode a personal access token (PAT), API key, OAuth client id/secret, or any long-lived credential in source, in build-time config, or in `sp-ui-plugin.json`. It is not hidden by minification or the build — it ships verbatim.
- A leaked PAT carries its owner's full access (often an admin or service account) to anyone who can load the plugin, with no audit trail that distinguishes the plugin from the owner. This is the "full-scope token sharing" antipattern the plugin authentication design explicitly rules out.
- Embedding a credential to reach an API the signed-in user cannot access is never the right fix. Use scopes (below); if real elevation is required, use a workflow (below).

## Use manifest scopes instead

- Declare the APIs the plugin needs in `sp-ui-plugin.json` under `apiScopes`. When the plugin loads, App Shell mints a plugin-specific, scoped access token from the signed-in user's session, and the SDK uses it automatically. You never handle a raw credential.
- The token acts **on behalf of the signed-in user**, and scope is enforced when the token is minted — not by the plugin trusting itself.
- Scopes can only **narrow** access, never widen it. `apiScopes` reduces what the user already has; it can never grant access the user lacks.
- Declaring a scope does **not** guarantee the user holds it. A call still fails if the user does not have that access. Gate the UI on the user's actual capabilities (for example, present a regular-user view versus an admin view based on `user.capabilities`), not on the presence of a scope in the manifest.

## When you genuinely need elevated access

- A plugin cannot give a user more access than they already have. If an action must run with more access than the signed-in user has, the only option today is to **trigger a SailPoint workflow** from the plugin. The workflow runs under its author's credentials, can perform internal and external operations, and returns results to the plugin.
- This is powerful but not fast or interactive — expect asynchronous, non-responsive timing. Use it only when elevation is truly required, and put a confirmation step in front of anything that writes.

### Triggering a workflow via the Launchers API

A plugin starts a SailPoint Workflow through the Launchers API:

- **List the user's assigned launchers** (the same list Launchpad shows) with the `my/assigned` endpoint, e.g. `plugin.get('/beta/launchers/my/assigned?limit=100&sorters=name')` and read `items`. (Angular SDK note: `LaunchersService.getLaunchersV1()` returns *all tenant launchers*, an admin scope — use the `my/assigned` path for the signed-in user's list.)
- **Start a launcher** with `plugin.post('/beta/launchers/<id>/launch', {})` (encode the id); the response carries an `interactiveProcessId`. The workflow runs server-side under its author's credentials.
- **Hand off interactive steps to Launchpad.** The iframe cannot render workflow forms, so link the user out: `<origin>/ui/d/launchpad/interactive-processes/<processId>`, where `origin` is `new URL(page.route).origin` from the plugin context. Encode the process id.

## References

- Plugin authentication architecture — scoped tokens, mint-time scope enforcement: Confluence page `4732190936`.
- SailPoint Workflows: https://documentation.sailpoint.com/saas/help/workflows/index.html
- The plugin guide in the project root (`SAILPOINT_PLUGIN_GUIDE.md`, or `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the Angular starter) for manifest and SDK basics.
