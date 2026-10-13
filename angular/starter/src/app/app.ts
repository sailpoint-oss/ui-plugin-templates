import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SailpointPluginService } from '@core';
import { TranslatePipe } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TagModule, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly plugin = inject(SailpointPluginService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Plugin display name. The SailPoint CLI (`sail ui-plugins init`) rewrites the
  // 'starter' literal to the alias the user provides. It is the plugin's own
  // name, not UI copy, so it is intentionally not translated.
  protected readonly title = signal('starter');
  protected readonly context = this.plugin.context;
  protected readonly status = this.plugin.status;
  protected readonly handshakeSeverity = {
    pending: 'warn',
    ready: 'success',
    failed: 'danger',
  } as const;

  ngOnInit(): void {
    // The host may have deep-linked to a sub-route (e.g. after a reload of
    // /ui/plugin/starter/workflows). The SDK derives that plugin-relative route
    // as `page.subPath`; the explicit navigation below restores it. Initial
    // navigation is disabled in app.config so the router never tries to match
    // the iframe's index.html path, so this is the plugin's first route.
    const initialSubPath = this.plugin.context()?.page.subPath ?? '';
    let initialNavigationHandled = false;

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        // Path routes look like '/workflows' — strip the leading slash to get
        // the plugin-relative sub-path the host expects ('' for the start route).
        const subPath = event.urlAfterRedirects.replace(/^\//, '');

        if (!initialNavigationHandled) {
          // Suppress the broadcast for the restore navigation, so the route we
          // just adopted never overwrites the deep-linked host URL it came from.
          initialNavigationHandled = true;
          return;
        }

        // Report the route to the host via the SDK so it mirrors it in the
        // browser URL. Only meaningful once the handshake is ready; standalone
        // dev has no App Shell to talk to.
        if (this.plugin.apiReady()) {
          this.plugin.setRoute(subPath).catch((err) => {
            console.warn('[plugin] Failed to report route change to the host.', err);
          });
        }
      });

    // Perform the first navigation now that the listener is wired, restoring a
    // deep-linked sub-path or falling back to the start route.
    this.router.navigateByUrl(`/${initialSubPath}`).catch((err) => {
      console.warn('[plugin] Failed to perform the initial route navigation.', err);
    });
  }
}
