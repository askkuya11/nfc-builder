import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Radio, Layers, CheckCircle2, ChevronRight, TrendingUp, Clock, FileSpreadsheet } from 'lucide-react';
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
  selectedLeadName,
  generatedUrl,
  writtenCount,
}) => {
  const [dubaiTime, setDubaiTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Dubai is UTC+4 (GST)
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
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 select-none">
      <div className="px-3 sm:px-5 py-2 flex items-center justify-between gap-2">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-xs tracking-wider shrink-0">
            NFC
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-xs sm:text-sm tracking-tight truncate">
                NFC BizSuite
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                Dubai
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>GST {dubaiTime || '18:00'}</span>
              <span className="text-slate-600 hidden xs:inline">•</span>
              <span className="text-slate-400 hidden xs:inline">UAE 5G</span>
            </div>
          </div>
        </div>

        {/* Desktop-Only Tab Navigation (On Mobile, Navigation is handled by the bottom dock) */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="tab-btn-scout"
            onClick={() => setActiveTab('scout')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition ${
              activeTab === 'scout'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Map Scout</span>
            {selectedLeadName && activeTab !== 'scout' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            id="tab-btn-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition ${
              activeTab === 'generator'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Product Mate</span>
            {generatedUrl && activeTab !== 'generator' && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            id="tab-btn-nfc"
            onClick={() => setActiveTab('nfc')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition ${
              activeTab === 'nfc'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>3. NFC Tool</span>
            {writtenCount > 0 && (
              <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {writtenCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40 px-2 py-1 rounded-lg">
            <Radio className="w-3 h-3 text-amber-400" />
            <span className="font-bold">{writtenCount}</span>
            <span className="hidden xs:inline text-amber-400/80">burnt</span>
          </div>
        </div>
      </div>
    </header>
  );
};
