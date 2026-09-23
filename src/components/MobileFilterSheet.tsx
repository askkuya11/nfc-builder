import React from 'react';
import { X, Check, SlidersHorizontal } from 'lucide-react';
import { DUBAI_METRO_STATIONS, DUBAI_GENERAL_DISTRICTS } from '../data/realDubaiBusinesses';
import { parseStationInfo } from './StationPickerSheet';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  district: string;
  setDistrict: (district: string) => void;
  reviewFilter: string;
  setReviewFilter: (filter: string) => void;
  sortBy: 'nearest' | 'sweet_spot' | 'reviews_asc' | 'rating_desc' | 'name_asc';
  setSortBy: (sort: 'nearest' | 'sweet_spot' | 'reviews_asc' | 'rating_desc' | 'name_asc') => void;
  onApply: () => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  district,
  setDistrict,
  reviewFilter,
  setReviewFilter,
  sortBy,
  setSortBy,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter & Sort"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/75 backdrop-blur-sm transition-opacity"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-[#161426] border border-[#27233e] rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-[#332e52] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#26223e]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#ec1a65]" />
            <h2 className="text-[17px] font-bold text-white tracking-tight">
              Filters & Sort
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9f9cb8] hover:text-white bg-[#110f22] border border-[#26223d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="px-5 py-4 overflow-y-auto no-scrollbar space-y-5">
          {/* Target Metro Station */}
          <div>
            <label className="block text-[13px] font-semibold text-[#8e8aab] mb-2">
              Metro Station / Area
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-11 bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] focus:outline-none rounded-full px-4 text-[14px] text-white appearance-none"
              >
                <option value="All Metro Stations" className="bg-[#161426] text-[#00b4d8] font-bold">
                  🚇 All Metro Stations (48 Stations • Red & Green)
                </option>
                <optgroup label="DUBAI METRO STATIONS" className="bg-[#161426] text-white">
                  {DUBAI_METRO_STATIONS.map((d) => {
                    const info = parseStationInfo(d);
                    return (
                      <option key={d} value={d}>
                        {info.displayName} ({info.lineLabel})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="GENERAL COMMERCIAL DISTRICTS" className="bg-[#161426] text-white">
                  {DUBAI_GENERAL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Review Volume Filter */}
          <div>
            <label className="block text-[13px] font-semibold text-[#8e8aab] mb-2">
              Review volume
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '0–100 Reviews', value: 'sweet_spot' },
                { label: '0–20 Reviews', value: '0_to_20' },
                { label: '0–50 Reviews', value: '0_to_50' },
                { label: '20–50 Reviews', value: '20_to_50' },
                { label: 'All Reviews', value: 'all' },
              ].map((item) => {
                const isSelected = reviewFilter === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setReviewFilter(item.value)}
                    className={`h-9 px-4 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#ec1a65] text-white font-bold shadow-md shadow-[#ec1a65]/30'
                        : 'bg-[#110f22] border border-[#26223d] text-[#9f9cb8] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[13px] font-semibold text-[#8e8aab] mb-2">
              Sort order
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Nearest to Metro', value: 'nearest' },
                { label: 'Lowest Reviews', value: 'reviews_asc' },
                { label: 'Highest Rating', value: 'rating_desc' },
                { label: 'Name (A–Z)', value: 'name_asc' },
              ].map((item) => {
                const isSelected = sortBy === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSortBy(item.value as any)}
                    className={`h-9 px-4 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#ec1a65] text-white font-bold shadow-md shadow-[#ec1a65]/30'
                        : 'bg-[#110f22] border border-[#26223d] text-[#9f9cb8] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Capsule Bottom Actions */}
        <div className="px-5 py-3 border-t border-[#26223e] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full bg-[#110f22] hover:bg-[#1a172e] border border-[#26223d] text-[#9f9cb8] hover:text-white font-medium text-[15px] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 h-11 rounded-full bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] hover:opacity-95 text-white font-bold text-[15px] shadow-lg shadow-[#ec1a65]/20 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
