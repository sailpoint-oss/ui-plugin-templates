# UI Plugin Templates

> 🚧 **Pre-release:** the `sail ui-plugins` command group is not yet generally available. This repository and its guides describe functionality that ships with an upcoming SailPoint CLI release. Remove this notice at GA.

Official starter templates for building [SailPoint Identity Security](https://www.sailpoint.com/) UI plugins.

UI plugins are JavaScript applications. SailPoint Identity Security runs them inside sandboxed iframes. They extend the SailPoint Identity Security interface at defined **slots** (for example, a full-page view). This repository holds the framework starter templates that the SailPoint CLI (`sail ui-plugins init`) uses to scaffold a new plugin workspace.

## Repository layout

```
ui-plugin-templates/
  README.md
  SAILPOINT_PLUGIN_GUIDE.md                # generic, framework-agnostic plugin guide
  angular/
    starter/                               # canonical Angular starter — what `init` scaffolds from
      SAILPOINT_PLUGIN_GUIDE_ANGULAR.md    # Angular-specific plugin guide
```

Each framework lives in its own top-level folder. Today only Angular is provided. Additional frameworks can be added over time. Within a framework, `starter/` is the minimal, prewired baseline.

## Using a template

### With the SailPoint CLI (recommended)

The CLI fetches the appropriate template and wires it to your tenant:

```bash
sail ui-plugins init <plugin-name>
```

This scaffolds a new workspace. It generates a `sp-ui-plugin.json` configuration. It drops a `SAILPOINT_PLUGIN_GUIDE.md` into the project with next steps. See that guide for the full local-development and deployment workflow.

To attach the SDK to an existing project instead, use `init --path`. The CLI generates `sp-ui-plugin.json` and copies the framework-agnostic guide into that directory:

```bash
sail ui-plugins init "My Plugin" --path ./existing-app --out-dir ./dist/app --port 4200
```

### By hand

You can also copy a template directly (for example, `angular/starter`) and wire it up yourself. Start from the `SAILPOINT_PLUGIN_GUIDE.md` inside the template. It documents the `sp-ui-plugin.json` fields, the CLI commands, and the local dev flow.

## Documentation

Two complete, self-contained plugin guides are provided. Each stands on its own. You only need the one that matches how you started:

- [`SAILPOINT_PLUGIN_GUIDE.md`](SAILPOINT_PLUGIN_GUIDE.md) — framework-agnostic guide for wiring the SDK into an existing project (`sail ui-plugins init --path`) or by hand: SDK install, HTTPS/dev-server setup, manifest updates, and design-token setup.
- [`angular/starter/SAILPOINT_PLUGIN_GUIDE_ANGULAR.md`](angular/starter/SAILPOINT_PLUGIN_GUIDE_ANGULAR.md) — Angular-specific guide, matching what `sail ui-plugins init` scaffolds from the Angular starter.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short:

- Keep `starter/` a **runnable, minimal** app. After `npm install`, the standard framework dev server must work with no extra steps.
- Templates are consumed verbatim by the CLI. Do not put non-buildable placeholder tokens in files that must parse or compile (`package.json`, `angular.json`, `sp-ui-plugin.json`).

## License

Distributed under the MIT License. See [LICENSE](LICENSE).
