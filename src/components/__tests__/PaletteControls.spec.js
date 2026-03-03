import { describe, it, expect, vi, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import PaletteControls from '../PaletteControls.vue';
import FormAction from '@/components/FormAction.vue';
import { useColourStore } from '@/stores/colourStore';

function makeWrapper({ colourSwatches = [] } = {}) {
  return shallowMount(PaletteControls, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { colourStore: { colourSwatches } },
          createSpy: vi.fn,
        }),
      ],
    },
  });
}

afterEach(() => vi.clearAllMocks());

describe('PaletteControls — empty palette', () => {
  it('renders Import button when palette is empty', () => {
    const wrapper = makeWrapper({ colourSwatches: [] });
    expect(wrapper.find('.b_controls__import').exists()).toBe(true);
  });

  it('does not render Export button when palette is empty', () => {
    const wrapper = makeWrapper({ colourSwatches: [] });
    expect(wrapper.find('.b_controls__export').exists()).toBe(false);
  });

  it('does not render Clear button when palette is empty', () => {
    const wrapper = makeWrapper({ colourSwatches: [] });
    expect(wrapper.find('.b_controls__clear').exists()).toBe(false);
  });
});

describe('PaletteControls — non-empty palette', () => {
  it('renders Export button when palette has colours', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#ff0000'] });
    expect(wrapper.find('.b_controls__export').exists()).toBe(true);
  });

  it('renders Import button when palette has colours', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#ff0000'] });
    expect(wrapper.find('.b_controls__import').exists()).toBe(true);
  });

  it('renders Clear button when palette has colours', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#ff0000'] });
    expect(wrapper.find('.b_controls__clear').exists()).toBe(true);
  });

  it('clicking Export calls openExportModal', async () => {
    const wrapper = makeWrapper({ colourSwatches: ['#ff0000'] });
    wrapper.find('.b_controls__export').findComponent(FormAction).props('onClick')();
    const store = useColourStore();
    expect(store.openExportModal).toHaveBeenCalled();
  });

  it('clicking Import calls openImportModal', async () => {
    const wrapper = makeWrapper({ colourSwatches: ['#ff0000'] });
    wrapper.find('.b_controls__import').findComponent(FormAction).props('onClick')();
    const store = useColourStore();
    expect(store.openImportModal).toHaveBeenCalled();
  });
});
