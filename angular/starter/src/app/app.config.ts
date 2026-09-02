import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';

import { routes } from './app.routes';
import { SailpointPluginService } from '@core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Prod iframe URL is …/index.html?parentOrigin=…; initial navigation would try to
    // match the "index.html" segment against our empty route table (NG04002). With no
    // routes yet skip syncing the router to the browser URL on bootstrap.
    provideRouter(routes, withDisabledInitialNavigation()),
    // TODO: When the SailPoint Design System package (@sailpoint/sds or equivalent)
    // is available, replace the line below with provideSds(). provideSds() is a thin
    // wrapper that calls providePrimeNG() internally with the ISC-compatible theme
    // preset and design tokens. Until that package ships, PrimeNG is installed but
    // not explicitly configured here — add providePrimeNG() manually only if you
    // need component-level customization in the interim.
    //
    // Example (interim, before provideSds is available):
    //   import { providePrimeNG } from 'primeng/config';
    //   import Aura from '@primeng/themes/aura';
    //   providePrimeNG({ theme: { preset: Aura } })
    //
    // Example (once provideSds is available):
    //   import { provideSds } from '@sailpoint/sds';
    //   provideSds()

    // Resolve the COIP handshake + plugin context once, before the app renders,
    // so components and SDK api.get/post calls never race the handshake.
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
