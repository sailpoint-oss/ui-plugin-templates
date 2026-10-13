---
name: plugin-routing-angular
description: Use when adding routes, navigation, lazy-loaded pages, or page structure to a SailPoint Angular UI plugin. Covers the path location strategy with disabled initial navigation inside the sandboxed iframe, how the plugin route is mirrored to the host URL over COIP, lazy `loadComponent` route definitions, and the ISC left-sidebar navigation pattern with `routerLinkActive`. Use it for any routing or in-plugin navigation work.
---

# Routing in an Angular plugin

UI plugins use Angular routing with the default **path location strategy** (`/`, `/workflows`). The iframe document is always the plugin's `index.html`, so a route path never reaches a server — navigation stays in memory, and the host App Shell URL is mirrored over COIP via the SDK (`navigation.setRoute` out, `page.subPath` in). Read the "Routing" section of `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for full context.

## Configuration

The starter configures `withDisabledInitialNavigation()` in `app.config.ts`:

```ts
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
provideRouter(routes, withDisabledInitialNavigation());
```

Initial navigation is disabled because the document loads at `index.html`, which matches no route (`NG04002`). `app.ts` performs the first navigation explicitly — restoring a deep-linked route from `page.subPath`, or the start route otherwise — and reports later route changes to the host with `plugin.setRoute(...)`.

## Route definitions

Define routes in `app.routes.ts`, using `loadComponent` for lazy loading:

```ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/overview/overview.component').then(m => m.OverviewComponent) },
  { path: 'workflows', loadComponent: () => import('./features/workflows/workflows.component').then(m => m.WorkflowsComponent) },
];
```

A lazy route can fail to compile while `npm test` still passes, because the specs don't import it. Run `npm run build` as a type-check before relying on a new route.

## Sidebar navigation (ISC pattern)

ISC apps use a left sidebar for section navigation. Link items with `routerLink` and highlight the current one with `routerLinkActive` (use `[routerLinkActiveOptions]="{ exact: true }"` for the root route). Import `RouterLink` and `RouterLinkActive` in the component. Conventions: sidebar flows from the header with a rounded bottom-right corner; active state is a blue background with a left-border accent; content sits in a white rounded card on a gray page background.
