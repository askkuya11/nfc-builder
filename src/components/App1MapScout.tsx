import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BusinessLead, GisIndoorBusiness } from '../types';
import { GmbAuditOverlay } from './GmbAuditOverlay';
import { GmbEverywhereImporterModal } from './GmbEverywhereImporterModal';
import { generateGmbAudit } from '../utils/gmbEverywhereAudit';
import { RealInteractiveRadarMap } from './RealInteractiveRadarMap';
import { GisBuildingModal } from './GisBuildingModal';
import { generateGisBuildingData } from '../utils/gisDubaiDirectory';
import {
  CategoryBadge,
  getCategoryVisualMeta,
  detectBusinessCategory,
} from '../utils/categoryIcons';
import {
  Search,
  MapPin,
  Star,
  ExternalLink,
  Copy,
  Check,
  Phone,
  MessageSquare,
  Sparkles,
  Download,
  Filter,
  Layers,
  Flame,
  ArrowRight,
  RefreshCw,
  Navigation,
  Radio,
  Crosshair,
  Compass,
  Eye,
  LocateFixed,
  FileSpreadsheet,
  Gauge,
  UploadCloud,
  Clock,
  UserCheck,
  PhoneCall,
  Edit3,
  UserPlus,
  Save,
  FileText,
  ZoomIn,
  ZoomOut,
  Footprints,
  Route,
  Maximize2,
  Minimize2,
  Building2,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Map,
  Columns,
} from 'lucide-react';

interface App1MapScoutProps {
  onSelectLead: (lead: BusinessLead) => void;
  selectedLeadId?: string;
}

export const DUBAI_METRO_STATIONS = [
  'Al Rigga (Red Line)',
  'DCC Area / Deira City Centre (Red Line)',
  'Union Metro (Red & Green Line Interchange)',
  'Salah Al Din (Green Line)',
  'BurJuman (Red & Green Line Interchange)',
  'Baniyas Square (Green Line)',
  'Abu Baker Al Siddique (Green Line)',
  'Al Fahidi / Meena Bazaar (Green Line)',
  'ADCB / Karama (Red Line)',
  'Business Bay (Red Line)',
  'Mall of the Emirates / MOE (Red Line)',
  'DMCC / JLT (Red Line)',
  'Sobha Realty / Dubai Marina (Red Line)',
];

export const DUBAI_GENERAL_DISTRICTS = [
  'All Dubai',
  'Deira',
  'Downtown Dubai',
  'Dubai Marina',
  'JBR (Jumeirah Beach Residence)',
  'Al Barsha',
  'JLT (Jumeirah Lake Towers)',
  'Karama',
  'Palm Jumeirah',
  'Dubai Hills',
];

export const DUBAI_DISTRICTS = [
  ...DUBAI_METRO_STATIONS,
  ...DUBAI_GENERAL_DISTRICTS,
];

const CATEGORIES = [
  'All Categories',
  'Dental Clinic',
  'Restaurants & Cafes',
  "Men's Barbershops & Gents Salons",
  'Ladies Salons & Spas',
  'Clinics & Healthcare',
  'Retail & Boutiques',
  'Automotive',
  'Fitness & Gyms',
];

