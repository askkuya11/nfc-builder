import React, { useState } from 'react';
import { BusinessLead, GisBuildingEntrance, GisIndoorBusiness } from '../types';
import { generateGisBuildingData } from '../utils/gisDubaiDirectory';
import {
  Building2,
  ExternalLink,
  X,
  Star,
  DoorOpen,
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

  const filteredBusinesses = info.indoorBusinesses.filter((b) => {
    if (activeFloorFilter === 'all') return true;
    if (activeFloorFilter === 'ground') return b.floor.includes('Ground');
    if (activeFloorFilter === 'mezzanine') return b.floor.includes('Mezzanine');
    if (activeFloorFilter === 'upper') return !b.floor.includes('Ground') && !b.floor.includes('Mezzanine');
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Building Directory"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-[#161426] border border-[#27233e] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Grab indicator */}
        <div className="w-10 h-1 bg-[#332e52] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#26223e]">
          <div>
            <div className="text-[12px] font-medium text-[#8e8aab]">
              Building Directory · Makani {info.makaniNumber}
            </div>
            <h2 className="text-[18px] font-bold text-white tracking-tight">
              {info.buildingName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9f9cb8] hover:text-white bg-[#110f22] border border-[#26223d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Target Lead Location Banner */}
          <div className="py-2.5 px-3 rounded-2xl bg-[#25111f] border border-[#ec1a65]/30">
            <div className="text-[11px] font-semibold text-[#ff5c8a]">
              Selected business location
            </div>
            <div className="text-[15px] font-bold text-white mt-0.5">
              {lead.name}
            </div>
            <div className="text-[12px] text-[#9f9cb8] mt-0.5">
              Floor: <span className="text-white font-medium">{info.currentLeadFloor}</span> · Unit: <span className="text-white font-medium">{info.currentLeadUnit}</span>
            </div>
          </div>

          {/* Entrances Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[13px] text-white flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-[#ec1a65]" />
                <span>Building entrances ({info.entrances.length})</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {info.entrances.map((entrance) => {
                const isSelected = entrance.id === activeEntrance.id;
                return (
                  <button
                    key={entrance.id}
                    type="button"
                    onClick={() => setSelectedEntranceId(entrance.id)}
                    className={`h-9 px-4 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#ec1a65] text-white font-bold shadow-md shadow-[#ec1a65]/30'
                        : 'bg-[#110f22] border border-[#26223d] text-[#9f9cb8] hover:text-white'
                    }`}
                  >
                    <span>{entrance.name}</span>
                    {entrance.isPrimary && (
                      <span className="text-[11px] text-[#00b4d8] font-bold">· Main</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-[13px] text-[#9f9cb8] bg-[#110f22] border border-[#26223d] p-3 rounded-2xl">
              <span className="font-medium text-white">{activeEntrance.name}</span> ({activeEntrance.side} side): {activeEntrance.guidance}
            </div>
          </div>

          {/* Indoor Directory */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-semibold text-[13px] text-white">
                Businesses in building ({info.indoorBusinesses.length})
              </span>

              {/* Floor Tabs */}
              <div className="flex items-center gap-1 bg-[#110f22] p-0.5 rounded-full border border-[#26223d]">
                {['all', 'ground', 'upper'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFloorFilter(tab)}
                    className={`h-7 px-2.5 rounded-full text-[12px] font-medium capitalize transition-all ${
                      activeFloorFilter === tab
                        ? 'bg-white text-black font-bold'
                        : 'text-[#8e8aab] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[#1e1a33]">
              {filteredBusinesses.map((biz) => {
                const isTarget = biz.isTargetLead;

                return (
                  <div
                    key={biz.id}
                    className={`py-2.5 flex items-center justify-between gap-3 ${
                      isTarget ? 'text-[#ff5c8a]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[14px] text-white truncate">
                        {biz.name}
                        {isTarget && (
                          <span className="ml-1.5 text-[11px] text-[#ff5c8a] font-bold">
                            (Current)
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-[#8e8aab]">
                        {biz.floor} · {biz.unitNumber} · {biz.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-[13px] text-white">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{biz.rating}</span>
                        <span className="text-[#8e8aab]">({biz.reviewCount})</span>
                      </div>

                      {onSelectCoTenant && !isTarget && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCoTenant(biz);
                            onClose();
                          }}
                          className="h-7 px-3 rounded-full bg-[#ec1a65] text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
                        >
                          Select
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
        <div className="px-5 py-3 border-t border-[#26223e] flex items-center justify-between text-xs">
          <a
            href={info.gisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00b4d8] font-medium hover:underline inline-flex items-center gap-1 text-[13px]"
          >
            <span>Open in 2GIS.ae</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full bg-[#110f22] hover:bg-[#1a172e] border border-[#26223d] text-white font-medium text-[13px] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
