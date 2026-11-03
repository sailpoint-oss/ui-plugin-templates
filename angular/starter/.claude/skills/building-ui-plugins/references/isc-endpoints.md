# ISC endpoints used from UI plugins

All paths go through `plugin.get(path)` or `plugin.post(path, body)`, which add the tenant API base URL and the scoped token. Every call must be covered by `apiScopes` in `sp-ui-plugin.json`.

## Identity search

`POST /v3/search?limit=<n>`

```json
{
  "indices": ["identities"],
  "query": { "query": "id:\"<identity-id>\"" },
  "includeNested": true,
  "queryResultFilter": { "includes": ["id", "displayName", "email", "manager", "access"] }
}
```

- Returns an array of identity documents. `manager.id` links people, and `access[]` holds access profiles, roles, and entitlements (`type`, `id`, `displayName`, `privileged`, `source.name`).
- Manager, peers, and direct reports: `(manager.id:"<mgr>" OR manager.id:"<me>" OR id:"<mgr>") AND NOT id:"<me>"`.
- People who hold access: `(accessProfileCount:>0 OR roleCount:>0) AND NOT id:"<me>"`.
- Quote ids and reject anything outside `[A-Za-z0-9-]` before building a query.

## Access requests

`POST /v3/access-requests`

```json
{
  "requestedFor": ["<identity-id>"],
  "requestType": "GRANT_ACCESS",
  "requestedItems": [{ "type": "ACCESS_PROFILE", "id": "<access-id>", "comment": "Why the user needs it" }]
}
```

- `type` is `ACCESS_PROFILE`, `ROLE`, or `ENTITLEMENT`. Use `REVOKE_ACCESS` to remove access.
- The request runs as the signed-in user. Confirm before sending.

## Access request status

`GET /v3/access-request-status?limit=250&sorters=-created`

- Returns an array, newest first. Each item has `name`, `type`, `state`, `created`, `requestedFor.name`, and `accessRequestId`.
- Group `state`: `REQUEST_COMPLETED` is done, `REJECTED` is rejected, `CANCELLED` and `TERMINATED` are canceled, `PROVISIONING_FAILED`, `NOT_ALL_ITEMS_PROVISIONED`, and `ERROR` are failed. Treat everything else as in progress.

## Launchers

- `GET /beta/launchers/my/assigned?limit=100&sorters=name` lists launchers assigned to the signed-in user in `items`.
- `POST /beta/launchers/{id}/launch` with `{}` starts the workflow and returns `interactiveProcessId`.
- Link the user to `{origin}/ui/d/launchpad/interactive-processes/{interactiveProcessId}` to finish any interactive steps. The plugin iframe cannot render them.
- `LaunchersService.getLaunchersV1()` in `@sailpoint/angular-sdk` lists every launcher in the tenant and needs admin scope. Use the `my/assigned` path for user-facing pages.