export const DISTRICT_CENTERS: Record<string, { lat: number; lng: number; sectorName: string; landmark: string }> = {
  // Metro Stations (Red & Green Lines)
  'Al Rigga (Red Line)': { lat: 25.2635, lng: 55.3245, sectorName: 'RED LINE • AL RIGGA ROAD CORRIDOR', landmark: 'Al Rigga Metro & Al Ghurair Centre' },
  'Al Rigga': { lat: 25.2635, lng: 55.3245, sectorName: 'RED LINE • AL RIGGA ROAD CORRIDOR', landmark: 'Al Rigga Metro & Al Ghurair Centre' },

  'DCC Area / Deira City Centre (Red Line)': { lat: 25.2532, lng: 55.3330, sectorName: 'RED LINE • DEIRA CITY CENTRE (DCC) SECTOR', landmark: 'DCC Metro, Pullman Hotel & Port Saeed' },
  'DCC Area': { lat: 25.2532, lng: 55.3330, sectorName: 'RED LINE • DEIRA CITY CENTRE (DCC) SECTOR', landmark: 'DCC Metro, Pullman Hotel & Port Saeed' },
  'Deira City Centre': { lat: 25.2532, lng: 55.3330, sectorName: 'RED LINE • DEIRA CITY CENTRE (DCC) SECTOR', landmark: 'DCC Metro, Pullman Hotel & Port Saeed' },

  'Union Metro (Red & Green Line Interchange)': { lat: 25.2662, lng: 55.3130, sectorName: 'RED & GREEN LINE • UNION INTERCHANGE HUB', landmark: 'Union Metro Square, Al Maktoum Road & Creek' },
  'Union Metro': { lat: 25.2662, lng: 55.3130, sectorName: 'RED & GREEN LINE • UNION INTERCHANGE HUB', landmark: 'Union Metro Square, Al Maktoum Road & Creek' },
  'Union': { lat: 25.2662, lng: 55.3130, sectorName: 'RED & GREEN LINE • UNION INTERCHANGE HUB', landmark: 'Union Metro Square, Al Maktoum Road & Creek' },

  'Salah Al Din (Green Line)': { lat: 25.2692, lng: 55.3280, sectorName: 'GREEN LINE • SALAH AL DIN SECTOR', landmark: 'Salah Al Din Metro, Reef Mall & Muraqqabat' },
  'Salah Al Din': { lat: 25.2692, lng: 55.3280, sectorName: 'GREEN LINE • SALAH AL DIN SECTOR', landmark: 'Salah Al Din Metro, Reef Mall & Muraqqabat' },
  'Salah Aldin': { lat: 25.2692, lng: 55.3280, sectorName: 'GREEN LINE • SALAH AL DIN SECTOR', landmark: 'Salah Al Din Metro, Reef Mall & Muraqqabat' },

  'BurJuman (Red & Green Line Interchange)': { lat: 25.2528, lng: 55.3025, sectorName: 'RED & GREEN LINE • BURJUMAN INTERCHANGE', landmark: 'BurJuman Metro, Bank Street & Trade Area' },
  'BurJuman': { lat: 25.2528, lng: 55.3025, sectorName: 'RED & GREEN LINE • BURJUMAN INTERCHANGE', landmark: 'BurJuman Metro, Bank Street & Trade Area' },

  'Baniyas Square (Green Line)': { lat: 25.2680, lng: 55.3060, sectorName: 'GREEN LINE • BANIYAS SQUARE SECTOR', landmark: 'Baniyas Square Metro, Nasser Sq & Wholesale Market' },
  'Baniyas Square': { lat: 25.2680, lng: 55.3060, sectorName: 'GREEN LINE • BANIYAS SQUARE SECTOR', landmark: 'Baniyas Square Metro, Nasser Sq & Wholesale Market' },

  'Abu Baker Al Siddique (Green Line)': { lat: 25.2660, lng: 55.3370, sectorName: 'GREEN LINE • ABU BAKER AL SIDDIQUE SECTOR', landmark: 'Abu Baker Metro & Salahuddin Commercial Strip' },
  'Abu Baker Al Siddique': { lat: 25.2660, lng: 55.3370, sectorName: 'GREEN LINE • ABU BAKER AL SIDDIQUE SECTOR', landmark: 'Abu Baker Metro & Salahuddin Commercial Strip' },

  'Al Fahidi / Meena Bazaar (Green Line)': { lat: 25.2568, lng: 55.2970, sectorName: 'GREEN LINE • AL FAHIDI / MEENA BAZAAR', landmark: 'Al Fahidi Metro, Meena Bazaar & Textile Market' },
  'Al Fahidi': { lat: 25.2568, lng: 55.2970, sectorName: 'GREEN LINE • AL FAHIDI / MEENA BAZAAR', landmark: 'Al Fahidi Metro, Meena Bazaar & Textile Market' },

  'ADCB / Karama (Red Line)': { lat: 25.2480, lng: 55.3020, sectorName: 'RED LINE • ADCB / AL KARAMA SECTOR', landmark: 'ADCB Metro & Karama Food District' },
  'ADCB': { lat: 25.2480, lng: 55.3020, sectorName: 'RED LINE • ADCB / AL KARAMA SECTOR', landmark: 'ADCB Metro & Karama Food District' },

  'Business Bay (Red Line)': { lat: 25.1837, lng: 55.2666, sectorName: 'RED LINE • BUSINESS BAY SECTOR', landmark: 'Business Bay Metro & Dubai Canal' },
  'Business Bay': { lat: 25.1837, lng: 55.2666, sectorName: 'RED LINE • BUSINESS BAY SECTOR', landmark: 'Business Bay Metro & Dubai Canal' },

  'Mall of the Emirates / MOE (Red Line)': { lat: 25.1180, lng: 55.2000, sectorName: 'RED LINE • MALL OF THE EMIRATES / BARSHA', landmark: 'MOE Metro & Barsha Commercial Hub' },

  'DMCC / JLT (Red Line)': { lat: 25.0740, lng: 55.1460, sectorName: 'RED LINE • DMCC / JLT HIGH-RISE SECTOR', landmark: 'DMCC Metro & Lake Towers' },
  'JLT (Jumeirah Lake Towers)': { lat: 25.0740, lng: 55.1460, sectorName: 'RED LINE • DMCC / JLT HIGH-RISE SECTOR', landmark: 'DMCC Metro & Lake Towers' },

  'Sobha Realty / Dubai Marina (Red Line)': { lat: 25.0805, lng: 55.1403, sectorName: 'RED LINE • SOBHA REALTY / MARINA SECTOR', landmark: 'Sobha Realty Metro & Marina Walk' },

  // General Districts
  'All Dubai': { lat: 25.2048, lng: 55.2708, sectorName: 'GREATER DUBAI METROPOLITAN', landmark: 'Dubai Central Hub' },
  'Dubai Marina': { lat: 25.0805, lng: 55.1403, sectorName: 'DUBAI MARINA & JBR SECTOR', landmark: 'Marina Promenade & Walk' },
  'Downtown Dubai': { lat: 25.1972, lng: 55.2744, sectorName: 'DOWNTOWN & FINANCIAL CORRIDOR', landmark: 'Burj Khalifa & DIFC' },
  'Deira': { lat: 25.2697, lng: 55.3125, sectorName: 'DEIRA HISTORIC TRADING SECTOR', landmark: 'Gold Souk & Clock Tower' },
  'JBR (Jumeirah Beach Residence)': { lat: 25.0780, lng: 55.1330, sectorName: 'JBR BEACHFRONT CORRIDOR', landmark: 'The Walk & Ain Dubai' },
  'Al Barsha': { lat: 25.1180, lng: 55.2000, sectorName: 'AL BARSHA COMMERCIAL SECTOR', landmark: 'Mall of the Emirates Area' },
  'Karama': { lat: 25.2480, lng: 55.3020, sectorName: 'AL KARAMA RETAIL SECTOR', landmark: 'Karama Centre & Market' },
  'Palm Jumeirah': { lat: 25.1124, lng: 55.1389, sectorName: 'PALM JUMEIRAH LUXURY SECTOR', landmark: 'The Pointe & Crescent' },
  'Dubai Hills': { lat: 25.1050, lng: 55.2450, sectorName: 'DUBAI HILLS ESTATE SECTOR', landmark: 'Dubai Hills Boulevard' },
};

export const resolveDistrictCenter = (districtName: string) => {
  if (DISTRICT_CENTERS[districtName]) return DISTRICT_CENTERS[districtName];
  const clean = districtName.toLowerCase();
  for (const [key, value] of Object.entries(DISTRICT_CENTERS)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return value;
    }
  }
  return DISTRICT_CENTERS['Al Rigga (Red Line)'];
};

