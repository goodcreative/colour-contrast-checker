import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import CombinationsList from '../CombinationsList.vue';
import ColourContrastWidget from '../ColourContrastWidget.vue';
import { contrastConfig } from '@/config/contrastConfig';

// Colour pairs chosen for known WCAG AA contrast ratios:
//   #000000 / #ffffff → 21:1    → PASS   (>= 4.5)
//   #888888 / #ffffff → ~3.55:1 → PARTIAL (3 to 4.5)
//   #aaaaaa / #ffffff → ~2.32:1 → FAIL   (< 3)
// Same pairs for APCA AA (min=45, max=60):
//   #000000 / #ffffff → Lc ~108 → PASS   (>= 60)
//   #999999 / #ffffff → Lc ~54  → LARGE  (45–60)
//   #bbbbbb / #ffffff → Lc ~36  → FAIL   (< 45)

const STUBS = {
  ColourContrastWidget: true,
  IconResultPass: true,
  IconResultPassLarge: true,
  IconResultFail: true,
};

function makeWrapper({ contrastMode = 'wcag', colourSwatches = [] } = {}) {
  return shallowMount(CombinationsList, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            colourStore: { contrastMode, colourSwatches },
          },
          stubActions: false,
          createSpy: vi.fn,
        }),
      ],
      stubs: STUBS,
    },
  });
}

describe('CombinationsList — WCAG mode', () => {
  it('renders pass section when passColourCombinations non-empty', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000', '#ffffff'] });
    const intros = wrapper.findAll('.b_combinations__intro');
    expect(intros.length).toBeGreaterThanOrEqual(1);
    expect(intros[0].find('h2').text()).toBe('Pass');
  });

  it('renders largePass section when largePassColourCombinations non-empty', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#888888', '#ffffff'] });
    expect(wrapper.findAll('.b_combinations__intro')).toHaveLength(1);
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Partial Pass');
  });

  it('renders fail section when failColourCombinations non-empty', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#aaaaaa', '#ffffff'] });
    expect(wrapper.findAll('.b_combinations__intro')).toHaveLength(1);
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Fail');
  });

  it('does not render pass section when only largePass combinations exist', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#888888', '#ffffff'] });
    const intros = wrapper.findAll('.b_combinations__intro');
    expect(intros).toHaveLength(1);
    expect(intros[0].find('h2').text()).toBe('Partial Pass');
  });

  it('does not render largePass section when only pass combinations exist', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000', '#ffffff'] });
    const intros = wrapper.findAll('.b_combinations__intro');
    expect(intros).toHaveLength(1);
    expect(intros[0].find('h2').text()).toBe('Pass');
  });

  it('does not render fail section when only pass combinations exist', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.findAll('.b_combinations__intro')).toHaveLength(1);
  });

  it('renders zero sections when all combination lists are empty', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000'] }); // 1 colour → no pairs
    expect(wrapper.findAll('.b_combinations__intro')).toHaveLength(0);
  });

  it('shows title "Pass" in WCAG pass group', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Pass');
  });

  it('shows threshold "4.5:1 or greater" in WCAG AA pass group', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro p strong').text()).toContain('4.5:1 or greater');
  });

  it('shows title "Partial Pass" in WCAG largePass group', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#888888', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Partial Pass');
  });

  it('shows threshold range in WCAG AA largePass group', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#888888', '#ffffff'] });
    const { min, max, displayEpsilon } = contrastConfig.wcag.aa;
    const text = wrapper.find('.b_combinations__intro p strong').text();
    expect(text).toContain(`${min}:1`);
    expect(text).toContain(`${max - displayEpsilon}:1`);
  });

  it('shows title "Fail" in WCAG fail group', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#aaaaaa', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Fail');
  });

  it('does not apply --apca grid modifier in WCAG mode', () => {
    const wrapper = makeWrapper({ colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.find('.b_combinations__list').classes()).not.toContain('b_combinations__list--apca');
  });
});

describe('CombinationsList — APCA mode', () => {
  it('shows title "Body text" in APCA pass group', () => {
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Body text');
  });

  it('shows "Lc 60 or greater" threshold in APCA AA pass group', () => {
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro p strong').text()).toContain('Lc 60 or greater');
  });

  it('shows title "Large text & UI" in APCA largePass group', () => {
    // #999999 on white ≈ Lc 54 → largePass (45–60)
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#999999', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Large text & UI');
  });

  it('shows range in APCA AA largePass group', () => {
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#999999', '#ffffff'] });
    const { min, max, displayEpsilon } = contrastConfig.apca.aa;
    const text = wrapper.find('.b_combinations__intro p strong').text();
    expect(text).toContain(`Lc ${min}`);
    expect(text).toContain(`${max - displayEpsilon}`);
  });

  it('shows title "Not suitable" in APCA fail group', () => {
    // #bbbbbb on white ≈ Lc 36 → fail (< 45)
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#bbbbbb', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro h2').text()).toBe('Not suitable');
  });

  it('shows "Lc less than 45" in APCA fail group', () => {
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#bbbbbb', '#ffffff'] });
    expect(wrapper.find('.b_combinations__intro p strong').text()).toContain('Lc less than 45');
  });

  it('applies --apca modifier to list div in APCA mode', () => {
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.find('.b_combinations__list').classes()).toContain('b_combinations__list--apca');
  });

  it('renders one ColourContrastWidget per pass item', () => {
    // 1 pass combo: #000000/#ffffff
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#000000', '#ffffff'] });
    expect(wrapper.findAllComponents(ColourContrastWidget)).toHaveLength(1);
  });

  it('renders one ColourContrastWidget per fail item', () => {
    // 1 fail combo: #bbbbbb/#ffffff
    const wrapper = makeWrapper({ contrastMode: 'apca', colourSwatches: ['#bbbbbb', '#ffffff'] });
    expect(wrapper.findAllComponents(ColourContrastWidget)).toHaveLength(1);
  });
});
