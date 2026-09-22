import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideSailPoint } from '@sailpoint/angular-sdk';
import { providePrimeNG } from 'primeng/config';

import { SailpointPluginService } from '@core';
// These will be imported from the SailPoint Design System package when available.
import spdsPrimePreset, { SPDS_DARK_MODE_SELECTOR, SPDS_THEME_PREFIX } from '@core/spds-prime-theme';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Hash-based routing (#/, #/workflows, #/api-examples) works reliably in an
    // iframe without server-side rewrite rules. Multiple routes eliminate the
    // NG04002 issue that required withDisabledInitialNavigation() when the route
    // table was empty.
    provideRouter(routes, withHashLocation()),
    // provideSailPoint() wires up HttpClient and an auth interceptor that reads
    // window.sailpointConfig() on every request. No params here — the plugin
    // host registers that function after the COIP handshake completes below.
    provideSailPoint(),
    // TODO: When the SailPoint Design System package is available,
    // replace this with the thin wrapper from SailPoint Design System
    // that calls providePrimeNG() internally with the ISC-compatible
    // theme preset and design tokens. Interim wiring uses the
    // generated preset in core/spds-prime-theme.ts.
    providePrimeNG({
      theme: {
        preset: spdsPrimePreset,
        options: { darkModeSelector: SPDS_DARK_MODE_SELECTOR, prefix: SPDS_THEME_PREFIX },
      },
    }),

    // Resolve the COIP handshake + plugin context once, before the app renders,
    // so window.sailpointConfig() is available for the first SDK request.
    // so api.get/post calls never race the handshake.
    provideAppInitializer(async () => {
      try {
        await inject(SailpointPluginService).whenReady();
      } catch (err) {
        // Standalone dev (no App Shell parent / unresolvable origin) or a handshake
        // failure — let bootstrap proceed so UI iteration isn't blocked.
        console.warn('[plugin] App Shell handshake did not complete during startup.', err);
      }
    })
  ]
};
