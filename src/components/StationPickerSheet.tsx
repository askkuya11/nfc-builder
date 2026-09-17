import React, { useState, useMemo } from 'react';
import {
  DUBAI_METRO_STATIONS,
  DUBAI_GENERAL_DISTRICTS,
} from '../data/realDubaiBusinesses';
import { Search, X, Check, TrainFront } from 'lucide-react';

interface StationPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStation: string;
  onSelectStation: (station: string) => void;
}

export const parseStationInfo = (stationString: string) => {
  const isRed = stationString.includes('Red Line') || stationString.includes('Red & Green');
  const isGreen = stationString.includes('Green Line') || stationString.includes('Red & Green');
  const isInterchange = stationString.includes('Interchange');

  let displayName = stationString.replace(/\(.*?\)/g, '').trim();
  let lineLabel = 'Red Line';
  if (isInterchange) lineLabel = 'Red & Green Interchange';
  else if (isGreen && !isRed) lineLabel = 'Green Line';

  let area = 'Dubai Central';
  if (stationString.includes('Rigga') || stationString.includes('Deira') || stationString.includes('DCC') || stationString.includes('Union') || stationString.includes('Baniyas') || stationString.includes('Salah Al Din') || stationString.includes('Gold Souq') || stationString.includes('Al Ras')) {
    area = 'Deira Historic District';
  } else if (stationString.includes('BurJuman') || stationString.includes('Fahidi') || stationString.includes('ADCB') || stationString.includes('Karama') || stationString.includes('Ghubaiba') || stationString.includes('Oud Metha')) {
    area = 'Bur Dubai / Karama';
  } else if (stationString.includes('Business Bay') || stationString.includes('Downtown') || stationString.includes('Burj Khalifa') || stationString.includes('Financial Centre') || stationString.includes('World Trade') || stationString.includes('Emirates Towers')) {
    area = 'Downtown & DIFC';
  } else if (stationString.includes('Mall of the Emirates') || stationString.includes('Barsha') || stationString.includes('Mashreq') || stationString.includes('Safa') || stationString.includes('Equiti')) {
    area = 'Al Barsha / SZR';
  } else if (stationString.includes('DMCC') || stationString.includes('Sobha') || stationString.includes('Marina') || stationString.includes('Jabal Ali') || stationString.includes('Ibn Battuta')) {
    area = 'Dubai Marina & JLT';
  } else if (stationString.includes('Airport') || stationString.includes('Emirates') || stationString.includes('Centrepoint') || stationString.includes('GGICO') || stationString.includes('DAFZA')) {
    area = 'Airport & Garhoud';
  } else if (stationString.includes('Qusais') || stationString.includes('Nahda') || stationString.includes('Stadium') || stationString.includes('Qiyadah') || stationString.includes('Abu Hail') || stationString.includes('Abu Baker')) {
    area = 'Al Qusais & Deira';
  } else if (stationString.includes('Healthcare') || stationString.includes('Jadaf') || stationString.includes('Creek')) {
    area = 'Dubai Creek & DHC';
  }

  return { displayName, lineLabel, area, isRed, isGreen, isInterchange };
};

export const StationPickerSheet: React.FC<StationPickerSheetProps> = ({
  isOpen,
  onClose,
  selectedStation,
  onSelectStation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLine, setFilterLine] = useState<'all' | 'red' | 'green'>('all');

  const redCount = useMemo(() => DUBAI_METRO_STATIONS.filter((s) => s.includes('Red Line') || s.includes('Red & Green')).length, []);
  const greenCount = useMemo(() => DUBAI_METRO_STATIONS.filter((s) => s.includes('Green Line') || s.includes('Red & Green')).length, []);
  const allCount = DUBAI_METRO_STATIONS.length;

  const filteredStations = useMemo(() => {
    let list = DUBAI_METRO_STATIONS;
    if (filterLine === 'red') {
      list = list.filter((s) => s.includes('Red Line') || s.includes('Red & Green'));
    } else if (filterLine === 'green') {
      list = list.filter((s) => s.includes('Green Line') || s.includes('Red & Green'));
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((s) => s.toLowerCase().includes(q));
  }, [filterLine, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose Metro Station"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/75 backdrop-blur-sm transition-opacity"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-[#161426] border border-[#27233e] rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-[#332e52] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header Bar */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#26223e]">
          <div className="flex items-center gap-2">
            <TrainFront className="w-4 h-4 text-[#ec1a65]" />
            <h2 className="text-[17px] font-bold text-white tracking-tight">
              Target Metro Station
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close station picker"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9f9cb8] hover:text-white bg-[#110f22] border border-[#26223d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-5 pt-3 pb-2 space-y-3 border-b border-[#26223e]">
          {/* Line Filter Capsule Switch matching image */}
          <div className="flex items-center bg-[#100e1f] p-1 rounded-full border border-[#26223e]">
            <button
              type="button"
              onClick={() => setFilterLine('all')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                filterLine === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              All ({allCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterLine('red')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                filterLine === 'red'
                  ? 'bg-[#ff3366] text-white shadow-sm'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ff3366]" />
              <span>Red ({redCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterLine('green')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                filterLine === 'green'
                  ? 'bg-[#10b981] text-white shadow-sm'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Green ({greenCount})</span>
            </button>
          </div>

          {/* Search Input matching image */}
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-[#8e8aab] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find station: Al Rigga, Union, BurJuman…"
              className="w-full h-11 bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] focus:outline-none rounded-full pl-10 pr-4 text-[14px] text-white placeholder-[#6d698a] transition-colors"
            />
          </div>
        </div>

        {/* Station List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e1a33] px-3">
          {filteredStations.map((station) => {
            const isSelected = selectedStation === station;
            const info = parseStationInfo(station);

            return (
              <button
                key={station}
                type="button"
                onClick={() => {
                  onSelectStation(station);
                  onClose();
                }}
                className={`w-full py-3 px-3 text-left flex items-center justify-between gap-3 hover:bg-[#1a172e] rounded-xl transition-colors ${
                  isSelected ? 'bg-[#25111f] border border-[#ec1a65]/40' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      info.isGreen && !info.isRed
                        ? 'bg-[#10b981]'
                        : info.isInterchange
                        ? 'bg-gradient-to-r from-[#ff3366] to-[#10b981]'
                        : 'bg-[#ff3366]'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-white tracking-tight truncate leading-tight">
                      {info.displayName}
                    </div>
                    <div className="text-[12px] text-[#8e8aab] truncate leading-tight mt-0.5">
                      {info.lineLabel} · {info.area}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#ff5c8a] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
