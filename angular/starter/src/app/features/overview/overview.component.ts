import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [HeroComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {}
