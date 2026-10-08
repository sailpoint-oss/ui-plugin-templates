---
name: animating-ui-plugins
description: Use when building, changing, or debugging animations or CSS visual effects in a SailPoint UI plugin — CSS `@keyframes`, the Web Animations API, transitions, or animated DOM created in code. Covers Angular view-encapsulation pitfalls, animations that play under `ng serve` but freeze in the production build, and how to verify animations in a built bundle. Use it whenever an animation does not play, plays only in dev, or elements created in code render unstyled.
---

# Animating SailPoint UI plugins

Angular's emulated view encapsulation rewrites a component's CSS: class selectors and `@keyframes` names get a per-component suffix. Two of the three traps below come from DOM or CSS the rewrite never reaches; the third is a dev-versus-production difference. An animation can look perfect under `ng serve` and freeze once the plugin is built and served from the CDN.

Read `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for the basics. This skill adds the animation-specific failures that are easy to miss.

## View encapsulation and imperative DOM

- Elements you create in code (`document.createElement`) never receive the encapsulation attribute (`_ngcontent-*`), so a component's scoped `.class` rules never apply to them. Symptom: the node is in the DOM but unstyled — typically `display: inline`, `0×0`, invisible — so the animation appears to never run.
- Set the layout and animation styles inline on created elements, or move those rules to a global stylesheet (`src/styles.scss`). Do not rely on a component-scoped class for JS-created nodes.

## Component `@keyframes` in production builds

- `@keyframes` declared inside a component have their names scoped by encapsulation. The production optimizer can rename the keyframes without rewriting every `animation-name` reference (references inside `@media` blocks are the ones seen to break), so the name no longer resolves and the animation silently does nothing.
- It works under `ng serve` because the dev CSS pipeline keeps the two aligned; the production build exposes the mismatch.
- Keep `@keyframes` used by backgrounds and effects in a global stylesheet, not inside a component. The Web Animations API (`element.animate()`) is immune — it has no CSS keyframe names to scope.

## Verifying animations

- Verify against a **production build served as static files**, not only `ng serve`: run `npm run build`, then serve `dist/<alias>/browser` from a plain static server and open that. The dev (Vite) CSS pipeline and the production optimizer differ, so CSS that animates locally can freeze in the built bundle.
- Turn OS/browser reduce-motion **off**. Headless Chrome defaults to `prefers-reduced-motion: reduce`, which legitimately disables motion; also confirm any reduced-motion rest state still leaves content visible rather than parked off-screen.
- Confirm motion actually **progresses over time** — sample a transform or position at two timestamps. "The element exists in the DOM" is not "the animation plays."
