/**
 * Test environment setup for Angular + Vitest.
 *
 * PrimeNG components (e.g., p-tabs) use ResizeObserver which is not available
 * in jsdom. Provide a minimal mock so components can initialize.
 */

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
