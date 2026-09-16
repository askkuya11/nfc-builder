import React, { useState } from 'react';
import { BusinessLead, GisBuildingEntrance, GisIndoorBusiness } from '../types';
import { generateGisBuildingData } from '../utils/gisDubaiDirectory';
import { getCategoryVisualMeta, CategoryBadge } from '../utils/categoryIcons';
import {
  Building2,
  DoorOpen,
  MapPin,
  ExternalLink,
  X,
  Footprints,
  Star,
  Layers,
  ArrowRight,
  Sparkles,
  Phone,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface GisBuildingModalProps {
  lead: BusinessLead | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCoTenant?: (coTenant: GisIndoorBusiness) => void;
}

export const GisBuildingModal: React.FC<GisBuildingModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSelectCoTenant,
}) => {
  const [activeFloorFilter, setActiveFloorFilter] = useState<string>('all');
  const [selectedEntranceId, setSelectedEntranceId] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const info = lead.buildingInfo || generateGisBuildingData(lead);
  const activeEntrance: GisBuildingEntrance =
    info.entrances.find((e) => e.id === selectedEntranceId) || info.primaryEntrance;

  // Filter indoor businesses by floor if tab selected
  const filteredBusinesses = info.indoorBusinesses.filter((b) => {
    if (activeFloorFilter === 'all') return true;
    if (activeFloorFilter === 'ground') return b.floor.includes('Ground');
    if (activeFloorFilter === 'mezzanine') return b.floor.includes('Mezzanine');
    if (activeFloorFilter === 'upper') return !b.floor.includes('Ground') && !b.floor.includes('Mezzanine');
    return true;
  });

  const uniqueFloors = Array.from(new Set(info.indoorBusinesses.map((b) => b.floor)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh] overflow-hidden text-white">
        {/* Header Bar with 2GIS.ae Signature Emerald Styling */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wide font-mono uppercase">
                  2GIS.AE CERTIFIED BUILDING
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  ✓ 100% Free • Zero API Needed
                </span>
                <span className="text-xs font-mono text-emerald-400/90 font-bold">
                  Makani: {info.makaniNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{info.buildingName}</span>
                {info.arabicName && (
                  <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                    ({info.arabicName})
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={info.gisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/50 text-xs font-bold transition font-mono shadow-sm"
              title="Open full building 3D model and verified entrances in 2GIS.ae"
            >
              <span>Open in 2GIS.ae</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Target Lead Location Banner in Building */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                Current Sales Target Unit Inside Building
              </div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                <span>📍 {lead.name}</span>
                <span className="text-slate-400 text-xs font-normal">({lead.category})</span>
              </div>
              <div className="text-xs text-amber-200/90 font-mono mt-0.5">
                Location: <strong>{info.currentLeadFloor}</strong> • Unit: <strong>{info.currentLeadUnit}</strong>
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-amber-500/20 sm:pl-4">
              <span className="text-[10px] font-mono text-slate-400 block">Proximity from Metro</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                👣 {lead.footsteps || 180} steps ({lead.walkMinutes || 2} min)
              </span>
            </div>
          </div>

          {/* 2GIS Entrance Navigator Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
                  2GIS Building Entrances ({info.entrances.length} Doors)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Select entrance to view entryway guidance
              </span>
            </div>

            {/* Entrance Selector Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              {info.entrances.map((entrance, idx) => {
                const isSelected = entrance.id === activeEntrance.id;
                return (
                  <button
                    key={entrance.id}
                    type="button"
                    onClick={() => setSelectedEntranceId(entrance.id)}
                    className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-md shadow-emerald-900/30'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold truncate">{entrance.name}</span>
                      {entrance.isPrimary && (
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono uppercase font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">
                      🚪 {entrance.doorType.replace(/_/g, ' ')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Entrance Detail Card */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-3 text-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{activeEntrance.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                    Side: {activeEntrance.side.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {activeEntrance.guidance}
                </div>
                <div className="text-[10px] font-mono text-emerald-400/90 pt-1">
                  GPS: {activeEntrance.lat.toFixed(5)}° N, {activeEntrance.lng.toFixed(5)}° E • Doorway Pin Verified
                </div>
              </div>
            </div>
          </div>

          {/* Indoor Directory & Businesses Inside the Building */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  Businesses Inside This Building ({info.indoorBusinesses.length} Organizations)
                </h3>
              </div>

              {/* Floor Tabs */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveFloorFilter('all')}
                  className={`px-2 py-1 rounded transition ${
                    activeFloorFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Floors
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFloorFilter('ground')}
                  className={`px-2 py-1 rounded transition ${
                    activeFloorFilter === 'ground'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ground
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFloorFilter('mezzanine')}
                  className={`px-2 py-1 rounded transition ${
                    activeFloorFilter === 'mezzanine'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mezzanine
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFloorFilter('upper')}
                  className={`px-2 py-1 rounded transition ${
                    activeFloorFilter === 'upper'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Floors 1+
                </button>
              </div>
            </div>

            {/* Sales Advantage Callout */}
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{info.salesAdvantageTip}</span>
            </div>

            {/* Indoor Tenant List Grouped by Floor */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {filteredBusinesses.map((biz) => {
                const isTarget = biz.isTargetLead;
                const isUnder50 = biz.reviewCount < 50;
                const visualMeta = getCategoryVisualMeta(biz.category, biz.name);

                return (
                  <div
                    key={biz.id}
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isTarget
                        ? 'bg-amber-950/60 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                        : isUnder50
                        ? 'bg-slate-950/80 border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{visualMeta.emoji}</span>
                        <span className="font-bold text-xs text-white truncate">{biz.name}</span>
                        {isTarget && (
                          <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[9px] font-mono font-black uppercase">
                            Target Lead
                          </span>
                        )}
                        {isUnder50 && !isTarget && (
                          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-mono font-bold">
                            &lt;50 Revs Opportunity
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-amber-300 font-mono font-semibold">
                          🏢 {biz.floor} • {biz.unitNumber}
                        </span>
                        <span>•</span>
                        <CategoryBadge category={biz.category} businessName={biz.name} size="sm" />
                        {biz.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-300">{biz.phone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{biz.rating}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            ({biz.reviewCount} revs)
                          </span>
                        </div>
                      </div>

                      {onSelectCoTenant && !isTarget && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCoTenant(biz);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1"
                          title="Switch active target or pitch this co-tenant"
                        >
                          <span>Pitch</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>2GIS Geo ID: {info.gisId} • Total Floors: G + {info.floorsCount - 1} • <strong className="text-emerald-400">100% Free</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={info.gisUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
              title="Open public 2GIS.ae map view for free"
            >
              <span>Free 2GIS.ae Web View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
