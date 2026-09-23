import React, { useState } from 'react';
import { BusinessLead, GisBuildingEntrance, GisIndoorBusiness, GisBuildingInfo } from '../types';
import { generateGisBuildingData, exportBuildingCompaniesToCsv } from '../utils/gisDubaiDirectory';
import {
  Building2,
  ExternalLink,
  X,
  Star,
  DoorOpen,
  Download,
  Clock,
  Phone,
  CheckCircle2,
  Sparkles,
  MapPin,
  Flame,
  Search,
} from 'lucide-react';

interface GisBuildingModalProps {
  lead?: BusinessLead | null;
  building?: GisBuildingInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCoTenant?: (coTenant: GisIndoorBusiness) => void;
  onSwitchBuilding?: (building: GisBuildingInfo) => void;
  allAreaBuildings?: GisBuildingInfo[];
}

export const GisBuildingModal: React.FC<GisBuildingModalProps> = ({
  lead,
  building: directBuilding,
  isOpen,
  onClose,
  onSelectCoTenant,
  onSwitchBuilding,
  allAreaBuildings = [],
}) => {
  const [activeFloorFilter, setActiveFloorFilter] = useState<string>('all');
  const [selectedEntranceId, setSelectedEntranceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const info: GisBuildingInfo | null =
    directBuilding || (lead ? lead.buildingInfo || generateGisBuildingData(lead) : null);

  if (!info) return null;

  const activeEntrance: GisBuildingEntrance =
    info.entrances.find((e) => e.id === selectedEntranceId) || info.primaryEntrance;

  const filteredBusinesses = info.indoorBusinesses.filter((b) => {
    if (activeFloorFilter === 'ground' && !b.floor.toLowerCase().includes('ground')) return false;
    if (activeFloorFilter === 'mezzanine' && !b.floor.toLowerCase().includes('mezzanine')) return false;
    if (
      activeFloorFilter === 'upper' &&
      (b.floor.toLowerCase().includes('ground') || b.floor.toLowerCase().includes('mezzanine'))
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.unitNumber.toLowerCase().includes(q) ||
        b.floor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadCsv = () => {
    exportBuildingCompaniesToCsv(info);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const openHoursCount = info.indoorBusinesses.filter((b) => b.isOpenNow).length;
  const sweetSpotCount = info.indoorBusinesses.filter((b) => b.reviewCount < 50).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Building Directory"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md transition-opacity"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-2xl bg-[#161426] border border-[#27233e] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Grab indicator for mobile */}
        <div className="w-12 h-1 bg-[#332e52] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#26223e] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs text-[#8e8aab] mb-1">
              <span className="flex items-center gap-1 font-semibold text-[#00b4d8]">
                <Building2 className="w-3.5 h-3.5" />
                2GIS Building Directory
              </span>
              <span>•</span>
              <span className="font-mono bg-[#110f22] px-2 py-0.5 rounded border border-[#27233e]">
                Makani {info.makaniNumber}
              </span>
              {info.distanceFromMetro && (
                <>
                  <span>•</span>
                  <span className="text-[#34d399] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {info.distanceFromMetro}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {info.buildingName}
              </h2>
            </div>
            {info.arabicName && (
              <div className="text-xs text-[#8e8aab] font-arabic mt-0.5" dir="rtl">
                {info.arabicName}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-bold shadow-lg shadow-[#10b981]/25 hover:opacity-95 transition active:scale-95"
              title="Download all companies inside this building to CSV spreadsheet"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#9f9cb8] hover:text-white bg-[#110f22] border border-[#26223d] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Building Switcher Pills if multiple buildings in area */}
        {allAreaBuildings.length > 1 && onSwitchBuilding && (
          <div className="bg-[#110f22] border-b border-[#26223e] px-5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-[#8e8aab] whitespace-nowrap uppercase tracking-wider">
              Area Buildings:
            </span>
            {allAreaBuildings.map((b) => {
              const isSelected = b.buildingName === info.buildingName;
              return (
                <button
                  key={b.buildingName}
                  type="button"
                  onClick={() => onSwitchBuilding(b)}
                  className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition ${
                    isSelected
                      ? 'bg-[#ec1a65] text-white font-bold shadow-md shadow-[#ec1a65]/30'
                      : 'bg-[#1a172e] text-[#a5a0c0] hover:text-white border border-[#27233e]'
                  }`}
                >
                  {b.buildingName.replace(' Commercial Building', '').replace(' Office Tower', '')} ({b.indoorBusinesses.length})
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Quick Stats & Map Launch Banners */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[11px] text-[#8e8aab] font-medium">Organizations</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-white">{info.indoorBusinesses.length}</span>
                <span className="text-[11px] text-[#8e8aab]">companies</span>
              </div>
            </div>

            <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[11px] text-[#8e8aab] font-medium">Operating Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs font-bold text-[#34d399]">{openHoursCount} Open Now</span>
              </div>
            </div>

            <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[11px] text-[#8e8aab] font-medium">Sweet Spot Leads</span>
              <div className="flex items-center gap-1 mt-1 text-[#fbbf24] font-bold text-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{sweetSpotCount} &lt;50 rev</span>
              </div>
            </div>

            {/* 2GIS 3D Building Model */}
            <a
              href={info.gisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-[#00b4d8]/20 to-[#0077b6]/20 border border-[#00b4d8]/40 hover:border-[#00b4d8] rounded-2xl p-3 flex flex-col justify-between group transition"
              title="Open building in 2GIS Dubai"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#00b4d8] font-bold">2GIS Map</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#00b4d8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <span className="text-xs font-bold text-white mt-1">Open 2GIS.ae ↗</span>
            </a>

            {/* Google Maps Building Location */}
            <a
              href={
                info.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${info.buildingName} ${info.metroStation || 'Dubai'}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-[#ea4335]/20 to-[#c5221f]/20 border border-[#ea4335]/40 hover:border-[#ea4335] rounded-2xl p-3 flex flex-col justify-between group transition"
              title="Open building in Google Maps"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#ff7d70] font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#ea4335]" />
                  Google Maps
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#ff7d70] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <span className="text-xs font-bold text-white mt-1">Open Maps ↗</span>
            </a>
          </div>

          {/* Sales Tip */}
          <div className="py-2.5 px-3.5 rounded-2xl bg-[#25111f] border border-[#ec1a65]/30 flex items-center justify-between gap-3">
            <span className="text-xs text-[#ff9bbb] font-medium leading-relaxed">
              {info.salesAdvantageTip}
            </span>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-[#10b981] text-white text-[11px] font-bold shrink-0 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>

          {/* Building Entrances Section */}
          <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-bold text-xs text-white flex items-center gap-1.5 uppercase tracking-wider">
                <DoorOpen className="w-4 h-4 text-[#ec1a65]" />
                Building Entrances ({info.entrances.length})
              </span>
              <span className="text-[11px] text-[#8e8aab]">Select door for concierge guide</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-2.5">
              {info.entrances.map((entrance) => {
                const isSelected = entrance.id === activeEntrance.id;
                return (
                  <button
                    key={entrance.id}
                    type="button"
                    onClick={() => setSelectedEntranceId(entrance.id)}
                    className={`h-8 px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#ec1a65] text-white font-bold shadow-md shadow-[#ec1a65]/30'
                        : 'bg-[#1a172e] border border-[#26223d] text-[#9f9cb8] hover:text-white'
                    }`}
                  >
                    <span>{entrance.name}</span>
                    {entrance.isPrimary && (
                      <span className="text-[10px] text-[#00b4d8] font-bold">· Main</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-[#a5a0c0] bg-[#161426] border border-[#26223d] p-3 rounded-xl">
              <span className="font-bold text-white">{activeEntrance.name}</span>: {activeEntrance.guidance}
            </div>
          </div>

          {/* Extracted Companies Directory */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Extracted Companies Inside Building</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1a172e] text-[#00b4d8] text-xs font-mono border border-[#27233e]">
                    {filteredBusinesses.length}
                  </span>
                </h3>
                <p className="text-[11px] text-[#8e8aab]">
                  Includes operating timings (open & close), floor levels, and reviews
                </p>
              </div>

              {/* Search & Floor Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8e8aab] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company or floor..."
                    className="h-8 pl-8 pr-3 rounded-xl bg-[#110f22] border border-[#27233e] text-xs text-white placeholder-[#6d698a] focus:outline-none focus:border-[#ec1a65] transition"
                  />
                </div>

                <div className="flex items-center bg-[#110f22] p-0.5 rounded-xl border border-[#26223d]">
                  {['all', 'ground', 'upper'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveFloorFilter(tab)}
                      className={`h-7 px-2.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        activeFloorFilter === tab
                          ? 'bg-white text-black font-bold shadow'
                          : 'text-[#8e8aab] hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of Companies */}
            <div className="space-y-2.5">
              {filteredBusinesses.map((biz) => {
                const isTarget = biz.isTargetLead;
                const isSweetSpot = biz.reviewCount < 50;

                return (
                  <div
                    key={biz.id}
                    className={`bg-[#110f22] border rounded-2xl p-3.5 transition group hover:border-[#3d3761] ${
                      isTarget
                        ? 'border-[#ec1a65] bg-[#25111f]/40'
                        : isSweetSpot
                        ? 'border-[#785a10]/50'
                        : 'border-[#27233e]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white group-hover:text-[#00b4d8] transition">
                            {biz.name}
                          </span>
                          {isTarget && (
                            <span className="px-2 py-0.5 rounded-md bg-[#ec1a65] text-white text-[10px] font-bold">
                              Current Active Lead
                            </span>
                          )}
                          {isSweetSpot && !isTarget && (
                            <span className="px-2 py-0.5 rounded-md bg-[#241c0a] text-[#fbbf24] border border-[#785a10] text-[10px] font-bold flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5 fill-amber-400" />
                              Sweet Spot
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#8e8aab] mt-1 flex-wrap">
                          <span className="text-white font-medium bg-[#1a172e] px-2 py-0.5 rounded-md border border-[#27233e]">
                            {biz.floor} · {biz.unitNumber}
                          </span>
                          <span>{biz.category}</span>
                          {biz.phone && (
                            <a
                              href={`tel:${biz.phone}`}
                              className="text-[#a5a0c0] hover:text-white flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-[#10b981]" />
                              {biz.phone}
                            </a>
                          )}
                        </div>

                        {/* Operating Timings Row (Explicit User Request) */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div
                            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                              biz.isOpenNow
                                ? 'bg-[#064e3b]/40 text-[#34d399] border-[#10b981]/40'
                                : 'bg-[#1f1d2e] text-[#9f9cb8] border-[#2f2b48]'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{biz.isOpenNow ? 'Open Now' : 'Closed'}</span>
                          </div>

                          <span className="text-xs text-[#e2e0ee] font-mono">
                            {biz.openingTime} – {biz.closingTime} ({biz.daysOpen || 'Daily'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#26223e]">
                        <div className="flex items-center gap-1.5 text-xs text-white">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{biz.rating}</span>
                          <span className="text-[#8e8aab]">({biz.reviewCount})</span>
                        </div>

                        {/* Direct Google Maps link for this organization */}
                        <a
                          href={biz.googleMapsUrl || biz.directReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-[#ea4335]/15 hover:bg-[#ea4335]/25 border border-[#ea4335]/35 text-[#ff7d70] text-xs font-bold flex items-center gap-1 transition"
                          title={`Open ${biz.name} on Google Maps`}
                        >
                          <MapPin className="w-3 h-3 text-[#ea4335]" />
                          <span>Maps</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#ff7d70]/70" />
                        </a>

                        {onSelectCoTenant && !isTarget && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCoTenant(biz);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white text-xs font-bold shadow-md hover:opacity-95 transition"
                          >
                            Target Business
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#26223e] flex items-center justify-between gap-3 text-xs bg-[#110f22]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* 2GIS link */}
            <a
              href={info.gisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00b4d8] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <span>Explore in 2GIS.ae</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Google Maps link */}
            <a
              href={
                info.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${info.buildingName} ${info.metroStation || 'Dubai'}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff7d70] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#ea4335]" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-[#ff7d70]/70" />
            </a>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="text-[#34d399] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1a172e] hover:bg-[#27233e] border border-[#383256] text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
