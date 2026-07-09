export type ContentAlignH = "left" | "center" | "right";
export type ContentAlignV = "top" | "center" | "bottom";

const CONTENT_ALIGN_H = new Set<ContentAlignH>(["left", "center", "right"]);
const CONTENT_ALIGN_V = new Set<ContentAlignV>(["top", "center", "bottom"]);

export function parseContentAlignH(value: string | null | undefined, fallback: ContentAlignH = "center"): ContentAlignH {
  if (value && CONTENT_ALIGN_H.has(value as ContentAlignH)) return value as ContentAlignH;
  return fallback;
}

export function parseContentAlignV(value: string | null | undefined, fallback: ContentAlignV = "center"): ContentAlignV {
  if (value && CONTENT_ALIGN_V.has(value as ContentAlignV)) return value as ContentAlignV;
  return fallback;
}

export function getShellAlignmentClasses(horizontal: ContentAlignH, vertical: ContentAlignV) {
  const justify =
    horizontal === "left" ? "justify-start" : horizontal === "right" ? "justify-end" : "justify-center";
  const items = vertical === "top" ? "items-start" : vertical === "bottom" ? "items-end" : "items-center";
  return `${items} ${justify}`;
}

export function getCenteredSectionClasses(horizontal: ContentAlignH) {
  if (horizontal === "left") return "items-start text-left";
  if (horizontal === "right") return "items-end text-right";
  return "items-center text-center";
}

export function getErrorTextClasses(horizontal: ContentAlignH) {
  if (horizontal === "left") return "text-left";
  if (horizontal === "right") return "text-right";
  return "text-center";
}
