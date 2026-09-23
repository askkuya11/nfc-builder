import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BusinessLead, GisIndoorBusiness, GisBuildingInfo, CollatedCustomerLead } from '../types';
import {
  REAL_DUBAI_BUSINESSES,
  DUBAI_METRO_STATIONS,
  DUBAI_GENERAL_DISTRICTS,
  DUBAI_DISTRICTS,
  getCorridorNeighbors,
} from '../data/realDubaiBusinesses';
export { DUBAI_METRO_STATIONS, DUBAI_GENERAL_DISTRICTS, DUBAI_DISTRICTS };
import { generateGmbAudit } from '../utils/gmbEverywhereAudit';
import { RealInteractiveRadarMap } from './RealInteractiveRadarMap';
import { GisBuildingModal } from './GisBuildingModal';
import { MobileFilterSheet } from './MobileFilterSheet';
import { StationPickerSheet, parseStationInfo } from './StationPickerSheet';
import {
  generateGisBuildingData,
  getBuildingsForMetroStation,
  exportBuildingCompaniesToCsv,
} from '../utils/gisDubaiDirectory';
import { getBusinessHours } from '../utils/businessHoursUtils';
import {
  Search,
  Star,
  SlidersHorizontal,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  TrainFront,
  Store,
  Flame,
  Scissors,
  Coffee,
  Sparkles,
  Utensils,
  Stethoscope,
  Wrench,
  Dumbbell,
  ShoppingBag,
  LayoutGrid,
  X,
  MapPin,
  Building2,
  Download,
  ExternalLink,
  Zap,
  Clock,
  CheckCircle2,
  Plus,
  Layers,
} from 'lucide-react';

interface App1MapScoutProps {
  onSelectLead: (lead: BusinessLead) => void;
  selectedLeadId?: string;
  plannedVisitLeads?: CollatedCustomerLead[];
  onToggleVisitLead?: (lead: BusinessLead) => void;
  onGoToProductMate?: () => void;
}

export const DISTRICT_CENTERS: Record<string, { lat: number; lng: number; sectorName: string; landmark: string }> = {
  'All Metro Stations': { lat: 25.2048, lng: 55.2708, sectorName: 'DUBAI METRO NETWORK • ALL 48 STATIONS', landmark: 'Dubai Red & Green Transit Lines' },
  'All Metro': { lat: 25.2048, lng: 55.2708, sectorName: 'DUBAI METRO NETWORK • ALL 48 STATIONS', landmark: 'Dubai Red & Green Transit Lines' },
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
  'Sobha Realty / Dubai Marina (Red Line)': { lat: 25.0805, lng: 55.1403, sectorName: 'RED LINE • SOBHA REALTY / MARINA SECTOR', landmark: 'Sobha Realty Metro & Marina Walk' },
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
  if (!districtName || districtName.toLowerCase().includes('all metro') || districtName === 'All Metro Stations') {
    return DISTRICT_CENTERS['All Metro Stations'];
  }
  if (DISTRICT_CENTERS[districtName]) return DISTRICT_CENTERS[districtName];
  const clean = districtName.toLowerCase();
  for (const [key, value] of Object.entries(DISTRICT_CENTERS)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return value;
    }
  }
  return DISTRICT_CENTERS['All Metro Stations'];
};

const CATEGORIES = [
  { label: 'All', value: 'all', icon: LayoutGrid },
  { label: 'Barbershop', value: "Men's Barbershops & Gents Salons", icon: Scissors },
  { label: 'Cafes', value: 'Cafes', icon: Coffee },
  { label: 'Ladies Salon', value: 'Ladies Salons & Spas', icon: Sparkles },
  { label: 'Restaurants', value: 'Restaurants', icon: Utensils },
  { label: 'Dental Clinic', value: 'Dental Clinic', icon: Stethoscope },
  { label: 'Automotive', value: 'Automotive', icon: Wrench },
  { label: 'Gyms', value: 'Fitness & Gyms', icon: Dumbbell },
  { label: 'Retail', value: 'Retail & Boutiques', icon: ShoppingBag },
];

