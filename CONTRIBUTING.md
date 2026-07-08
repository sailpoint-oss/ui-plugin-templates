# Contributing to UI Plugin Templates

We love your input! We want to make contributing to this project as easy and
transparent as possible. Look below if you would like to:

- [Report an issue](#reporting-issues)
- [Make a feature request](#making-feature-requests)
- [Submit a fix](#submitting-a-fix)
- [Submit a new template or example](#submitting-a-new-template-or-example)
- [Submit a general issue or ask a question](#discussing-general-issues-or-questions)

# High-level Guidelines

## We Develop with GitHub

We use GitHub to host code, track issues and feature requests, and accept pull
requests.

## We Use GitHub Flow

Pull requests are the best way to propose changes to the codebase, and
[GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) is our preferred method of accepting pull requests. The basics are:

1. Fork the repo and create your branch from `main`.
2. Make your changes.
3. Issue your pull request!

## Keep Templates Runnable

These templates are consumed verbatim by the SailPoint CLI (`sail ui-plugins
init`). To keep them healthy:

- A `starter/` must be a minimal, runnable app: `npm install` followed by the
  standard framework dev server should work with no extra steps.
- Do not introduce non-buildable placeholder tokens into files that must parse
  or compile (`package.json`, `angular.json`, `sp-ui-plugin.json`). The CLI
  performs scoped substitutions into those files during scaffolding; keep them
  valid so the template builds and can be verified in CI.

## We Use the MIT Software License

In short, when you submit code changes, your submissions are understood to be
under the same [MIT License](http://choosealicense.com/licenses/mit/) that
covers the project.

# Reporting Issues

We use GitHub issues to track bugs publicly. If you see a problem with a
template, please
[report it here](https://github.com/sailpoint-oss/ui-plugin-templates/issues/new).

Our maintainers _love_ thorough bug reports. **Great bug reports** tend to have:

- A quick summary and/or description
- Which template and framework (e.g. `angular/starter`)
- SailPoint CLI version (if scaffolded via the CLI)
- Framework tooling versions (e.g. Angular CLI, Node)
- Steps to reproduce — be specific, and give sample code if you can
- What you expected would happen
- What actually happens
- Screenshots
- Operating System
- Notes (why you think this might be happening, or things you tried that
  didn't work)

# Making Feature Requests

We use GitHub issues to track feature requests. **Great feature requests** tend
to:

- Say if this is related to a problem (and describe said problem)
- Describe the solution you'd like
- Describe alternatives you use or have considered
- Include notes on how this might benefit others

# Submitting a Fix

Looking to fix something yourself? Great! Here are the steps:

- Fork the repository, copying the `main` branch only
- Pull down the code, install dependencies, and ensure the affected template
  builds and runs
- Create a new branch from `main` with the naming convention `fix/your-fix-name`
- Create a pull request from your branch to our origin repository's `main`
  branch!

# Submitting a New Template or Example

Looking to add a new framework template or example plugin? Great! Here are the
steps:

- Fork the repository, copying the `main` branch only
- Pull down the code, install dependencies, and ensure everything builds and
  runs
- Create a new branch from `main` with the naming convention
  `feature/your-feature-name`
- Create a pull request from your branch to our origin repository's `main`
  branch!

# Discussing General Issues or Questions

If none of the above options work for you, you can submit a general issue using
GitHub's [issues](https://github.com/sailpoint-oss/ui-plugin-templates/issues).
You can also head over to the
[Developer Community forum](https://developer.sailpoint.com/discuss) to discuss
with us directly.

# License

By contributing, you agree that your contributions will be licensed under the
MIT License.
