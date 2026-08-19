import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SailpointPluginService } from '@core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly plugin = inject(SailpointPluginService);

  protected readonly title = signal('starter');

  // Reactive plugin state read straight from the service. Any component can
  // inject SailpointPluginService and read these signals the same way.
  protected readonly context = this.plugin.context;
  protected readonly status = this.plugin.status;
}
