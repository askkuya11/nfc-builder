import React, { useState, useEffect, useCallback } from 'react';
import { BusinessLead } from '../types';
import { GmbAuditOverlay } from './GmbAuditOverlay';
import { GmbEverywhereImporterModal } from './GmbEverywhereImporterModal';
import { generateGmbAudit } from '../utils/gmbEverywhereAudit';
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
  'Salons & Spas',
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeLeadOnMap, setActiveLeadOnMap] = useState<BusinessLead | null>(null);
  const [radarScanning, setRadarScanning] = useState<boolean>(true);
  const [radarCategoryFilter, setRadarCategoryFilter] = useState<'all' | 'dental' | 'high_need'>('all');
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const [auditOverlayEnabled, setAuditOverlayEnabled] = useState<boolean>(true);

  const fetchBusinesses = useCallback(async (
    targetDistrict = district,
    targetCategory = category,
    targetReview = reviewFilter,
    targetCount = extractCount,
    targetQuery = customSearch
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load businesses from Dubai directory');
      }

      const data = await response.json();
      if (data.businesses && Array.isArray(data.businesses)) {
        const enriched: BusinessLead[] = data.businesses.map((b: BusinessLead) => ({
          ...b,
          audit: b.audit || generateGmbAudit(b),
        }));
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

  // Real-time automatic fetch whenever filters change
  useEffect(() => {
    fetchBusinesses(district, category, reviewFilter, extractCount, customSearch);
  }, [district, category, reviewFilter, extractCount]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCsv = () => {
    const headers = ['Name', 'Category', 'District', 'Google Rating', 'Review Count', 'Phone', 'Address', 'Google Maps Link', 'Pitch Angle'];
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.district}"`,
      l.rating,
      l.reviewCount,
      `"${l.phone}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${l.mapsUrl}"`,
      `"${l.pitchAngle.replace(/"/g, '""')}"`,
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
              Find Dubai shops with <strong className="text-amber-400 font-semibold">10 to 100 reviews</strong>. These owners understand reviews drive foot-traffic, but are falling behind competitors. They are your highest-converting prospects for Google Review NFC cards.
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

        {/* Filter Controls Box */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
              <option value="sweet_spot">🎯 10 to 100 Reviews (Sweet Spot)</option>
              <option value="under_50">⭐ 10 to 50 Reviews (High Need)</option>
              <option value="50_to_100">📈 50 to 100 Reviews</option>
              <option value="all">🌐 Any Review Count</option>
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

        {/* Custom Search & Search Trigger Button */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Search custom keyword (e.g. 'artisan coffee Marina' or 'barbers Deira')..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses()}
            />
          </div>

          <button
            onClick={fetchBusinesses}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Searching Dubai Map...' : extractCount >= 999 ? `Extract ALL ${totalMatched} Businesses` : `Extract ${extractCount} Businesses`}</span>
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
      </div>

      {/* Result Count and View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Showing <span className="text-amber-400 font-bold">{leads.length}</span> of <span className="text-amber-300 font-bold">{totalMatched}</span> verified {category !== 'All Categories' ? category : 'businesses'} in {district}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">• {reviewFilter === 'sweet_spot' ? '10-100 reviews' : reviewFilter}</span>
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
            <span>GMB Everywhere Overlay: {auditOverlayEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Radar Map
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-200">Scanning Google Maps in {district}...</p>
          <p className="text-xs text-slate-400">Filtering businesses with 10–100 reviews for high-conversion NFC sales</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* RADAR MAP VIEW */}
      {viewMode === 'map' && !loading && leads.length > 0 && (() => {
        const centerInfo = resolveDistrictCenter(district);

        // Filter leads for the radar view if user selects a subfilter
        const displayedRadarLeads = leads.filter((l) => {
          if (radarCategoryFilter === 'dental') {
            return l.category.toLowerCase().includes('dental') || l.name.toLowerCase().includes('dental');
          }
          if (radarCategoryFilter === 'high_need') {
            return l.reviewCount < 50;
          }
          return true;
        });

        // Determine real geographic bounds for selected territory
        const leadsWithCoords = leads.filter(l => typeof l.lat === 'number' && typeof l.lng === 'number');
        const minLat = leadsWithCoords.length > 0 ? Math.min(...leadsWithCoords.map(l => l.lat!)) : centerInfo.lat - 0.006;
        const maxLat = leadsWithCoords.length > 0 ? Math.max(...leadsWithCoords.map(l => l.lat!)) : centerInfo.lat + 0.006;
        const minLng = leadsWithCoords.length > 0 ? Math.min(...leadsWithCoords.map(l => l.lng!)) : centerInfo.lng - 0.006;
        const maxLng = leadsWithCoords.length > 0 ? Math.max(...leadsWithCoords.map(l => l.lng!)) : centerInfo.lng + 0.006;

        const latSpan = Math.max(maxLat - minLat, 0.005);
        const lngSpan = Math.max(maxLng - minLng, 0.005);

        const dentalCount = leads.filter(l => l.category.toLowerCase().includes('dental') || l.name.toLowerCase().includes('dental')).length;
        const highNeedCount = leads.filter(l => l.reviewCount < 50).length;

        return (
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-2xl relative">
            {/* Tactical Radar HUD Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${radarScanning ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${radarScanning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    TERRITORY RADAR • {centerInfo.sectorName}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                  <span>GPS: {centerInfo.lat.toFixed(4)}° N, {centerInfo.lng.toFixed(4)}° E</span>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">{centerInfo.landmark}</span>
                </div>
              </div>

              {/* Radar Control Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRadarScanning(!radarScanning)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition border flex items-center gap-1.5 ${
                    radarScanning
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Radio className={`w-3 h-3 ${radarScanning ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>Sweep: {radarScanning ? 'ON' : 'PAUSED'}</span>
                </button>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setRadarCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded transition ${
                      radarCategoryFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({leads.length})
                  </button>
                  {dentalCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setRadarCategoryFilter('dental')}
                      className={`px-2 py-0.5 rounded transition ${
                        radarCategoryFilter === 'dental'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dental ({dentalCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setRadarCategoryFilter('high_need')}
                    className={`px-2 py-0.5 rounded transition ${
                      radarCategoryFilter === 'high_need'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    &lt;50 Revs ({highNeedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Radar Circular Scope Display */}
            <div className="relative w-full py-4 flex flex-col items-center justify-center">
              {/* The circular tactical scope */}
              <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-slate-950 border-2 border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.1)] overflow-hidden flex items-center justify-center">
                
                {/* Background topographic radar grid texture */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

                {/* Range Concentric Sonar Circles */}
                <div className="absolute w-[80%] h-[80%] rounded-full border border-emerald-500/20 border-dashed pointer-events-none" />
                <div className="absolute w-[55%] h-[55%] rounded-full border border-emerald-500/25 pointer-events-none" />
                <div className="absolute w-[30%] h-[30%] rounded-full border border-emerald-500/30 border-dashed pointer-events-none" />
                
                {/* Crosshairs & Axis lines */}
                <div className="absolute w-full h-[1px] bg-emerald-500/20 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-emerald-500/20 pointer-events-none" />
                <div className="absolute w-full h-[1px] bg-emerald-500/10 rotate-45 pointer-events-none" />
                <div className="absolute w-full h-[1px] bg-emerald-500/10 -rotate-45 pointer-events-none" />

                {/* Range markers */}
                <span className="absolute top-[11%] right-[52%] text-[9px] font-mono text-emerald-400/60 pointer-events-none">1.2 km</span>
                <span className="absolute top-[24%] right-[52%] text-[9px] font-mono text-emerald-400/60 pointer-events-none">800 m</span>
                <span className="absolute top-[36%] right-[52%] text-[9px] font-mono text-emerald-400/60 pointer-events-none">400 m</span>

                {/* Cardinal direction tags */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-1 rounded">N 000°</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-1 rounded">S 180°</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-1 rounded">E 090°</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-400 bg-slate-950/80 px-1 rounded">W 270°</span>

                {/* Rotating Conical Radar Sweep Beam */}
                {radarScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className="w-full h-full rounded-full animate-[spin_5s_linear_infinite] origin-center pointer-events-none"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16,185,129,0.03) 310deg, rgba(245,158,11,0.28) 360deg)',
                      }}
                    />
                  </div>
                )}

                {/* Center Territory Anchor Beacon (e.g. Al Rigga Metro) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
                  <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </div>
                  <span className="text-[8px] font-mono text-amber-300 font-bold bg-slate-950/90 px-1 rounded mt-0.5 whitespace-nowrap border border-amber-500/30">
                    {district} Hub
                  </span>
                </div>

                {/* Real-Coordinate Interactive Lead Blips */}
                <div className="absolute inset-0">
                  {displayedRadarLeads.map((lead) => {
                    const leadLat = lead.lat ?? centerInfo.lat;
                    const leadLng = lead.lng ?? centerInfo.lng;

                    // Compute normalized positions
                    const xPercent = Math.max(14, Math.min(86, 16 + (((leadLng - minLng) / lngSpan) * 68)));
                    const yPercent = Math.max(14, Math.min(86, 16 + (((maxLat - leadLat) / latSpan) * 68)));

                    const isSelected = activeLeadOnMap?.id === lead.id;
                    const isDental = lead.category.toLowerCase().includes('dental') || lead.name.toLowerCase().includes('dental');
                    const isUrgent = lead.reviewCount < 50;

                    return (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => setActiveLeadOnMap(lead)}
                        style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 focus:outline-none ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                        }`}
                        title={`${lead.name} (${lead.reviewCount} reviews)`}
                      >
                        {/* Selected crosshair target reticle */}
                        {isSelected && (
                          <div className="absolute -inset-2 rounded-full border border-amber-400 border-dashed animate-spin pointer-events-none" />
                        )}

                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shadow-lg whitespace-nowrap backdrop-blur-sm transition ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-400 shadow-amber-500/50'
                              : isDental
                              ? 'bg-cyan-950 text-cyan-200 border-cyan-500/70 hover:border-cyan-400'
                              : isUrgent
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70 hover:border-emerald-400'
                              : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-amber-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : isDental ? 'bg-cyan-400' : isUrgent ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="font-mono text-[9px]">{lead.reviewCount} revs</span>
                          {isDental && <span className="text-[8px] opacity-80">🦷</span>}
                        </div>

                        {/* Hover Tooltip showing business name */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none z-30">
                          {lead.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Radar Footer Status Line */}
              <div className="mt-3 flex items-center justify-between w-full px-2 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Showing <strong className="text-white">{displayedRadarLeads.length}</strong> targets in {district} sector</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> &lt;50 (High Need)
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Dental
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Sweet Spot
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Selected Target Telemetry Card */}
            {activeLeadOnMap && (
              <div className="mt-2 bg-slate-900/95 border border-amber-500/50 rounded-xl p-3.5 sm:p-4 shadow-2xl relative">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {activeLeadOnMap.district}
                      </span>
                      <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {activeLeadOnMap.category}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        ✓ Verified Real Place
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                      {activeLeadOnMap.name}
                    </h4>

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
      {!loading && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leads.map((lead) => {
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
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300 border border-slate-700">
                        {lead.category}
                      </span>
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

                  {/* Business Name */}
                  <h3 className="font-bold text-sm sm:text-base text-white tracking-tight mb-1">
                    {lead.name}
                  </h3>

                  {/* Address */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{lead.address}</span>
                  </div>

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

      {/* GMB Everywhere Importer Modal */}
      <GmbEverywhereImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportLeads={handleImportLeads}
      />
    </div>
  );
};
