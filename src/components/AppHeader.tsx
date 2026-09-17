import React, { useState, useEffect } from 'react';
import { AppTab } from '../types';

interface AppHeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedLeadName?: string;
  generatedUrl?: string;
  writtenCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  setActiveTab,
  writtenCount,
}) => {
  const [dubaiTime, setDubaiTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      setDubaiTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0d0b18]/95 backdrop-blur-md sticky top-0 z-40 select-none px-4 pt-3 pb-3 border-b border-[#1f1c33] transition-all">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Concentric Radar Icon + ReviewRadar + DUBAI METRO badge */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Radial Target / Radar Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#0072ff] flex items-center justify-center p-2 shadow-lg shadow-[#00c6ff]/20 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[19px] font-bold text-white tracking-tight">
                ReviewRadar
              </span>
              <span className="bg-[#381423] text-[#ff5c8a] border border-[#ff2a6d]/40 text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full">
                Dubai Metro
              </span>
            </div>

            {/* Stepper Breadcrumb Subtitle */}
            <div className="flex items-center gap-1.5 text-[12px] text-[#8e8aab] mt-0.5 font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('scout')}
                className={`hover:text-white transition-colors ${activeTab === 'scout' ? 'text-[#ff5c8a] font-semibold' : ''}`}
              >
                Map Scout
              </button>
              <span className="text-[#514d69]">➔</span>
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`hover:text-white transition-colors ${activeTab === 'generator' ? 'text-[#ff5c8a] font-semibold' : ''}`}
              >
                Product Mate
              </button>
              <span className="text-[#514d69]">➔</span>
              <button
                type="button"
                onClick={() => setActiveTab('nfc')}
                className={`hover:text-white transition-colors ${activeTab === 'nfc' ? 'text-[#ff5c8a] font-semibold' : ''}`}
              >
                NFC Writer
              </button>
            </div>
          </div>
        </div>

        {/* Right Badge: 100% Free & Clock */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-[#102a20] text-[#34d399] border border-[#059669]/40 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>100% Free</span>
          </div>

          {dubaiTime && (
            <span className="hidden sm:inline-block text-[11px] text-[#6f6b8c] font-mono">
              {dubaiTime} GST
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
