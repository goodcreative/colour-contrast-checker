import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import getURLParam from '../getURLParam.js';

describe('getURLParam', () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location.href;
  });

  afterEach(() => {
    window.history.replaceState(null, '', originalLocation);
  });

  function setURL(url) {
    window.history.replaceState(null, '', url);
  }

  it('returns value for an existing param', () => {
    setURL('/?colours=ff0000-00ff00');
    expect(getURLParam('colours')).toBe('ff0000-00ff00');
  });

  it('returns null for a missing param', () => {
    setURL('/');
    expect(getURLParam('colours')).toBeNull();
  });

  it('returns empty string for param with no value', () => {
    setURL('/?title=');
    expect(getURLParam('title')).toBe('');
  });

  it('handles multiple params', () => {
    setURL('/?colours=aabbcc&title=My+Palette&focus=ff0000');
    expect(getURLParam('colours')).toBe('aabbcc');
    expect(getURLParam('title')).toBe('My Palette');
    expect(getURLParam('focus')).toBe('ff0000');
  });

  it('returns null when no query string present', () => {
    setURL('/');
    expect(getURLParam('anything')).toBeNull();
  });

  it('decodes URL-encoded values', () => {
    setURL('/?title=Hello%20World');
    expect(getURLParam('title')).toBe('Hello World');
  });
});
