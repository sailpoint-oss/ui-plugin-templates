# SailPoint ISC UI Plugin (Angular starter)

A standalone Angular app that SailPoint Identity Security Cloud (ISC) loads inside a sandboxed iframe. It communicates with the ISC host through the SailPoint UI Plugin SDK (a cross-origin `postMessage` protocol) and comes prewired with that SDK.

**Plugin guide:** see [`SAILPOINT_PLUGIN_GUIDE_ANGULAR.md`](./SAILPOINT_PLUGIN_GUIDE_ANGULAR.md) for how to use the SDK via `SailpointPluginService`, the `sp-ui-plugin.json` manifest, local development against a live tenant, and deployment. That guide is the canonical, self-contained reference for building this plugin.

Replace the starter UI in `src/app/app.html` (and add your own components) with your plugin's UI. The SDK integration lives in `src/app/core/` and you normally don't need to edit it.

## Commands

```bash
npm start        # dev server over HTTPS (ng serve --ssl) — required for local ISC dev
npm run build    # production build to dist/
npm test         # unit tests (Karma)
```

Scaffold new building blocks with the Angular CLI, e.g. `ng generate component my-feature`; run `ng generate --help` for the full list.

## Additional resources

- [`SAILPOINT_PLUGIN_GUIDE_ANGULAR.md`](./SAILPOINT_PLUGIN_GUIDE_ANGULAR.md) — plugin guide (SDK usage, config, deployment)
- [Angular CLI reference](https://angular.dev/tools/cli) — this project was generated with Angular CLI 20.2.2
