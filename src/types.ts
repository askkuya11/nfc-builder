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
  websiteUrl?: string;
  placeId: string;
  mapsUrl: string;
  directReviewUrl: string;
  instagramHandle?: string;
  pitchOpportunity: 'high' | 'medium' | 'established';
  pitchAngle: string;
  status?: 'new' | 'contacted' | 'nfc_written' | 'sold';
  lat?: number;
  lng?: number;
  distanceKm?: number;
  distanceLabel?: string;
  rank?: number;
  metroExit?: string;
  metroStationName?: string;
  footsteps?: number;
  walkMinutes?: number;
  walkingGuide?: string;
  yearsInBusiness?: number;
  establishedYear?: number;
  reviewsPerYear?: number;
  yearsVsReviewsGap?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  contactDirectPhone?: string;
  notes?: string;
  customContactUpdated?: boolean;
  audit?: GmbAuditData;
  buildingInfo?: GisBuildingInfo;
}

export interface GisBuildingEntrance {
  id: string;
  name: string;
  doorType: 'main_glass_door' | 'revolving_door' | 'side_entrance' | 'parking_elevator' | 'service_door';
  side: 'north' | 'south' | 'east' | 'west' | 'street' | 'courtyard';
  lat: number;
  lng: number;
  guidance: string;
  isPrimary?: boolean;
}

export interface GisIndoorBusiness {
  id: string;
  name: string;
  category: string;
  floor: string;
  floorNumber: number;
  unitNumber: string;
  phone?: string;
  reviewCount: number;
  rating: number;
  pitchOpportunity?: 'high' | 'medium' | 'established';
  isTargetLead?: boolean;
}

export interface GisBuildingInfo {
  buildingName: string;
  arabicName?: string;
  makaniNumber: string;
  gisId: string;
  gisUrl: string;
  gisSearchQuery: string;
  floorsCount: number;
  totalOrganizations: number;
  currentLeadFloor: string;
  currentLeadUnit: string;
  primaryEntrance: GisBuildingEntrance;
  entrances: GisBuildingEntrance[];
  indoorBusinesses: GisIndoorBusiness[];
  salesAdvantageTip: string;
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
