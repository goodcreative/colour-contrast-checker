import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import ColourSwatch from '../ColourSwatch.vue';

const RED = '#ff0000';
const BLUE = '#0000ff';

function makeWrapper({ colourHex = RED, focusColour = '', cvdMode = 'normal', colourSwatches = [RED] } = {}) {
  return mount(ColourSwatch, {
    props: { colourHex },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            colourStore: { focusColour, cvdMode, colourSwatches },
          },
          stubActions: true,
          createSpy: vi.fn,
        }),
      ],
      stubs: { IconCopy: true, IconDustbin: true },
    },
  });
}

describe('ColourSwatch', () => {
  let mockWriteText;

  beforeEach(() => {
    vi.useFakeTimers();
    mockWriteText = vi.fn().mockResolvedValue(undefined);
    // navigator is getter-only in jsdom — add clipboard to existing object
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('displays colourHex prop as text', () => {
    const wrapper = makeWrapper({ colourHex: RED });
    expect(wrapper.find('.b_swatch__details p').text()).toBe(RED);
  });

  it('renders without focus styles when focusColour does not match', () => {
    const wrapper = makeWrapper({ colourHex: RED, focusColour: BLUE });
    expect(wrapper.find('.b_swatch').classes()).not.toContain('focus');
  });

  it('applies focus class when store focusColour matches colourHex', () => {
    const wrapper = makeWrapper({ colourHex: RED, focusColour: RED });
    expect(wrapper.find('.b_swatch').classes()).toContain('focus');
  });

  it('uses original hex as background when cvdMode is normal', () => {
    const wrapper = makeWrapper({ colourHex: RED, cvdMode: 'normal', colourSwatches: [RED] });
    const sample = wrapper.find('.b_swatch__sample');
    expect(sample.attributes('style')).toContain('background-color');
  });

  it('calls store.setFocusColour(colourHex) when sample clicked and not focused', async () => {
    const wrapper = makeWrapper({ colourHex: RED, focusColour: '' });
    const { useColourStore } = await import('@/stores/colourStore');
    const store = useColourStore();
    await wrapper.find('.b_swatch__sample').trigger('click');
    expect(store.setFocusColour).toHaveBeenCalledWith(RED);
  });

  it('calls store.setFocusColour("") when sample clicked and already focused', async () => {
    const wrapper = makeWrapper({ colourHex: RED, focusColour: RED });
    const { useColourStore } = await import('@/stores/colourStore');
    const store = useColourStore();
    await wrapper.find('.b_swatch__sample').trigger('click');
    expect(store.setFocusColour).toHaveBeenCalledWith('');
  });

  it('calls store.removeColour(colourHex) when Delete button clicked', async () => {
    const wrapper = makeWrapper({ colourHex: RED });
    const { useColourStore } = await import('@/stores/colourStore');
    const store = useColourStore();
    // Delete button is the second .b_action__button
    const buttons = wrapper.findAll('.b_action__button');
    await buttons[1].trigger('click');
    expect(store.removeColour).toHaveBeenCalledWith(RED);
  });

  it('calls navigator.clipboard.writeText(colourHex) on Copy click', async () => {
    const wrapper = makeWrapper({ colourHex: RED });
    const buttons = wrapper.findAll('.b_action__button');
    await buttons[0].trigger('click');
    await nextTick();
    expect(mockWriteText).toHaveBeenCalledWith(RED);
  });

  it('shows "Copied!" message immediately after clipboard write', async () => {
    const wrapper = makeWrapper({ colourHex: RED });
    const buttons = wrapper.findAll('.b_action__button');
    await buttons[0].trigger('click');
    await nextTick();
    expect(wrapper.find('.b_swatch__copyMessage').exists()).toBe(true);
  });

  it('hides "Copied!" message after 600ms', async () => {
    const wrapper = makeWrapper({ colourHex: RED });
    const buttons = wrapper.findAll('.b_action__button');
    await buttons[0].trigger('click');
    await nextTick();
    vi.advanceTimersByTime(600);
    await nextTick();
    expect(wrapper.find('.b_swatch__copyMessage').exists()).toBe(false);
  });

  it('does not show "Copied!" when clipboard write rejects', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('denied'));
    const wrapper = makeWrapper({ colourHex: RED });
    const buttons = wrapper.findAll('.b_action__button');
    await buttons[0].trigger('click');
    await nextTick();
    expect(wrapper.find('.b_swatch__copyMessage').exists()).toBe(false);
  });
});
