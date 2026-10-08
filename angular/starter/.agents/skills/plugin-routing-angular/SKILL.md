---
name: plugin-routing-angular
description: Use when adding routes, navigation, lazy-loaded pages, or page structure to a SailPoint Angular UI plugin. Covers why the hash location strategy is required inside the sandboxed iframe, lazy `loadComponent` route definitions, and the ISC left-sidebar navigation pattern with `routerLinkActive`. Use it for any routing or in-plugin navigation work.
---

# Routing in an Angular plugin

UI plugins use Angular routing with the **hash location strategy** (`#/`, `#/workflows`). Hash URLs work reliably in an iframe with no server-side rewrite rules. Read the "Routing" section of `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for full context.

## Configuration

The starter configures `withHashLocation()` in `app.config.ts`:

```ts
import { provideRouter, withHashLocation } from '@angular/router';
provideRouter(routes, withHashLocation());
```

Do not switch to path location — absolute paths break inside the iframe.

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
