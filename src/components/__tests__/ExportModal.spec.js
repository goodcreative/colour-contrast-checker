import { describe, it, expect, vi, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ExportModal from '../ExportModal.vue';
import { useColourStore } from '@/stores/colourStore';

vi.mock('@/composables/exportPaletteAsJSON', () => ({ exportPaletteAsJSON: vi.fn(() => '{"app":"test"}') }));
vi.mock('@/composables/exportPaletteAsCSS', () => ({ exportPaletteAsCSS: vi.fn(() => ':root {}') }));
vi.mock('@/composables/exportPaletteAsASE', () => ({ exportPaletteAsASE: vi.fn(() => new ArrayBuffer(0)) }));
vi.mock('@/composables/downloadFile', () => ({ downloadFile: vi.fn() }));

import { exportPaletteAsJSON } from '@/composables/exportPaletteAsJSON';
import { exportPaletteAsCSS } from '@/composables/exportPaletteAsCSS';
import { exportPaletteAsASE } from '@/composables/exportPaletteAsASE';
import { downloadFile } from '@/composables/downloadFile';

function makeWrapper({ isExportModalOpen = false, colourSwatches = ['#ff0000'], paletteTitle = 'My Palette' } = {}) {
  return shallowMount(ExportModal, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { colourStore: { isExportModalOpen, colourSwatches, paletteTitle } },
          createSpy: vi.fn,
        }),
      ],
    },
  });
}

afterEach(() => vi.clearAllMocks());

describe('ExportModal — visibility', () => {
  it('is hidden when isExportModalOpen is false', () => {
    const wrapper = makeWrapper({ isExportModalOpen: false });
    expect(wrapper.find('.b_exportModal').isVisible()).toBe(false);
  });

  it('is visible when isExportModalOpen is true', () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    expect(wrapper.find('.b_exportModal').isVisible()).toBe(true);
  });
});

describe('ExportModal — format selector', () => {
  it('renders three format buttons', () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    expect(wrapper.findAll('.b_exportModal__formatBtn')).toHaveLength(3);
  });

  it('JSON button is active by default', () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    expect(wrapper.findAll('.b_exportModal__formatBtn')[0].classes()).toContain('b_exportModal__formatBtn--active');
  });

  it('clicking CSS button marks it active', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.findAll('.b_exportModal__formatBtn')[1].trigger('click');
    expect(wrapper.findAll('.b_exportModal__formatBtn')[1].classes()).toContain('b_exportModal__formatBtn--active');
  });

  it('clicking a format deactivates the previous selection', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.findAll('.b_exportModal__formatBtn')[2].trigger('click');
    expect(wrapper.findAll('.b_exportModal__formatBtn')[0].classes()).not.toContain('b_exportModal__formatBtn--active');
  });
});

describe('ExportModal — download', () => {
  it('calls exportPaletteAsJSON and downloadFile when JSON selected', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.find('.b_exportModal__download').trigger('click');
    expect(exportPaletteAsJSON).toHaveBeenCalledWith({ name: 'My Palette', colours: ['#ff0000'] });
    expect(downloadFile).toHaveBeenCalledWith('My Palette.json', expect.any(String), 'application/json');
  });

  it('calls exportPaletteAsCSS and downloadFile when CSS selected', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.findAll('.b_exportModal__formatBtn')[1].trigger('click');
    await wrapper.find('.b_exportModal__download').trigger('click');
    expect(exportPaletteAsCSS).toHaveBeenCalled();
    expect(downloadFile).toHaveBeenCalledWith('My Palette.css', expect.any(String), 'text/css');
  });

  it('calls exportPaletteAsASE and downloadFile when ASE selected', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.findAll('.b_exportModal__formatBtn')[2].trigger('click');
    await wrapper.find('.b_exportModal__download').trigger('click');
    expect(exportPaletteAsASE).toHaveBeenCalled();
    expect(downloadFile).toHaveBeenCalledWith('My Palette.ase', expect.any(ArrayBuffer), 'application/octet-stream');
  });

  it('calls closeExportModal after download', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.find('.b_exportModal__download').trigger('click');
    const store = useColourStore();
    expect(store.closeExportModal).toHaveBeenCalled();
  });
});

describe('ExportModal — close', () => {
  it('calls closeExportModal when close button clicked', async () => {
    const wrapper = makeWrapper({ isExportModalOpen: true });
    await wrapper.find('.b_exportModal__close').trigger('click');
    const store = useColourStore();
    expect(store.closeExportModal).toHaveBeenCalled();
  });
});
