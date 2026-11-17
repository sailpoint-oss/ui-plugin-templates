---
name: plugin-theming-primeng
description: Use when styling a SailPoint Angular UI plugin, using PrimeNG components, applying SailPoint Design System (SPDS) / ISC design tokens, setting typography or icons, or adding global CSS. Covers the PrimeNG + SPDS theme preset, semantic design-token CSS variables, the `.spds-h*` heading utilities, Font Awesome icons, and the iframe's isolated CSS scope. Use it for any visual, component-library, or theming work in this workspace.
---

# Theming an Angular plugin (PrimeNG + SPDS)

[PrimeNG](https://v21.primeng.org/) is the component library for SailPoint UI plugins. It is in the starter's `package.json` and configured in `src/app/app.config.ts` with the SailPoint Design System theme preset.

## Theme setup

- Keep `providePrimeNG()` and the generated SPDS preset. Use only design-system dependencies, tokens, components, and directives already available in this starter.
- The public SPDS preset is the source of truth. Do not assume that private or internal design-system capabilities are available to UI plugins.
- The preset lives in `src/app/core/spds-prime-theme.ts`. Treat it as generated source and do not hand-edit it. A future public `provideSpds()` will replace the interim `providePrimeNG()` wiring.
- This starter uses the PrimeNG major declared in `package.json`. Confirm APIs against documentation for that installed major.

## PrimeNG first

- Use PrimeNG components directly for standard UI: `p-button`, `p-card`, `p-message`, `p-tag`, form controls, dialogs, menus, and similar primitives.
- Use `p-card` for card surfaces and `p-message` for feedback instead of recreating their borders, colors, and status treatments in application CSS.
- For projected card, panel, dialog, or template content, wrap markup in a class the feature owns and style that class. Do not reach into PrimeNG's internal `.p-*` structure to arrange content you authored.
- Do not use `Ripple`, `RippleModule`, or `pRipple`. Keep Angular's default emulated view encapsulation; `::ng-deep` and `ViewEncapsulation.None` are last resorts.

## Tokens and application CSS

The preset injects primitive and semantic tokens as `--spds-*` CSS variables. Component tokens are injected when that PrimeNG component is first used.

Use semantic tokens before primitive palette tokens:

| Role                         | Existing token                |
| ---------------------------- | ----------------------------- |
| Base or alternating surface  | `--spds-surface-200`          |
| Raised or content surface    | `--spds-content-background`   |
| Borders and dividers         | `--spds-content-border-color` |
| Primary text                 | `--spds-text-color`           |
| Muted text                   | `--spds-text-muted-color`     |
| Navigation state             | `--spds-navigation-item-*`    |

Alternate container backgrounds by nesting level so each content boundary remains visible. Start with `--spds-surface-200` for the page, use `--spds-content-background` for content placed on it, then return to `--spds-surface-200` for content nested inside that surface. Continue alternating if another content surface is necessary.

- A PrimeNG card uses `--spds-content-background` by default. For a card nested inside another card, place a feature-owned class on the nested `p-card` host and set `--spds-card-background: var(--spds-surface-200)` on that class. If another card is nested inside it, set that card's background back to `--spds-content-background`.
- Apply the same alternation to custom static containers such as result panels and bordered list items.

### State tokens

Tokens whose names include a UI state such as `hover`, `focus`, `active`, `disabled`, `selected`, or `invalid` are contracts for that state. Use them only while the corresponding state is present.

- Use hover tokens inside `:hover`, focus tokens inside `:focus` or `:focus-visible`, and active tokens for selected routes or controls.
- Do not use `--spds-content-hover-background` or another state token as a convenient static surface color. Use `--spds-surface-200` for the approved neutral static surface.
- Do not borrow a focus token to style an active state, even if the colors currently match. The token values can diverge independently.
- When PrimeNG owns the state class, scope the matching state token to that documented class in `src/styles.scss`.

### Surface scale restriction

The direct `--spds-surface-*` scale is not correctly calibrated yet. Avoid it until the public preset is corrected.

- `--spds-surface-200` is the temporary exception for the page canvas and approved neutral static surfaces.
- Do not use any other direct surface-scale token, including `--spds-surface-0`, `-50`, `-100`, or darker steps.
- Prefer semantic tokens such as `--spds-content-background`, `--spds-content-border-color`, and state-specific component tokens.
- Do not choose a nearby surface step to approximate a missing semantic token. Keep an explicit literal when no approved token exists so the design-system gap remains visible.

- Verify every `--spds-*` name in `src/app/core/spds-prime-theme.ts`. Do not invent a token.
- Do not mask a missing token with `var(--spds-example, fallback)`. Use a real existing token; if none fits, use an explicit literal so the design-system gap remains visible.
- Never use `--p-*`. The preset configures PrimeNG with the `spds` prefix, so `--p-*` declarations silently fail.
- Avoid primitive color tokens such as `--spds-blue-500`, `--spds-zinc-500`, or `--spds-red-500` in application CSS when a semantic token or themed PrimeNG component expresses the role.
- Do not consume component tokens as values in unrelated application CSS; they are emitted only when that component is present and are intended primarily for its own styles.
- Scoped overrides of existing component token declarations are acceptable when a design needs a state or variation PrimeNG does not provide. Treat them as the component's styling API, verify the token exists, and prefer this to `::ng-deep`.
- The current public preset does not expose an application spacing namespace. Keep intentional `rem` values for margin, padding, and gap; do not invent `--spds-spacing-*` or use `--spds-scale-*` as spacing aliases.
- Avoid hard-coded colors, shadows, gradient text, and decorative effects in general-purpose plugin UI. Keep a literal only when the product design intentionally requires a bespoke fixed-color treatment and document the reason.

## Typography

- The preset injects global heading styles: native `h1`–`h6` use the bold heading tokens (xlarge → xxsmall).
- Utility classes apply the same sizes on any element: `.spds-h1`–`.spds-h6` (bold) and `.spds-h1--semibold`–`.spds-h6--semibold`.
- Preserve semantic heading order independently of visual size. For example, use `<h1 class="spds-h4">` when the page title should look like the fourth heading size.

## Icons

Font Awesome is the standard icon set for SailPoint UI plugins. (Bundling mechanism is TBD — do not load icons from a remote CDN; the sandbox blocks it.)

## PrimeNG customization

When one instance must differ from the preset, stop at the first option that works:

1. PrimeNG inputs, templates, and `styleClass`.
2. PrimeNG's documented theme API classes when recreating component structure inside a template.
3. A class on markup the feature owns.
4. A host-scoped existing `--spds-*` component token.

When a PrimeNG template requires recreating part of a component, preserve its documented theme API classes so the preset still applies. For example, a custom card header should use `.p-card-title`, with feature-specific changes placed under an additional class that the feature owns.

Prefer to avoid `::ng-deep`.

## CSS isolation

- The plugin iframe has its own CSS scope and inherits nothing from the host page.
- Global styles must be imported in `src/styles.scss`. PrimeNG theme styles are injected into the iframe's `<head>` for this app only.
- Elements created in code, or `@keyframes` declared inside a component, do not behave the way scoped component CSS does — see the `animating-ui-plugins` skill before hand-rolling animated or imperatively-created DOM.
