import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import CVDModeSelector from '../CVDModeSelector.vue';

const OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
];

function mountSelector(modelValue = 'normal', options = OPTIONS) {
  return shallowMount(CVDModeSelector, {
    props: { title: 'Vision', options, modelValue },
  });
}

describe('CVDModeSelector', () => {
  it('renders the title prop', () => {
    const wrapper = mountSelector();
    expect(wrapper.find('.b_cvdSelector__title').text()).toBe('Vision');
  });

  it('renders one button per option', () => {
    const wrapper = mountSelector();
    expect(wrapper.findAll('.b_cvdSelector__pill')).toHaveLength(4);
  });

  it('renders correct label text for each option', () => {
    const wrapper = mountSelector();
    const pills = wrapper.findAll('.b_cvdSelector__pill');
    expect(pills[0].text()).toBe('Normal');
    expect(pills[1].text()).toBe('Protanopia');
  });

  it('applies --active modifier to button matching modelValue', () => {
    const wrapper = mountSelector('protanopia');
    const pills = wrapper.findAll('.b_cvdSelector__pill');
    expect(pills[1].classes()).toContain('b_cvdSelector__pill--active');
  });

  it('does not apply --active to non-matching buttons', () => {
    const wrapper = mountSelector('normal');
    const pills = wrapper.findAll('.b_cvdSelector__pill');
    expect(pills[1].classes()).not.toContain('b_cvdSelector__pill--active');
    expect(pills[2].classes()).not.toContain('b_cvdSelector__pill--active');
  });

  it('renders activeInfo description for "normal" modelValue', () => {
    const wrapper = mountSelector('normal');
    const desc = wrapper.find('.b_cvdSelector__infoDesc');
    expect(desc.exists()).toBe(true);
    expect(desc.text()).toContain('trichromatic');
  });

  it('does NOT render prevalence para when modelValue is "normal"', () => {
    const wrapper = mountSelector('normal');
    const normalPillWrapper = wrapper.findAll('.b_cvdSelector__pillWrapper')[0];
    expect(normalPillWrapper.find('.b_cvdSelector__infoStat').exists()).toBe(false);
  });

  it('renders prevalence para for protanopia', () => {
    const wrapper = mountSelector('protanopia');
    const stat = wrapper.find('.b_cvdSelector__infoStat');
    expect(stat.exists()).toBe(true);
    expect(stat.text()).toContain('1%');
  });

  it('renders prevalence para for deuteranopia', () => {
    const wrapper = mountSelector('deuteranopia');
    const stat = wrapper.findAll('.b_cvdSelector__pillWrapper')[2].find('.b_cvdSelector__infoStat');
    expect(stat.exists()).toBe(true);
    expect(stat.text()).toContain('8%');
  });

  it('renders prevalence para for tritanopia', () => {
    const wrapper = mountSelector('tritanopia');
    const stat = wrapper.findAll('.b_cvdSelector__pillWrapper')[3].find('.b_cvdSelector__infoStat');
    expect(stat.exists()).toBe(true);
    expect(stat.text()).toContain('30,000');
  });

  it('does not render info panel for unknown modelValue', () => {
    const wrapper = mountSelector('unknown');
    expect(wrapper.find('.b_cvdSelector__info').exists()).toBe(false);
  });

  it('emits update:modelValue with clicked option value', async () => {
    const wrapper = mountSelector('normal');
    await wrapper.findAll('.b_cvdSelector__pill')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['protanopia']);
  });

  it('emits correct value when different pill is clicked', async () => {
    const wrapper = mountSelector('normal');
    await wrapper.findAll('.b_cvdSelector__pill')[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['deuteranopia']);
  });
});
