/**
 * Internal validation rule:
 * Validates whether a Place ID is a valid, non-null, non-stub string with length > 10
 */
export function isValidPlaceId(placeId: unknown): placeId is string {
  return (
    typeof placeId === 'string' &&
    placeId.trim().length > 10 &&
    !placeId.includes('undefined') &&
    !placeId.includes('null') &&
    !placeId.startsWith('dxb-real-') &&
    !placeId.startsWith('gis-') &&
    !placeId.startsWith('osm-node-') &&
    !placeId.startsWith('dxb-live-')
  );
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
