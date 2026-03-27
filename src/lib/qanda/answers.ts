/**
 * Converts an array of answers to a value map keyed by question.key.
 * 
 * Rules:
 * - Use question.key as map key
 * - Prefer valueText if present
 * - Else if valueJson is boolean, map to "true"/"false"
 * - Else if valueJson is string/number, stringify it
 * - Else empty string
 */
export function answersToValueMap(
  answers: Array<{
    question: { key: string };
    valueText: string | null;
    valueJson: unknown;
  }>
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const answer of answers) {
    const key = answer.question.key;
    
    if (answer.valueText !== null && answer.valueText !== undefined) {
      map[key] = answer.valueText;
    } else if (answer.valueJson !== null && answer.valueJson !== undefined) {
      if (typeof answer.valueJson === "boolean") {
        map[key] = answer.valueJson ? "true" : "false";
      } else if (typeof answer.valueJson === "string" || typeof answer.valueJson === "number") {
        map[key] = String(answer.valueJson);
      } else {
        map[key] = "";
      }
    } else {
      map[key] = "";
    }
  }

  return map;
}
