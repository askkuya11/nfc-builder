import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BusinessLead, GisIndoorBusiness } from '../types';
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
import { generateGisBuildingData } from '../utils/gisDubaiDirectory';
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
  X,
  MapPin,
} from 'lucide-react';

interface App1MapScoutProps {
  onSelectLead: (lead: BusinessLead) => void;
  selectedLeadId?: string;
}

export const DISTRICT_CENTERS: Record<string, { lat: number; lng: number; sectorName: string; landmark: string }> = {
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
  if (DISTRICT_CENTERS[districtName]) return DISTRICT_CENTERS[districtName];
  const clean = districtName.toLowerCase();
  for (const [key, value] of Object.entries(DISTRICT_CENTERS)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return value;
    }
  }
  return DISTRICT_CENTERS['Al Rigga (Red Line)'];
};

const CATEGORIES = [
  { label: 'Barbershop', value: "Men's Barbershops & Gents Salons", icon: Scissors },
  { label: 'Cafes', value: 'Restaurants & Cafes', icon: Coffee },
  { label: 'Ladies Salon', value: 'Ladies Salons & Spas', icon: Sparkles },
  { label: 'Restaurants', value: 'Restaurants & Cafes', icon: Utensils },
  { label: 'Dental Clinic', value: 'Dental Clinic', icon: Stethoscope },
  { label: 'Automotive', value: 'Automotive', icon: Wrench },
  { label: 'Gyms', value: 'Fitness & Gyms', icon: Dumbbell },
  { label: 'Retail', value: 'Retail & Boutiques', icon: ShoppingBag },
];

