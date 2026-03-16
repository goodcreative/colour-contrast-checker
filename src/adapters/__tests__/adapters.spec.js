import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createBrowserUrlAdapter } from '../browserUrlAdapter';
import { createBrowserStorageAdapter } from '../browserStorageAdapter';
import { createInMemoryUrlAdapter, createInMemoryStorageAdapter } from '../testAdapters';

describe('browserUrlAdapter', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('getParam returns null when param absent', () => {
    const adapter = createBrowserUrlAdapter();
    expect(adapter.getParam('colours')).toBeNull();
  });

  it('getSearch returns empty string on clean URL', () => {
    const adapter = createBrowserUrlAdapter();
    expect(adapter.getSearch()).toBe('');
  });

  it('setParams writes params to window.location', () => {
    const adapter = createBrowserUrlAdapter();
    adapter.setParams({ colours: 'ff0000', complianceMode: 'AAA' });
    expect(window.location.search).toContain('colours=ff0000');
    expect(window.location.search).toContain('complianceMode=AAA');
  });

  it('setParams with null value deletes param', () => {
    window.history.replaceState({}, '', '?title=hello');
    const adapter = createBrowserUrlAdapter();
    adapter.setParams({ title: null });
    expect(window.location.search).not.toContain('title');
  });

  it('getParam reads param previously set via setParams', () => {
    const adapter = createBrowserUrlAdapter();
    adapter.setParams({ complianceMode: 'AAA' });
    expect(adapter.getParam('complianceMode')).toBe('AAA');
  });

  it('getSearch returns query string after setParams', () => {
    const adapter = createBrowserUrlAdapter();
    adapter.setParams({ colours: 'ff0000' });
    expect(adapter.getSearch()).toContain('colours=ff0000');
  });
});

describe('browserStorageAdapter', () => {
  beforeEach(() => localStorage.clear());

  it('load returns null for missing key', () => {
    const adapter = createBrowserStorageAdapter();
    expect(adapter.load('missing')).toBeNull();
  });

  it('save and load round-trip', () => {
    const adapter = createBrowserStorageAdapter();
    adapter.save('palettes', '[{"id":0}]');
    expect(adapter.load('palettes')).toBe('[{"id":0}]');
  });

  it('remove deletes key', () => {
    const adapter = createBrowserStorageAdapter();
    adapter.save('key', 'val');
    adapter.remove('key');
    expect(adapter.load('key')).toBeNull();
  });
});

describe('createInMemoryUrlAdapter', () => {
  it('getParam reads from initial search string', () => {
    const adapter = createInMemoryUrlAdapter('?complianceMode=AAA');
    expect(adapter.getParam('complianceMode')).toBe('AAA');
  });

  it('getSearch returns empty string when no params', () => {
    const adapter = createInMemoryUrlAdapter();
    expect(adapter.getSearch()).toBe('');
  });

  it('getSearch returns query string when params present', () => {
    const adapter = createInMemoryUrlAdapter('?colours=ff0000');
    expect(adapter.getSearch()).toContain('colours=ff0000');
  });

  it('setParams updates snapshot', () => {
    const adapter = createInMemoryUrlAdapter();
    adapter.setParams({ colours: 'ff0000' });
    expect(adapter.snapshot()).toContain('colours=ff0000');
  });

  it('setParams with null removes param', () => {
    const adapter = createInMemoryUrlAdapter('?title=hello');
    adapter.setParams({ title: null });
    expect(adapter.snapshot()).not.toContain('title');
  });

  it('callsTo tracks setParams calls', () => {
    const adapter = createInMemoryUrlAdapter();
    adapter.setParams({ colours: 'ff0000' });
    adapter.setParams({ complianceMode: 'AA' });
    expect(adapter.callsTo('setParams')).toHaveLength(2);
  });
});

describe('createInMemoryStorageAdapter', () => {
  it('load returns null for missing key', () => {
    const adapter = createInMemoryStorageAdapter();
    expect(adapter.load('missing')).toBeNull();
  });

  it('load reads from seed', () => {
    const adapter = createInMemoryStorageAdapter({ palettes: '[{"id":0}]' });
    expect(adapter.load('palettes')).toBe('[{"id":0}]');
  });

  it('save and snapshot round-trip', () => {
    const adapter = createInMemoryStorageAdapter();
    adapter.save('idCounter', '3');
    expect(adapter.snapshot().idCounter).toBe('3');
  });

  it('remove deletes from snapshot', () => {
    const adapter = createInMemoryStorageAdapter({ key: 'val' });
    adapter.remove('key');
    expect('key' in adapter.snapshot()).toBe(false);
  });

  it('callsTo tracks save calls with args', () => {
    const adapter = createInMemoryStorageAdapter();
    adapter.save('a', '1');
    adapter.save('b', '2');
    expect(adapter.callsTo('save')).toHaveLength(2);
    expect(adapter.callsTo('save')[0].args).toEqual(['a', '1']);
  });
});
