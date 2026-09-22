import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SailpointPluginService } from '@core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TagModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly plugin = inject(SailpointPluginService);

  protected readonly context = this.plugin.context;
  protected readonly status = this.plugin.status;
  protected readonly handshakeSeverity = {
    pending: 'warn',
    ready: 'success',
    failed: 'danger',
  } as const;
}
