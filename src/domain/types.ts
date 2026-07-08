/**
 * 2.0 domain model — the ubiquitous language of the colour-management service,
 * expressed as TypeScript types. See `docs/2.0-design/domain-model.md`.
 *
 *   Project → Palette → Colour        (value per Mode)
 *
 * A Colour is owned by exactly one Palette and carries a stable `id` (reserving a
 * future aliasing layer, out of scope here).
 */

/** Canonical sRGB colour, stored as a hex string. Format-flexible on I/O (colorjs.io). */
export type HexColour = string;

/**
 * How a Role participates in a contrast pair. Drives the default prioritised
 * results (foreground-role × background-role) and supplies APCA polarity.
 */
export type RoleClassification = "foreground" | "background" | "both";

/** A functional role from the controlled vocabulary (see `roles.ts`). */
export interface Role {
  /** Stable slug, e.g. "background". */
  id: string;
  /** Human-readable label, e.g. "Background". */
  label: string;
  /** Foreground / background / both classification. */
  classification: RoleClassification;
}

/**
 * A named theme variant **owned by a Palette** (e.g. Light / Dark). Arbitrary named
 * set, mirroring a Figma variable-collection's modes. Each Colour holds one value per Mode.
 */
export interface Mode {
  /** Stable id. */
  id: string;
  /** Display name, e.g. "Light". */
  name: string;
}

/**
 * The atomic unit. Carries context beyond a bare hex value: a descriptive name,
 * functional role tags, and one value per Mode.
 */
export interface Colour {
  /** Stable id — survives renames/re-tagging; reserves the future aliasing layer. */
  id: string;
  /** Free-text descriptive label, e.g. "Midnight Navy". */
  name: string;
  /** Role ids (multi-select) from the controlled vocabulary. */
  roles: string[];
  /** One canonical sRGB value per Mode, keyed by Mode id. */
  values: Record<string, HexColour>;
}

/** An ordered collection of Colours plus the Modes they resolve against. */
export interface Palette {
  id: string;
  name: string;
  description?: string;
  /** Theme variants this Palette declares (default Light + Dark; single "Default" allowed). */
  modes: Mode[];
  colours: Colour[];
}

/** Top-level grouping of related Palettes (a client brand, a theme exploration, …). */
export interface Project {
  id: string;
  name: string;
  palettes: Palette[];
}
