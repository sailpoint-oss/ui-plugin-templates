import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SailpointPluginService } from '@core';
import { IdentitiesService } from '@sailpoint/angular-sdk/identities';
import { TenantService, type Tenant } from '@sailpoint/angular-sdk/tenant';
import { EMPTY, firstValueFrom } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, JsonPipe, RouterOutlet],
  providers: [IdentitiesService, TenantService],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly plugin = inject(SailpointPluginService);
  private readonly identitiesSvc = inject(IdentitiesService);
  private readonly tenantSvc = inject(TenantService);

  protected readonly title = signal('starter');

  protected readonly context = this.plugin.context;
  protected readonly status = this.plugin.status;
  protected readonly apiReady = this.plugin.apiReady;

  /** Observable example: IdentitiesService with AsyncPipe and a gate signal. */
  protected readonly identitiesLoading = signal(false);
  protected readonly identitiesError = signal('');
  protected readonly getIdentities = signal(false);
  protected readonly identities$ = this.identitiesSvc
    .listIdentitiesV1({ limit: 5 })
    .pipe(
      tap(() => {
        this.identitiesLoading.set(true);
        this.identitiesError.set('');
      }),
      catchError((err) => {
        this.identitiesError.set(this.formatApiError(err));
        return EMPTY;
      }),
      finalize(() => this.identitiesLoading.set(false)),
    );

  /** Promise example: TenantService via firstValueFrom(). */
  protected readonly tenantLoading = signal(false);
  protected readonly tenantError = signal('');
  protected readonly tenant = signal<Tenant | undefined>(undefined);

  protected async promiseApiCall(): Promise<void> {
    this.tenantLoading.set(true);
    this.tenantError.set('');

    try {
      const tenantData = await firstValueFrom(this.tenantSvc.getTenantV1());
      this.tenant.set(tenantData);
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
