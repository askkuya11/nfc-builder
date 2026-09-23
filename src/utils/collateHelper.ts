import { BusinessLead, CollatedCustomerLead } from '../types';
import { REAL_DUBAI_BUSINESSES } from '../data/realDubaiBusinesses';
import { deriveBusinessWebsite } from './businessWebsiteUtils';
import { buildGoogleReviewUrl } from './googlePlaceIdUtils';

const STORAGE_KEY = 'dubai_nfc_selected_history_v2';

/**
 * Loads previously selected companies from localStorage, or returns empty array if none selected yet.
 */
export function loadSelectedHistory(): CollatedCustomerLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists selected companies to localStorage.
 */
export function saveSelectedHistory(list: CollatedCustomerLead[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota or access errors
  }
}

/**
 * Initial list is empty until the user actually selects companies to process.
 */
export function getInitialCollatedCustomers(): CollatedCustomerLead[] {
  return loadSelectedHistory();
}

/**
 * Converts a selected BusinessLead from Map Scout into a CollatedCustomerLead for the Field Visit Plan.
 */
export function createCollatedLeadFromBusinessLead(
  lead: BusinessLead,
  visitOrder?: number
): CollatedCustomerLead {
  const reviewUrl =
    lead.placeId
      ? `https://search.google.com/local/writereview?placeid=${lead.placeId}`
      : lead.directReviewUrl || buildGoogleReviewUrl(lead.name, lead.district, lead.placeId || null);

  const website = lead.websiteUrl || deriveBusinessWebsite(lead.name);

  return {
    id: `lead-${lead.id || Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    businessName: lead.name,
    district: lead.district,
    address: lead.address,
    category: lead.category,
    targetUrl: reviewUrl,
    type: 'google_review',
    placeId: lead.placeId || null,
    instagramHandle: lead.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    websiteUrl: website,
    rating: lead.rating,
    reviewCount: lead.reviewCount,
    priceAed: 199,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'pending',
    footsteps: lead.footsteps,
    phone: lead.contactDirectPhone || lead.phone,
    visitOrder,
  };
}

/**
 * Collates 10-20 real Dubai companies based on active district/metro station
 * when the user explicitly clicks the suggestion button.
 */
export function collateTargetCompanies(
  count: number = 15,
  preferredDistrict: string = 'DCC Area / Deira City Centre',
  existingList: CollatedCustomerLead[] = []
): CollatedCustomerLead[] {
  const existingNames = new Set(existingList.map((c) => c.businessName.toLowerCase()));
  const cleanDistrict = (preferredDistrict || '').toLowerCase();

  // Find leads matching district or corridor first
  const districtMatches = REAL_DUBAI_BUSINESSES.filter(
    (b) =>
      b.district.toLowerCase().includes(cleanDistrict) ||
      cleanDistrict.includes(b.district.toLowerCase().replace(/\(.*?\)/g, '').trim())
  );

  // Fallback to remaining real Dubai businesses to guarantee requested count (10 - 20)
  const otherMatches = REAL_DUBAI_BUSINESSES.filter(
    (b) => !districtMatches.some((dm) => dm.id === b.id)
  );

  const pool = [...districtMatches, ...otherMatches];
  const collated: CollatedCustomerLead[] = [];

  for (const b of pool) {
    if (existingNames.has(b.name.toLowerCase())) continue;

    const reviewUrl =
      b.placeId
        ? `https://search.google.com/local/writereview?placeid=${b.placeId}`
        : b.directReviewUrl || buildGoogleReviewUrl(b.name, b.district, null);

    const website = b.websiteUrl || deriveBusinessWebsite(b.name);

    collated.push({
      id: `collate-${Date.now()}-${collated.length}-${Math.random().toString(36).substr(2, 4)}`,
      businessName: b.name,
      district: b.district,
      address: b.address,
      category: b.category,
      targetUrl: reviewUrl,
      type: 'google_review',
      placeId: b.placeId || null,
      instagramHandle: b.instagramHandle || b.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      websiteUrl: website,
      rating: b.rating,
      reviewCount: b.reviewCount,
      priceAed: 199,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      visitOrder: existingList.length + collated.length + 1,
    });

    if (collated.length >= count) break;
  }

  return collated;
}

/**
 * Downloads a clean CSV containing all collated customers, review links, and field visit status
 */
export function exportCollatedCustomersCsv(customers: CollatedCustomerLead[]): void {
  if (!customers.length) return;

  const headers = [
    'Stop #',
    'Company Name',
    'Category',
    'District / Metro Corridor',
    'Address',
    'Footsteps from Metro',
    'Google Review Write URL',
    'Instagram Handle',
    'Website',
    'Rating',
    'Review Count',
    'NFC Tag Status',
    'NFC Written Timestamp',
    'Price (AED)',
    'Field Notes',
  ];

  const rows = customers.map((c, idx) => [
    c.visitOrder || idx + 1,
    `"${(c.businessName || '').replace(/"/g, '""')}"`,
    `"${(c.category || '').replace(/"/g, '""')}"`,
    `"${(c.district || '').replace(/"/g, '""')}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    c.footsteps || '',
    `"${(c.targetUrl || '').replace(/"/g, '""')}"`,
    `"${(c.instagramHandle || '').replace(/"/g, '""')}"`,
    `"${(c.websiteUrl || '').replace(/"/g, '""')}"`,
    c.rating || '',
    c.reviewCount || '',
    `"${c.status === 'written' ? 'WRITTEN & READY IN BAG' : 'PENDING NFC TAG'}"`,
    `"${c.writtenAt || ''}"`,
    c.priceAed || 199,
    `"${(c.fieldNotes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dubai_10_20_Field_Visit_Plan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