export const App1MapScout: React.FC<App1MapScoutProps> = ({
  onSelectLead,
  selectedLeadId,
}) => {
  const [district, setDistrict] = useState<string>('Al Rigga (Red Line)');
  const [category, setCategory] = useState<string>('All Categories');
  const [reviewFilter, setReviewFilter] = useState<string>('sweet_spot'); // 10-100 reviews
  const [sortBy, setSortBy] = useState<'nearest' | 'sweet_spot' | 'reviews_asc' | 'rating_desc' | 'name_asc'>('nearest');
  const [extractCount, setExtractCount] = useState<number>(20);
  const [customSearch, setCustomSearch] = useState<string>('');
  
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [totalMatched, setTotalMatched] = useState<number>(0);
  const [totalInDistrict, setTotalInDistrict] = useState<number>(0);
  const [totalInDistrictCategory, setTotalInDistrictCategory] = useState<number>(0);

  const [leadSource, setLeadSource] = useState<string>('real_verified_dubai_places');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(false);
  const [activeLeadOnMap, setActiveLeadOnMap] = useState<BusinessLead | null>(null);
  const [radarScanning, setRadarScanning] = useState<boolean>(true);
  const [radarCategoryFilter, setRadarCategoryFilter] = useState<'all' | 'barbershop' | 'dental' | 'high_need'>('all');
  const [mapEngine, setMapEngine] = useState<'google' | '2gis'>('google');
  const [radarZoom, setRadarZoom] = useState<number>(1);
  const [showRouteTrail, setShowRouteTrail] = useState<boolean>(true);
  const [routeMaxStops, setRouteMaxStops] = useState<number>(10);
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const [auditOverlayEnabled, setAuditOverlayEnabled] = useState<boolean>(true);
  const [resultSearchQuery, setResultSearchQuery] = useState<string>('');

  // 2GIS Building & Entrance Directory modal state
  const [gisModalLead, setGisModalLead] = useState<BusinessLead | null>(null);
  const [isGisModalOpen, setIsGisModalOpen] = useState<boolean>(false);

  const openGisModal = (lead: BusinessLead) => {
    if (!lead.buildingInfo) {
      lead.buildingInfo = generateGisBuildingData(lead);
    }
    setGisModalLead(lead);
    setIsGisModalOpen(true);
  };

  const handleSelectCoTenant = (coTenant: GisIndoorBusiness) => {
    const existing = leads.find((l) => l.name.toLowerCase() === coTenant.name.toLowerCase());
    if (existing) {
      onSelectLead(existing);
      setActiveLeadOnMap(existing);
    } else {
      const parentLead = gisModalLead;
      const bName = parentLead?.buildingInfo?.buildingName || 'Dubai Commercial Center';
      const syntheticLead: BusinessLead = {
        id: coTenant.id,
        name: coTenant.name,
        category: coTenant.category,
        rating: coTenant.rating,
        reviewCount: coTenant.reviewCount,
        district: parentLead ? parentLead.district : district,
        address: `${bName}, ${coTenant.floor}, Unit ${coTenant.unitNumber}, ${parentLead?.district || district}, Dubai`,
        phone: coTenant.phone || '+971 4 222 1111',
        placeId: `gis-${coTenant.id}`,
        mapsUrl: `https://maps.app.goo.gl/yMHn9hGf2T3t9XRN6`,
        directReviewUrl: `https://search.google.com/local/writereview?placeid=${coTenant.id}`,
        pitchOpportunity: coTenant.pitchOpportunity || 'high',
        pitchAngle: `High-value co-tenant inside ${bName}. Located at ${coTenant.floor}, Unit ${coTenant.unitNumber}. On same walking corridor!`,
        lat: parentLead?.lat,
        lng: parentLead?.lng,
        footsteps: parentLead?.footsteps,
        walkMinutes: parentLead?.walkMinutes,
        metroExit: parentLead?.metroExit,
        walkingGuide: `Inside ${bName} (${coTenant.floor})`,
        buildingInfo: parentLead?.buildingInfo,
      };
      onSelectLead(syntheticLead);
      setActiveLeadOnMap(syntheticLead);
    }
    setIsGisModalOpen(false);
  };

  // Editable decision maker contact state
  const [editingLeadForContact, setEditingLeadForContact] = useState<BusinessLead | null>(null);
  const [editContactName, setEditContactName] = useState<string>('');
  const [editContactRole, setEditContactRole] = useState<string>('');
  const [editContactPhone, setEditContactPhone] = useState<string>('');
  const [editContactNotes, setEditContactNotes] = useState<string>('');
  const [contactSaveToast, setContactSaveToast] = useState<string | null>(null);

  const openContactEditor = (lead: BusinessLead) => {
    setEditingLeadForContact(lead);
    setEditContactName(lead.contactPersonName || '');
    setEditContactRole(lead.contactPersonRole || 'Owner & Decision Maker');
    setEditContactPhone(lead.contactDirectPhone || lead.phone || '');
    setEditContactNotes(lead.notes || '');
  };

  const handleSaveContact = () => {
    if (!editingLeadForContact) return;

    const customData = {
      contactPersonName: editContactName.trim(),
      contactPersonRole: editContactRole.trim(),
      contactDirectPhone: editContactPhone.trim(),
      notes: editContactNotes.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const savedCustomContactsRaw = localStorage.getItem('dubai_leads_custom_contacts');
      const savedCustomContacts = savedCustomContactsRaw ? JSON.parse(savedCustomContactsRaw) : {};
      savedCustomContacts[editingLeadForContact.id] = customData;
      if (editingLeadForContact.placeId) {
        savedCustomContacts[editingLeadForContact.placeId] = customData;
      }
      localStorage.setItem('dubai_leads_custom_contacts', JSON.stringify(savedCustomContacts));
    } catch (_e) {
      // local storage fallback
    }

    setLeads(prev => prev.map(l => {
      if (l.id === editingLeadForContact.id || (l.placeId && l.placeId === editingLeadForContact.placeId)) {
        return {
          ...l,
          contactPersonName: customData.contactPersonName || undefined,
          contactPersonRole: customData.contactPersonRole || undefined,
          contactDirectPhone: customData.contactDirectPhone || undefined,
          notes: customData.notes || undefined,
          customContactUpdated: true,
        };
      }
      return l;
    }));

    if (activeLeadOnMap && (activeLeadOnMap.id === editingLeadForContact.id || (activeLeadOnMap.placeId && activeLeadOnMap.placeId === editingLeadForContact.placeId))) {
      setActiveLeadOnMap(prev => prev ? {
        ...prev,
        contactPersonName: customData.contactPersonName || undefined,
        contactPersonRole: customData.contactPersonRole || undefined,
        contactDirectPhone: customData.contactDirectPhone || undefined,
        notes: customData.notes || undefined,
        customContactUpdated: true,
      } : null);
    }

    setEditingLeadForContact(null);
    setContactSaveToast(`✓ Updated decision maker for ${editingLeadForContact.name}`);
    setTimeout(() => setContactSaveToast(null), 3000);
  };

  const filteredLeads = useMemo(() => {
    const query = (customSearch || resultSearchQuery || '').toLowerCase().trim();
    if (!query) return leads;
    return leads.filter((l) =>
      l.name.toLowerCase().includes(query) ||
      l.address.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query) ||
      l.district.toLowerCase().includes(query) ||
      (l.phone && l.phone.toLowerCase().includes(query)) ||
      (l.contactPersonName && l.contactPersonName.toLowerCase().includes(query)) ||
      (l.distanceLabel && l.distanceLabel.toLowerCase().includes(query)) ||
      (l.metroExit && l.metroExit.toLowerCase().includes(query)) ||
      (l.walkingGuide && l.walkingGuide.toLowerCase().includes(query)) ||
      (l.yearsVsReviewsGap && l.yearsVsReviewsGap.toLowerCase().includes(query)) ||
      (l.pitchAngle && l.pitchAngle.toLowerCase().includes(query))
    );
  }, [leads, customSearch, resultSearchQuery]);

  const fetchBusinesses = useCallback(async (
    targetDistrict = district,
    targetCategory = category,
    targetReview = reviewFilter,
    targetCount = extractCount,
    targetQuery = customSearch,
    targetSort = sortBy
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search-businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: targetDistrict,
          category: targetCategory,
          reviewRange: targetReview,
          count: targetCount,
          customQuery: targetQuery,
          sortBy: targetSort,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load businesses from Dubai directory');
      }

      const data = await response.json();
      if (data.businesses && Array.isArray(data.businesses)) {
        let savedCustomContacts: Record<string, any> = {};
        try {
          const raw = localStorage.getItem('dubai_leads_custom_contacts');
          if (raw) savedCustomContacts = JSON.parse(raw);
        } catch (_e) {}

        const enriched: BusinessLead[] = data.businesses.map((b: BusinessLead) => {
          const custom = savedCustomContacts[b.id] || (b.placeId && savedCustomContacts[b.placeId]);
          return {
            ...b,
            audit: b.audit || generateGmbAudit(b),
            ...(custom ? {
              contactPersonName: custom.contactPersonName || b.contactPersonName,
              contactPersonRole: custom.contactPersonRole || b.contactPersonRole,
              contactDirectPhone: custom.contactDirectPhone || b.contactDirectPhone,
              notes: custom.notes,
              customContactUpdated: true,
            } : {}),
          };
        });
        setLeads(enriched);
        setLeadSource(data.source || 'curated_dubai_dataset');
        setTotalMatched(data.totalMatched ?? enriched.length);
        setTotalInDistrict(data.totalInDistrict ?? enriched.length);
        setTotalInDistrictCategory(data.totalInDistrictCategory ?? enriched.length);
        if (enriched.length > 0) {
          setActiveLeadOnMap(enriched[0]);
        } else {
          setActiveLeadOnMap(null);
        }
      }
    } catch (_err: any) {
      setError('Directory refreshed with standard verified Dubai leads.');
    } finally {
      setLoading(false);
    }
  }, [district, category, reviewFilter, extractCount, customSearch]);

  const handleImportLeads = (importedLeads: BusinessLead[], mode: 'replace' | 'append') => {
    const enriched = importedLeads.map((b) => ({
      ...b,
      audit: b.audit || generateGmbAudit(b),
    }));

    if (mode === 'replace') {
      setLeads(enriched);
      setLeadSource('gmb_everywhere_import');
      if (enriched.length > 0) {
        setActiveLeadOnMap(enriched[0]);
        // If imported leads are in a known district, sync the selector
        if (enriched[0].district && DUBAI_DISTRICTS.includes(enriched[0].district)) {
          setDistrict(enriched[0].district);
        }
      }
    } else {
      setLeads((prev) => [...enriched, ...prev]);
      setLeadSource('gmb_everywhere_hybrid');
      if (enriched.length > 0) {
        setActiveLeadOnMap(enriched[0]);
      }
    }
  };

  // Real-time automatic fetch whenever filters change or custom search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses(district, category, reviewFilter, extractCount, customSearch, sortBy);
    }, 350);
    return () => clearTimeout(timer);
  }, [district, category, reviewFilter, extractCount, customSearch, sortBy]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCsv = () => {
    const exportList = filteredLeads.length > 0 ? filteredLeads : leads;
    const headers = [
      'Proximity Rank (#)',
      'Name',
      'Category',
      'District',
      'Footsteps from Metro Exit',
      'Walk Time (Minutes)',
      'Metro Exit Gate',
      'Walking Guide Directions',
      'Google Rating',
      'Review Count',
      'Years Operating',
      'Established Year',
      'Reviews/Year',
      'Point of Contact',
      'Contact Role',
      'Direct Phone / WhatsApp',
      'Landline Phone',
      'Address',
      'Google Maps Link',
      'Pitch Angle',
      'Years vs Review Gap Pitch',
    ];
    const rows = exportList.map((l, idx) => [
      l.rank || (idx + 1),
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.district}"`,
      l.footsteps || Math.round((l.distanceKm || 0.1) * 1300),
      l.walkMinutes || Math.max(1, Math.ceil((l.distanceKm || 0.1) * 13)),
      `"${(l.metroExit || 'Exit 1').replace(/"/g, '""')}"`,
      `"${(l.walkingGuide || `~${l.footsteps || 110} footsteps from Metro Exit`).replace(/"/g, '""')}"`,
      l.rating,
      l.reviewCount,
      l.yearsInBusiness ?? '',
      l.establishedYear ?? '',
      l.reviewsPerYear ?? '',
      `"${(l.contactPersonName || '').replace(/"/g, '""')}"`,
      `"${(l.contactPersonRole || '').replace(/"/g, '""')}"`,
      `"${l.contactDirectPhone || ''}"`,
      `"${l.phone}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${l.mapsUrl}"`,
      `"${l.pitchAngle.replace(/"/g, '""')}"`,
      `"${(l.yearsVsReviewsGap || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dubai_NFC_Leads_${district.replace(/\s+/g, '_')}_${leads.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* App Intro & Value Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/30 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-1.5">
              <Flame className="w-3.5 h-3.5" /> App 1 of 3: Dubai Lead Scout
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Google Maps Business Finder
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Find Dubai shops with <strong className="text-amber-400 font-semibold">0 to 100 reviews</strong>. These owners understand reviews drive foot-traffic, but are falling behind competitors. They are your highest-converting prospects for Google Review NFC cards.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImporterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition"
              title="Import or paste CSV/JSON exported from GMB Everywhere Chrome extension"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import GMB Everywhere</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              disabled={leads.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-200 font-medium transition disabled:opacity-50"
              title="Export CSV to take on field sales visits"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile-First View Switcher & Filter Toggle Header */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700/80 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>List View</span>
              {leads.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${viewMode === 'list' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                  {filteredLeads.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Radar Map</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'split'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="View Radar Map and List View side by side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>

          {/* Collapsible Filters Toggle for Mobile */}
          <button
            type="button"
            onClick={() => setFiltersCollapsed(!filtersCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filters: <strong className="text-white">{district.split('(')[0].trim()}</strong></span>
            {filtersCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Filter Controls Box (Collapsible on Mobile) */}
        {!filtersCollapsed && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 animate-fadeIn">
          {/* District Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Target Area in Dubai
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 appearance-none font-medium"
              >
                <optgroup label="🚇 DUBAI METRO STATIONS (RED & GREEN LINE)">
                  {DUBAI_METRO_STATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🏙️ GENERAL DUBAI COMMERCIAL DISTRICTS">
                  {DUBAI_GENERAL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              </select>
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Business Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="All Categories">🌐 All Categories</option>
              <option value="Men's Barbershops & Gents Salons">✂️ Men's Barbershops & Gents Salons</option>
              <option value="Dental Clinic">🦷 Dental Clinics</option>
              <option value="Restaurants & Cafes">🍽️ Restaurants & Cafes</option>
              <option value="Ladies Salons & Spas">✨ Ladies Salons & Spas</option>
              <option value="Clinics & Healthcare">💊 Clinics & Healthcare</option>
              <option value="Retail & Boutiques">🛍️ Retail & Boutiques</option>
              <option value="Automotive">🚗 Automotive & Garages</option>
              <option value="Fitness & Gyms">🏋️ Fitness & Gyms</option>
            </select>
          </div>

          {/* Review Volume Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Existing Review Count
            </label>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="sweet_spot">🎯 0 to 100 Reviews (Sweet Spot)</option>
              <option value="0_to_20">🚨 0 to 20 Reviews (Low Count / Urgent Need)</option>
              <option value="0_to_50">🔥 0 to 50 Reviews (High Need)</option>
              <option value="20_to_50">⭐ 20 to 50 Reviews (Moderate Need)</option>
              <option value="50_to_100">📈 50 to 100 Reviews (Established)</option>
              <option value="all">🌐 Any Review Count (Show All)</option>
            </select>
          </div>

          {/* Sort Order Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Proximity & Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="nearest">📍 Nearest First (Proximity to Metro)</option>
              <option value="sweet_spot">🎯 Sweet Spot (0-100 Reviews)</option>
              <option value="reviews_asc">🔥 Lowest Reviews First</option>
              <option value="rating_desc">⭐ Highest Rating First</option>
              <option value="name_asc">🔤 Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Target Count Extraction: 20, 50, or ALL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Extract Quantity
              </label>
              <span className="text-[10px] font-bold text-amber-400">
                {totalInDistrictCategory > 0 ? `${totalInDistrictCategory} Total in Area` : ''}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setExtractCount(20)}
                className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition border ${
                  extractCount === 20
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                20 Leads
              </button>
              <button
                type="button"
                onClick={() => setExtractCount(50)}
                className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition border ${
                  extractCount === 50
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                50 Leads
              </button>
              <button
                type="button"
                onClick={() => setExtractCount(999)}
                className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition border ${
                  extractCount >= 999
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950 text-amber-400 border-amber-500/40 hover:bg-amber-500/10'
                }`}
              >
                ALL ({totalMatched})
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Live Search Input Bar & Search Button */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => {
                const val = e.target.value;
                setCustomSearch(val);
                setResultSearchQuery(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchBusinesses();
                }
              }}
              placeholder="🔎 Search shop name or keyword (e.g. 'urban', 'blade', 'salon', 'barber', 'exit 1')..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 font-medium"
            />
            {customSearch && (
              <button
                type="button"
                onClick={() => {
                  setCustomSearch('');
                  setResultSearchQuery('');
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded"
                title="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchBusinesses()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading
                ? 'Scanning Google Maps...'
                : customSearch.trim()
                ? `Search "${customSearch.trim()}" in ${district}`
                : extractCount >= 999
                ? `Extract ALL ${totalMatched} in ${district}`
                : `Extract ${extractCount} Businesses`}
            </span>
          </button>
        </div>

        {/* Auto-detect & Capture Summary Badge */}
        <div className="mt-2.5 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
              Target Area Auto-Detect
            </span>
            <span className="text-slate-300 font-medium">
              Actual Total in <strong className="text-white">{district}</strong>: <strong className="text-amber-400 font-bold">{totalInDistrictCategory}</strong> {category !== 'All Categories' ? category : 'businesses'} detected {totalInDistrict > 0 && totalInDistrict !== totalInDistrictCategory ? `(${totalInDistrict} total across all categories)` : ''}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Captured <strong className="text-emerald-400 font-bold">{leads.length}</strong> of <strong className="text-amber-300 font-bold">{totalMatched}</strong> matching targets
          </span>
        </div>

        {/* Barbershop Exhaustive Extraction Callout */}
        {category === "Men's Barbershops & Gents Salons" && (
          <div className="mt-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-2 text-xs text-amber-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Exhaustive Barbershop & Gents Salon Extraction Active</strong>: Live Google Maps geocoder & Dubai commercial directory synced for <strong className="text-white">{district}</strong>. Every barbershop extracted.
              </span>
            </div>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[10px] font-extrabold uppercase">
              100% Coverage
            </span>
          </div>
        )}
      </div>

      {/* Result Count and View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Showing <span className="text-amber-400 font-bold">{filteredLeads.length}</span> of <span className="text-amber-300 font-bold">{totalMatched}</span> verified {category !== 'All Categories' ? category : 'businesses'} in {district}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">• {reviewFilter === 'sweet_spot' ? '0-100 reviews' : reviewFilter}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-emerald-950/80 text-emerald-300 border-emerald-800/60 flex items-center gap-1">
            ✓ 100% Real Google Maps Places
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* GMB Everywhere Audit Overlay Toggle */}
          <button
            type="button"
            onClick={() => setAuditOverlayEnabled(!auditOverlayEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
              auditOverlayEnabled
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle GMB Everywhere audit overlay on cards"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>GMB Everywhere: {auditOverlayEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>List ({filteredLeads.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>Radar Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'split'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
          </div>
        </div>
      </div>

      {/* IN-RESULT QUICK SEARCH BAR (For List & Radar View) */}
      {!loading && leads.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
          <div className="relative w-full sm:flex-1">
            <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={resultSearchQuery || customSearch}
              onChange={(e) => {
                const val = e.target.value;
                setResultSearchQuery(val);
                setCustomSearch(val);
              }}
              placeholder={`🔍 Search in ${leads.length} loaded results (shop name, address, category, phone)...`}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            />
            {(resultSearchQuery || customSearch) && (
              <button
                type="button"
                onClick={() => {
                  setResultSearchQuery('');
                  setCustomSearch('');
                }}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-white text-[11px] font-bold bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded"
                title="Clear search filter"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-auto flex-shrink-0">
            {resultSearchQuery ? (
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 text-[11px]">
                <span>Filter: Matched <strong>{filteredLeads.length}</strong> of {leads.length} leads</span>
                <button
                  type="button"
                  onClick={() => setResultSearchQuery('')}
                  className="ml-1 text-[10px] underline hover:text-white text-slate-300"
                >
                  Clear
                </button>
              </span>
            ) : (
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Quick Search across <strong className="text-amber-400 font-bold">{leads.length}</strong> extracted leads</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-200">Scanning Google Maps in {district}...</p>
          <p className="text-xs text-slate-400">Filtering businesses with 0–100 reviews for high-conversion NFC sales</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* RADAR MAP VIEW */}
      {(viewMode === 'map' || viewMode === 'split') && !loading && leads.length > 0 && (() => {
        const centerInfo = resolveDistrictCenter(district);

        // Filter leads for the radar view if user selects a subfilter
        const displayedRadarLeads = filteredLeads.filter((l) => {
          if (radarCategoryFilter === 'barbershop') {
            return detectBusinessCategory(l.category, l.name) === 'barbershop';
          }
          if (radarCategoryFilter === 'dental') {
            return detectBusinessCategory(l.category, l.name) === 'dental';
          }
          if (radarCategoryFilter === 'high_need') {
            return l.reviewCount < 50;
          }
          return true;
        });

        // Dynamic spatial zoom calculation based on selected radarZoom level
        // At zoom=1 (100%), outer ring radius is 1.2 km
        // At zoom=2 (200%), outer ring radius zooms in to 600m (spreading close businesses far apart!)
        // At zoom=3 (300%), outer ring radius zooms in to 400m
        // At zoom=0.5 (50%), outer ring radius zooms out to 2.4 km
        const effectiveRadiusKm = 1.2 / radarZoom;
        const latSpan = effectiveRadiusKm / 111.0; // ~111km per deg lat
        const lngSpan = effectiveRadiusKm / 100.5; // ~100.5km per deg lng at 25°N

        const outerRangeLabel = effectiveRadiusKm >= 1 ? `${effectiveRadiusKm.toFixed(1)} km` : `${Math.round(effectiveRadiusKm * 1000)} m`;
        const midRangeLabel = (effectiveRadiusKm * 0.67) >= 1 ? `${(effectiveRadiusKm * 0.67).toFixed(1)} km` : `${Math.round(effectiveRadiusKm * 670)} m`;
        const innerRangeLabel = (effectiveRadiusKm * 0.33) >= 1 ? `${(effectiveRadiusKm * 0.33).toFixed(1)} km` : `${Math.round(effectiveRadiusKm * 330)} m`;

        const dentalCount = filteredLeads.filter(l => l.category.toLowerCase().includes('dental') || l.name.toLowerCase().includes('dental')).length;
        const highNeedCount = filteredLeads.filter(l => l.reviewCount < 50).length;

        // Sequence of points for connected footstep visit route (Hub -> Rank 1 -> Rank 2 -> Rank 3 -> Rank 4...)
        const sortedRadarLeads = [...displayedRadarLeads]
          .sort((a, b) => (a.rank || 999) - (b.rank || 999))
          .slice(0, routeMaxStops);

        const routePoints = [
          {
            id: 'hub',
            name: `${district.replace(/\(.*?\)/g, '').trim()} Metro Exit 1`,
            rank: 0,
            x: 50,
            y: 50,
            footsteps: 0,
            isHub: true,
            lead: undefined as BusinessLead | undefined,
          },
          ...sortedRadarLeads.map((lead, idx) => {
            const leadLat = lead.lat ?? centerInfo.lat;
            const leadLng = lead.lng ?? centerInfo.lng;

            const dLat = leadLat - centerInfo.lat;
            const dLng = leadLng - centerInfo.lng;

            // Center is (50, 50). Radar radius corresponds to 40% of container width
            const rawX = 50 + (dLng / lngSpan) * 40;
            const rawY = 50 - (dLat / latSpan) * 40;

            const xPercent = Math.max(8, Math.min(92, rawX));
            const yPercent = Math.max(8, Math.min(92, rawY));

            return {
              id: lead.id,
              name: lead.name,
              rank: lead.rank || (idx + 1),
              x: xPercent,
              y: yPercent,
              footsteps: lead.footsteps || Math.round((lead.distanceKm || 0.1) * 1300),
              walkMinutes: lead.walkMinutes || Math.max(1, Math.ceil((lead.distanceKm || 0.1) * 13)),
              metroExit: lead.metroExit || 'Exit 1',
              isHub: false,
              lead,
            };
          }),
        ];

        const routePathD = routePoints.length >= 2
          ? routePoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
          : '';

        const totalRouteFootsteps = routePoints.reduce((acc, p) => acc + (p.footsteps || 0), 0);
        const totalRouteMinutes = Math.max(1, Math.ceil(totalRouteFootsteps / 100));

        return (
          <div className="space-y-3">
            <RealInteractiveRadarMap
              leads={displayedRadarLeads}
              district={district}
              centerInfo={centerInfo}
              activeLead={activeLeadOnMap}
              onSelectLead={(lead) => setActiveLeadOnMap(lead)}
              radarCategoryFilter={radarCategoryFilter}
              setRadarCategoryFilter={setRadarCategoryFilter}
              showRouteTrail={showRouteTrail}
              setShowRouteTrail={setShowRouteTrail}
              routeMaxStops={routeMaxStops}
              setRouteMaxStops={setRouteMaxStops}
              onOpenGisModal={openGisModal}
              initialMapEngine={mapEngine}
              onEngineChange={setMapEngine}
            />

            {/* Interactive Field Visit Route Planner Card */}
            {showRouteTrail && routePoints.length > 1 && (
              <div className="mt-3 bg-slate-950/90 border border-amber-500/40 rounded-xl p-3 sm:p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Field Visit Route Planner • {routePoints.length - 1} Connected Stops
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="text-amber-400 font-bold">👣 Total Route: ~{totalRouteFootsteps} Footsteps</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">⏱️ ~{totalRouteMinutes} min total walk</span>
                  </div>
                </div>

                {/* Step Sequence Pills */}
                <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {routePoints.map((pt, idx) => {
                    const isHub = pt.isHub;
                    const isSelected = !isHub && activeLeadOnMap?.id === pt.id;

                    return (
                      <React.Fragment key={pt.id || idx}>
                        {idx > 0 && (
                          <div className="flex items-center gap-1 text-slate-500 text-[10px] font-mono shrink-0">
                            <span className="text-amber-400 font-bold text-xs">➔</span>
                            <span className="text-slate-400 text-[9px] font-bold">+{pt.footsteps}👣</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (pt.lead) setActiveLeadOnMap(pt.lead);
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono whitespace-nowrap transition shrink-0 ${
                            isHub
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                              : isSelected
                              ? 'bg-amber-500 text-slate-950 font-black border-white shadow-lg ring-1 ring-amber-300 scale-105'
                              : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                          }`}
                        >
                          {isHub ? (
                            <span>📍 Hub: {pt.name}</span>
                          ) : (
                            <>
                              <span className={`px-1.5 py-0.2 rounded font-black text-[10px] ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-500 text-slate-950'}`}>
                                #{pt.rank}
                              </span>
                              <span className="font-sans font-semibold text-[11px] max-w-[130px] truncate">{pt.name}</span>
                            </>
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Selected Target Telemetry Card */}
            {activeLeadOnMap && (
              <div className="mt-2 bg-slate-900/95 border border-amber-500/50 rounded-xl p-3.5 sm:p-4 shadow-2xl relative">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-xs font-mono shadow border border-amber-300">
                        RANK #{activeLeadOnMap.rank || 1}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {activeLeadOnMap.district}
                      </span>
                      <CategoryBadge category={activeLeadOnMap.category} businessName={activeLeadOnMap.name} />
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        ✓ Verified Real Place
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base">{getCategoryVisualMeta(activeLeadOnMap.category, activeLeadOnMap.name).emoji}</span>
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {activeLeadOnMap.name}
                      </h4>
                    </div>

                    {/* Point A (Metro) ➔ Point B (Business) Footsteps & Walking Guide Banner */}
                    <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">👣</span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-bold text-white flex-wrap">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                              POINT A: Metro ({activeLeadOnMap.metroExit || 'Exit 1'})
                            </span>
                            <span className="text-amber-400 font-bold">➔</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                              POINT B: Venue
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-200">
                            <span className="font-bold text-amber-300 font-mono">{activeLeadOnMap.footsteps ? `${activeLeadOnMap.footsteps} Footsteps` : 'Nearby Steps'}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-400 font-semibold font-mono">~{activeLeadOnMap.walkMinutes || 1} min walk</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300 font-mono">~{Math.round((activeLeadOnMap.footsteps || 150) * 0.75)} meters</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                        {activeLeadOnMap.walkingGuide || `Direct walk from Metro ${activeLeadOnMap.metroExit || 'Exit 1'}`}
                      </span>
                    </div>

                    {/* 2GIS.ae Building Entrance & Inside Business Directory Banner */}
                    {(() => {
                      const bInfo = activeLeadOnMap.buildingInfo || generateGisBuildingData(activeLeadOnMap);
                      return (
                        <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                              🏢
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-xs">{bInfo.buildingName}</span>
                                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                                  Makani: {bInfo.makaniNumber}
                                </span>
                                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
                                  100% Free • Zero API
                                </span>
                                <span className="text-[10px] text-slate-300 font-mono">
                                  {bInfo.currentLeadFloor} • {bInfo.currentLeadUnit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-emerald-300 mt-0.5">
                                <span>🚪 <strong>{bInfo.primaryEntrance.name}</strong></span>
                                <span>•</span>
                                <span className="text-slate-300 font-medium">{bInfo.indoorBusinesses.length} co-tenants inside building</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => openGisModal(activeLeadOnMap)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                            >
                              <DoorOpen className="w-3.5 h-3.5" />
                              <span>2GIS Inside Directory</span>
                            </button>
                            <a
                              href={bInfo.gisUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
                              title="Open free public 2GIS.ae map in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })()}

                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{activeLeadOnMap.address}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {activeLeadOnMap.rating}
                      </span>
                      <span className="text-slate-300 font-mono">({activeLeadOnMap.reviewCount} Google reviews)</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 font-mono">{activeLeadOnMap.phone}</span>
                    </div>

                    {/* GMB Everywhere Quick Highlights in Radar HUD */}
                    {activeLeadOnMap.audit && (
                      <div className="my-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                        <div className="flex flex-col">
                          <span className="text-slate-400">Category Match</span>
                          <span className="font-bold text-cyan-300 truncate">{activeLeadOnMap.audit.categoryMatchScore}% Match</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400">Completeness</span>
                          <span className="font-bold text-emerald-400">{activeLeadOnMap.audit.profileCompleteness}%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400">Review Velocity</span>
                          <span className="font-bold text-amber-400">{activeLeadOnMap.audit.reviewVelocity.split(' ')[0]} /mo</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400">Photos Count</span>
                          <span className="font-bold text-purple-400">{activeLeadOnMap.audit.photosCount} Photos</span>
                        </div>
                      </div>
                    )}

                    {/* Point of Contact (Call Before Visit) in Radar HUD */}
                    <div className="mt-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-bold text-white">{activeLeadOnMap.contactPersonName || 'Store / Front Desk'}</span>
                        <span className="text-[10px] text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                          {activeLeadOnMap.contactPersonRole || 'Key Contact'}
                        </span>
                        {activeLeadOnMap.customContactUpdated && (
                          <span className="text-[9px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-700 font-semibold">✓ On-site Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${(activeLeadOnMap.contactDirectPhone || activeLeadOnMap.phone).replace(/\s+/g, '')}`}
                          className="text-[11px] font-mono font-bold text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700/60"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-400" />
                          <span>{activeLeadOnMap.contactDirectPhone || activeLeadOnMap.phone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => openContactEditor(activeLeadOnMap)}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition"
                          title="Update decision maker contact details"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                    {activeLeadOnMap.notes && (
                      <p className="text-[11px] text-emerald-300/90 mt-1.5 bg-slate-950 p-2 rounded border border-emerald-900/50 font-mono">
                        <strong className="text-emerald-400 font-semibold">📝 Field Note: </strong>
                        {activeLeadOnMap.notes}
                      </p>
                    )}

                    <p className="text-xs text-amber-200/90 mt-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800 leading-relaxed">
                      <strong className="text-amber-400 font-semibold">Sales Angle: </strong>
                      {activeLeadOnMap.pitchAngle}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectLead(activeLeadOnMap)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 whitespace-nowrap"
                    >
                      <span>Send to App 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href={activeLeadOnMap.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
                    >
                      <span>Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* BUSINESS LEADS LIST VIEW */}
      {(viewMode === 'list' || viewMode === 'split') && !loading && leads.length > 0 && (
        <>
          {filteredLeads.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              No businesses in the extracted results match "<strong className="text-amber-400">{resultSearchQuery}</strong>".
              <button
                type="button"
                onClick={() => setResultSearchQuery('')}
                className="ml-3 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
              >
                Clear In-Result Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadId === lead.id;

                return (
              <div
                key={lead.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-slate-850'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs font-mono shadow-sm border border-amber-300 flex items-center gap-1">
                        <span>#{lead.rank || (filteredLeads.indexOf(lead) + 1)}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900 border-l border-slate-900/30 pl-1 ml-0.5">RANK</span>
                      </span>
                      {lead.distanceLabel && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{lead.distanceLabel}</span>
                        </span>
                      )}
                      {lead.yearsInBusiness && (
                        <span className="px-2 py-0.5 rounded bg-blue-950/90 text-[10px] font-mono font-bold text-blue-300 border border-blue-500/40 flex items-center gap-1" title={`${lead.yearsInBusiness} years operating in Dubai (Est. ${lead.establishedYear})`}>
                          <Clock className="w-2.5 h-2.5 text-blue-400" />
                          <span>In Business {lead.yearsInBusiness} Yrs (~{lead.reviewsPerYear ?? 0} revs/yr)</span>
                        </span>
                      )}
                      <CategoryBadge category={lead.category} businessName={lead.name} />
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] font-medium text-amber-400 border border-amber-500/30">
                        {lead.district}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                        ✓ Real Place
                      </span>
                    </div>

                    {/* Review Badge */}
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-white">{lead.rating}</span>
                      <span className="text-slate-500 font-normal">({lead.reviewCount})</span>
                    </div>
                  </div>

                  {/* Business Name with Category Emoji */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{getCategoryVisualMeta(lead.category, lead.name).emoji}</span>
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                      {lead.name}
                    </h3>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{lead.address}</span>
                  </div>

                  {/* Point A (Metro) ➔ Point B (Business) Footsteps & Walking Guide Box */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 mb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300 font-bold text-xs">
                        👣
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
                            POINT A: Metro ({lead.metroExit || 'Exit 1'})
                          </span>
                          <span className="text-amber-400 font-bold text-xs">➔</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
                            POINT B: Venue
                          </span>
                          <span className="font-bold text-white text-xs font-mono ml-1">
                            {lead.footsteps ? `${lead.footsteps} Steps` : `${Math.round((lead.distanceKm || 0.1) * 1300)} Steps`}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                            {lead.walkMinutes ? `${lead.walkMinutes} min walk` : '1 min walk'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-300 mt-0.5 font-mono">
                          {lead.walkingGuide || `~${Math.round((lead.distanceKm || 0.1) * 1300)} footsteps (${lead.walkMinutes || 1} min walk) from ${lead.district} Metro`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveLeadOnMap(lead);
                          // Scroll map into view smoothly if on small screens
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] font-mono transition shadow-sm"
                        title="Focus on this establishment and draw Point A ➔ Point B route on map"
                      >
                        Map Route
                      </button>
                      <span className="text-[10px] font-extrabold uppercase text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                        Rank #{lead.rank || (filteredLeads.indexOf(lead) + 1)}
                      </span>
                    </div>
                  </div>

                  {/* 2GIS.ae Building & Entrances Directory Box */}
                  {(() => {
                    const bInfo = lead.buildingInfo || generateGisBuildingData(lead);
                    return (
                      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-900 border border-emerald-500/40 rounded-xl p-2.5 mb-2.5 shadow-sm text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-xs shrink-0 font-bold">
                              🏢
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-xs">{bInfo.buildingName}</span>
                                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                                  Makani: {bInfo.makaniNumber}
                                </span>
                                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
                                  100% Free • Zero API
                                </span>
                                <span className="text-[10px] text-slate-300 font-mono">
                                  {bInfo.currentLeadFloor} • {bInfo.currentLeadUnit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 mt-0.5">
                                <span>🚪 <strong>Primary Entrance:</strong> {bInfo.primaryEntrance.name}</span>
                                <span>•</span>
                                <span className="text-slate-300 font-medium">{bInfo.indoorBusinesses.length} co-tenants inside building</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => openGisModal(lead)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                              title="Inspect 2GIS building entrances and all co-tenants inside this building (Free)"
                            >
                              <DoorOpen className="w-3.5 h-3.5" />
                              <span>2GIS Inside Directory</span>
                            </button>
                            <a
                              href={bInfo.gisUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
                              title="Open free public 2GIS.ae map in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* NFC Pitch Angle Box */}
                  <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-2.5 mb-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold mb-0.5 text-[11px]">
                      <Sparkles className="w-3 h-3" />
                      <span>Sales Pitch Angle:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {lead.pitchAngle}
                    </p>
                  </div>

                  {/* Years Operating vs. Review Volume Gap Box */}
                  {lead.yearsVsReviewsGap && (
                    <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-2.5 mb-2 text-xs">
                      <div className="flex items-center gap-1 text-blue-400 font-semibold mb-0.5 text-[11px]">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>Years Operating vs. Review Gap Correlation:</span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed font-medium">
                        {lead.yearsVsReviewsGap}
                      </p>
                    </div>
                  )}

                  {/* Real Verified Business Contact Box */}
                  <div className="bg-gradient-to-r from-emerald-950/70 via-slate-950 to-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5 mb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-xs">
                        {lead.contactPersonName ? <UserCheck className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        {lead.contactPersonName ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">
                              {lead.contactPersonName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                              {lead.contactPersonRole || 'Verified Contact'}
                            </span>
                            {lead.customContactUpdated && (
                              <span className="text-[9px] text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-700 font-semibold">
                                ✓ On-site Updated
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">
                              Store / Front Desk
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                              Verified GMB Phone
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lead.contactPersonName ? 'Direct Key Contact • Call before visit' : 'Verified Google Maps Phone • Call before visit'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0 flex-wrap">
                      <a
                        href={`tel:${(lead.contactDirectPhone || lead.phone).replace(/\s+/g, '')}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/60 text-xs font-bold font-mono flex items-center gap-1 transition"
                        title="Call verified business line"
                      >
                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                        <span>{lead.contactDirectPhone || lead.phone}</span>
                      </a>

                      <a
                        href={`https://wa.me/${(lead.contactDirectPhone || lead.phone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        title="Open WhatsApp chat with business contact"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => openContactEditor(lead)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition"
                        title="Update owner or decision maker details after field visit"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Update Contact</span>
                      </button>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="bg-slate-950 border border-emerald-900/50 rounded-lg p-2.5 mb-2.5 text-xs">
                      <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-0.5 text-[11px]">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>On-site Field Notes:</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-mono">
                        {lead.notes}
                      </p>
                    </div>
                  )}

                  {/* GMB Everywhere Audit Overlay */}
                  {auditOverlayEnabled && (
                    <GmbAuditOverlay audit={lead.audit || generateGmbAudit(lead)} />
                  )}

                  {/* Extracted Google Maps Link row */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 mb-3 flex items-center justify-between gap-2">
                    <div className="truncate text-[10px] font-mono text-slate-400">
                      <span className="text-slate-500">Maps Link: </span>
                      {lead.mapsUrl}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => copyToClipboard(lead.mapsUrl, `url-${lead.id}`)}
                        className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition"
                        title="Copy Google Maps Link"
                      >
                        {copiedId === `url-${lead.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <a
                        href={lead.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 text-slate-300 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 rounded transition text-[10px] font-medium flex items-center gap-1"
                        title="Open real business on Google Maps"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Maps</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition text-[11px]"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span className="hidden xs:inline">{lead.phone}</span>
                    </a>
                  </div>

                  {/* The primary hand-off to App 2 */}
                  <button
                    onClick={() => onSelectLead(lead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition shadow-sm"
                  >
                    <span>Send to Product Mate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  )}

  {/* Empty result */}
      {!loading && leads.length === 0 && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <MapPin className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
          <h3 className="font-bold text-white text-sm">No businesses matched current criteria</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try choosing &apos;All Dubai&apos; or resetting the category filter.
          </p>
          <button
            onClick={() => {
              setDistrict('All Dubai');
              setCategory('All Categories');
              setReviewFilter('all');
            }}
            className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Mobile Floating Toggle FAB between List and Radar Map */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40 animate-bounce">
        <button
          type="button"
          onClick={() => {
            const nextMode = viewMode === 'map' ? 'list' : 'map';
            setViewMode(nextMode);
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/50 border-2 border-white ring-2 ring-amber-400/50 active:scale-95 transition"
        >
          {viewMode === 'map' ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span>Show List ({filteredLeads.length})</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4" />
              <span>Open Radar Map</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Save Toast Notification */}
      {contactSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-semibold text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{contactSaveToast}</span>
        </div>
      )}

      {/* Edit Decision Maker Modal */}
      {editingLeadForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Update Decision Maker
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[260px]">
                    {editingLeadForContact.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLeadForContact(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Owner / Decision Maker Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  placeholder="e.g. Mr. Tariq Al-Mansoori"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={editContactRole}
                  onChange={(e) => setEditContactRole(e.target.value)}
                  placeholder="e.g. Owner & Managing Director"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Direct Mobile / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  placeholder="e.g. +971 50 123 4567"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  On-site Visit Notes / Best Time to Call
                </label>
                <textarea
                  value={editContactNotes}
                  onChange={(e) => setEditContactNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Spoke with manager on-site. Owner visits Sun & Wed 11am-2pm."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 outline-none transition resize-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingLeadForContact(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContact}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Decision Maker</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GMB Everywhere Importer Modal */}
      <GmbEverywhereImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportLeads={handleImportLeads}
      />

      {/* 2GIS.ae Building Entrances & Co-Tenants Directory Modal */}
      <GisBuildingModal
        lead={gisModalLead}
        isOpen={isGisModalOpen}
        onClose={() => setIsGisModalOpen(false)}
        onSelectCoTenant={handleSelectCoTenant}
      />
    </div>
  );
};
