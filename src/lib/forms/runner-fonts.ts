const GOOGLE_FONT_OPTIONS = new Set([
  "Syne",
  "DM Sans",
  "Inter",
  "Lora",
  "Merriweather",
  "Montserrat",
  "Poppins",
  "Manrope",
  "Plus Jakarta Sans",
  "Playfair Display",
]);

export function sanitizeRunnerFont(font: string, fallback: string) {
  return GOOGLE_FONT_OPTIONS.has(font) ? font : fallback;
}

export function buildRunnerGoogleFontsHref(primaryFont: string, secondaryFont: string) {
  const resolvedPrimary = sanitizeRunnerFont(primaryFont, "Syne");
  const resolvedSecondary = sanitizeRunnerFont(secondaryFont, "DM Sans");
  const families = Array.from(new Set([resolvedPrimary, resolvedSecondary])).map(
    (font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;700;800`,
  );
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
