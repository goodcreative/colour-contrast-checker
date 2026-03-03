import { describe, it, expect, vi, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ImportModal from '../ImportModal.vue';
import { useColourStore } from '@/stores/colourStore';

const VALID_JSON = JSON.stringify({
  app: 'colour-contrast-checker',
  name: 'Imported',
  colours: ['#ff0000', '#0000ff'],
});

const INVALID_JSON = 'not json at all';

function makeWrapper({ isImportModalOpen = false } = {}) {
  return shallowMount(ImportModal, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { colourStore: { isImportModalOpen } },
          createSpy: vi.fn,
        }),
      ],
    },
  });
}

// Simulate a file-change event with given text content.
// Mocks FileReader to call onload via queueMicrotask (synchronous enough for tests).
async function triggerFileChange(wrapper, text) {
  const origFileReader = globalThis.FileReader;
  globalThis.FileReader = class {
    readAsText() {
      queueMicrotask(() => {
        if (this.onload) this.onload({ target: { result: text } });
      });
    }
  };

  const input = wrapper.find('.b_importModal__input');
  Object.defineProperty(input.element, 'files', {
    value: [new File([text], 'palette.json', { type: 'application/json' })],
    configurable: true,
  });
  await input.trigger('change');
  // setTimeout macrotask runs after all pending microtasks have flushed
  await new Promise(r => setTimeout(r, 0));

  globalThis.FileReader = origFileReader;
}

afterEach(() => vi.clearAllMocks());

describe('ImportModal — visibility', () => {
  it('is hidden when isImportModalOpen is false', () => {
    const wrapper = makeWrapper({ isImportModalOpen: false });
    expect(wrapper.find('.b_importModal').isVisible()).toBe(false);
  });

  it('is visible when isImportModalOpen is true', () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    expect(wrapper.find('.b_importModal').isVisible()).toBe(true);
  });
});

describe('ImportModal — file input', () => {
  it('renders a file input', () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    expect(wrapper.find('.b_importModal__input').exists()).toBe(true);
  });

  it('file input accepts .json files', () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    expect(wrapper.find('.b_importModal__input').attributes('accept')).toBe('.json');
  });
});

describe('ImportModal — mode toggle', () => {
  it('renders the ModeToggle component', () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    expect(wrapper.find('.b_importModal__modeToggle').exists()).toBe(true);
  });

  it('defaults to replace mode', () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    expect(wrapper.find('.b_importModal__modeToggle').attributes('modelvalue')).toBe('replace');
  });
});

describe('ImportModal — valid file', () => {
  it('clears error message on valid file', async () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    await triggerFileChange(wrapper, VALID_JSON);
    expect(wrapper.find('.b_importModal__error').exists()).toBe(false);
  });

  it('calls importPalette with parsed data and replace mode on confirm', async () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    await triggerFileChange(wrapper, VALID_JSON);
    await wrapper.find('.b_importModal__confirm').trigger('click');
    const store = useColourStore();
    expect(store.importPalette).toHaveBeenCalledWith(
      { name: 'Imported', colours: ['#ff0000', '#0000ff'] },
      'replace',
    );
  });

  it('calls closeImportModal after confirm', async () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    await triggerFileChange(wrapper, VALID_JSON);
    await wrapper.find('.b_importModal__confirm').trigger('click');
    const store = useColourStore();
    expect(store.closeImportModal).toHaveBeenCalled();
  });
});

describe('ImportModal — invalid file', () => {
  it('shows error message on invalid JSON', async () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    await triggerFileChange(wrapper, INVALID_JSON);
    expect(wrapper.find('.b_importModal__error').exists()).toBe(true);
    expect(wrapper.find('.b_importModal__error').text()).toBeTruthy();
  });

  it('does not call importPalette when file is invalid', async () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    await triggerFileChange(wrapper, INVALID_JSON);
    await wrapper.find('.b_importModal__confirm').trigger('click');
    const store = useColourStore();
    expect(store.importPalette).not.toHaveBeenCalled();
  });
});

describe('ImportModal — close', () => {
  it('calls closeImportModal when close button clicked', async () => {
    const wrapper = makeWrapper({ isImportModalOpen: true });
    await wrapper.find('.b_importModal__close').trigger('click');
    const store = useColourStore();
    expect(store.closeImportModal).toHaveBeenCalled();
  });
});
