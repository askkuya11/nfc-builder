import React, { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { App1MapScout } from './components/App1MapScout';
import { App2ProductMate } from './components/App2ProductMate';
import { App3NfcTool } from './components/App3NfcTool';
import { AppTab, BusinessLead } from './types';
import { Compass, Sparkles, Radio, Smartphone, Monitor, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('scout');
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [nfcPayload, setNfcPayload] = useState<{
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
  } | null>(null);
  const [writtenCount, setWrittenCount] = useState<number>(3);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  // Step 1 -> Step 2 Hand-off
  const handleSelectLead = (lead: BusinessLead) => {
    setSelectedLead(lead);
    setActiveTab('generator');
  };

  // Step 2 -> Step 3 Hand-off
  const handleSendToNfcTool = (payload: {
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
  }) => {
    setNfcPayload(payload);
    setActiveTab('nfc');
  };

  const handleCardWritten = () => {
    setWrittenCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Device Viewport Switcher for Desktop Testing */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Dubai NFC B2B Suite</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-medium">Step-by-step App Flow:</span>
          <span className={activeTab === 'scout' ? 'text-white font-bold' : 'text-slate-500'}>
            1. Search Dubai Map
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className={activeTab === 'generator' ? 'text-white font-bold' : 'text-slate-500'}>
            2. Product Mate Review Gen
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className={activeTab === 'nfc' ? 'text-white font-bold' : 'text-slate-500'}>
            3. Write to NFC Tag
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Display Mode:</span>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition ${
              !isPhoneFrame
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Fluid Responsive</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition ${
              isPhoneFrame
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device Frame</span>
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div
        className={`w-full flex-1 flex flex-col mx-auto transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[440px] my-4 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden bg-slate-950 min-h-[850px]'
            : 'max-w-6xl'
        }`}
      >
        {/* App Header with Dubai Clock & Tabs */}
        <AppHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedLeadName={selectedLead?.name}
          generatedUrl={nfcPayload?.targetUrl}
          writtenCount={writtenCount}
        />

        {/* Dynamic App Body View */}
        <main className="flex-1 p-3 sm:p-5 pb-24 sm:pb-16">
          {activeTab === 'scout' && (
            <App1MapScout
              onSelectLead={handleSelectLead}
              selectedLeadId={selectedLead?.id}
            />
          )}

          {activeTab === 'generator' && (
            <App2ProductMate
              initialLead={selectedLead}
              onSendToNfcTool={handleSendToNfcTool}
            />
          )}

          {activeTab === 'nfc' && (
            <App3NfcTool
              initialPayload={nfcPayload}
              onCardWritten={handleCardWritten}
              writtenCount={writtenCount}
            />
          )}
        </main>

        {/* Mobile Sticky Bottom Floating Navigation Dock */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3 max-w-6xl mx-auto flex items-center justify-around select-none">
          <button
            id="nav-dock-scout"
            onClick={() => setActiveTab('scout')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
              activeTab === 'scout' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">1. Map Scout</span>
          </button>

          <button
            id="nav-dock-generator"
            onClick={() => setActiveTab('generator')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
              activeTab === 'generator' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">2. Product Mate</span>
          </button>

          <button
            id="nav-dock-nfc"
            onClick={() => setActiveTab('nfc')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
              activeTab === 'nfc' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">3. NFC Tool</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
