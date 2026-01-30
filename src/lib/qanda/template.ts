/**
 * Renders a template string by replacing {{key}} tokens with values.
 * 
 * Rules:
 * - Tokens are exactly: {{key}} where key matches [a-z0-9_]+
 * - Replace all occurrences
 * - Do not allow arbitrary code execution (string replace only)
 * - If template is null/undefined, return empty string
 * - If value missing, replace with empty string
 */
export function renderTemplate(template: string | null | undefined, values: Record<string, string>): string {
  if (template === null || template === undefined) {
    return "";
  }

  // Match {{key}} where key is [a-z0-9_]+
  const tokenRegex = /\{\{([a-z0-9_]+)\}\}/g;

  return template.replace(tokenRegex, (match, key) => {
    // Return the value if it exists, otherwise empty string
    return values[key] ?? "";
  });
}
