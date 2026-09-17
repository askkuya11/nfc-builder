import React, { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { App1MapScout } from './components/App1MapScout';
import { App2ProductMate } from './components/App2ProductMate';
import { App3NfcTool } from './components/App3NfcTool';
import { AppTab, BusinessLead } from './types';
import { MapPin, Zap, Radio, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('scout');
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [nfcPayload, setNfcPayload] = useState<{
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
    email?: string;
    websiteUrl?: string;
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
    email?: string;
    websiteUrl?: string;
  }) => {
    setNfcPayload(payload);
    setActiveTab('nfc');
  };

  const handleCardWritten = () => {
    setWrittenCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0d0b18] text-white flex flex-col font-sans selection:bg-[#ec1a65]/30 selection:text-white">
      {/* Top Device Viewport Switcher for Testing (Understated) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-[#0c0a16] border-b border-[#1f1c33] text-xs text-[#8e8aab]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-tight">ReviewRadar</span>
          <span className="text-[#3c3755]">/</span>
          <span className={activeTab === 'scout' ? 'text-[#ff5c8a] font-bold' : 'text-[#8e8aab]'}>
            Map Scout
          </span>
          <span className="text-[#3c3755]">/</span>
          <span className={activeTab === 'generator' ? 'text-[#ff5c8a] font-bold' : 'text-[#8e8aab]'}>
            Product Mate
          </span>
          <span className="text-[#3c3755]">/</span>
          <span className={activeTab === 'nfc' ? 'text-[#ff5c8a] font-bold' : 'text-[#8e8aab]'}>
            NFC Writer
          </span>
        </div>

        <div className="flex items-center bg-[#161426] p-0.5 rounded-full border border-[#27233e]">
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
              !isPhoneFrame
                ? 'bg-[#27233e] text-white font-bold shadow-sm'
                : 'text-[#8e8aab] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
              isPhoneFrame
                ? 'bg-[#27233e] text-white font-bold shadow-sm'
                : 'text-[#8e8aab] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>390px Mobile</span>
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div
        className={`w-full flex-1 flex flex-col mx-auto transition-all duration-200 relative ${
          isPhoneFrame
            ? 'max-w-[420px] my-4 rounded-[40px] border-4 border-[#27233e] shadow-2xl overflow-hidden bg-[#0d0b18] min-h-[850px] pb-16'
            : 'max-w-6xl pb-16 px-2 sm:px-4'
        }`}
      >
        {/* App Header matching the image */}
        <AppHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedLeadName={selectedLead?.name}
          generatedUrl={nfcPayload?.targetUrl}
          writtenCount={writtenCount}
        />

        {/* Dynamic Tab Body View */}
        <main className="flex-1 px-3.5 pt-3 pb-8">
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

        {/* Bottom Navigation Dock (Constrained perfectly inside active container width) */}
        <nav
          aria-label="Bottom Navigation"
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-[#0e0c19]/95 backdrop-blur-xl border-t border-[#201d36] pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-4 flex items-center justify-around select-none w-full transition-all duration-200 ${
            isPhoneFrame ? 'max-w-[412px] rounded-b-[36px]' : 'max-w-2xl rounded-t-3xl border-x'
          }`}
        >
          {/* Tab 1: Map Scout */}
          <button
            id="nav-dock-scout"
            type="button"
            onClick={() => setActiveTab('scout')}
            className={`flex flex-col items-center justify-center min-w-[100px] min-h-[48px] py-1 px-3 rounded-2xl transition-all duration-150 ${
              activeTab === 'scout'
                ? 'bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] font-bold shadow-lg shadow-[#ec1a65]/10'
                : 'text-[#7e7b96] hover:text-white'
            }`}
          >
            <MapPin className={`w-4 h-4 mb-0.5 ${activeTab === 'scout' ? 'text-[#ff5c8a]' : 'text-[#7e7b96]'}`} />
            <span className="text-[12px] tracking-tight">Map Scout</span>
          </button>

          {/* Tab 2: Product Mate */}
          <button
            id="nav-dock-generator"
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`flex flex-col items-center justify-center min-w-[100px] min-h-[48px] py-1 px-3 rounded-2xl transition-all duration-150 ${
              activeTab === 'generator'
                ? 'bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] font-bold shadow-lg shadow-[#ec1a65]/10'
                : 'text-[#7e7b96] hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 mb-0.5 ${activeTab === 'generator' ? 'text-[#ff5c8a]' : 'text-[#7e7b96]'}`} />
            <span className="text-[12px] tracking-tight">Product Mate</span>
          </button>

          {/* Tab 3: NFC Writer */}
          <button
            id="nav-dock-nfc"
            type="button"
            onClick={() => setActiveTab('nfc')}
            className={`flex flex-col items-center justify-center min-w-[100px] min-h-[48px] py-1 px-3 rounded-2xl transition-all duration-150 ${
              activeTab === 'nfc'
                ? 'bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] font-bold shadow-lg shadow-[#ec1a65]/10'
                : 'text-[#7e7b96] hover:text-white'
            }`}
          >
            <Radio className={`w-4 h-4 mb-0.5 ${activeTab === 'nfc' ? 'text-[#ff5c8a]' : 'text-[#7e7b96]'}`} />
            <span className="text-[12px] tracking-tight">NFC Writer</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
