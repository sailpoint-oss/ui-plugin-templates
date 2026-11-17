import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { HeroComponent } from './hero/hero.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CardModule, HeroComponent, TranslatePipe],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {}
