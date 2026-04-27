import { describe, it, expect } from 'vitest';
import { scoreColourPair, scoreAllPairs, categorizePairs } from '../contrastEngine.js';

const BLACK  = '#000000';
const WHITE  = '#ffffff';
const MID_GRAY   = '#888888';
const LIGHT_GRAY = '#aaaaaa';
const RED    = '#ff0000';
const GREEN  = '#00ff00';

// ---------------------------------------------------------------------------
// scoreColourPair
// ---------------------------------------------------------------------------

describe('scoreColourPair', () => {
  describe('WCAG', () => {
    it('black/white → 21', () => {
      const { score } = scoreColourPair(BLACK, WHITE);
      expect(score).toBe(21);
    });

    it('identical colours → 1', () => {
      const { score } = scoreColourPair(BLACK, BLACK);
      expect(score).toBe(1);
    });

    it('order does not affect ratio', () => {
      const { score: ab } = scoreColourPair(BLACK, MID_GRAY);
      const { score: ba } = scoreColourPair(MID_GRAY, BLACK);
      expect(ab).toBe(ba);
    });

    it('ratio is rounded to 2 decimal places', () => {
      const { score } = scoreColourPair(BLACK, MID_GRAY);
      const decimals = (score.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });

    it('returns simulatedFg/simulatedBg equal to inputs when cvdMode is normal', () => {
      const { simulatedFg, simulatedBg } = scoreColourPair(BLACK, WHITE);
      expect(simulatedFg).toBe(BLACK);
      expect(simulatedBg).toBe(WHITE);
    });
  });

  describe('APCA', () => {
    it('black/white → > 100', () => {
      const { score } = scoreColourPair(BLACK, WHITE, { mode: 'apca' });
      expect(score).toBeGreaterThan(100);
    });

    it('ratio is rounded to 1 decimal place', () => {
      const { score } = scoreColourPair(BLACK, MID_GRAY, { mode: 'apca' });
      const decimals = (score.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(1);
    });
  });

  describe('CVD simulation', () => {
    it('normal mode returns unchanged hex values', () => {
      const { simulatedFg, simulatedBg } = scoreColourPair(RED, GREEN, { cvdMode: 'normal' });
      expect(simulatedFg).toBe(RED);
      expect(simulatedBg).toBe(GREEN);
    });

    it('protanopia returns transformed hex values', () => {
      const { simulatedFg, simulatedBg } = scoreColourPair(RED, GREEN, { cvdMode: 'protanopia' });
      expect(simulatedFg).not.toBe(RED);
      expect(simulatedBg).not.toBe(GREEN);
    });

    it('score is computed from simulated colours, not originals', () => {
      const { score: normal } = scoreColourPair(RED, GREEN, { cvdMode: 'normal' });
      const { score: protan } = scoreColourPair(RED, GREEN, { cvdMode: 'protanopia' });
      expect(protan).not.toBe(normal);
    });

    it('simulatedFg and simulatedBg are consistent with score', () => {
      // The score returned must equal what scoreColourPair would return if called with simulatedFg/simulatedBg and cvdMode normal
      const result = scoreColourPair(RED, GREEN, { cvdMode: 'deuteranopia' });
      const { score: scoreFromSimulated } = scoreColourPair(result.simulatedFg, result.simulatedBg, { cvdMode: 'normal' });
      expect(result.score).toBe(scoreFromSimulated);
    });
  });

  describe('defaults', () => {
    it('mode defaults to wcag', () => {
      const { score: explicit } = scoreColourPair(BLACK, WHITE, { mode: 'wcag' });
      const { score: defaulted } = scoreColourPair(BLACK, WHITE);
      expect(defaulted).toBe(explicit);
    });

    it('cvdMode defaults to normal', () => {
      const { simulatedFg } = scoreColourPair(RED, GREEN);
      expect(simulatedFg).toBe(RED);
    });
  });
});

// ---------------------------------------------------------------------------
// scoreAllPairs
// ---------------------------------------------------------------------------

describe('scoreAllPairs', () => {
  it('empty swatches returns []', () => {
    expect(scoreAllPairs([])).toEqual([]);
  });

  it('single swatch returns []', () => {
    expect(scoreAllPairs([BLACK])).toEqual([]);
  });

  it('two swatches returns one pair', () => {
    expect(scoreAllPairs([BLACK, WHITE])).toHaveLength(1);
  });

  it('three swatches returns three unique pairs', () => {
    expect(scoreAllPairs([BLACK, WHITE, MID_GRAY])).toHaveLength(3);
  });

  it('does not produce reversed duplicates', () => {
    expect(scoreAllPairs([BLACK, WHITE])).toHaveLength(1);
  });

  it('pair has correct shape', () => {
    const [pair] = scoreAllPairs([BLACK, WHITE]);
    expect(pair).toHaveProperty('fgHex');
    expect(pair).toHaveProperty('bgHex');
    expect(pair).toHaveProperty('score');
    expect(pair).toHaveProperty('simulatedFg');
    expect(pair).toHaveProperty('simulatedBg');
    expect(typeof pair.score).toBe('number');
  });

  it('black/white pair has score of 21 (WCAG)', () => {
    const [pair] = scoreAllPairs([BLACK, WHITE]);
    expect(pair.score).toBe(21);
  });

  describe('focus colour', () => {
    it('only returns pairs involving the focus colour', () => {
      const pairs = scoreAllPairs([BLACK, WHITE, MID_GRAY], { focusColour: WHITE });
      expect(pairs).toHaveLength(2);
      pairs.forEach(p => expect([p.fgHex, p.bgHex]).toContain(WHITE));
    });

    it('focus colour is always fgHex', () => {
      const pairs = scoreAllPairs([BLACK, WHITE], { focusColour: WHITE });
      expect(pairs[0].fgHex).toBe(WHITE);
    });
  });

  describe('CVD', () => {
    it('protanopia shifts ratio for chromatic pair', () => {
      const [normal] = scoreAllPairs([RED, GREEN], { cvdMode: 'normal' });
      const [protan] = scoreAllPairs([RED, GREEN], { cvdMode: 'protanopia' });
      expect(protan.score).not.toBe(normal.score);
    });
  });
});

// ---------------------------------------------------------------------------
// categorizePairs
// ---------------------------------------------------------------------------

describe('categorizePairs', () => {
  it('returns { pass, partial, fail } arrays', () => {
    const result = categorizePairs([]);
    expect(result).toHaveProperty('pass');
    expect(result).toHaveProperty('partial');
    expect(result).toHaveProperty('fail');
  });

  it('empty input returns empty buckets', () => {
    const result = categorizePairs([]);
    expect(result.pass).toHaveLength(0);
    expect(result.partial).toHaveLength(0);
    expect(result.fail).toHaveLength(0);
  });

  describe('WCAG AA', () => {
    it('black/white (21:1) → pass', () => {
      const scored = scoreAllPairs([BLACK, WHITE]);
      const { pass } = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AA' });
      expect(pass).toHaveLength(1);
    });

    it('mid-gray/white (3.55:1) → partial', () => {
      const scored = scoreAllPairs([MID_GRAY, WHITE]);
      const { partial } = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AA' });
      expect(partial).toHaveLength(1);
    });

    it('light-gray/white (2.32:1) → fail', () => {
      const scored = scoreAllPairs([LIGHT_GRAY, WHITE]);
      const { fail } = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AA' });
      expect(fail).toHaveLength(1);
    });
  });

  describe('WCAG AAA', () => {
    it('black/white → pass', () => {
      const scored = scoreAllPairs([BLACK, WHITE]);
      const { pass } = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AAA' });
      expect(pass).toHaveLength(1);
    });

    it('mid-gray/white → fail (below 4.5 min)', () => {
      const scored = scoreAllPairs([MID_GRAY, WHITE]);
      const { fail } = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AAA' });
      expect(fail).toHaveLength(1);
    });
  });

  describe('APCA AA', () => {
    it('black/white (Lc~108) → pass', () => {
      const scored = scoreAllPairs([BLACK, WHITE], { mode: 'apca' });
      const { pass } = categorizePairs(scored, { mode: 'apca', complianceLevel: 'AA' });
      expect(pass).toHaveLength(1);
    });

    it('#999999/white (Lc~54) → partial', () => {
      const scored = scoreAllPairs(['#999999', WHITE], { mode: 'apca' });
      const { partial } = categorizePairs(scored, { mode: 'apca', complianceLevel: 'AA' });
      expect(partial).toHaveLength(1);
    });

    it('#bbbbbb/white (Lc~37) → fail', () => {
      const scored = scoreAllPairs(['#bbbbbb', WHITE], { mode: 'apca' });
      const { fail } = categorizePairs(scored, { mode: 'apca', complianceLevel: 'AA' });
      expect(fail).toHaveLength(1);
    });
  });

  it('buckets are sorted by score descending', () => {
    const scored = scoreAllPairs([BLACK, '#111111', '#222222', '#333333']);
    const { fail } = categorizePairs(scored);
    const scores = fail.map(p => p.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  it('unknown mode returns empty categories', () => {
    const scored = scoreAllPairs([BLACK, WHITE]);
    const result = categorizePairs(scored, { mode: 'unknown' });
    expect(result.pass).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: scoreAllPairs → categorizePairs
// ---------------------------------------------------------------------------

describe('round-trip', () => {
  it('scoreAllPairs → categorizePairs totals equal pair count', () => {
    const scored = scoreAllPairs([BLACK, WHITE, MID_GRAY, LIGHT_GRAY]);
    const { pass, partial, fail } = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AA' });
    expect(pass.length + partial.length + fail.length).toBe(scored.length);
  });

  it('changing complianceLevel re-categorizes without re-scoring', () => {
    const scored = scoreAllPairs([BLACK, WHITE, MID_GRAY]);
    const aa  = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AA' });
    const aaa = categorizePairs(scored, { mode: 'wcag', complianceLevel: 'AAA' });
    // AAA is stricter — pass count can only decrease or stay the same
    expect(aaa.pass.length).toBeLessThanOrEqual(aa.pass.length);
  });
});
