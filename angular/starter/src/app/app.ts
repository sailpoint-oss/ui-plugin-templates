import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import type { Identity } from 'sailpoint-api-client/identities/api';
import { IdentitiesApi } from 'sailpoint-api-client/identities/api';
import type { Tenant } from 'sailpoint-api-client/tenant/api';
import { TenantApi } from 'sailpoint-api-client/tenant/api';
import { from } from 'rxjs';
import { finalize, map, switchMap, take } from 'rxjs/operators';

import { SailpointApiService, SailpointPluginService } from '@core';

@Component({
  selector: 'app-root',
  imports: [JsonPipe, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly plugin = inject(SailpointPluginService);
  private readonly api = inject(SailpointApiService);

  protected readonly title = signal('starter');

  protected readonly context = this.plugin.context;
  protected readonly status = this.plugin.status;
  protected readonly apiReady = this.api.apiReady;

  protected readonly tenantLoading = signal(false);
  protected readonly tenantError = signal('');
  protected readonly tenant = signal<Tenant | undefined>(undefined);

  protected readonly identitiesLoading = signal(false);
  protected readonly identitiesError = signal('');
  protected readonly identities = signal<Identity[] | undefined>(undefined);

  /** Promise example: TenantApi via getApi(). */
  protected async promiseApiCall(): Promise<void> {
    this.resetTenant();

    try {
      const tenantApi = await this.api.getApi(TenantApi);
      const response = await tenantApi.getTenantV1();
      this.tenant.set(response.data);
    } catch (err) {
      this.tenantError.set(this.formatApiError(err));
    } finally {
      this.tenantLoading.set(false);
    }
  }

  /**
   * Observable example: IdentitiesApi via getApi$(). */
  protected observableApiCall(): void {
    this.resetIdentities();

    this.api
      .getApi$(IdentitiesApi)
      .pipe(
        switchMap((identitiesApi) =>
          from(identitiesApi.listIdentitiesV1({ limit: 5 })),
        ),
        map((response) => response.data),
        take(1),
        finalize(() => this.identitiesLoading.set(false)),
      )
      .subscribe({
        next: (data) => this.identities.set(data),
        error: (err) => this.identitiesError.set(this.formatApiError(err)),
      });
  }

  private resetTenant(): void {
    this.tenantLoading.set(true);
    this.tenantError.set('');
    this.tenant.set(undefined);
  }

  private resetIdentities(): void {
    this.identitiesLoading.set(true);
    this.identitiesError.set('');
    this.identities.set(undefined);
  }

  private formatApiError(err: unknown): string {
    return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
}
