import { CONTRAST_MODES, COMPLIANCE_MODES } from "./modes.js";

const [wcag, apca] = CONTRAST_MODES;
const [aa, aaa] = COMPLIANCE_MODES.map(m => m.toLowerCase());

export const contrastConfig = {
  [wcag]: {
    [aa]:  { min: 3,   max: 4.5, displayEpsilon: 0.01 },
    [aaa]: { min: 4.5, max: 7,   displayEpsilon: 0.01 },
  },
  [apca]: {
    [aa]:  { min: 45, max: 60, displayEpsilon: 0.1 },
    [aaa]: { min: 60, max: 75, displayEpsilon: 0.1 },
  },
};
