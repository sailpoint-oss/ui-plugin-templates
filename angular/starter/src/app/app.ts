import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SailpointApiService, SailpointPluginService } from '@core';
import { IdentitiesApi } from '@sailpoint/api-client/identities/api';
import type { Tenant } from '@sailpoint/api-client/tenant/api';
import { TenantApi } from '@sailpoint/api-client/tenant/api';
import { EMPTY, from } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, JsonPipe, RouterOutlet],
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

  protected readonly getIdentities = signal(false);
  protected readonly identities$ = this.api.getApi$(IdentitiesApi).pipe(
    tap(() => {
      this.identitiesLoading.set(true);
      this.identitiesError.set('');
    }),
    switchMap((identitiesApi) =>
      from(identitiesApi.listIdentitiesV1({ limit: 5 })),
    ),
    map((response) => response.data),
    catchError((err) => {
      this.identitiesError.set(this.formatApiError(err));
      return EMPTY;
    }),
    finalize(() => this.identitiesLoading.set(false)),
  );

  /** Promise example: TenantApi via getApi(). */
  protected async promiseApiCall(): Promise<void> {
    this.tenantLoading.set(true);
    this.tenantError.set('');

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

  private formatApiError(err: unknown): string {
    return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
}
