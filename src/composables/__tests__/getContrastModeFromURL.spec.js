import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import getContrastModeFromURL from '../getContrastModeFromURL.js';

describe('getContrastModeFromURL', () => {
  const originalURL = window.location.href;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'apca' when URL has ?contrastMode=apca", () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'http://localhost/?contrastMode=apca',
    });
    expect(getContrastModeFromURL()).toBe('apca');
  });

  it("returns 'wcag' when URL has ?contrastMode=wcag", () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'http://localhost/?contrastMode=wcag',
    });
    expect(getContrastModeFromURL()).toBe('wcag');
  });

  it('returns false when param absent', () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'http://localhost/',
    });
    expect(getContrastModeFromURL()).toBe(false);
  });

  it('returns false for invalid value', () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: 'http://localhost/?contrastMode=invalid',
    });
    expect(getContrastModeFromURL()).toBe(false);
  });
});
