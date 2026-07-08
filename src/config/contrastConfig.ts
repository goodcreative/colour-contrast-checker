import {
  CONTRAST_ALGORITHMS,
  COMPLIANCE_LEVELS,
  type ContrastAlgorithm,
} from "./contrastSettings";

const [wcag, apca] = CONTRAST_ALGORITHMS;
const [aa, aaa] = COMPLIANCE_LEVELS.map((m) => m.toLowerCase());

/** Thresholds for grading a contrast score into pass / partial / fail. */
export interface ContrastThresholds {
  min: number;
  max: number;
  displayEpsilon: number;
}

type ContrastConfig = Record<ContrastAlgorithm, Record<string, ContrastThresholds>>;

export const contrastConfig: ContrastConfig = {
  [wcag]: {
    [aa]:  { min: 3,   max: 4.5, displayEpsilon: 0.01 },
    [aaa]: { min: 4.5, max: 7,   displayEpsilon: 0.01 },
  },
  [apca]: {
    [aa]:  { min: 45, max: 60, displayEpsilon: 0.1 },
    [aaa]: { min: 60, max: 75, displayEpsilon: 0.1 },
  },
};
