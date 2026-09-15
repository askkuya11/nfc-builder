export type AppTab = 'scout' | 'generator' | 'nfc';

export interface GmbAuditData {
  categoryMatch: string; // e.g. "100% Primary Match" or "Secondary: Dental Healthcare"
  categoryMatchScore: number; // 0 - 100%
  profileCompleteness: number; // 0 - 100%
  profileStatus: 'incomplete' | 'needs_attention' | 'optimized';
  reviewVelocity: string; // e.g. "+0.9 rev/mo (Stagnant)"
  velocityRate: number; // reviews per month
  velocityStatus: 'stagnant' | 'slow' | 'moderate' | 'rapid';
  photosCount: number; // total photo count
  photoStatus: 'deficient' | 'adequate' | 'rich';
  auditScore: number; // composite GMB Everywhere audit score (0 - 100)
  missingAttributes?: string[]; // e.g. ["Direct Booking Link", "Owner Q&A", "Cover Photo Resolution"]
  source?: 'gmb_everywhere_import' | 'audit_engine' | 'verified_dubai_places';
}

export interface BusinessLead {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  district: string;
  address: string;
  phone: string;
  placeId: string;
  mapsUrl: string;
  directReviewUrl: string;
  instagramHandle?: string;
  pitchOpportunity: 'high' | 'medium' | 'established';
  pitchAngle: string;
  status?: 'new' | 'contacted' | 'nfc_written' | 'sold';
  lat?: number;
  lng?: number;
  audit?: GmbAuditData;
}

export type CardTheme = 'gold_black' | 'google_clean' | 'instagram_sunset' | 'matte_noir' | 'dubai_emerald';

export type NfcChipType = 'NTAG213' | 'NTAG215' | 'NTAG216';

export interface NfcProgramState {
  businessName: string;
  district: string;
  targetUrl: string;
  type: 'google_review' | 'instagram' | 'custom_url';
  instagramHandle?: string;
  theme: CardTheme;
  chipType: NfcChipType;
  lockTag: boolean;
  notes?: string;
}

export interface NfcBatchItem {
  id: string;
  businessName: string;
  district: string;
  url: string;
  type: 'google_review' | 'instagram';
  timestamp: string;
  status: 'pending' | 'written' | 'verified' | 'sold';
  priceAed: number;
}