export const App1MapScout: React.FC<App1MapScoutProps> = ({
  onSelectLead,
  selectedLeadId,
}) => {
  const [district, setDistrict] = useState<string>('Al Rigga (Red Line)');
  const [category, setCategory] = useState<string>("Men's Barbershops & Gents Salons");
  const [reviewFilter, setReviewFilter] = useState<string>('sweet_spot');
  const [sortBy, setSortBy] = useState<'nearest' | 'sweet_spot' | 'reviews_asc' | 'rating_desc' | 'name_asc'>('nearest');
  const [customSearch, setCustomSearch] = useState<string>('barber');
  const [stationLineFilter, setStationLineFilter] = useState<'all' | 'red' | 'green'>('all');
  const [stationQuickSearch, setStationQuickSearch] = useState<string>('');
  const [scoutAdjacentCorridor, setScoutAdjacentCorridor] = useState<boolean>(true);
  const [targetCount, setTargetCount] = useState<number>(50);

  const [leads, setLeads] = useState<BusinessLead[]>(() => {
    const initial = REAL_DUBAI_BUSINESSES.filter(b => b.district.includes('Al Rigga') || b.district === 'Deira').slice(0, 35);
    const sourceList = initial.length > 0 ? initial : REAL_DUBAI_BUSINESSES.slice(0, 35);
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

  const parsedCurrentStation = useMemo(() => {
    return parseStationInfo(district);
  }, [district]);

  // Quick Station List for the in-card selector
  const quickStations = useMemo(() => {
    let list = DUBAI_METRO_STATIONS;
    if (stationLineFilter === 'red') {
      list = list.filter((s) => s.includes('Red Line') || s.includes('Red & Green'));
    } else if (stationLineFilter === 'green') {
      list = list.filter((s) => s.includes('Green Line') || s.includes('Red & Green'));
    }

    if (stationQuickSearch.trim()) {
      const q = stationQuickSearch.toLowerCase();
      list = list.filter((s) => s.toLowerCase().includes(q));
    }
    return list;
  }, [stationLineFilter, stationQuickSearch]);

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
        pitchAngle: `High-value co-tenant inside ${bName}. Located at ${coTenant.floor}, Unit ${coTenant.unitNumber}.`,
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

  const fetchBusinesses = useCallback(
    async (
      targetDistrict = district,
      targetCategory = category,
      targetReview = reviewFilter,
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
            count: 35,
            customQuery: customSearch,
            sortBy: targetSort,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to load businesses');
        }

        const data = await response.json();
        if (data.businesses && Array.isArray(data.businesses)) {
          const enriched: BusinessLead[] = data.businesses.map((b: BusinessLead) => ({
            ...b,
            audit: b.audit || generateGmbAudit(b),
            buildingInfo: b.buildingInfo || generateGisBuildingData(b),
          }));
          setLeads(enriched);
          if (enriched.length > 0) {
            setActiveLeadOnMap(enriched[0]);
          }
        }
      } catch (_err: any) {
        // Fallback to verified local dataset
        const cleanDist = targetDistrict.replace(/\(.*?\)/g, '').trim().toLowerCase();
        const localFiltered = REAL_DUBAI_BUSINESSES.filter((b) => {
          if (targetDistrict !== 'All Dubai' && !b.district.toLowerCase().includes(cleanDist)) return false;
          if (targetCategory !== 'All Categories' && b.category !== targetCategory) return false;
          return true;
        }).map((b) => ({
          ...b,
          audit: generateGmbAudit(b as any),
          buildingInfo: generateGisBuildingData(b as any),
        })) as BusinessLead[];
        setLeads(localFiltered);
        if (localFiltered.length > 0) {
          setActiveLeadOnMap(localFiltered[0]);
        }
      } finally {
        setLoading(false);
      }
    },
    [district, category, reviewFilter, sortBy, customSearch]
  );

  useEffect(() => {
    fetchBusinesses(district, category, reviewFilter, sortBy);
  }, [district, category, reviewFilter, sortBy, fetchBusinesses]);

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
    <div className="flex flex-col gap-4 pb-20 max-w-xl mx-auto text-white">
      {/* 1. TARGET METRO STATION CONTAINER (PRODUCTION-GRADE REFINED) */}
      <section aria-label="Target Metro Station" className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5">
        {/* Header inside container */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#ec1a65]/20 border border-[#ec1a65]/40 flex items-center justify-center text-[#ff5c8a]">
              <TrainFront className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-white tracking-tight block leading-tight">
                Target Metro Station
              </span>
              <span className="text-[11px] text-[#8e8aab]">
                Dubai Red & Green Transit Network
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsStationSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#110f22] hover:bg-[#1a172e] border border-[#26223d] text-xs font-semibold text-[#00b4d8] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>

        {/* Currently Active Station Spotlight */}
        <div className="bg-[#110f22] border border-[#26223d] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                parsedCurrentStation.isInterchange
                  ? 'bg-gradient-to-br from-[#ff3366] to-[#10b981] text-white shadow-md'
                  : parsedCurrentStation.isGreen
                  ? 'bg-[#10b981]/20 border border-[#10b981]/40 text-[#34d399]'
                  : 'bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff708f]'
              }`}
            >
              <TrainFront className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  {parsedCurrentStation.displayName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                    parsedCurrentStation.isInterchange
                      ? 'bg-gradient-to-r from-[#ff3366] to-[#10b981] text-white'
                      : parsedCurrentStation.isGreen
                      ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40'
                      : 'bg-[#ff3366]/20 text-[#ff708f] border border-[#ff3366]/40'
                  }`}
                >
                  {parsedCurrentStation.lineLabel}
                </span>
              </div>
              <p className="text-[11px] text-[#8e8aab] truncate mt-0.5">
                {parsedCurrentStation.area} • <span className="text-[#34d399] font-medium">{filteredLeads.length} leads in vicinity</span>
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#381423] border border-[#ec1a65]/40 text-[10px] font-bold text-[#ff5c8a] shrink-0">
            Active Hub
          </span>
        </div>

        {/* Line Filter Capsule Switch */}
        <div className="flex items-center bg-[#100e1f] p-1 rounded-full border border-[#26223e]">
          <button
            type="button"
            onClick={() => setStationLineFilter('all')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
              stationLineFilter === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#8e8aab] hover:text-white'
            }`}
          >
            All (48)
          </button>
          <button
            type="button"
            onClick={() => setStationLineFilter('red')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              stationLineFilter === 'red'
                ? 'bg-[#ff3366] text-white shadow-sm'
                : 'text-[#8e8aab] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff3366]" />
            <span>Red (30)</span>
          </button>
          <button
            type="button"
            onClick={() => setStationLineFilter('green')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              stationLineFilter === 'green'
                ? 'bg-[#10b981] text-white shadow-sm'
                : 'text-[#8e8aab] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Green (18)</span>
          </button>
        </div>

        {/* Station Search Input with Clear Button and Count */}
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-[#8e8aab] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={stationQuickSearch}
            onChange={(e) => setStationQuickSearch(e.target.value)}
            placeholder="Find station: Al Rigga, Union, BurJuman…"
            className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] focus:outline-none rounded-full pl-10 pr-10 py-2 text-xs text-white placeholder-[#6d698a] transition-colors"
          />
          {stationQuickSearch ? (
            <button
              type="button"
              onClick={() => setStationQuickSearch('')}
              className="absolute right-3 p-1 rounded-full text-[#8e8aab] hover:text-white hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3.5 text-[10px] font-mono text-[#6d698a] pointer-events-none">
              {quickStations.length}
            </span>
          )}
        </div>

        {/* Station Scrollable List (Fixed clipping, custom dark scrollbar, highlighted active item) */}
        <div className="bg-[#110f22] border border-[#26223d] rounded-2xl max-h-44 overflow-y-auto p-1.5 space-y-1 focus:outline-none [scrollbar-width:thin] [scrollbar-color:#2f2b4a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2f2b4a] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#423d66]">
          {quickStations.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8e8aab]">
              No metro stations match &ldquo;{stationQuickSearch}&rdquo;
            </div>
          ) : (
            quickStations.slice(0, 24).map((station) => {
              const isSelected =
                district.toLowerCase().includes(station.toLowerCase().replace(/\(.*?\)/g, '').trim()) ||
                station.toLowerCase().includes(district.toLowerCase().replace(/\(.*?\)/g, '').trim());
              const info = parseStationInfo(station);
              return (
                <button
                  key={station}
                  type="button"
                  onClick={() => {
                    setDistrict(station);
                    fetchBusinesses(station, category);
                  }}
                  className={`w-full py-2 px-3 text-left flex items-center justify-between gap-2.5 rounded-xl transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#381423] border border-[#ec1a65]/50 text-white font-bold shadow-sm'
                      : 'bg-[#151226]/40 hover:bg-[#1a172e] border border-transparent hover:border-[#27233e] text-[#9f9cb8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        info.isInterchange
                          ? 'bg-gradient-to-r from-[#ff3366] to-[#10b981] ring-1 ring-white/30'
                          : info.isGreen && !info.isRed
                          ? 'bg-[#10b981]'
                          : 'bg-[#ff3366]'
                      }`}
                    />
                    <span className={`text-[13px] truncate ${isSelected ? 'text-white font-bold' : 'text-[#d6d4e8]'}`}>
                      {info.displayName}
                    </span>
                    {isSelected && (
                      <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#ec1a65] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#787498] truncate max-w-[130px]">
                      {info.area.split('/')[0].trim()}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#ff5c8a] shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Station Corridor Box (Interactive Metro Track Route & iOS Switch) */}
        <div className="bg-[#24111e] border border-[#ec1a65]/40 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-lg">
          {/* Top Corridor Control Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ec1a65]/20 border border-[#ec1a65]/40 flex items-center justify-center text-[#ff5c8a] shrink-0">
                <TrainFront className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#ff5c8a] block leading-tight">
                  Station Corridor
                </span>
                <span className="text-[10px] text-[#ff9bbb] hidden sm:block">
                  Adjacent transit sweep on active metro line
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
              <span className="text-xs font-bold text-white group-hover:text-[#ff9bbb] transition-colors">
                Scout Adjacent Corridor
              </span>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  scoutAdjacentCorridor ? 'bg-[#ec1a65]' : 'bg-[#373052]'
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

          {/* Interactive Metro Track Route Diagram (Pixel-Perfect 2-Row Alignment for Mobile Views) */}
          <div className="flex flex-col gap-1 w-full pt-1 pb-1">
            {/* Row 1: Dead-center aligned Track Rail & Node Circles */}
            <div className="relative h-6 flex items-center justify-between px-4 w-full">
              {/* Connecting Rail Line (Precisely pinned from center of left dot to center of right dot) */}
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

            {/* Row 2: Station Labels (Grid layout preventing text wrap vertical displacement) */}
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

          {/* Corridor Telemetry Footer */}
          <div className="pt-2 border-t border-[#ec1a65]/20 flex items-center justify-between text-[11px]">
            {scoutAdjacentCorridor ? (
              <>
                <div className="flex items-center gap-1.5 text-[#34d399] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  <span>3-Station Corridor Active (+2 adjacent stops included)</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#ff5c8a] bg-[#381423] px-2 py-0.5 rounded-full border border-[#ec1a65]/40 shrink-0">
                  Triple Coverage
                </span>
              </>
            ) : (
              <>
                <span className="text-[#8e8aab]">
                  Single station focus • Tap adjacent stop nodes to navigate along the line
                </span>
                <span className="text-[10px] text-[#6d698a] font-mono shrink-0">1 Stop</span>
              </>
            )}
          </div>
        </div>

        {/* Target Business Category Section */}
        <div>
          <label className="block text-xs font-bold text-white mb-2">
            Target Business Category:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    if (cat.label === 'Barbershop') setCustomSearch('barber');
                    else if (cat.label === 'Cafes') setCustomSearch('cafe');
                    else if (cat.label === 'Ladies Salon') setCustomSearch('salon');
                    else if (cat.label === 'Dental Clinic') setCustomSearch('dental');
                    else setCustomSearch('');
                    fetchBusinesses(district, cat.value);
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
                if (e.key === 'Enter') fetchBusinesses();
              }}
              placeholder="e.g. barber, cafe, clinic..."
              className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] focus:outline-none rounded-full pl-10 pr-3 py-2 text-xs text-white placeholder-[#6d698a] transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#110f22] border border-[#26223d] rounded-full p-1 text-xs">
            <button
              type="button"
              onClick={() => setTargetCount(20)}
              className={`px-3 py-1 font-bold rounded-full transition-all ${
                targetCount === 20 ? 'bg-white text-black' : 'text-[#8e8aab]'
              }`}
            >
              20
            </button>
            <button
              type="button"
              onClick={() => setTargetCount(50)}
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
          onClick={() => fetchBusinesses()}
          className="w-full bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] hover:opacity-95 active:scale-[0.99] text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-[#ec1a65]/25 flex items-center justify-center gap-2 text-[15px] transition-all"
        >
          <Search className="w-4 h-4" />
          <span>
            Scout {targetCount} {customSearch || 'businesses'} at {parsedCurrentStation.displayName}
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

            {activeLeadOnMap && (
              <div className="p-4 bg-[#161426] border border-[#27233e] rounded-2xl shadow-xl">
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

                <div className="flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => onSelectLead(activeLeadOnMap)}
                    className="h-9 px-4 rounded-full bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white font-bold text-[13px] shadow-md shadow-[#ec1a65]/20 flex items-center gap-1.5"
                  >
                    <span>Select for Product Mate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
            )}
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

                return (
                  <article
                    key={lead.id}
                    className="py-4 px-2 hover:bg-[#161426]/50 rounded-2xl transition-colors duration-150"
                  >
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
              setDistrict('Al Rigga (Red Line)');
              setCategory("Men's Barbershops & Gents Salons");
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
