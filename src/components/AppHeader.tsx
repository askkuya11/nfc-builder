import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Radio, Smartphone, Layers, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';
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
        second: '2-digit',
        hour12: false,
      };
      setDubaiTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 select-none">
      {/* Mobile Top System Bar */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-mono tracking-tight text-slate-400 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-200 font-semibold">DUBAI (GST) {dubaiTime || '18:00'}</span>
          <span className="text-slate-500 hidden sm:inline">• Target Market: UAE Local B2B</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
            <TrendingUp className="w-3 h-3" />
            <span>NFC Ready: {writtenCount} cards</span>
          </span>
          <span className="text-slate-400 hidden xs:inline">5G UAE</span>
        </div>
      </div>

      {/* Main Suite Brand & App Navigation Tabs */}
      <div className="px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-sm tracking-wider">
              NFC
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight leading-tight flex items-center gap-1.5">
                NFC BizSuite Dubai
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Enterprise
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                3-in-1 Workflow: Scout Leads ➔ Generate Link ➔ Burn NFC
              </p>
            </div>
          </div>

          {/* Quick Step Status Pill */}
          <div className="hidden md:flex items-center gap-1 text-xs bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <span className={activeTab === 'scout' ? 'text-amber-400 font-bold' : 'text-slate-400'}>1. Map Scout</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={activeTab === 'generator' ? 'text-amber-400 font-bold' : 'text-slate-400'}>2. Product Mate</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className={activeTab === 'nfc' ? 'text-amber-400 font-bold' : 'text-slate-400'}>3. NFC Burner</span>
          </div>
        </div>

        {/* 3 Dedicated App Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            id="tab-btn-scout"
            onClick={() => setActiveTab('scout')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
              activeTab === 'scout'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">1. Map Scout</span>
            {selectedLeadName && activeTab !== 'scout' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
            )}
          </button>

          <button
            id="tab-btn-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
              activeTab === 'generator'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">2. Product Mate</span>
            {generatedUrl && activeTab !== 'generator' && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute top-1 right-1" />
            )}
          </button>

          <button
            id="tab-btn-nfc"
            onClick={() => setActiveTab('nfc')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
              activeTab === 'nfc'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Radio className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">3. NFC Tool</span>
            {writtenCount > 0 && (
              <span className="text-[10px] bg-slate-900 text-amber-300 px-1 rounded-full font-mono font-bold">
                {writtenCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
