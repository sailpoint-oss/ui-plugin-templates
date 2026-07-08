# UI Plugin Templates

> 🚧 **Pre-release:** the `sail ui-plugins` command group is not yet generally
> available. This repository and its guides describe functionality that ships
> with an upcoming SailPoint CLI release. Remove this notice at GA.

Official starter templates for building [SailPoint Identity Security Cloud
(ISC)](https://www.sailpoint.com/) UI plugins.

UI plugins are JavaScript applications that run inside ISC as sandboxed iframes,
extending the ISC interface at defined **slots** (for example, a full-page
view). This repository holds the framework starter templates that the SailPoint
CLI (`sail ui-plugins init`) uses to scaffold a new plugin workspace.

## Repository layout

```
ui-plugin-templates/
  README.md
  SAILPOINT_PLUGIN_GUIDE.md                # generic, framework-agnostic plugin guide
  angular/
    starter/                               # canonical Angular starter — what `init` scaffolds from
      SAILPOINT_PLUGIN_GUIDE_ANGULAR.md    # Angular-specific plugin guide
```

Each framework lives in its own top-level folder. Today only Angular is
provided; additional frameworks may be added over time. Within a framework,
`starter/` is the minimal, prewired baseline.

## Using a template

### With the SailPoint CLI (recommended)

The CLI fetches the appropriate template and wires it to your tenant:

```bash
sail ui-plugins init <plugin-name>
```

This scaffolds a new workspace, generates a `sp-ui-plugin.json` configuration,
and drops a `SAILPOINT_PLUGIN_GUIDE.md` into the project with next steps. See
that guide for the full local-development and deployment workflow.

### By hand

You can also copy a template directly (for example, `angular/starter`) and wire
it up yourself. Start from the `SAILPOINT_PLUGIN_GUIDE.md` inside the template —
it documents the `sp-ui-plugin.json` fields, the CLI commands, and the local dev
flow.

## Documentation

Two complete, self-contained plugin guides are provided. Each stands on its own —
you only need the one that matches how you started:

- [`SAILPOINT_PLUGIN_GUIDE.md`](SAILPOINT_PLUGIN_GUIDE.md) — framework-agnostic
  guide for wiring the SDK into an existing project by hand (or via
  `sail ui-plugins init --path`): manual HTTPS/SSL, SDK install and
  initialization, and design-token setup.
- [`angular/starter/SAILPOINT_PLUGIN_GUIDE_ANGULAR.md`](angular/starter/SAILPOINT_PLUGIN_GUIDE_ANGULAR.md)
  — Angular-specific guide, matching what `sail ui-plugins init` scaffolds from
  the Angular starter.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short:

- Keep `starter/` a **runnable, minimal** app — `npm install` then the standard
  framework dev server should work with no extra steps.
- Templates are consumed verbatim by the CLI; avoid non-buildable placeholder
  tokens in files that must parse or compile (`package.json`, `angular.json`,
  `sp-ui-plugin.json`).

## License

Distributed under the MIT License. See [LICENSE](LICENSE).
