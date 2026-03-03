import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { downloadFile } from '../downloadFile';

describe('downloadFile', () => {
  let anchor, clickSpy, origCreateObjectURL, origRevokeObjectURL;

  beforeEach(() => {
    clickSpy = vi.fn();
    anchor = { href: '', download: '', click: clickSpy };
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    origCreateObjectURL = URL.createObjectURL;
    origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:test-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it('creates an anchor element', () => {
    downloadFile('test.json', '{}', 'application/json');
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('sets download attribute to filename', () => {
    downloadFile('palette.json', '{}', 'application/json');
    expect(anchor.download).toBe('palette.json');
  });

  it('sets href to the object URL', () => {
    downloadFile('test.json', '{}', 'application/json');
    expect(anchor.href).toBe('blob:test-url');
  });

  it('appends anchor to body before clicking', () => {
    downloadFile('test.json', '{}', 'application/json');
    expect(document.body.appendChild).toHaveBeenCalledWith(anchor);
  });

  it('triggers click on the anchor', () => {
    downloadFile('test.json', '{}', 'application/json');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('removes anchor from body after clicking', () => {
    downloadFile('test.json', '{}', 'application/json');
    expect(document.body.removeChild).toHaveBeenCalledWith(anchor);
  });

  it('revokes the object URL after clicking', () => {
    downloadFile('test.json', '{}', 'application/json');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('works with ArrayBuffer content', () => {
    downloadFile('palette.ase', new ArrayBuffer(8), 'application/octet-stream');
    expect(clickSpy).toHaveBeenCalled();
  });
});
