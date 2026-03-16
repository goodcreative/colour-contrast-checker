import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ColourContrastWidget from '../ColourContrastWidget.vue';

// Black on white: WCAG ratio = 21, APCA ≈ 108 (body)
// #757575 on white: WCAG ≈ 4.63 (partial/pass), APCA ≈ 68 (body)
// #AAAAAA on white: WCAG ≈ 2.32 (fail), APCA ≈ 36 (decorative)
// #999999 on white: WCAG ≈ 2.85 (fail), APCA ≈ 54 (large)

const STUBS = {
  IconResultPass: true,
  IconResultPassLarge: true,
  IconResultFail: true,
};

function makeWrapper({ primaryColour = '#000000', contrastColour = '#ffffff', contrastMode = 'wcag', cvdMode = 'normal', colourSwatches = [] } = {}) {
  return mount(ColourContrastWidget, {
    props: {
      primaryColour,
      contrastColour,
      contrastRatio: 1,  // not used for display — component recalculates
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            colourStore: { contrastMode, cvdMode, colourSwatches },
          },
          stubActions: false,
          createSpy: vi.fn,
        }),
      ],
      stubs: STUBS,
    },
  });
}

describe('ColourContrastWidget — WCAG mode', () => {
  it('renders WCAG layout (not APCA) when contrastMode is "wcag"', () => {
    const wrapper = makeWrapper({ contrastMode: 'wcag' });
    expect(wrapper.find('.b_contrast--apca').exists()).toBe(false);
    expect(wrapper.find('.b_contrast').exists()).toBe(true);
  });

  it('displays primaryColour hex text', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff' });
    expect(wrapper.html()).toContain('#000000');
  });

  it('displays contrastColour hex text', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff' });
    expect(wrapper.html()).toContain('#ffffff');
  });

  it('formats contrastLabel as "X:1"', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff' });
    expect(wrapper.find('strong').text()).toContain(':1');
  });

  it('shows "Pass" rating for black/white (ratio 21 > 4.5 AA max)', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff' });
    expect(wrapper.find('.b_contrast__result p').text()).toContain('Pass');
  });

  it('shows "Partial" rating for #888888 on white (WCAG AA, ~3.55:1)', () => {
    // #888888 on white ≈ 3.55:1 — between AA min(3) and max(4.5) → Partial Pass
    const wrapper = makeWrapper({ primaryColour: '#888888', contrastColour: '#ffffff' });
    expect(wrapper.find('.b_contrast__result p').text()).toContain('Partial');
  });

  it('shows "Fail" rating for low-contrast pair', () => {
    // #AAAAAA on white ≈ 2.32, below AA min of 3
    const wrapper = makeWrapper({ primaryColour: '#AAAAAA', contrastColour: '#ffffff' });
    expect(wrapper.find('.b_contrast__result p').text()).toContain('Fail');
  });

  it('shows simulated primary colour as background (when cvdMode is normal, same as original)', () => {
    const wrapper = makeWrapper({ primaryColour: '#ff0000', contrastColour: '#ffffff', cvdMode: 'normal', colourSwatches: ['#ff0000', '#ffffff'] });
    const primarySample = wrapper.find('.b_contrast__sample--primary');
    expect(primarySample.attributes('style')).toContain('background-color');
  });

  it('shows original primaryColour background on mouseenter', async () => {
    // jsdom normalizes hex to rgb() in inline styles
    const wrapper = makeWrapper({ primaryColour: '#ff0000', contrastColour: '#0000ff', cvdMode: 'normal', colourSwatches: ['#ff0000', '#0000ff'] });
    await wrapper.find('.b_contrast').trigger('mouseenter');
    const primarySample = wrapper.find('.b_contrast__sample--primary');
    expect(primarySample.attributes('style')).toContain('rgb(255, 0, 0)');
  });

  it('reverts to simulated colour on mouseleave', async () => {
    const wrapper = makeWrapper({ primaryColour: '#ff0000', contrastColour: '#0000ff', cvdMode: 'normal', colourSwatches: ['#ff0000', '#0000ff'] });
    await wrapper.find('.b_contrast').trigger('mouseenter');
    await wrapper.find('.b_contrast').trigger('mouseleave');
    const primarySample = wrapper.find('.b_contrast__sample--primary');
    // After mouseleave, goes back to simulated (normal = same as original)
    expect(primarySample.attributes('style')).toContain('background-color');
  });
});

describe('ColourContrastWidget — APCA mode', () => {
  it('renders APCA layout (not WCAG) when contrastMode is "apca"', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff', contrastMode: 'apca' });
    expect(wrapper.find('.b_contrast--apca').exists()).toBe(true);
    expect(wrapper.find('.b_contrast__pair').exists()).toBe(false);
  });

  it('displays "Lc X" format for primary direction', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff', contrastMode: 'apca' });
    const lcSpans = wrapper.findAll('.b_contrast__panelLc');
    expect(lcSpans[0].text()).toMatch(/^Lc \d+/);
  });

  it('displays "Lc X" format for reverse direction', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff', contrastMode: 'apca' });
    const lcSpans = wrapper.findAll('.b_contrast__panelLc');
    expect(lcSpans[1].text()).toMatch(/^Lc \d+/);
  });

  it('shows "Body" use-case badge when Lc >= 60 (black/white, APCA AA)', () => {
    // black on white ≈ Lc 108 → body (>= max 60)
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff', contrastMode: 'apca' });
    const useCaseSpans = wrapper.findAll('.b_contrast__panelUseCase');
    expect(useCaseSpans[0].text()).toBe('Body');
  });

  it('shows "Large" use-case badge when 45 <= Lc < 60', () => {
    // #999999 on white ≈ Lc 54 → large (>= min 45, < max 60)
    const wrapper = makeWrapper({ primaryColour: '#999999', contrastColour: '#ffffff', contrastMode: 'apca' });
    const useCaseSpans = wrapper.findAll('.b_contrast__panelUseCase');
    expect(useCaseSpans[0].text()).toBe('Large');
  });

  it('shows "Decorative" use-case badge when Lc < 45', () => {
    // #BBBBBB on white ≈ Lc 36 → decorative (< min 45)
    const wrapper = makeWrapper({ primaryColour: '#bbbbbb', contrastColour: '#ffffff', contrastMode: 'apca' });
    const useCaseSpans = wrapper.findAll('.b_contrast__panelUseCase');
    expect(useCaseSpans[0].text()).toBe('Decorative');
  });

  it('applies --body CSS modifier when use case is Body', () => {
    const wrapper = makeWrapper({ primaryColour: '#000000', contrastColour: '#ffffff', contrastMode: 'apca' });
    const useCaseSpan = wrapper.findAll('.b_contrast__panelUseCase')[0];
    expect(useCaseSpan.classes()).toContain('b_contrast__panelUseCase--body');
  });

  it('applies --large CSS modifier when use case is Large', () => {
    const wrapper = makeWrapper({ primaryColour: '#999999', contrastColour: '#ffffff', contrastMode: 'apca' });
    const useCaseSpan = wrapper.findAll('.b_contrast__panelUseCase')[0];
    expect(useCaseSpan.classes()).toContain('b_contrast__panelUseCase--large');
  });

  it('applies --decorative CSS modifier when use case is Decorative', () => {
    const wrapper = makeWrapper({ primaryColour: '#bbbbbb', contrastColour: '#ffffff', contrastMode: 'apca' });
    const useCaseSpan = wrapper.findAll('.b_contrast__panelUseCase')[0];
    expect(useCaseSpan.classes()).toContain('b_contrast__panelUseCase--decorative');
  });
});
