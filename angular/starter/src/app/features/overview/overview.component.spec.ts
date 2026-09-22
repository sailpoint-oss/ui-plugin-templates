import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let fixture: ComponentFixture<OverviewComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the welcome heading', () => {
    expect(compiled.querySelector('h2')?.textContent).toContain('Welcome to Your UI Plugin');
  });

  it('lists what users can build', () => {
    const items = compiled.querySelectorAll('li');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Custom dashboards');
    expect(items[1].textContent).toContain('Workflow launchers');
    expect(items[2].textContent).toContain('Administrative tools');
  });
});
