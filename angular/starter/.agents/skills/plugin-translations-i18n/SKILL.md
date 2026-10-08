---
name: plugin-translations-i18n
description: Use when adding or editing user-facing text, translating a SailPoint Angular UI plugin, or configuring internationalization. Covers the ngx-translate stack, the `translate` pipe, JSON catalogs under `public/i18n/`, adding a label or a new language, why `useHttpBackend` makes catalog requests skip the SailPoint auth interceptor, and ISC's 22-language parity with an `en` fallback. Use it whenever introducing or changing display strings.
---

# Translations (i18n) in an Angular plugin

Translations use [ngx-translate](https://ngx-translate.org/) (`@ngx-translate/core` + `@ngx-translate/http-loader`). Catalogs are plain JSON under `public/i18n/`, loaded at runtime over HTTP and rendered through the `translate` pipe. Read the "Translations (i18n)" section of `SAILPOINT_PLUGIN_GUIDE_ANGULAR.md` in the project root for full context, and prefer the [ngx-translate docs](https://ngx-translate.org/) for the pipe/service API and parameterized messages.

## Setup (already wired)

`app.config.ts` calls:

```ts
provideTranslateService({
  fallbackLang: 'en',
  loader: provideTranslateHttpLoader({ prefix: 'i18n/', suffix: '.json', useHttpBackend: true }),
})
```

An app initializer calls `translate.use(navigator.language)` so the plugin renders in the viewer's browser language. `useHttpBackend: true` makes catalog requests skip the SailPoint auth interceptor — the catalogs are same-origin static assets, not API calls.

## Add or update a label

1. Add/edit the key in `public/i18n/en.json`. Nested objects use dots, e.g. `nav.overview`.
2. Reference it in a template: `{{ 'nav.overview' | translate }}`. For strings with inline markup (`<code>`, `<strong>`), bind with `[innerHTML]="'some.key' | translate"`.
3. Import `TranslatePipe` from `@ngx-translate/core` in the component's `imports`.

## Add a language

Drop a new catalog into `public/i18n/` named for the locale the browser reports (`navigator.language`, matched verbatim). Missing keys and unmatched locales fall back to `en`. No code change needed.

## ISC parity

ISC's fallback language is `en` and ISC supports 22 languages. To mirror ISC, provide a catalog for each and keep `en` as the fallback: `en`, `cs`, `da`, `de`, `es`, `fi`, `fr`, `hu`, `it`, `ja`, `ko`, `lt`, `nl`, `no`, `pl`, `pt`, `ru`, `sv`, `th`, `tr`, `zh-CN`, `zh-TW`.