export const App1MapScout: React.FC<App1MapScoutProps> = ({
  onSelectLead,
  selectedLeadId,
  plannedVisitLeads = [],
  onToggleVisitLead,
  onGoToProductMate,
}) => {
  const [district, setDistrict] = useState<string>('All Metro Stations');
  const [category, setCategory] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('sweet_spot');
  const [sortBy, setSortBy] = useState<'nearest' | 'sweet_spot' | 'reviews_asc' | 'rating_desc' | 'name_asc'>('nearest');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [scoutAdjacentCorridor, setScoutAdjacentCorridor] = useState<boolean>(true);
  const [targetCount, setTargetCount] = useState<number>(50);

  const [leads, setLeads] = useState<BusinessLead[]>(() => {
    const sourceList = REAL_DUBAI_BUSINESSES.slice(0, 50);
    return sourceList.map(b => ({
      ...b,
      audit: generateGmbAudit(b as any),
      buildingInfo: generateGisBuildingData(b as any),
    })) as BusinessLead[];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeLeadOnMap, setActiveLeadOnMap] = useState<BusinessLead | null>(null);
  const [mapEngine, setMapEngine] = useState<'google' | '2gis'>('google');
  const [showRouteTrail, setShowRouteTrail] = useState<boolean>(true);
  const [routeMaxStops, setRouteMaxStops] = useState<number>(10);
  const [radarCategoryFilter, setRadarCategoryFilter] = useState<'all' | 'barbershop' | 'dental' | 'high_need'>('all');

  // Expanded pitch details state per lead
  const [expandedPitchId, setExpandedPitchId] = useState<string | null>(null);

  // Modal sheets
  const [isStationSheetOpen, setIsStationSheetOpen] = useState<boolean>(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);

  // 2GIS Building & Entrance Directory modal state
  const [gisModalLead, setGisModalLead] = useState<BusinessLead | null>(null);
  const [isGisModalOpen, setIsGisModalOpen] = useState<boolean>(false);

  // Buildings located within the active metro station sector
  const areaBuildings = useMemo(() => {
    return getBuildingsForMetroStation(district);
  }, [district]);

  const totalDistrictBusinessesInBuildings = useMemo(() => {
    return areaBuildings.reduce(
      (acc, b) => acc + (b.indoorBusinesses?.length || b.totalCompaniesCount || 0),
      0
    );
  }, [areaBuildings]);

  const [selectedBuildingName, setSelectedBuildingName] = useState<string>('all_buildings');
  const [downloadCsvSuccess, setDownloadCsvSuccess] = useState<boolean>(false);
  const [autoTargetPulse, setAutoTargetPulse] = useState<boolean>(false);

  // Automatically reset building selection when switching metro stations
  useEffect(() => {
    setSelectedBuildingName('all_buildings');
  }, [district]);

  const activeBuilding = useMemo(() => {
    if (selectedBuildingName && selectedBuildingName !== 'all_buildings') {
      const found = areaBuildings.find((b) => b.buildingName === selectedBuildingName);
      if (found) return found;
    }
    return areaBuildings[0] || null;
  }, [areaBuildings, selectedBuildingName]);

  const handleAutoSelectBuilding = () => {
    if (!areaBuildings.length) return;
    setAutoTargetPulse(true);
    setTimeout(() => setAutoTargetPulse(false), 1200);

    let best = areaBuildings[0];
    let maxScore = -1;
    for (const b of areaBuildings) {
      const sweetSpotCount = b.indoorBusinesses.filter((biz) => biz.reviewCount < 50).length;
      const score = sweetSpotCount * 10 + b.indoorBusinesses.length;
      if (score > maxScore) {
        maxScore = score;
        best = b;
      }
    }
    setSelectedBuildingName(best.buildingName);
  };

  const handleDownloadActiveBuildingCsv = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeBuilding) return;

    if (selectedBuildingName === 'all_buildings') {
      // Export all companies across all buildings in this metro area
      const combinedCompanies = areaBuildings.flatMap((b) =>
        b.indoorBusinesses.map((biz) => ({
          ...biz,
          buildingName: b.buildingName,
          makaniNumber: b.makaniNumber,
          metroStation: b.metroStation,
          distanceFromMetro: b.distanceFromMetro,
          gisUrl: b.gisUrl,
          googleMapsUrl: b.googleMapsUrl,
        }))
      );

      const headers = [
        'Building Name',
        'Makani Number',
        'Metro Station',
        'Metro Exit & Distance',
        'Company Name',
        'Category / Industry',
        'Floor',
        'Unit / Suite Number',
        'Opening Time',
        'Closing Time',
        'Days Open',
        'Operating Hours',
        'Current Status (GST)',
        'Phone',
        'Google Star Rating',
        'Review Count',
        'Pitch Opportunity',
        '2GIS Map URL',
        'Google Maps URL',
        'Direct 5-Star Review URL',
      ];

      const rows = combinedCompanies.map((b: any) => [
        `"${(b.buildingName || '').replace(/"/g, '""')}"`,
        `"${(b.makaniNumber || '').replace(/"/g, '""')}"`,
        `"${(b.metroStation || parsedCurrentStation.displayName).replace(/"/g, '""')}"`,
        `"${(b.distanceFromMetro || '').replace(/"/g, '""')}"`,
        `"${(b.name || '').replace(/"/g, '""')}"`,
        `"${(b.category || '').replace(/"/g, '""')}"`,
        `"${(b.floor || '').replace(/"/g, '""')}"`,
        `"${(b.unitNumber || '').replace(/"/g, '""')}"`,
        `"${(b.openingTime || '09:00 AM').replace(/"/g, '""')}"`,
        `"${(b.closingTime || '09:00 PM').replace(/"/g, '""')}"`,
        `"${(b.daysOpen || 'Daily').replace(/"/g, '""')}"`,
        `"${(b.hoursLabel || '09:00 AM - 09:00 PM').replace(/"/g, '""')}"`,
        `"${b.isOpenNow ? 'Open Now' : 'Closed'}"`,
        `"${(b.phone || '').replace(/"/g, '""')}"`,
        `"${b.rating || 0}"`,
        `"${b.reviewCount || 0}"`,
        `"${(b.pitchOpportunity || 'medium').toUpperCase()}"`,
        `"${b.gisUrl || ''}"`,
        `"${b.googleMapsUrl || ''}"`,
        `"${(b.directReviewUrl || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `${parsedCurrentStation.displayName.replace(/[^a-zA-Z0-9]/g, '_')}_All_Nearby_Buildings_Directory.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      exportBuildingCompaniesToCsv(activeBuilding);
    }

    setDownloadCsvSuccess(true);
    setTimeout(() => setDownloadCsvSuccess(false), 2500);
  };

  const parsedCurrentStation = useMemo(() => {
    return parseStationInfo(district);
  }, [district]);

  const activeSelectedStation = useMemo(() => {
    if (!district || district.toLowerCase().includes('all metro') || district === 'All Metro Stations' || district === 'all') {
      return 'All Metro Stations';
    }
    const clean = district.toLowerCase().replace(/\(.*?\)/g, '').trim();
    const found = DUBAI_METRO_STATIONS.find(
      (s) =>
        s.toLowerCase().includes(clean) ||
        clean.includes(s.toLowerCase().replace(/\(.*?\)/g, '').trim())
    );
    return found || district;
  }, [district]);

  const redStations = useMemo(
    () => DUBAI_METRO_STATIONS.filter((s) => s.includes('Red Line') || s.includes('Red & Green')),
    []
  );
  const greenStations = useMemo(
    () => DUBAI_METRO_STATIONS.filter((s) => s.includes('Green Line') && !s.includes('Red & Green')),
    []
  );

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
      const bName = parentLead?.buildingInfo?.buildingName || activeBuilding?.buildingName || 'Dubai Commercial Center';
      const syntheticLead: BusinessLead = {
        id: coTenant.id,
        name: coTenant.name,
        category: coTenant.category,
        rating: coTenant.rating,
        reviewCount: coTenant.reviewCount,
        district: parentLead ? parentLead.district : district,
        address: `${bName}, ${coTenant.floor}, Unit ${coTenant.unitNumber}, ${parentLead?.district || district}, Dubai`,
        phone: coTenant.phone || '+971 4 228 9911',
        placeId: `gis-${coTenant.id}`,
        mapsUrl: coTenant.directReviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coTenant.name + ' Dubai')}`,
        directReviewUrl: coTenant.directReviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coTenant.name + ' Dubai')}`,
        pitchOpportunity: coTenant.pitchOpportunity || 'high',
        pitchAngle: `High-value co-tenant inside ${bName} (${coTenant.floor}, Unit ${coTenant.unitNumber}). Operating: ${coTenant.openingTime} - ${coTenant.closingTime}.`,
        lat: parentLead?.lat || activeBuilding?.lat,
        lng: parentLead?.lng || activeBuilding?.lng,
        footsteps: parentLead?.footsteps || 60,
        walkMinutes: parentLead?.walkMinutes || 2,
        metroExit: parentLead?.metroExit || activeBuilding?.metroExit,
        walkingGuide: `Inside ${bName} (${coTenant.floor})`,
        buildingInfo: parentLead?.buildingInfo || activeBuilding || undefined,
      };
      syntheticLead.audit = generateGmbAudit(syntheticLead as any);
      setLeads((prev) => [syntheticLead, ...prev]);
      onSelectLead(syntheticLead);
      setActiveLeadOnMap(syntheticLead);
    }
    setIsGisModalOpen(false);
  };

  const filteredLeads = useMemo(() => {
    const query = (customSearch || '').toLowerCase().trim();
    if (!query) return leads;
    return leads.filter((l) =>
      l.name.toLowerCase().includes(query) ||
      l.address.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query) ||
      l.district.toLowerCase().includes(query) ||
      (l.phone && l.phone.toLowerCase().includes(query)) ||
      (l.contactPersonName && l.contactPersonName.toLowerCase().includes(query)) ||
      (l.pitchAngle && l.pitchAngle.toLowerCase().includes(query))
    );
  }, [leads, customSearch]);

  const convertIndoorBusinessToLead = useCallback(
    (biz: GisIndoorBusiness, building: GisBuildingInfo, metroDistrict: string): BusinessLead => {
      const hash = Math.abs(
        biz.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      );
      const lead: BusinessLead = {
        id: biz.id,
        name: biz.name,
        category: biz.category,
        rating: biz.rating,
        reviewCount: biz.reviewCount,
        district: metroDistrict,
        address: `${building.buildingName}, ${biz.floor}, Unit ${biz.unitNumber}, ${metroDistrict}, Dubai`,
        phone: biz.phone,
        placeId: `gis-${biz.id}`,
        mapsUrl:
          biz.googleMapsUrl ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            biz.name + ' ' + building.buildingName + ' Dubai'
          )}`,
        directReviewUrl:
          biz.directReviewUrl ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            biz.name + ' ' + building.buildingName + ' Dubai'
          )}`,
        pitchOpportunity: biz.pitchOpportunity || (biz.reviewCount < 50 ? 'high' : 'medium'),
        pitchAngle: `Located inside ${building.buildingName} (${biz.floor}, Unit ${biz.unitNumber}). Operating: ${biz.openingTime} – ${biz.closingTime}. High-conversion NFC Google review card opportunity (${biz.reviewCount} reviews).`,
        lat: building.lat + ((hash % 30) - 15) * 0.00002,
        lng: building.lng + (((hash >> 2) % 30) - 15) * 0.00002,
        footsteps: 40,
        walkMinutes: 1,
        metroExit: building.metroExit,
        walkingGuide: `Inside ${building.buildingName} (${biz.floor})`,
        buildingInfo: building,
        verifiedReal: true,
      };
      lead.audit = generateGmbAudit(lead as any);
      return lead;
    },
    []
  );

  const fetchBusinesses = useCallback(
    async (
      targetDistrict = district,
      targetCategory = category,
      targetReview = reviewFilter,
      targetSort = sortBy,
      targetQuery?: string,
      targetBuilding = selectedBuildingName
    ) => {
      setLoading(true);
      setError(null);
      const queryToSend = targetQuery !== undefined ? targetQuery : customSearch;
      const isAllCategory =
        !targetCategory ||
        targetCategory === 'All Categories' ||
        targetCategory === 'All' ||
        targetCategory === 'all';

      const isAllBuildingsMode = !targetBuilding || targetBuilding === 'all_buildings';

      // 1. SPECIFIC BUILDING SELECTED (e.g. Building 52 A Al Khubaise, Al Zarooni, etc.)
      if (!isAllBuildingsMode) {
        const buildingsForDist = getBuildingsForMetroStation(targetDistrict);
        const matchedBuilding =
          buildingsForDist.find((b) => b.buildingName === targetBuilding) ||
          areaBuildings.find((b) => b.buildingName === targetBuilding) ||
          activeBuilding;

        if (matchedBuilding && matchedBuilding.indoorBusinesses.length > 0) {
          let indoorLeads = matchedBuilding.indoorBusinesses.map((biz) =>
            convertIndoorBusinessToLead(biz, matchedBuilding, targetDistrict)
          );

          // If category filter is applied (not 'all') or search query entered:
          if (!isAllCategory || queryToSend.trim()) {
            const catClean = (targetCategory || '').toLowerCase();
            const qClean = queryToSend.toLowerCase().trim();

            indoorLeads = indoorLeads.filter((l) => {
              const catMatch =
                isAllCategory ||
                l.category.toLowerCase().includes(catClean) ||
                catClean.includes(l.category.toLowerCase());
              const qMatch =
                !qClean ||
                l.name.toLowerCase().includes(qClean) ||
                l.category.toLowerCase().includes(qClean) ||
                l.address.toLowerCase().includes(qClean);
              return catMatch && qMatch;
            });
          }

          // Apply review filter if requested
          if (targetReview && targetReview !== 'all') {
            indoorLeads = indoorLeads.filter((l) => {
              if (targetReview === 'sweet_spot' || targetReview === '21-50')
                return l.reviewCount >= 21 && l.reviewCount <= 50;
              if (targetReview === 'under_50' || targetReview === '<50')
                return l.reviewCount < 50;
              if (targetReview === 'under_20') return l.reviewCount <= 20;
              if (targetReview === '50_plus') return l.reviewCount > 50;
              return true;
            });
          }

          // Sort indoor leads
          if (targetSort === 'reviews_asc') {
            indoorLeads.sort((a, b) => a.reviewCount - b.reviewCount);
          } else if (targetSort === 'rating_asc') {
            indoorLeads.sort((a, b) => a.rating - b.rating);
          } else if (targetSort === 'reviews_desc') {
            indoorLeads.sort((a, b) => b.reviewCount - a.reviewCount);
          }

          setLeads(indoorLeads);
          if (indoorLeads.length > 0) {
            setActiveLeadOnMap(indoorLeads[0]);
          }
          setLoading(false);
          return;
        }
      }

      // 2. ALL BUILDINGS IN METRO MODE
      try {
        const response = await fetch('/api/search-businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            district: targetDistrict,
            category: isAllCategory ? 'All Categories' : targetCategory,
            reviewRange: targetReview,
            count: targetCount || 50,
            customQuery: queryToSend,
            sortBy: targetSort,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to load businesses');
        }

        const data = await response.json();
        if (data.businesses && Array.isArray(data.businesses)) {
          const buildingsForDist = getBuildingsForMetroStation(targetDistrict);
          const allBuildingLeads = buildingsForDist.flatMap((b) =>
            b.indoorBusinesses.map((biz) => convertIndoorBusinessToLead(biz, b, targetDistrict))
          );

          const seen = new Set<string>();
          const combined: BusinessLead[] = [];

          // Add building leads first if they match
          for (const bl of allBuildingLeads) {
            const catMatch =
              isAllCategory ||
              bl.category.toLowerCase().includes((targetCategory || '').toLowerCase());
            const qMatch =
              !queryToSend.trim() ||
              bl.name.toLowerCase().includes(queryToSend.toLowerCase()) ||
              bl.category.toLowerCase().includes(queryToSend.toLowerCase());
            if (catMatch && qMatch && !seen.has(bl.name.toLowerCase())) {
              seen.add(bl.name.toLowerCase());
              combined.push(bl);
            }
          }

          // Add remaining API leads
          for (const b of data.businesses) {
            if (!seen.has(b.name.toLowerCase())) {
              seen.add(b.name.toLowerCase());
              combined.push({
                ...b,
                audit: b.audit || generateGmbAudit(b),
                buildingInfo: b.buildingInfo || generateGisBuildingData(b),
              });
            }
          }

          setLeads(combined.slice(0, targetCount || 50));
          if (combined.length > 0) {
            setActiveLeadOnMap(combined[0]);
          }
        }
      } catch (_err: any) {
        const cleanDist = targetDistrict.replace(/\(.*?\)/g, '').trim().toLowerCase();
        const buildingsForDist = getBuildingsForMetroStation(targetDistrict);
        const allBuildingLeads = buildingsForDist.flatMap((b) =>
          b.indoorBusinesses.map((biz) => convertIndoorBusinessToLead(biz, b, targetDistrict))
        );

        const localFiltered = REAL_DUBAI_BUSINESSES.filter((b) => {
          if (targetDistrict !== 'All Dubai' && !b.district.toLowerCase().includes(cleanDist))
            return false;
          if (!isAllCategory && b.category !== targetCategory) return false;
          return true;
        }).map((b) => ({
          ...b,
          audit: generateGmbAudit(b as any),
          buildingInfo: generateGisBuildingData(b as any),
        })) as BusinessLead[];

        const seen = new Set<string>();
        const combined: BusinessLead[] = [];

        for (const bl of allBuildingLeads) {
          const catMatch =
            isAllCategory ||
            bl.category.toLowerCase().includes((targetCategory || '').toLowerCase());
          const qMatch =
            !queryToSend.trim() ||
            bl.name.toLowerCase().includes(queryToSend.toLowerCase()) ||
            bl.category.toLowerCase().includes(queryToSend.toLowerCase());
          if (catMatch && qMatch && !seen.has(bl.name.toLowerCase())) {
            seen.add(bl.name.toLowerCase());
            combined.push(bl);
          }
        }

        for (const b of localFiltered) {
          if (!seen.has(b.name.toLowerCase())) {
            seen.add(b.name.toLowerCase());
            combined.push(b);
          }
        }

        setLeads(combined.slice(0, targetCount || 50));
        if (combined.length > 0) {
          setActiveLeadOnMap(combined[0]);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      district,
      category,
      reviewFilter,
      sortBy,
      customSearch,
      targetCount,
      selectedBuildingName,
      areaBuildings,
      activeBuilding,
      convertIndoorBusinessToLead,
    ]
  );

  useEffect(() => {
    fetchBusinesses(district, category, reviewFilter, sortBy, customSearch, selectedBuildingName);
  }, [district, category, reviewFilter, sortBy, selectedBuildingName, fetchBusinesses]);

  // Dynamic CTA button label based on selected metro, selected building, and selected category
  const dynamicScoutButtonText = useMemo(() => {
    const metroName = parsedCurrentStation.displayName;
    const isAllCat =
      !category ||
      category === 'all' ||
      category === 'All Categories' ||
      category === 'All';

    const activeCatObj = CATEGORIES.find((c) => c.value === category);
    const catLabel = customSearch.trim()
      ? `"${customSearch.trim()}"`
      : isAllCat
      ? 'all businesses'
      : activeCatObj?.label || category;

    const isAllBuildings = !selectedBuildingName || selectedBuildingName === 'all_buildings';

    if (isAllBuildings) {
      if (isAllCat && !customSearch.trim()) {
        return `Scout ${targetCount} all businesses at ${metroName}`;
      }
      return `Scout ${targetCount} ${catLabel} at ${metroName}`;
    } else {
      const bName = activeBuilding?.buildingName || selectedBuildingName;
      const count = activeBuilding?.indoorBusinesses?.length || 22;
      if (isAllCat && !customSearch.trim()) {
        return `Scout all ${count} businesses in ${bName} at ${metroName}`;
      }
      return `Scout ${catLabel} in ${bName} at ${metroName}`;
    }
  }, [
    parsedCurrentStation.displayName,
    category,
    customSearch,
    selectedBuildingName,
    activeBuilding,
    targetCount,
  ]);

  // Corridor station names with accurate line sequence resolution
  const corridorStations = useMemo(() => {
    const rawNeighbors = getCorridorNeighbors(district);
    return {
      prevRaw: rawNeighbors.prev,
      currRaw: rawNeighbors.curr,
      nextRaw: rawNeighbors.next,
      prev: parseStationInfo(rawNeighbors.prev).displayName,
      curr: parseStationInfo(rawNeighbors.curr).displayName,
      next: parseStationInfo(rawNeighbors.next).displayName,
      line: rawNeighbors.line,
    };
  }, [district]);

  return (
    <div className="flex flex-col gap-4 pb-28 sm:pb-36 max-w-xl mx-auto text-white">
      {/* 1. TARGET METRO & BUILDING CONTROLS CONTAINER */}
      <section aria-label="Target Metro Station and Buildings" className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
        {/* Header: Title and Map View Button */}
        <div className="flex items-center justify-between pb-1 border-b border-[#26223d]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ec1a65]/20 border border-[#ec1a65]/40 flex items-center justify-center text-[#ff5c8a] shadow-sm">
              <TrainFront className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Target Metro & Buildings
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#110f22] text-[#00b4d8] border border-[#26223d]">
                  2GIS Dubai
                </span>
              </div>
              <span className="text-[11px] text-[#8e8aab] block">
                Dubai Red & Green transit corridors • {filteredLeads.length} leads in vicinity
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsStationSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#110f22] hover:bg-[#1a172e] border border-[#26223d] hover:border-[#00b4d8]/60 text-xs font-bold text-[#00b4d8] transition-all shrink-0 shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-[#00b4d8]" />
            <span>Map View</span>
          </button>
        </div>

        {/* 1. Target Metro Station Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="metro-station-select" className="font-bold text-[#b4b0d0] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <TrainFront className="w-3.5 h-3.5 text-[#ff5c8a]" />
              <span>Target Metro Station:</span>
            </label>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                parsedCurrentStation.isInterchange
                  ? 'bg-gradient-to-r from-[#ff3366]/20 to-[#10b981]/20 text-white border border-white/20'
                  : parsedCurrentStation.isGreen
                  ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/40'
                  : 'bg-[#ff3366]/15 text-[#ff708f] border border-[#ff3366]/40'
              }`}
            >
              {parsedCurrentStation.isInterchange ? 'Red & Green Interchange' : parsedCurrentStation.lineLabel}
            </span>
          </div>

          <div className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 z-10">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  parsedCurrentStation.isInterchange
                    ? 'bg-gradient-to-r from-[#ff3366] to-[#10b981]'
                    : parsedCurrentStation.isGreen
                    ? 'bg-[#10b981]'
                    : 'bg-[#ff3366]'
                }`}
              />
            </div>

            <select
              id="metro-station-select"
              aria-label="Select Target Metro Station"
              value={activeSelectedStation}
              onChange={(e) => {
                const newStation = e.target.value;
                setDistrict(newStation);
                setSelectedBuildingName('all_buildings');
                fetchBusinesses(newStation, category);
              }}
              className="w-full appearance-none bg-[#110f22] hover:bg-[#181530] border border-[#26223d] hover:border-[#ec1a65]/50 focus:border-[#ec1a65] focus:outline-none focus:ring-1 focus:ring-[#ec1a65] rounded-xl pl-8 pr-9 py-2.5 text-xs sm:text-[13px] font-bold text-white transition-all cursor-pointer truncate shadow-inner"
            >
              <option value="All Metro Stations" className="bg-[#161426] text-[#00b4d8] font-bold py-1.5">
                🚇 All Metro Stations (48 Stations • Red & Green Lines)
              </option>
              <optgroup label="🔴 Red Line Stations (30)">
                {redStations.map((s) => {
                  const info = parseStationInfo(s);
                  return (
                    <option key={s} value={s} className="bg-[#161426] text-white py-1">
                      {info.displayName} — {info.area.split('/')[0].trim()}
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="🟢 Green Line Stations (18)">
                {greenStations.map((s) => {
                  const info = parseStationInfo(s);
                  return (
                    <option key={s} value={s} className="bg-[#161426] text-white py-1">
                      {info.displayName} — {info.area.split('/')[0].trim()}
                    </option>
                  );
                })}
              </optgroup>
            </select>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8e8aab]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 2. Nearby Buildings to Metro Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="nearby-building-select" className="font-bold text-[#b4b0d0] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>Nearby Commercial Buildings:</span>
            </label>
            <span className="text-[10px] font-mono text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded-full border border-[#00b4d8]/30 font-bold">
              {areaBuildings.length} Towers • {totalDistrictBusinessesInBuildings} Companies
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-[#00b4d8] z-10">
                <Building2 className="w-4 h-4" />
              </div>

              <select
                id="nearby-building-select"
                aria-label="Select Nearby Building to Metro"
                value={selectedBuildingName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBuildingName(val);
                }}
                className="w-full appearance-none bg-[#110f22] hover:bg-[#181530] border border-[#26223d] hover:border-[#00b4d8]/50 focus:border-[#00b4d8] focus:outline-none focus:ring-1 focus:ring-[#00b4d8] rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-[13px] font-bold text-white transition-all cursor-pointer truncate shadow-inner"
              >
                {/* 1st on the list: All Buildings in Nearby Metro */}
                <option value="all_buildings" className="bg-[#161426] text-[#00b4d8] font-extrabold py-1.5">
                  🏢 All Buildings in Nearby Metro ({totalDistrictBusinessesInBuildings} businesses • {areaBuildings.length} towers)
                </option>

                {/* Next: Each individual building with its business count */}
                <optgroup
                  label={`🏢 Nearby Towers at ${parsedCurrentStation.displayName} (${areaBuildings.length})`}
                  className="bg-[#161426] text-white"
                >
                  {areaBuildings.map((b) => (
                    <option key={b.buildingName} value={b.buildingName} className="bg-[#161426] text-white py-1">
                      {b.buildingName} ({b.indoorBusinesses?.length || b.totalCompaniesCount} businesses • {b.distanceFromMetro || b.metroExit})
                    </option>
                  ))}
                </optgroup>
              </select>

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8e8aab]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Auto-Target Best Building Button */}
            <button
              type="button"
              onClick={handleAutoSelectBuilding}
              className={`h-10 px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition shrink-0 shadow-md ${
                autoTargetPulse
                  ? 'scale-105 bg-gradient-to-r from-[#10b981] to-[#059669] text-white border-transparent'
                  : 'bg-[#110f22] border-[#26223d] text-[#00b4d8] hover:text-white hover:border-[#00b4d8]'
              }`}
              title="Auto-select commercial building with highest sweet spot review opportunity"
            >
              <Zap className="w-3.5 h-3.5 fill-[#00b4d8]" />
              <span>Auto-Best</span>
            </button>
          </div>
        </div>

        {/* 3. Station Corridor Box (Interactive Metro Track Route & iOS Switch) */}
        <div className="bg-[#110f22] border border-[#26223d] hover:border-[#ec1a65]/30 transition-colors rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 shadow-md">
          {/* Top Corridor Control Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ec1a65]/15 border border-[#ec1a65]/30 flex items-center justify-center text-[#ff5c8a] shrink-0">
                <TrainFront className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  Station Corridor Sweep
                </span>
                <span className="text-[10px] text-[#8e8aab] hidden sm:block">
                  Scout adjacent stops along active metro line
                </span>
              </div>
            </div>

            {/* Custom iOS Toggle Switch for Corridor */}
            <button
              type="button"
              role="switch"
              aria-checked={scoutAdjacentCorridor}
              onClick={() => setScoutAdjacentCorridor(!scoutAdjacentCorridor)}
              className="flex items-center gap-2 cursor-pointer select-none group focus:outline-none"
            >
              <span className="text-xs font-medium text-[#a5a0c0] group-hover:text-white transition-colors">
                Adjacent Sweep
              </span>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  scoutAdjacentCorridor ? 'bg-[#ec1a65]' : 'bg-[#2a2542]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    scoutAdjacentCorridor ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Interactive Metro Track Route Diagram */}
          <div className="flex flex-col gap-1 w-full pt-1 pb-1">
            {/* Row 1: Dead-center aligned Track Rail & Node Circles */}
            <div className="relative h-6 flex items-center justify-between px-4 w-full">
              <div
                className={`absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-all duration-300 ${
                  scoutAdjacentCorridor
                    ? 'bg-gradient-to-r from-[#ec1a65]/40 via-[#ec1a65] to-[#ec1a65]/40 shadow-[0_0_10px_#ec1a65]'
                    : 'bg-[#3b3252]'
                }`}
              />

              {/* Prev Node Dot */}
              <div className="w-1/3 flex justify-start relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setDistrict(corridorStations.prevRaw);
                    fetchBusinesses(corridorStations.prevRaw, category);
                  }}
                  className="w-5 h-5 rounded-full bg-[#161426] border-2 border-[#8e8aab] hover:border-[#ff5c8a] flex items-center justify-center transition-colors group focus:outline-none"
                  title={`Switch to ${corridorStations.prev}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8e8aab] group-hover:bg-[#ff5c8a]" />
                </button>
              </div>

              {/* Core Node Dot */}
              <div className="w-1/3 flex justify-center relative z-10">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inset-0 rounded-full bg-[#ec1a65] opacity-50" />
                  <div className="w-5 h-5 rounded-full bg-[#ec1a65] border-2 border-white shadow-lg shadow-[#ec1a65]/50 flex items-center justify-center relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Next Node Dot */}
              <div className="w-1/3 flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setDistrict(corridorStations.nextRaw);
                    fetchBusinesses(corridorStations.nextRaw, category);
                  }}
                  className="w-5 h-5 rounded-full bg-[#161426] border-2 border-[#8e8aab] hover:border-[#ff5c8a] flex items-center justify-center transition-colors group focus:outline-none"
                  title={`Switch to ${corridorStations.next}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8e8aab] group-hover:bg-[#ff5c8a]" />
                </button>
              </div>
            </div>

            {/* Row 2: Station Labels */}
            <div className="grid grid-cols-3 gap-1 text-center w-full pt-1">
              {/* Prev Station Label */}
              <button
                type="button"
                onClick={() => {
                  setDistrict(corridorStations.prevRaw);
                  fetchBusinesses(corridorStations.prevRaw, category);
                }}
                className="flex flex-col items-start text-left group w-full transition-transform active:scale-95 min-w-0"
              >
                <span className="text-[11px] font-semibold text-[#8e8aab] group-hover:text-white truncate w-full transition-colors">
                  {corridorStations.prev}
                </span>
                <span className="text-[9px] text-[#6d698a] group-hover:text-[#ff9bbb] transition-colors">
                  ← Prev Stop
                </span>
              </button>

              {/* Core Station Label */}
              <div className="flex flex-col items-center text-center w-full min-w-0">
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#ec1a65]/30 border border-[#ec1a65]/50 truncate max-w-full">
                  {corridorStations.curr}
                </span>
                <span className="text-[9px] text-[#ff9bbb] font-bold mt-0.5">
                  ● Core Station
                </span>
              </div>

              {/* Next Station Label */}
              <button
                type="button"
                onClick={() => {
                  setDistrict(corridorStations.nextRaw);
                  fetchBusinesses(corridorStations.nextRaw, category);
                }}
                className="flex flex-col items-end text-right group w-full transition-transform active:scale-95 min-w-0"
              >
                <span className="text-[11px] font-semibold text-[#8e8aab] group-hover:text-white truncate w-full transition-colors">
                  {corridorStations.next}
                </span>
                <span className="text-[9px] text-[#6d698a] group-hover:text-[#ff9bbb] transition-colors">
                  Next Stop →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Active Target Building Details Suite */}
        {activeBuilding && (
          <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-3.5 space-y-3 shadow-md">
            {selectedBuildingName === 'all_buildings' ? (
              /* All Buildings Overview Mode */
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#27233e]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#8e8aab] mb-0.5">
                      <span className="font-mono bg-[#161426] px-2 py-0.5 rounded border border-[#27233e] text-[#00b4d8] font-bold">
                        {areaBuildings.length} Commercial Towers
                      </span>
                      <span className="text-[#34d399] font-medium flex items-center gap-1">
                        <TrainFront className="w-3 h-3" />
                        {parsedCurrentStation.displayName} Corridor
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                      All Buildings in Nearby {parsedCurrentStation.displayName} Metro
                    </h4>
                    <p className="text-xs text-[#8e8aab] mt-0.5">
                      Complete multi-tenant corporate directory with {totalDistrictBusinessesInBuildings} businesses
                    </p>
                  </div>

                  {/* Area Summary Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap sm:justify-end shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[#064e3b]/40 text-[#34d399] border border-[#10b981]/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {areaBuildings.reduce((acc, b) => acc + b.indoorBusinesses.filter((x) => x.isOpenNow).length, 0)} Open Now
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#241c0a] text-[#fbbf24] border border-[#785a10] flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {areaBuildings.reduce((acc, b) => acc + b.indoorBusinesses.filter((x) => x.reviewCount < 50).length, 0)} Sweet Spot
                    </span>
                  </div>
                </div>

                {/* Action Buttons for All Buildings */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {/* 1. Open 2GIS Area Location */}
                  <a
                    href={activeBuilding?.gisUrl || 'https://2gis.ae/dubai'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3 rounded-xl bg-[#00b4d8]/15 hover:bg-[#00b4d8]/25 border border-[#00b4d8]/40 hover:border-[#00b4d8] text-[#00b4d8] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 group"
                    title="Open this metro sector directly on 2GIS Dubai"
                  >
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    <span className="truncate">2GIS Area Hub</span>
                  </a>

                  {/* 2. Open Google Maps */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${parsedCurrentStation.displayName} Metro Station Dubai commercial buildings`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3 rounded-xl bg-[#ea4335]/15 hover:bg-[#ea4335]/25 border border-[#ea4335]/40 hover:border-[#ea4335] text-[#ff7d70] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 group"
                    title="Open area commercial buildings on Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#ea4335] group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">Google Maps</span>
                  </a>

                  {/* 3. Download All Area Buildings CSV */}
                  <button
                    type="button"
                    onClick={handleDownloadActiveBuildingCsv}
                    className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#10b981]/25 hover:opacity-95 transition active:scale-95"
                    title="Download all companies across all buildings to CSV"
                  >
                    {downloadCsvSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                        <span className="truncate">Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Export CSV</span>
                      </>
                    )}
                  </button>

                  {/* 4. Extract All Companies Directory */}
                  <button
                    type="button"
                    onClick={() => {
                      setGisModalLead(null);
                      setIsGisModalOpen(true);
                    }}
                    className="h-9 px-3 rounded-xl bg-[#1f1b36] hover:bg-[#282346] border border-[#3b3560] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    title="View complete building directory"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#ec1a65] shrink-0" />
                    <span className="truncate">Directory ({totalDistrictBusinessesInBuildings})</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Specific Building Details Mode */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#27233e]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#8e8aab] mb-0.5">
                      <span className="font-mono bg-[#161426] px-2 py-0.5 rounded border border-[#27233e] text-[#00b4d8] font-bold">
                        Makani {activeBuilding.makaniNumber}
                      </span>
                      {activeBuilding.distanceFromMetro && (
                        <span className="text-[#34d399] font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activeBuilding.distanceFromMetro}
                        </span>
                      )}
                      <span>• {activeBuilding.floorsCount} Floors</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                      {activeBuilding.buildingName}
                    </h4>
                    {activeBuilding.arabicName && (
                      <span className="text-xs text-[#8e8aab] font-arabic" dir="rtl">
                        {activeBuilding.arabicName}
                      </span>
                    )}
                  </div>

                  {/* Building Telemetry Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[#064e3b]/40 text-[#34d399] border border-[#10b981]/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activeBuilding.indoorBusinesses.filter((b) => b.isOpenNow).length} Open Now
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#241c0a] text-[#fbbf24] border border-[#785a10] flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {activeBuilding.indoorBusinesses.filter((b) => b.reviewCount < 50).length} Sweet Spot
                    </span>
                  </div>
                </div>

                {/* Action Buttons for this Building */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
                  {/* 1. Open 2GIS Target Location */}
                  <a
                    href={activeBuilding.gisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3 rounded-xl bg-[#00b4d8]/15 hover:bg-[#00b4d8]/25 border border-[#00b4d8]/40 hover:border-[#00b4d8] text-[#00b4d8] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 group"
                    title="Open this target building directly on 2GIS Dubai"
                  >
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    <span className="truncate">2GIS.ae</span>
                  </a>

                  {/* 2. Open Google Maps */}
                  <a
                    href={
                      activeBuilding.googleMapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${activeBuilding.buildingName} ${activeBuilding.metroStation || 'Dubai'}`
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3 rounded-xl bg-[#ea4335]/15 hover:bg-[#ea4335]/25 border border-[#ea4335]/40 hover:border-[#ea4335] text-[#ff7d70] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 group"
                    title="Open this target building directly on Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#ea4335] group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">Google Maps</span>
                  </a>

                  {/* 3. Download Companies (CSV) */}
                  <button
                    type="button"
                    onClick={handleDownloadActiveBuildingCsv}
                    className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#10b981]/25 hover:opacity-95 transition active:scale-95"
                    title="Download all companies with open/close timings, phones, and reviews to CSV"
                  >
                    {downloadCsvSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                        <span className="truncate">Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Export CSV</span>
                      </>
                    )}
                  </button>

                  {/* 4. Extract Companies Directory */}
                  <button
                    type="button"
                    onClick={() => {
                      setGisModalLead(null);
                      setIsGisModalOpen(true);
                    }}
                    className="h-9 px-3 rounded-xl bg-[#1f1b36] hover:bg-[#282346] border border-[#3b3560] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    title="Extract and view complete indoor company directory"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#ec1a65] shrink-0" />
                    <span className="truncate">Companies ({activeBuilding.indoorBusinesses.length})</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Target Business Category Section */}
        <div>
          <label className="block text-xs font-bold text-white mb-2">
            Target Business Category:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
            {CATEGORIES.map((cat) => {
              const isSelected =
                cat.value === 'all'
                  ? category === 'all' || category === 'All Categories' || category === 'All'
                  : category === cat.value;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    let nextQuery = '';
                    if (cat.label === 'Barbershop') nextQuery = 'barber';
                    else if (cat.label === 'Cafes') nextQuery = 'cafe';
                    else if (cat.label === 'Ladies Salon') nextQuery = 'salon';
                    else if (cat.label === 'Dental Clinic') nextQuery = 'dental';
                    else if (cat.label === 'Restaurants') nextQuery = 'restaurant';
                    else if (cat.label === 'Automotive') nextQuery = 'auto';
                    else if (cat.label === 'Gyms') nextQuery = 'gym';
                    else if (cat.label === 'Retail') nextQuery = 'retail';
                    else if (cat.value === 'all') nextQuery = '';
                    else nextQuery = '';

                    setCustomSearch(nextQuery);
                    fetchBusinesses(district, cat.value, reviewFilter, sortBy, nextQuery, selectedBuildingName);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-150 shrink-0 ${
                    isSelected
                      ? 'bg-[#ec1a65] text-white shadow-lg shadow-[#ec1a65]/30'
                      : 'bg-[#1a172e] border border-[#2c2847] text-[#9f9cb8] hover:text-white hover:border-[#3d3761]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query Input & Number Range Pill Inputs */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <Store className="w-4 h-4 text-[#8e8aab] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchBusinesses(district, category, reviewFilter, sortBy, customSearch, selectedBuildingName);
              }}
              placeholder="e.g. barber, cafe, clinic..."
              className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] focus:outline-none rounded-full pl-10 pr-3 py-2 text-xs text-white placeholder-[#6d698a] transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#110f22] border border-[#26223d] rounded-full p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setTargetCount(20);
                fetchBusinesses(district, category, reviewFilter, sortBy, customSearch, selectedBuildingName);
              }}
              className={`px-3 py-1 font-bold rounded-full transition-all ${
                targetCount === 20 ? 'bg-white text-black' : 'text-[#8e8aab]'
              }`}
            >
              20
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetCount(50);
                fetchBusinesses(district, category, reviewFilter, sortBy, customSearch, selectedBuildingName);
              }}
              className={`px-3 py-1 font-bold rounded-full transition-all ${
                targetCount === 50 ? 'bg-white text-black' : 'text-[#8e8aab]'
              }`}
            >
              50
            </button>
          </div>
        </div>

        {/* Big Vibrant Gradient CTA Button */}
        <button
          type="button"
          onClick={() => fetchBusinesses(district, category, reviewFilter, sortBy, customSearch, selectedBuildingName)}
          className="w-full bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] hover:opacity-95 active:scale-[0.99] text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-[#ec1a65]/25 flex items-center justify-center gap-2 text-[15px] transition-all"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {dynamicScoutButtonText}
          </span>
        </button>
      </section>

      {/* 2. SWEET SPOT BANNER (MATCHING IMAGE EXACTLY) */}
      <section
        aria-label="Target Review Sweet Spot"
        className="bg-[#241c0a] border border-[#785a10] rounded-full py-2.5 px-4 flex items-center justify-between text-xs shadow-md"
      >
        <div className="flex items-center gap-2 font-bold text-[#fbbf24]">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>Target: 21–50 Reviews (Sweet Spot)</span>
        </div>
        <span className="text-[#d4b465] font-semibold text-[11px] sm:text-xs">
          Highest NFC Card Close Rate
        </span>
      </section>

      {/* 2b. FIELD VISIT PLANNING STATUS BAR */}
      {plannedVisitLeads.length > 0 && (
        <section
          aria-label="Planned Field Visit Route"
          className="bg-[#1b122c] border border-[#ec1a65]/50 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#381423] text-[#ff5c8a] flex items-center justify-center shrink-0 border border-[#ec1a65]/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Field Visit Route:</span>
                <span className="text-[#34d399] font-mono bg-[#102a20] px-2 py-0.5 rounded-full border border-[#059669]/40">
                  {plannedVisitLeads.length} / 15 Targets Selected
                </span>
                {plannedVisitLeads.length >= 10 && plannedVisitLeads.length <= 20 && (
                  <span className="text-[10px] text-[#fbbf24] bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-600/30">
                    Perfect 10–20 Batch Size!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e8aab] mt-0.5">
                Stops planned before heading out into the field. Burn NFC cards in Tab 3.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToProductMate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ec1a65] to-[#a822d8] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#ec1a65]/20 shrink-0 self-end sm:self-center"
          >
            <span>Review Plan & NFC Tags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 3. RESULTS HEADER */}
      <section aria-label="Results and Controls" className="flex items-center justify-between gap-3 pt-1 px-1">
        <div className="text-[13px] text-[#8e8aab]">
          <span className="text-white font-bold">{filteredLeads.length}</span> businesses found
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="h-8 px-3.5 rounded-full text-[13px] font-semibold text-white bg-[#161426] border border-[#27233e] hover:bg-[#1f1c35] transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8e8aab]" />
            <span>Filter</span>
          </button>

          {/* List / Map Switch */}
          <div className="flex items-center bg-[#110f22] border border-[#26223d] p-0.5 rounded-full text-[12px]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-center">
          <div className="w-6 h-6 border-2 border-[#ec1a65] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[#8e8aab]">Scanning businesses near {parsedCurrentStation.displayName}…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="py-2 text-[13px] text-[#ff3366]">
          {error}
        </div>
      )}

      {/* 4. RADAR MAP VIEW */}
      {viewMode === 'map' && !loading && leads.length > 0 && (() => {
        const centerInfo = resolveDistrictCenter(district);
        const displayedRadarLeads = filteredLeads.filter((l) => {
          if (radarCategoryFilter === 'barbershop') return l.category.toLowerCase().includes('barber');
          if (radarCategoryFilter === 'dental') return l.category.toLowerCase().includes('dental');
          if (radarCategoryFilter === 'high_need') return l.reviewCount < 50;
          return true;
        });

        return (
          <div className="space-y-3">
            <div className="rounded-3xl border border-[#26223e] overflow-hidden shadow-2xl">
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
            </div>

            {activeLeadOnMap && (() => {
              const mapHours = getBusinessHours(activeLeadOnMap);
              return (
                <div className="p-4 bg-[#161426] border border-[#27233e] rounded-2xl shadow-xl">
                  {/* On top of business: Closing Hours Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${mapHours.statusBadge.badgeBg} ${mapHours.statusBadge.badgeBorder} ${mapHours.statusBadge.textColor} text-[11px] font-bold`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${mapHours.statusBadge.dotColor}`} />
                      <span>{mapHours.closingNotice}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#8e8aab] font-mono">
                      <Clock className="w-3 h-3 text-[#00b4d8] shrink-0" />
                      <span>{mapHours.hoursLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[16px] font-bold text-white tracking-tight">
                        {activeLeadOnMap.name}
                      </h4>
                      <div className="text-[12px] text-[#8e8aab] mt-0.5">
                        {activeLeadOnMap.category} · {activeLeadOnMap.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[13px] text-white shrink-0 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{activeLeadOnMap.rating}</span>
                      <span className="text-[#8e8aab]">({activeLeadOnMap.reviewCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onSelectLead(activeLeadOnMap)}
                      className="h-9 px-4 rounded-full bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white font-bold text-[13px] shadow-md shadow-[#ec1a65]/20 flex items-center gap-1.5"
                    >
                      <span>Process in Product Mate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onToggleVisitLead && (
                      <button
                        type="button"
                        onClick={() => onToggleVisitLead(activeLeadOnMap)}
                        className="h-9 px-3.5 rounded-full bg-[#110f22] border border-[#26223d] hover:border-[#ec1a65]/50 text-white text-[13px] font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#ff5c8a]" />
                        <span>
                          {plannedVisitLeads.some((p) => p.businessName.toLowerCase() === activeLeadOnMap.name.toLowerCase())
                            ? 'In Visit Plan ✓'
                            : '+ Plan Stop'}
                        </span>
                      </button>
                    )}
                    <a
                      href={activeLeadOnMap.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3.5 rounded-full bg-[#110f22] border border-[#26223d] text-[#8e8aab] hover:text-white text-[13px] font-medium transition-colors flex items-center"
                    >
                      Google Maps
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* 5. BUSINESS LIST: Edge-to-edge list in dark theme */}
      {viewMode === 'list' && !loading && leads.length > 0 && (
        <section aria-label="Business Results">
          {filteredLeads.length === 0 ? (
            <div className="py-12 text-center text-[#8e8aab] text-[14px]">
              No businesses match your search.
              <button
                type="button"
                onClick={() => setCustomSearch('')}
                className="block mx-auto mt-2 text-[#ec1a65] font-semibold hover:underline text-[13px]"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#201d36]">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadId === lead.id;
                const isPitchExpanded = expandedPitchId === lead.id;
                const hours = getBusinessHours(lead);

                return (
                  <article
                    key={lead.id}
                    className="py-4 px-2 hover:bg-[#161426]/50 rounded-2xl transition-colors duration-150"
                  >
                    {/* On Top of Business: Closing Hours & Operating Status */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${hours.statusBadge.badgeBg} ${hours.statusBadge.badgeBorder} ${hours.statusBadge.textColor} text-[11px] font-bold shadow-sm`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${hours.statusBadge.dotColor}`} />
                        <span>{hours.closingNotice}</span>
                        <span className="text-[#8e8aab] font-medium text-[10px] hidden xs:inline">
                          · {hours.daysOpen}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#8e8aab] font-mono">
                        <Clock className="w-3 h-3 text-[#ec1a65] shrink-0" />
                        <span>{hours.hoursLabel}</span>
                      </div>
                    </div>

                    {/* Primary Row */}
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[17px] font-bold text-white tracking-tight leading-snug truncate">
                        {lead.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[13px] shrink-0 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-white">{lead.rating}</span>
                        <span className="text-[#8e8aab]">({lead.reviewCount})</span>
                      </div>
                    </div>

                    {/* Metadata Line 1: Category & Proximity */}
                    <div className="flex items-center gap-1.5 text-[13px] text-[#8e8aab] mt-1 flex-wrap">
                      <span className="text-[#c5c2db]">{lead.category}</span>
                      <span>·</span>
                      {lead.footsteps ? (
                        <span className="text-[#ff5c8a] font-medium">About {lead.footsteps} footsteps from Metro</span>
                      ) : (
                        <span>{lead.distanceLabel || 'Near Metro'}</span>
                      )}
                    </div>

                    {/* Metadata Line 2: Address & Directory */}
                    <div className="text-[13px] text-[#8e8aab] mt-0.5 flex items-center justify-between gap-2 flex-wrap">
                      <span className="truncate">
                        {lead.address}
                        {lead.buildingInfo?.primaryEntrance && ` · ${lead.buildingInfo.primaryEntrance.name.split('(')[0].trim()}`}
                      </span>

                      {lead.buildingInfo && (
                        <button
                          type="button"
                          onClick={() => openGisModal(lead)}
                          className="text-[12px] text-[#00b4d8] font-semibold hover:underline shrink-0"
                        >
                          Directory ({lead.buildingInfo.indoorBusinesses.length})
                        </button>
                      )}
                    </div>

                    {/* Expandable Details */}
                    {lead.pitchAngle && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedPitchId(isPitchExpanded ? null : lead.id)}
                          className="text-[12px] text-[#ec1a65] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>{isPitchExpanded ? 'Hide pitch angle' : 'View NFC pitch angle'}</span>
                          {isPitchExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isPitchExpanded && (
                          <p className="text-[13px] text-[#9f9cb8] bg-[#110f22] border border-[#26223d] p-3 rounded-xl leading-relaxed mt-1.5">
                            {lead.pitchAngle}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-3 mt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-3 text-[13px]">
                        <a
                          href={`tel:${(lead.contactDirectPhone || lead.phone).replace(/\s+/g, '')}`}
                          className="text-[#00b4d8] font-semibold hover:underline"
                        >
                          Call
                        </a>
                        <span className="text-[#4b4765] text-[11px]">·</span>
                        <a
                          href={`https://wa.me/${(lead.contactDirectPhone || lead.phone).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#10b981] font-semibold hover:underline"
                        >
                          WhatsApp
                        </a>
                        <span className="text-[#4b4765] text-[11px]">·</span>
                        <a
                          href={lead.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8e8aab] hover:text-white transition-colors"
                        >
                          Google Maps
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        {onToggleVisitLead && (() => {
                          const isPlanned = plannedVisitLeads.some(
                            (p) => p.businessName.toLowerCase() === lead.name.toLowerCase()
                          );
                          const plannedIndex = plannedVisitLeads.findIndex(
                            (p) => p.businessName.toLowerCase() === lead.name.toLowerCase()
                          );

                          return (
                            <button
                              type="button"
                              onClick={() => onToggleVisitLead(lead)}
                              className={`h-8 px-3 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                                isPlanned
                                  ? 'bg-[#102a20] border border-[#059669]/60 text-[#34d399]'
                                  : 'bg-[#110f22] border border-[#27233e] text-[#8e8aab] hover:text-white hover:border-[#ec1a65]/40'
                              }`}
                              title={isPlanned ? 'Remove from 10–20 Field Visit Plan' : 'Add to 10–20 Field Visit Plan'}
                            >
                              {isPlanned ? (
                                <>
                                  <Check className="w-3 h-3 text-[#10b981]" />
                                  <span>Stop #{plannedIndex + 1}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>+ Plan Visit</span>
                                </>
                              )}
                            </button>
                          );
                        })()}

                        <button
                          type="button"
                          onClick={() => onSelectLead(lead)}
                          className={`h-8 px-4 rounded-full text-[13px] font-bold transition-all ${
                            isSelected
                              ? 'bg-[#381423] border border-[#ec1a65]/50 text-[#ff5c8a]'
                              : 'bg-[#ec1a65] text-white hover:opacity-90 shadow-md shadow-[#ec1a65]/20'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Empty result */}
      {!loading && leads.length === 0 && !error && (
        <div className="py-12 text-center bg-[#161426] border border-[#27233e] rounded-3xl p-6">
          <h3 className="font-bold text-white text-[16px]">No businesses found</h3>
          <p className="text-[13px] text-[#8e8aab] mt-1">
            Try choosing another station or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setDistrict('All Metro Stations');
              setCategory('all');
              setCustomSearch('');
              setReviewFilter('all');
            }}
            className="mt-4 h-9 px-5 rounded-full bg-[#110f22] border border-[#26223d] hover:bg-[#1a172e] text-white text-[13px] font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Station Sheet */}
      <StationPickerSheet
        isOpen={isStationSheetOpen}
        onClose={() => setIsStationSheetOpen(false)}
        selectedStation={district}
        onSelectStation={(st) => {
          setDistrict(st);
          fetchBusinesses(st, category);
        }}
      />

      {/* 2GIS Building Modal */}
      <GisBuildingModal
        lead={gisModalLead}
        building={gisModalLead?.buildingInfo || activeBuilding}
        allAreaBuildings={areaBuildings}
        onSwitchBuilding={(b) => setSelectedBuildingName(b.buildingName)}
        isOpen={isGisModalOpen}
        onClose={() => setIsGisModalOpen(false)}
        onSelectCoTenant={handleSelectCoTenant}
      />

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        district={district}
        setDistrict={setDistrict}
        reviewFilter={reviewFilter}
        setReviewFilter={setReviewFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onApply={() => fetchBusinesses(district, category)}
      />
    </div>
  );
};
