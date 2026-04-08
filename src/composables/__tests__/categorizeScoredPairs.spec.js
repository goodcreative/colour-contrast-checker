import { describe, it, expect } from 'vitest';
import { categorizeScoredPairs } from '../buildCategorizedCombinations.js';

// Synthetic scored pairs — no colour math needed
const PAIR_HIGH  = ['#000000', '#ffffff', 21];    // well above any threshold
const PAIR_PASS_WCAG_AA  = ['#a', '#b', 5.0];    // >= 4.5 (pass AA), >= 4.5 (largePass AAA)
const PAIR_LARGE_WCAG_AA = ['#c', '#d', 3.5];    // >= 3 (largePass AA), < 4.5 (fail AAA)
const PAIR_FAIL_WCAG_AA  = ['#e', '#f', 2.0];    // < 3 (fail AA and AAA)
const PAIR_PASS_APCA_AA  = ['#g', '#h', 65];     // >= 60 (pass APCA AA)
const PAIR_LARGE_APCA_AA = ['#i', '#j', 50];     // >= 45, < 60 (largePass APCA AA)
const PAIR_FAIL_APCA_AA  = ['#k', '#l', 30];     // < 45 (fail APCA AA)

describe('categorizeScoredPairs', () => {
  it('returns { pass, largePass, fail } arrays', () => {
    const result = categorizeScoredPairs({ scoredPairs: [], contrastMode: 'wcag', complianceLevel: 'AA' });
    expect(result).toHaveProperty('pass');
    expect(result).toHaveProperty('largePass');
    expect(result).toHaveProperty('fail');
  });

  it('empty scoredPairs returns empty buckets', () => {
    const result = categorizeScoredPairs({ scoredPairs: [], contrastMode: 'wcag', complianceLevel: 'AA' });
    expect(result).toEqual({ pass: [], largePass: [], fail: [] });
  });

  describe('WCAG AA thresholds (min=3, max=4.5)', () => {
    it('score >= 4.5 → pass', () => {
      const { pass } = categorizeScoredPairs({
        scoredPairs: [PAIR_PASS_WCAG_AA],
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(pass).toHaveLength(1);
    });

    it('score >= 3 and < 4.5 → largePass', () => {
      const { largePass } = categorizeScoredPairs({
        scoredPairs: [PAIR_LARGE_WCAG_AA],
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(largePass).toHaveLength(1);
    });

    it('score < 3 → fail', () => {
      const { fail } = categorizeScoredPairs({
        scoredPairs: [PAIR_FAIL_WCAG_AA],
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(fail).toHaveLength(1);
    });

    it('correctly distributes mixed pairs', () => {
      const result = categorizeScoredPairs({
        scoredPairs: [PAIR_PASS_WCAG_AA, PAIR_LARGE_WCAG_AA, PAIR_FAIL_WCAG_AA],
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(result.pass).toHaveLength(1);
      expect(result.largePass).toHaveLength(1);
      expect(result.fail).toHaveLength(1);
    });
  });

  describe('WCAG AAA thresholds (min=4.5, max=7) — same scores, different buckets', () => {
    it('score 5.0 → largePass at AAA (was pass at AA)', () => {
      const { largePass } = categorizeScoredPairs({
        scoredPairs: [PAIR_PASS_WCAG_AA],  // score=5.0
        contrastMode: 'wcag',
        complianceLevel: 'AAA',
      });
      expect(largePass).toHaveLength(1);
    });

    it('score 3.5 → fail at AAA (was largePass at AA)', () => {
      const { fail } = categorizeScoredPairs({
        scoredPairs: [PAIR_LARGE_WCAG_AA],  // score=3.5
        contrastMode: 'wcag',
        complianceLevel: 'AAA',
      });
      expect(fail).toHaveLength(1);
    });

    it('score 21 → pass at AAA', () => {
      const { pass } = categorizeScoredPairs({
        scoredPairs: [PAIR_HIGH],
        contrastMode: 'wcag',
        complianceLevel: 'AAA',
      });
      expect(pass).toHaveLength(1);
    });
  });

  describe('APCA AA thresholds (min=45, max=60)', () => {
    it('score >= 60 → pass', () => {
      const { pass } = categorizeScoredPairs({
        scoredPairs: [PAIR_PASS_APCA_AA],
        contrastMode: 'apca',
        complianceLevel: 'AA',
      });
      expect(pass).toHaveLength(1);
    });

    it('score >= 45 and < 60 → largePass', () => {
      const { largePass } = categorizeScoredPairs({
        scoredPairs: [PAIR_LARGE_APCA_AA],
        contrastMode: 'apca',
        complianceLevel: 'AA',
      });
      expect(largePass).toHaveLength(1);
    });

    it('score < 45 → fail', () => {
      const { fail } = categorizeScoredPairs({
        scoredPairs: [PAIR_FAIL_APCA_AA],
        contrastMode: 'apca',
        complianceLevel: 'AA',
      });
      expect(fail).toHaveLength(1);
    });
  });

  describe('boundary values', () => {
    it('score exactly at max → pass', () => {
      const { pass } = categorizeScoredPairs({
        scoredPairs: [['#a', '#b', 4.5]],
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(pass).toHaveLength(1);
    });

    it('score exactly at min → largePass', () => {
      const { largePass } = categorizeScoredPairs({
        scoredPairs: [['#a', '#b', 3.0]],
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(largePass).toHaveLength(1);
    });
  });

  describe('sorting', () => {
    it('each bucket is sorted by ratio descending', () => {
      const pairs = [
        ['#a', '#b', 7.5],
        ['#c', '#d', 9.0],
        ['#e', '#f', 5.5],
      ];
      const { pass } = categorizeScoredPairs({
        scoredPairs: pairs,
        contrastMode: 'wcag',
        complianceLevel: 'AA',
      });
      expect(pass[0][2]).toBeGreaterThanOrEqual(pass[1][2]);
      expect(pass[1][2]).toBeGreaterThanOrEqual(pass[2][2]);
    });
  });

  it('invalid contrastMode returns empty buckets', () => {
    const result = categorizeScoredPairs({
      scoredPairs: [PAIR_HIGH],
      contrastMode: 'unknown',
      complianceLevel: 'AA',
    });
    expect(result).toEqual({ pass: [], largePass: [], fail: [] });
  });
});
