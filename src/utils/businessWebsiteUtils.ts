/**
 * Utility to derive clean business website URLs from business names or domain strings
 */
export function deriveBusinessWebsite(businessName: string): string {
  if (!businessName) return 'www.wakdev.com';

  // Specific domain overrides for popular Dubai brands
  const nameLower = businessName.toLowerCase();
  if (nameLower.includes('al safadi')) return 'www.alsafadirestaurants.com';
  if (nameLower.includes('sum of us')) return 'www.thesumofus.com';
  if (nameLower.includes('tips and toes')) return 'www.tipsandtoes.com';
  if (nameLower.includes('aroma espresso') || nameLower.includes('espresso lab')) return 'www.espressolab.ae';
  if (nameLower.includes('caribou')) return 'www.cariboucoffee.ae';
  if (nameLower.includes('zaroob')) return 'www.zaroob.com';
  if (nameLower.includes('shake shack')) return 'www.shakeshack.me';
  if (nameLower.includes('operation falafel')) return 'www.operationfalafel.com';
  if (nameLower.includes('sushi art')) return 'www.sushiart.ae';
  if (nameLower.includes('barbar')) return 'www.eatbarbar.com';

  // Sanitize business name for domain slug
  const sanitized = nameLower
    .replace(/\b(restaurant|cafe|café|salons?|spa|clinic|barbershop|gents|ladies|dubai|uae|branch|center|centre|szr|sheikh zayed road|al rigga|dcc)\b/gi, '')
    .replace(/[^a-z0-9]/g, '');

  if (sanitized.length >= 3) {
    return `www.${sanitized}.ae`;
  }

  return 'www.wakdev.com';
}

/**
 * Strips http://, https://, or trailing slashes to leave a clean path value for NFC URL fields
 */
export function cleanUrlPath(fullUrl: string): { protocol: string; path: string } {
  if (!fullUrl) return { protocol: 'https://', path: 'www.wakdev.com' };

  let protocol = 'https://';
  let path = fullUrl.trim();

  if (path.startsWith('https://')) {
    protocol = 'https://';
    path = path.replace(/^https:\/\//, '');
  } else if (path.startsWith('http://')) {
    protocol = 'http://';
    path = path.replace(/^http:\/\//, '');
  } else if (path.startsWith('mailto:')) {
    protocol = 'mailto:';
    path = path.replace(/^mailto:/, '');
  } else if (path.startsWith('tel:')) {
    protocol = 'tel:';
    path = path.replace(/^tel:/, '');
  }

  return { protocol, path };
}
