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
            <span className="text-[19px] font-bold text-white tracking-tight">
              ReviewRadar
            </span>
          </div>
        </div>

        {/* Right: GST Clock */}
        {dubaiTime && (
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] text-[#6f6b8c] font-mono">
              {dubaiTime} GST
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
