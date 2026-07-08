import type { Role } from "@/domain/types";

/**
 * Controlled vocabulary of functional colour roles. Each role carries a
 * foreground / background / both classification (ADR 0006), which drives the
 * default prioritised results (foreground-role × background-role) and supplies
 * APCA polarity.
 *
 * Classifications follow ADR 0006's enumeration:
 *   text, icon, border, accent, brand → foreground
 *   background, surface               → background
 * The "both" classification is reserved by the type for future roles (ADR: "some → both").
 */
export const ROLE_VOCABULARY: readonly Role[] = [
  { id: "background", label: "Background", classification: "background" },
  { id: "surface", label: "Surface", classification: "background" },
  { id: "text", label: "Text", classification: "foreground" },
  { id: "icon", label: "Icon", classification: "foreground" },
  { id: "border", label: "Border", classification: "foreground" },
  { id: "accent", label: "Accent", classification: "foreground" },
  { id: "brand", label: "Brand", classification: "foreground" },
];

/** All role ids in the vocabulary. */
export const ROLE_IDS: readonly string[] = ROLE_VOCABULARY.map((r) => r.id);

const ROLE_BY_ID = new Map(ROLE_VOCABULARY.map((r) => [r.id, r]));

/** Look up a role by its id, or `null` if it is not in the vocabulary. */
export function getRole(id: string): Role | null {
  return ROLE_BY_ID.get(id) ?? null;
}
