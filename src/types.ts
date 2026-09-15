export type AppTab = 'scout' | 'generator' | 'nfc';

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
