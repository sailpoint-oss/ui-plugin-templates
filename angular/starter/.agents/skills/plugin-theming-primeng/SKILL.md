---
name: plugin-theming-primeng
description: Use when styling a SailPoint Angular UI plugin, using PrimeNG components, applying SailPoint Design System (SPDS) / ISC design tokens, setting typography or icons, or adding global CSS. Covers the PrimeNG + SPDS theme preset, semantic design-token CSS variables, the `.spds-h*` heading utilities, Font Awesome icons, and the iframe's isolated CSS scope. Use it for any visual, component-library, or theming work in this workspace.
---

# Theming an Angular plugin (PrimeNG + SPDS)

[PrimeNG](https://primeng.org/) is the component library for SailPoint UI plugins. It is in the starter's `package.json` and configured in `src/app/app.config.ts` with the SailPoint Design System theme preset. Read the "Design tokens / theming" section of `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for the full context.

## Design tokens

- The SPDS preset lives in `src/app/core/spds-prime-theme.ts` and is applied via `providePrimeNG()` in `app.config.ts`. (A future `provideSpds()` will be a thin wrapper around `providePrimeNG()` that applies the ISC preset automatically.)
- The preset injects primitive and semantic design tokens as CSS variables when the app loads. Component-level tokens are injected the first time an instance of that component is used.
- Prefer the semantic token variables for colors, spacing, and surfaces rather than hard-coded values. See the PrimeNG docs for the token names.

## Typography

- The preset injects global heading styles: native `h1`–`h6` use the bold heading tokens (xlarge → xxsmall).
- Utility classes apply the same sizes on any element: `.spds-h1`–`.spds-h6` (bold) and `.spds-h1--semibold`–`.spds-h6--semibold`.

## Icons

Font Awesome is the standard icon set for SailPoint UI plugins. (Bundling mechanism is TBD — do not load icons from a remote CDN; the sandbox blocks it.)

## CSS isolation

- The plugin iframe has its own CSS scope and inherits nothing from the host page.
- Global styles must be imported in `src/styles.scss`. PrimeNG theme styles are injected into the iframe's `<head>` for this app only.
- Elements created in code, or `@keyframes` declared inside a component, do not behave the way scoped component CSS does — see the `animating-ui-plugins` skill before hand-rolling animated or imperatively-created DOM.
