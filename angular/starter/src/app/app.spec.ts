import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { SailpointPluginService } from '@core';
import { activateTranslations, provideTranslateTesting } from './testing/i18n.testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideTranslateTesting(),
        // Stub the plugin service so the component does not build a real SDK or
        // attempt an App Shell handshake during the test. The component only
        // reads the `context` and `status` signals.
        {
          provide: SailpointPluginService,
          useValue: {
            context: signal({
              tenant: { org: 'acme' },
              user: { displayName: 'Test User', email: 'test@acme.com' },
              page: { route: 'https://acme.identitysoon.com/ui/plugin/starter', subPath: '' },
            }),
            status: signal('ready'),
            apiReady: () => false,
            setRoute: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    activateTranslations();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('lets routed pages own the content surface', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main.shell-content > router-outlet')).toBeTruthy();
    expect(compiled.querySelector('.shell-content__card')).toBeNull();
  });

  it('renders the greeting and handshake context above page content', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell-content__title')?.textContent).toContain('Hello, starter');
    const header = compiled.querySelector('main.shell-content > header.shell-content__header');
    expect(header?.querySelector('p-tag')).toBeTruthy();
    expect(header?.textContent).toContain('acme');
    expect(header?.textContent).toContain('Test User');
  });

  it('renders flat PrimeNG Menu navigation', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')?.getAttribute('aria-label')).toBe('Plugin sections');
    expect(compiled.querySelector('p-menu')).toBeTruthy();
    expect(compiled.querySelector('p-panelmenu')).toBeNull();
    const links = compiled.querySelectorAll('.p-menu-item-link');
    expect(links.length).toBe(3);
    expect(links[0].textContent).toContain('Overview');
    expect(links[1].textContent).toContain('Workflows');
    expect(links[2].textContent).toContain('API Examples');
    expect(links[0].classList).toContain('p-menu-item-link-active');
  });
});
