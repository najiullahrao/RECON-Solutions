/**
 * Sanitize a string for use in Supabase ilike/or patterns.
 * Removes % and _ (LIKE wildcards) and escapes single quotes to prevent injection.
 */
export function sanitizeForSearch(value) {
  if (value == null || typeof value !== 'string') return '';
  return value
    .replace(/'/g, "''")
    .replace(/%/g, '')
    .replace(/_/g, '');
}
