import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia which is not implemented in jsdom
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;
  global.HTMLElement.prototype.scrollIntoView = vi.fn();
  global.HTMLElement.prototype.hasPointerCapture = vi.fn();
  global.HTMLElement.prototype.releasePointerCapture = vi.fn();
  global.PointerEvent = class PointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerId: number;
    constructor(type: string, props: any) {
      super(type, props);
      this.button = props?.button || 0;
      this.ctrlKey = props?.ctrlKey || false;
      this.pointerId = props?.pointerId || 1;
    }
  } as any;
});
