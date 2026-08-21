import '@testing-library/jest-dom';

// Next.js navigation hooks are not available in jsdom; mock them so pages that
// call usePathname/useRouter/useSearchParams render under test.
jest.mock('next/navigation', () => ({
  usePathname: () => '/test',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
}));

// Match media mock (some components may query window.matchMedia).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
