/**
 * Linear structural email check.
 *
 * Avoids nested-quantifier regex on user input (CodeQL
 * js/polynomial-redos). Lex still applies its own address check.
 */
export function isPlausibleEmail(value: string): boolean {
  if (value.length < 5 || value.length > 254) return false;
  const at = value.indexOf("@");
  if (at < 1 || at !== value.lastIndexOf("@")) return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 32) return false;
  }
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot >= 1 && dot < domain.length - 1;
}
