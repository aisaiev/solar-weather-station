import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

type MockMediaQueryList = {
  matches: boolean;
  addEventListener: (type: 'change', listener: (event: { matches: boolean }) => void) => void;
  removeEventListener: (type: 'change', listener: (event: { matches: boolean }) => void) => void;
};

describe('ThemeService', () => {
  let listeners: Array<(event: { matches: boolean }) => void>;
  let mockMql: MockMediaQueryList;

  beforeEach(() => {
    listeners = [];
    mockMql = {
      matches: false,
      addEventListener: (_type, listener) => listeners.push(listener),
      removeEventListener: (_type, listener) => {
        listeners = listeners.filter((l) => l !== listener);
      },
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => mockMql as unknown as MediaQueryList),
    });
    document.documentElement.classList.remove('dark');

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('should initialize isDark from matchMedia and apply class', () => {
    mockMql.matches = true;

    const service = TestBed.inject(ThemeService);

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should react to media query change event and update class', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    listeners.forEach((listener) => listener({ matches: true }));
    TestBed.tick();

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class when switching back to light', () => {
    const service = TestBed.inject(ThemeService);

    listeners.forEach((listener) => listener({ matches: true }));
    TestBed.tick();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    listeners.forEach((listener) => listener({ matches: false }));
    TestBed.tick();

    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
