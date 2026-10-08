# UI Plugin Templates

> 🚧 **Pre-release:** the `sail ui-plugins` command group is not yet generally available. This repository and its guides describe functionality that ships with an upcoming SailPoint CLI release. Remove this notice at GA.

Official starter templates for building [SailPoint Identity Security](https://www.sailpoint.com/) UI plugins.

UI plugins are JavaScript applications. SailPoint Identity Security runs them inside sandboxed iframes. They extend the SailPoint Identity Security interface at defined **slots** (for example, a full-page view). This repository holds the framework starter templates that the SailPoint CLI (`sail ui-plugins init`) uses to scaffold a new plugin workspace.

## Repository layout

```
ui-plugin-templates/
  README.md
  SAILPOINT_PLUGIN_GUIDE.md                # generic, framework-agnostic plugin guide
  .agents/skills/                          # framework-agnostic agent skills (shared across templates)
  angular/
    starter/                               # canonical Angular starter — what `init` scaffolds from
      SAILPOINT_PLUGIN_GUIDE_ANGULAR.md    # Angular-specific plugin guide
      .agents/skills/                      # Angular-specific agent skills, scaffolded by `init`
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

## Agent skills

Agent skills live in `.agents/skills/` — the cross-client convention, so compatible coding agents load them automatically and any other agent can read them as Markdown. Framework-agnostic skills live at the repository root; framework-specific skills live under each framework's starter (today, `angular/starter/`). See [How skills are delivered](#how-skills-are-delivered) for how they reach a scaffolded project and how to change that.

**Framework-agnostic** (`/.agents/skills/`):

- `plugin-credentials-and-scopes`: why embedding a PAT, API key, or secret is unsafe; using manifest `apiScopes` to act on behalf of the signed-in user (scope only narrows, never grants); and triggering a workflow via the Launchers API for elevated actions.
- `sp-ui-plugin-manifest`: the `sp-ui-plugin.json` contract — alias rules, `apiScopes`, security fields, manifest-vs-build, and when a change needs `push-manifest`.
- `plugin-lifecycle-cli`: the `sail ui-plugins` lifecycle (init, create, link, build, deploy) and which command to run after a manifest change.

**Angular** (`angular/starter/.agents/skills/`):

- `calling-sailpoint-apis-angular`: `SailpointPluginService` context signals, `@sailpoint/angular-sdk` services, `plugin.get()`/`post()`, Observable vs `firstValueFrom`, and handshake gating.
- `plugin-theming-primeng`: PrimeNG + SailPoint Design System theme preset, design tokens, typography utilities, icons, and iframe CSS isolation.
- `plugin-translations-i18n`: ngx-translate setup, adding labels and languages, and ISC's 22-language parity.
- `plugin-routing-angular`: hash location strategy, lazy `loadComponent` routes, and the ISC sidebar pattern.
- `animating-ui-plugins`: Angular view-encapsulation pitfalls with imperative DOM and component `@keyframes`, animations that play under `ng serve` but freeze in the production build, and verifying animations against a built bundle.

The skills complement the plugin guides rather than repeat them.

### How skills are delivered

`sail ui-plugins init` assembles a project's `.agents/skills/` from two sources:

- **Framework skills** (for example `angular/starter/.agents/skills/`) ship as part of the starter that `init` scaffolds. They reach a project only when you scaffold that framework.
- **Repo-wide skills** (`/.agents/skills/`) are merged into the scaffolded workspace on top of the framework skills, and are also delivered to existing projects by `sail ui-plugins init --path`.

So a new Angular workspace gets the Angular skills **plus** the repo-wide skills; an `init --path` project gets the repo-wide skills **only** (no framework skills, since the target may be any framework).

**No name collisions.** A repo-wide skill and a framework skill must not use the same folder name — at `init` they would merge into one `.agents/skills/` and overwrite each other. CI (the `Skill name collisions` check in the PRB workflow) fails the build if this happens. Two different frameworks may reuse a name, because they never scaffold into the same project.

**Changing the merge strategy.** By default every repo-wide skill is merged into every framework starter. A skill that should *not* reach framework starters — for example a framework-agnostic skill whose guidance would be wrong inside a specific framework, where a framework-specific version is authored instead — opts out in its `SKILL.md` frontmatter:

```yaml
metadata:
  sailpoint-merge: path-only
```

- **Absent (default):** merged into every framework starter and into `init --path` projects.
- **`path-only`:** not merged into framework starters; delivered only by `init --path`.

Both the CLI merge and the collision check read this flag, so a `path-only` skill may safely share a name with a framework skill (they never land in the same project).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short:

- Keep `starter/` a **runnable, minimal** app. After `npm install`, the standard framework dev server must work with no extra steps.
- Templates are consumed verbatim by the CLI. Do not put non-buildable placeholder tokens in files that must parse or compile (`package.json`, `angular.json`, `sp-ui-plugin.json`).

## License

Distributed under the MIT License. See [LICENSE](LICENSE).
