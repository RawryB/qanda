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

export function getShellPaddingClasses(flush: boolean) {
  return flush ? "p-0" : "p-4";
}

export function getSectionPaddingClasses(
  flush: boolean,
  vertical: ContentAlignV,
  variant: "intro" | "question" | "completion",
) {
  if (!flush) {
    if (variant === "question") return "px-8 py-8";
    return "px-8 py-10";
  }

  const horizontalPad = "px-0";
  if (vertical === "top") {
    return variant === "question" ? `${horizontalPad} pt-0 pb-8` : `${horizontalPad} pt-0 pb-10`;
  }
  if (vertical === "bottom") {
    return variant === "question" ? `${horizontalPad} pt-8 pb-0` : `${horizontalPad} pt-10 pb-0`;
  }
  return variant === "question" ? `${horizontalPad} py-8` : `${horizontalPad} py-10`;
}

export function getErrorPaddingClasses(flush: boolean) {
  return flush ? "px-0" : "px-8";
}
