export function deriveBusinessEmail(name?: string, customEmail?: string): string {
  if (customEmail && customEmail.trim().length > 0) {
    return customEmail.trim();
  }
  if (!name) return 'contact@dubaibusiness.ae';

  const clean = name
    .toLowerCase()
    .replace(/^(the|al)\s+/, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 18);

  return `info@${clean || 'dubaibusiness'}.ae`;
}
