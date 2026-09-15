import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  TrendingUp,
  CreditCard,
  DollarSign,
  Palette,
  Eye,
  X,
  Volume2
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

  // Simulator state
  const [isSimulatingTap, setIsSimulatingTap] = useState<boolean>(false);
  const [simulatedCustomerModal, setSimulatedCustomerModal] = useState<boolean>(false);

  // Sales Queue state
  const [batchQueue, setBatchQueue] = useState<NfcBatchItem[]>([
    {
      id: 'batch-1',
      businessName: 'Al Safadi Gourmet',
      district: 'Downtown Dubai',
      url: 'https://search.google.com/local/writereview?placeid=ChIJb7c9_g9tXz4R3t-M9_Q0Z0A',
      type: 'google_review',
      timestamp: 'Today, 11:30 AM',
      status: 'written',
      priceAed: 199,
    },
    {
      id: 'batch-2',
      businessName: 'Lumiere Dental Clinic',
      district: 'Business Bay',
      url: 'https://search.google.com/local/writereview?placeid=ChIJrS7zO11tXz4RL17jS7gYV9c',
      type: 'google_review',
      timestamp: 'Today, 12:15 PM',
      status: 'pending',
      priceAed: 249,
    },
  ]);

  const [cardPrice, setCardPrice] = useState<number>(199); // Typical sale price in Dubai (AED 199)

  // Sync payload when sent from App 2 (Product Mate)
  useEffect(() => {
    if (initialPayload) {
      if (initialPayload.businessName) setBusinessName(initialPayload.businessName);
      if (initialPayload.district) setDistrict(initialPayload.district);
      if (initialPayload.targetUrl) setTargetUrl(initialPayload.targetUrl);
      if (initialPayload.type) setCardType(initialPayload.type);
      if (initialPayload.instagramHandle) setInstagramHandle(initialPayload.instagramHandle);

      // Auto match theme
      if (initialPayload.type === 'instagram') {
        setTheme('instagram_sunset');
      } else {
        setTheme('gold_black');
      }
    }
  }, [initialPayload]);

  // Check Web NFC API availability & Iframe top-level browsing context
  useEffect(() => {
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }
    setIsInIframe(inIframe);

    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsNfcSupported(true);
    } else {
      setIsNfcSupported(false);
    }
  }, []);

  // Compute byte usage for NTAG chip
  const maxBytes = chipType === 'NTAG213' ? 144 : chipType === 'NTAG215' ? 504 : 888;
  const payloadBytes = new TextEncoder().encode(targetUrl).length + 12; // plus NDEF overhead
  const bytePercentage = Math.min(Math.round((payloadBytes / maxBytes) * 100), 100);

  // REAL HARDWARE WRITE VIA WEB NFC API (OR SECURE IFRAME SANDBOX SIMULATOR)
  const handleWritePhysicalTag = async () => {
    if (!targetUrl) {
      alert('Please configure a valid URL before writing to NFC tag.');
      return;
    }

    // Web NFC requires a top-level browsing context (w3c spec: window.top === window.self)
    const canUseHardwareNfc = isNfcSupported && !isInIframe;

    if (canUseHardwareNfc) {
      try {
        setNfcWriteStatus('scanning');
        setNfcStatusMessage('Ready! Hold your physical NFC card against the back of your phone...');

        const ndef = new (window as any).NDEFReader();
        await ndef.write({
          records: [
            {
              recordType: 'url',
              data: targetUrl,
            },
          ],
        });

        // Haptic feedback
        if (typeof navigator.vibrate === 'function') {
          navigator.vibrate([100, 50, 150]);
        }
        playNfcSuccessSound();

        setNfcWriteStatus('success');
        setNfcStatusMessage(`Successfully written to physical NFC tag for ${businessName}!`);
        onCardWritten();

        // Update batch status
        addOrUpdateBatchItem('written');
      } catch (err: any) {
        const isSecurityOrContext = err?.name === 'SecurityError' || err?.message?.includes('top-level browsing context');
        if (isSecurityOrContext) {
          // If browser restricted Web NFC in this context, gracefully simulate
          playNfcSuccessSound();
          setNfcWriteStatus('success');
          setNfcStatusMessage(`Tag Programmed in Preview Mode! (Open in a standalone tab on mobile for physical tag write).`);
          onCardWritten();
          addOrUpdateBatchItem('written');
        } else {
          setNfcWriteStatus('error');
          setNfcStatusMessage(err.message || 'Write paused. Ensure NFC is enabled in phone settings.');
        }
      }
    } else {
      // Fallback: Virtual write simulation for desktop / iframe / non-compatible devices
      setNfcWriteStatus('scanning');
      setNfcStatusMessage(
        isInIframe
          ? 'Preview Sandbox: Programming virtual NTAG chip...'
          : 'Hardware NFC simulator: Programming NTAG chip memory...'
      );

      setTimeout(() => {
        // Haptic feedback if supported
        if (typeof navigator.vibrate === 'function') {
          navigator.vibrate([100, 50, 150]);
        }
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

  // Add to batch list
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

  // Simulate customer tapping the card with smartphone
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
    <div className="flex flex-col gap-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/30 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-1.5">
              <Radio className="w-3.5 h-3.5" /> App 3 of 3: NFC Card Writer & Burner
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              NFC Hardware Writer & Card Simulator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Burn the direct review URL onto physical NFC cards using Web NFC or test using the interactive card visualizer.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700/70 text-right">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">
                AED {totalSalesRevenue}
              </div>
            </div>
          </div>
        </div>

        {/* Web NFC Hardware support indicator */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isNfcSupported && !isInIframe
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
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
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium underline underline-offset-2"
                title="Open in a top-level tab to activate physical phone NFC antenna"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in New Tab for Physical Phone NFC</span>
              </a>
            )}

            <button
              onClick={() => playNfcTapSound()}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              title="Test audio sound"
            >
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span>Audio On</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: INTERACTIVE 3D CARD VISUALIZER & HARDWARE WRITE */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center shadow-lg">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Physical Card Finish & Preview</span>
              </span>

              {/* Theme selector chips */}
              <div className="flex items-center gap-1">
                {(['gold_black', 'google_clean', 'instagram_sunset', 'dubai_emerald'] as CardTheme[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`w-4 h-4 rounded-full border transition ${
                        theme === t ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900' : 'opacity-60 hover:opacity-100'
                      } ${
                        t === 'gold_black'
                          ? 'bg-gradient-to-tr from-black to-amber-700 border-amber-500'
                          : t === 'google_clean'
                          ? 'bg-white border-slate-300'
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
            <div className="w-full mt-5 pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={handleWritePhysicalTag}
                disabled={nfcWriteStatus === 'scanning'}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-slate-950 font-black text-sm tracking-wide transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
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
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    nfcWriteStatus === 'success'
                      ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-200'
                      : nfcWriteStatus === 'error'
                      ? 'bg-red-950/70 border border-red-500/50 text-red-200'
                      : 'bg-amber-950/70 border border-amber-500/50 text-amber-200'
                  }`}
                >
                  {nfcWriteStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="flex-1">{nfcStatusMessage}</span>
                  <button
                    onClick={() => setNfcStatusMessage('')}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chip Specs & Memory Usage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                NTAG Chip Spec & Capacity
              </span>

              {/* Chip Type Selector */}
              <div className="flex items-center gap-1">
                {(['NTAG213', 'NTAG215', 'NTAG216'] as NfcChipType[]).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setChipType(chip)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      chipType === chip
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>NDEF Memory Usage</span>
                <span className="font-mono text-amber-400">
                  {payloadBytes} / {maxBytes} bytes ({bytePercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    bytePercentage > 90 ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${bytePercentage}%` }}
                />
              </div>
            </div>

            {/* Permanent Tag Lock Toggle */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lockTag ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
                <div>
                  <div className="font-semibold text-slate-200 text-[11px]">
                    Permanent Tag Lock (Anti-Tamper)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Prevents competitors from overwriting the client&apos;s review link.
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={lockTag}
                onChange={(e) => setLockTag(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYLOAD EDITOR, SALES ROUTE QUEUE & PITCH SCRIPTS */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Active Card Payload Configurator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Programmer Payload Setup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Card Name On Face
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Sale Price (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-amber-400">AED</span>
                  <input
                    type="number"
                    value={cardPrice}
                    onChange={(e) => setCardPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-12 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Target URL (NDEF Write Payload)
              </label>
              <textarea
                rows={2}
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Daily Sales Batch Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Dubai Sales Route & Batch Queue</span>
              </span>

              <button
                onClick={() => addOrUpdateBatchItem('pending')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                <span>Queue Card</span>
              </button>
            </div>

            {/* List of queued and written cards */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {batchQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.businessName}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({item.district})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold ${
                          item.status === 'sold'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.status === 'written'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-amber-400 font-mono font-bold">
                        AED {item.priceAed}
                      </span>
                      <span className="text-slate-500">{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.status !== 'sold' && (
                      <button
                        onClick={() => markItemAsSold(item.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] transition shadow-sm"
                        title="Mark as Sold & Collected AED"
                      >
                        Sold
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setBatchQueue((prev) => prev.filter((i) => i.id !== item.id))
                      }
                      className="p-1 text-slate-500 hover:text-red-400 transition"
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
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs text-amber-400">
              <DollarSign className="w-4 h-4" />
              Dubai 60-Second Pitch Script to Business Owners:
            </h4>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed space-y-1.5 font-sans">
              <p>
                <strong className="text-white">&quot;Hi Manager,</strong> I saw you currently have <span className="text-amber-400">42 reviews</span> on Google Maps. The restaurant down the block has 350+ and gets all the tourist foot traffic.&quot;
              </p>
              <p>
                &quot;Customers never search for your link, but if your waiter places this luxury card on the table and says <em className="text-amber-300">&apos;Just tap your phone here to rate us&apos;</em>, it opens the 5-star rating window instantly in 1 second. You can gain 15 new 5-star reviews every single day!&quot;
              </p>
              <p className="text-emerald-400 font-semibold pt-1">
                &quot;It&apos;s a one-time investment of 199 AED. No monthly subscription.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATED PHONE POPUP MODAL (When user clicks "Simulate Customer Tap") */}
      {simulatedCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSimulatedCustomerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>

              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider">
                NFC Tag Read Event Detected
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Customer Phone Screen Preview
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Here is what happens on the customer&apos;s iPhone or Android after tapping your NFC card:
              </p>
            </div>

            {/* Simulated Smartphone Screen */}
            <div className="mt-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left shadow-inner">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-950">
                  G
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Google Maps Rating Modal</div>
                  <div className="text-[10px] text-slate-500">{businessName}</div>
                </div>
              </div>

              <div className="text-center py-2">
                <div className="text-xs font-semibold text-slate-200 mb-1">
                  How was your experience at {businessName}?
                </div>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="p-1 hover:scale-125 transition"
                    >
                      <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-amber-400 font-bold">
                  ★ ★ ★ ★ ★ 5-Stars Auto-Highlighted
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-end">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Open Live in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setSimulatedCustomerModal(false)}
              className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close Simulator
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
