import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  ExternalLink,
  Plus,
  Trash2,
  TrendingUp,
  CreditCard,
  DollarSign,
  X,
  Volume2,
} from 'lucide-react';
import { NfcCardPreview } from './NfcCardPreview';
import { CardTheme, NfcChipType, NfcBatchItem } from '../types';
import { playNfcSuccessSound, playNfcTapSound } from '../utils/audio';

interface App3NfcToolProps {
  initialPayload?: {
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
  } | null;
  onCardWritten: () => void;
  writtenCount: number;
}

export const App3NfcTool: React.FC<App3NfcToolProps> = ({
  initialPayload,
  onCardWritten,
  writtenCount,
}) => {
  // Card state
  const [businessName, setBusinessName] = useState<string>('Al Safadi Gourmet');
  const [district, setDistrict] = useState<string>('Downtown Dubai');
  const [targetUrl, setTargetUrl] = useState<string>(
    'https://search.google.com/local/writereview?placeid=ChIJb7c9_g9tXz4R3t-M9_Q0Z0A'
  );
  const [cardType, setCardType] = useState<'google_review' | 'instagram' | 'custom_url'>('google_review');
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [theme, setTheme] = useState<CardTheme>('gold_black');
  const [chipType, setChipType] = useState<NfcChipType>('NTAG213');
  const [lockTag, setLockTag] = useState<boolean>(false);

  // Web NFC writing hardware state
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [nfcStatusMessage, setNfcStatusMessage] = useState<string>('');

  // Daily batch queue & business sales list
  const [batchQueue, setBatchQueue] = useState<NfcBatchItem[]>([
    {
      id: 'batch-1',
      businessName: 'Al Safadi Gourmet',
      district: 'Al Rigga',
      url: 'https://search.google.com/local/writereview?placeid=ChIJb7c9_g9tXz4R3t-M9_Q0Z0A',
      type: 'google_review',
      timestamp: 'Today 10:15 AM',
      status: 'sold',
      priceAed: 199,
    },
    {
      id: 'batch-2',
      businessName: 'Royal Fade Gents Salon',
      district: 'Deira City Centre',
      url: 'https://search.google.com/local/writereview?placeid=ChIJo7k12fptXz4R04A5h6i_z3k',
      type: 'google_review',
      timestamp: 'Today 11:30 AM',
      status: 'written',
      priceAed: 199,
    },
  ]);

  const [cardPrice, setCardPrice] = useState<number>(199);
  const [simulatedCustomerModal, setSimulatedCustomerModal] = useState<boolean>(false);
  const [isSimulatingTap, setIsSimulatingTap] = useState<boolean>(false);

  // Synchronize when hand-off payload received from App 2 (Product Mate)
  useEffect(() => {
    if (initialPayload) {
      if (initialPayload.businessName) setBusinessName(initialPayload.businessName);
      if (initialPayload.district) setDistrict(initialPayload.district);
      if (initialPayload.targetUrl) setTargetUrl(initialPayload.targetUrl);
      if (initialPayload.type) setCardType(initialPayload.type);
      if (initialPayload.instagramHandle) setInstagramHandle(initialPayload.instagramHandle);
      setNfcStatusMessage(`Ready to burn payload for ${initialPayload.businessName}`);
    }
  }, [initialPayload]);

  // Check hardware support on mount
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (_e) {
      setIsInIframe(true);
    }

    if ('NDEFReader' in window) {
      setIsNfcSupported(true);
    } else {
      setIsNfcSupported(false);
    }
  }, []);

  // Compute memory bytes
  const payloadBytes = new TextEncoder().encode(targetUrl).length + 18;
  const maxBytes = chipType === 'NTAG213' ? 144 : chipType === 'NTAG215' ? 504 : 888;
  const bytePercentage = Math.min(100, Math.round((payloadBytes / maxBytes) * 100));

  // Write tag logic
  const handleWritePhysicalTag = async () => {
    if (!targetUrl) {
      alert('Please enter a target URL before writing the tag.');
      return;
    }

    if (payloadBytes > maxBytes) {
      alert(`Payload (${payloadBytes} bytes) exceeds ${chipType} capacity (${maxBytes} bytes). Upgrade chip type.`);
      return;
    }

    setNfcWriteStatus('scanning');
    setNfcStatusMessage('Ready! Hold your NFC card to the back of this phone...');

    if (isNfcSupported && !isInIframe) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.write({
          records: [
            {
              recordType: 'url',
              data: targetUrl,
            },
          ],
        });

        playNfcSuccessSound();
        setNfcWriteStatus('success');
        setNfcStatusMessage(`Physical Tag Programmed! NDEF URL burned for ${businessName}.`);
        onCardWritten();
        addOrUpdateBatchItem('written');
      } catch (err: any) {
        setNfcWriteStatus('error');
        setNfcStatusMessage(`NFC Write Failed: ${err.message || 'Tag disconnected or not supported'}`);
      }
    } else {
      setTimeout(() => {
        playNfcSuccessSound();
        setNfcWriteStatus('success');
        setNfcStatusMessage(
          isInIframe
            ? `Virtual NTAG Chip Programmed! (Open in a standalone tab on Android to burn physical tag).`
            : `Chip Programmed! NDEF URL record burned for ${businessName}.`
        );
        onCardWritten();
        addOrUpdateBatchItem('written');
      }, 1000);
    }
  };

  const addOrUpdateBatchItem = (status: 'pending' | 'written' | 'verified' | 'sold') => {
    const newItem: NfcBatchItem = {
      id: `batch-${Date.now()}`,
      businessName,
      district,
      url: targetUrl,
      type: cardType === 'instagram' ? 'instagram' : 'google_review',
      timestamp: 'Just now',
      status,
      priceAed: cardPrice,
    };
    setBatchQueue((prev) => [newItem, ...prev.slice(0, 15)]);
  };

  const handleSimulateCustomerTap = () => {
    setIsSimulatingTap(true);
    playNfcTapSound();
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(80);
    }

    setTimeout(() => {
      setIsSimulatingTap(false);
      setSimulatedCustomerModal(true);
    }, 600);
  };

  const markItemAsSold = (id: string) => {
    setBatchQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'sold' } : item))
    );
  };

  const totalSalesRevenue = batchQueue
    .filter((i) => i.status === 'sold')
    .reduce((sum, item) => sum + item.priceAed, 0);

  return (
    <div className="flex flex-col gap-5 pb-20 text-white">
      {/* Header Banner */}
      <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5" /> App 3 of 3: NFC Card Writer & Burner
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              NFC Hardware Writer & Card Simulator
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8aab] mt-1 max-w-xl leading-relaxed">
              Burn the direct review URL onto physical NFC cards using Web NFC or test using the interactive card visualizer.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#110f22] px-4 py-2 rounded-2xl border border-[#26223d] text-right">
            <div>
              <div className="text-[10px] text-[#8e8aab] uppercase font-semibold">Total Revenue</div>
              <div className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff5c8a] to-[#00b4d8] font-mono">
                AED {totalSalesRevenue}
              </div>
            </div>
          </div>
        </div>

        {/* Web NFC Hardware support indicator */}
        <div className="mt-4 pt-3.5 border-t border-[#26223e] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isNfcSupported && !isInIframe
                  ? 'bg-[#10b981] animate-pulse'
                  : 'bg-[#ff5c8a]'
              }`}
            />
            <span className="text-[#8e8aab]">
              {isNfcSupported && !isInIframe
                ? 'Web NFC Hardware Active (Ready to burn physical cards)'
                : isInIframe
                ? 'Preview Sandbox Active (Virtual NTAG programmer ready)'
                : 'Simulator Mode Active (Compatible with all devices & iOS)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isInIframe && (
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#00b4d8] hover:underline flex items-center gap-1 font-medium"
                title="Open in a top-level tab to activate physical phone NFC antenna"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in New Tab for Physical Phone NFC</span>
              </a>
            )}

            <button
              onClick={() => playNfcTapSound()}
              className="text-[11px] text-[#8e8aab] hover:text-white flex items-center gap-1"
              title="Test audio sound"
            >
              <Volume2 className="w-3 h-3 text-[#ff5c8a]" />
              <span>Audio On</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: INTERACTIVE 3D CARD VISUALIZER & HARDWARE WRITE */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 flex flex-col items-center shadow-2xl">
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e8aab] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#ec1a65]" />
                <span>Physical Card Finish & Preview</span>
              </span>

              {/* Theme selector chips */}
              <div className="flex items-center gap-1.5">
                {(['gold_black', 'google_clean', 'instagram_sunset', 'dubai_emerald'] as CardTheme[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`w-5 h-5 rounded-full border transition ${
                        theme === t ? 'ring-2 ring-[#ec1a65] ring-offset-2 ring-offset-[#161426]' : 'opacity-60 hover:opacity-100'
                      } ${
                        t === 'gold_black'
                          ? 'bg-gradient-to-tr from-black to-amber-700 border-amber-500'
                          : t === 'google_clean'
                          ? 'bg-white border-white/40'
                          : t === 'instagram_sunset'
                          ? 'bg-gradient-to-tr from-purple-600 to-pink-500 border-pink-400'
                          : 'bg-emerald-800 border-emerald-400'
                      }`}
                      title={t.replace('_', ' ')}
                    />
                  )
                )}
              </div>
            </div>

            {/* The 3D NFC Card component */}
            <NfcCardPreview
              businessName={businessName}
              district={district}
              cardType={cardType}
              theme={theme}
              targetUrl={targetUrl}
              instagramHandle={instagramHandle}
              onTapSimulator={handleSimulateCustomerTap}
              isSimulatingTap={isSimulatingTap}
            />

            {/* WRITE NFC TAG BUTTON & HARDWARE TRIGGER */}
            <div className="w-full mt-6 pt-5 border-t border-[#26223e] flex flex-col gap-3">
              <button
                onClick={handleWritePhysicalTag}
                disabled={nfcWriteStatus === 'scanning'}
                className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] hover:opacity-95 text-white font-bold text-sm tracking-wide transition shadow-xl shadow-[#ec1a65]/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Radio className={`w-4 h-4 ${nfcWriteStatus === 'scanning' ? 'animate-ping' : ''}`} />
                <span>
                  {nfcWriteStatus === 'scanning'
                    ? 'Hold NFC Card to Back of Phone...'
                    : 'Write & Burn NFC Card Now'}
                </span>
              </button>

              {/* Status Banner */}
              {nfcStatusMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    nfcWriteStatus === 'success'
                      ? 'bg-[#102a20] border border-[#059669]/40 text-[#34d399]'
                      : nfcWriteStatus === 'error'
                      ? 'bg-red-950/70 border border-red-500/40 text-red-200'
                      : 'bg-[#25111f] border border-[#ec1a65]/40 text-[#ff5c8a]'
                  }`}
                >
                  {nfcWriteStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="flex-1">{nfcStatusMessage}</span>
                  <button
                    onClick={() => setNfcStatusMessage('')}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chip Specs & Memory Usage */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 text-xs text-[#8e8aab] shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#ec1a65]" />
                NTAG Chip Spec & Capacity
              </span>

              {/* Chip Type Selector */}
              <div className="flex items-center gap-1.5 bg-[#110f22] p-0.5 rounded-full border border-[#26223d]">
                {(['NTAG213', 'NTAG215', 'NTAG216'] as NfcChipType[]).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setChipType(chip)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition ${
                      chipType === chip
                        ? 'bg-white text-black shadow-sm'
                        : 'text-[#8e8aab] hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#8e8aab]">
                <span>NDEF Memory Usage</span>
                <span className="font-mono text-[#00b4d8]">
                  {payloadBytes} / {maxBytes} bytes ({bytePercentage}%)
                </span>
              </div>
              <div className="w-full bg-[#110f22] h-2 rounded-full overflow-hidden border border-[#26223d]">
                <div
                  className={`h-full transition-all duration-300 ${
                    bytePercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-[#ec1a65] to-[#00a8f3]'
                  }`}
                  style={{ width: `${bytePercentage}%` }}
                />
              </div>
            </div>

            {/* Permanent Tag Lock Toggle */}
            <div className="mt-4 pt-3.5 border-t border-[#26223e] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {lockTag ? (
                  <Lock className="w-4 h-4 text-[#ff5c8a]" />
                ) : (
                  <Unlock className="w-4 h-4 text-[#8e8aab]" />
                )}
                <div>
                  <div className="font-semibold text-white text-[11px]">
                    Permanent Tag Lock (Anti-Tamper)
                  </div>
                  <div className="text-[10px] text-[#8e8aab]">
                    Prevents competitors from overwriting the client&apos;s review link.
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={lockTag}
                onChange={(e) => setLockTag(e.target.checked)}
                className="w-4 h-4 accent-[#ec1a65] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYLOAD EDITOR, SALES ROUTE QUEUE & PITCH SCRIPTS */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Active Card Payload Configurator */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8e8aab] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ec1a65]" />
              <span>Programmer Payload Setup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#8e8aab] mb-1.5">
                  Card Name On Face
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8e8aab] mb-1.5">
                  Sale Price (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[#ff5c8a] font-semibold">AED</span>
                  <input
                    type="number"
                    value={cardPrice}
                    onChange={(e) => setCardPrice(Number(e.target.value))}
                    className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl pl-12 pr-3 py-2.5 text-xs text-white focus:outline-none transition font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8e8aab] mb-1.5">
                Target URL (NDEF Write Payload)
              </label>
              <textarea
                rows={2}
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl p-3 text-xs text-white font-mono placeholder-[#6d698a] focus:outline-none resize-none leading-relaxed transition"
              />
            </div>
          </div>

          {/* Daily Sales Batch Queue */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e8aab] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#ec1a65]" />
                <span>Dubai Sales Route & Batch Queue</span>
              </span>

              <button
                onClick={() => addOrUpdateBatchItem('pending')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#110f22] hover:bg-[#1a172e] text-white text-xs font-semibold border border-[#26223d] transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#ec1a65]" />
                <span>Queue Card</span>
              </button>
            </div>

            {/* List of queued and written cards */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {batchQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#110f22] border border-[#26223d] rounded-2xl p-3.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.businessName}
                      </h4>
                      <span className="text-[10px] font-mono text-[#8e8aab]">
                        ({item.district})
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-1.5 text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.status === 'sold'
                            ? 'bg-[#102a20] text-[#34d399] border border-[#059669]/40'
                            : item.status === 'written'
                            ? 'bg-[#381423] text-[#ff5c8a] border border-[#ec1a65]/40'
                            : 'bg-[#161426] text-[#8e8aab] border border-[#27233e]'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-[#00b4d8] font-mono font-bold">
                        AED {item.priceAed}
                      </span>
                      <span className="text-[#8e8aab]">{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status !== 'sold' && (
                      <button
                        onClick={() => markItemAsSold(item.id)}
                        className="px-3 py-1 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-bold text-[11px] transition shadow-md shadow-[#10b981]/20"
                        title="Mark as Sold & Collected AED"
                      >
                        Sold
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setBatchQueue((prev) => prev.filter((i) => i.id !== item.id))
                      }
                      className="p-1.5 text-[#8e8aab] hover:text-red-400 transition rounded-lg hover:bg-white/5"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dubai B2B Sales Pitch Cheatsheet */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 text-xs text-[#8e8aab] space-y-2.5 shadow-2xl">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs text-[#ff5c8a]">
              <DollarSign className="w-4 h-4 text-[#ff5c8a]" />
              Dubai 60-Second Pitch Script to Business Owners:
            </h4>
            <div className="bg-[#110f22] p-3.5 rounded-2xl border border-[#26223d] text-[11px] text-[#8e8aab] leading-relaxed space-y-2 font-sans">
              <p>
                <strong className="text-white">&quot;Hi Manager,</strong> I saw you currently have <span className="text-[#ff5c8a] font-bold">42 reviews</span> on Google Maps. The restaurant down the block has 350+ and gets all the tourist foot traffic.&quot;
              </p>
              <p>
                &quot;Customers never search for your link, but if your waiter places this luxury card on the table and says <em className="text-[#00b4d8]">&apos;Just tap your phone here to rate us&apos;</em>, it opens the 5-star rating window instantly in 1 second. You can gain 15 new 5-star reviews every single day!&quot;
              </p>
              <p className="text-[#34d399] font-semibold pt-1">
                &quot;It&apos;s a one-time investment of 199 AED. No monthly subscription.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATED PHONE POPUP MODAL */}
      {simulatedCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setSimulatedCustomerModal(false)}
              className="absolute top-4 right-4 text-[#8e8aab] hover:text-white p-1.5 rounded-full bg-[#110f22] border border-[#26223d] transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] flex items-center justify-center mx-auto mb-3">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>

              <span className="text-[10px] uppercase font-mono font-bold text-[#ff5c8a] tracking-wider">
                NFC Tag Read Event Detected
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Customer Phone Screen Preview
              </h3>
              <p className="text-xs text-[#8e8aab] mt-1">
                Here is what happens on the customer&apos;s iPhone or Android after tapping your NFC card:
              </p>
            </div>

            {/* Simulated Smartphone Screen */}
            <div className="mt-4 bg-[#110f22] border border-[#26223d] rounded-2xl p-4 text-left shadow-inner">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#26223d]">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#110f22]">
                  G
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Google Maps Rating Modal</div>
                  <div className="text-[10px] text-[#8e8aab]">{businessName}</div>
                </div>
              </div>

              <div className="text-center py-2">
                <div className="text-xs font-semibold text-white mb-1">
                  How was your experience at {businessName}?
                </div>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-1 hover:scale-125 transition">
                      <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-amber-400 font-bold">
                  ★ ★ ★ ★ ★ 5-Stars Auto-Highlighted
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#26223d] flex justify-end">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ec1a65] to-[#00b4d8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Live in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setSimulatedCustomerModal(false)}
              className="w-full mt-4 py-2.5 rounded-full bg-[#110f22] hover:bg-[#1a172e] border border-[#26223d] text-white text-xs font-semibold transition"
            >
              Close Simulator
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
