/**
 * Contrast-checking settings vocabulary.
 *
 * Renamed from the legacy `config/modes.js` (`CONTRAST_MODES` / `CVD_MODES` /
 * `COMPLIANCE_MODES`) to free the word **Mode** for the 2.0 theme-variant concept
 * (a named value-set owned by a Palette). These are *settings/algorithms*, not Modes:
 *   - CONTRAST_ALGORITHMS — which contrast maths to run
 *   - CVD_TYPES           — which colour-vision-deficiency simulation to apply
 *   - COMPLIANCE_LEVELS   — which WCAG conformance level to grade against
 */

export const CONTRAST_ALGORITHMS = ["wcag", "apca"] as const;
export const CVD_TYPES = ["normal", "protanopia", "deuteranopia", "tritanopia"] as const;
export const COMPLIANCE_LEVELS = ["AA", "AAA"] as const;

export type ContrastAlgorithm = (typeof CONTRAST_ALGORITHMS)[number];
export type CVDType = (typeof CVD_TYPES)[number];
export type ComplianceLevel = (typeof COMPLIANCE_LEVELS)[number];
