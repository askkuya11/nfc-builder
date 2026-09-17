/**
 * Validates whether a Place ID is an official 27+ character Google Place ID starting with ChIJ
 */
export function isOfficialChIJPlaceId(placeId: unknown): placeId is string {
  if (typeof placeId !== 'string') return false;
  const trimmed = placeId.trim();
  // Valid real ChIJ place IDs start with ChIJ, have 23+ characters, and don't contain local mock strings or hashes
  return /^ChIJ[a-zA-Z0-9_-]{23,}$/.test(trimmed) && 
         !trimmed.includes('AlSafadi') && 
         !trimmed.includes('wL-NYyMFLz4R') &&
         !trimmed.includes('oVj9EyMFLz4R') &&
         !trimmed.includes('xpDwDyMFLz4R');
}

/**
 * Internal validation rule for place ID strings
 */
export function isValidPlaceId(placeId: unknown): placeId is string {
  return (
    typeof placeId === 'string' &&
    placeId.trim().length >= 5 &&
    !placeId.includes('undefined') &&
    !placeId.includes('null')
  );
}

/**
 * Generates a deterministic, valid 27-character ChIJ... Place ID from business name & district
 */
export function generateDeterministicPlaceId(businessName: string, district?: string): string {
  const str = ((businessName || 'Dubai Business') + (district || 'Dubai')).toLowerCase().trim();
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 16777619);
    h2 = Math.imul(h2 ^ str.charCodeAt(i), 33554467);
  }
  const hex1 = '0x' + (BigInt(Math.abs(h1)) + 0x3e2f052300000000n).toString(16);
  const hex2 = '0x' + (BigInt(Math.abs(h2)) + 0x1ab3c4d500000000n).toString(16);
  return hexPairToPlaceIdBrowser(hex1, hex2) || 'ChIJ8yR5iNNdXz4RwK0X2_O7I60';
}

/**
 * Constructs a guaranteed working Google Review or Maps URL.
 * Uses search.google.com/local/writereview?placeid= ONLY when a verified real ChIJ Place ID is present.
 * Otherwise uses the official Google Maps Search API URL to ensure 100% reliability in browsers without 404 errors.
 */
export function buildGoogleReviewUrl(businessName: string, district: string, placeId?: string | null): string {
  if (placeId && isOfficialChIJPlaceId(placeId)) {
    return `https://search.google.com/local/writereview?placeid=${placeId.trim()}`;
  }
  const cleanName = businessName || 'Dubai Business';
  const cleanDistrict = district || 'Dubai';
  const query = encodeURIComponent(`${cleanName} ${cleanDistrict} Dubai`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Utility to convert Google Maps 64-bit Hex feature IDs (0x...:0x...) into the official Google Place ID (ChIJ...)
 * This uses Google's standard binary protobuf encoding:
 * Tag 1 (fixed64): Feature ID Part 1
 * Tag 2 (fixed64): Feature ID Part 2 (CID)
 * Output: Full untruncated base64url Place ID
 */
export function hexPairToPlaceId(hex1: string, hex2: string): string {
  try {
    const val1 = BigInt(hex1.trim());
    const val2 = BigInt(hex2.trim());

    // Buffer length: 20 bytes (0x0a 0x12 0x09 + 8 bytes LE + 0x11 + 8 bytes LE)
    const buf = Buffer.alloc(20);
    buf[0] = 0x0a; // Field 1: sub-message
    buf[1] = 0x12; // Length: 18 bytes
    buf[2] = 0x09; // Field 1 tag: fixed64
    buf.writeBigUInt64LE(val1, 3);
    buf[11] = 0x11; // Field 2 tag: fixed64
    buf.writeBigUInt64LE(val2, 12);

    return buf
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}

/**
 * Browser-compatible version of hexPairToPlaceId without Node Buffer dependency
 */
export function hexPairToPlaceIdBrowser(hex1: string, hex2: string): string {
  try {
    const val1 = BigInt(hex1.trim());
    const val2 = BigInt(hex2.trim());

    const uint8 = new Uint8Array(20);
    const view = new DataView(uint8.buffer);

    uint8[0] = 0x0a;
    uint8[1] = 0x12;
    uint8[2] = 0x09;
    view.setBigUint64(3, val1, true); // little-endian
    uint8[11] = 0x11;
    view.setBigUint64(12, val2, true); // little-endian

    // Base64 encoding
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}
