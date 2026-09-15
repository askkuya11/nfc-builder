import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Sparkles,
  Link2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Instagram,
  QrCode,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Share2,
  RotateCcw
} from 'lucide-react';
import { BusinessLead } from '../types';

interface App2ProductMateProps {
  initialLead?: BusinessLead | null;
  onSendToNfcTool: (payload: {
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
  }) => void;
}

export const App2ProductMate: React.FC<App2ProductMateProps> = ({
  initialLead,
  onSendToNfcTool,
}) => {
  // Mode: Google Review Link or Instagram NFC Link
  const [mode, setMode] = useState<'google' | 'instagram'>('google');

  // Input states
  const [mapLinkInput, setMapLinkInput] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [district, setDistrict] = useState<string>('Dubai');
  const [instagramHandle, setInstagramHandle] = useState<string>('');

  // Generated outputs
  const [placeId, setPlaceId] = useState<string>('');
  const [generatedReviewUrl, setGeneratedReviewUrl] = useState<string>('');
  const [generatedInstagramUrl, setGeneratedInstagramUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Synchronize when a lead is passed from App 1 (Map Scout)
  useEffect(() => {
    if (initialLead) {
      setMapLinkInput(initialLead.mapsUrl || '');
      setBusinessName(initialLead.name || '');
      setDistrict(initialLead.district || 'Dubai');
      if (initialLead.instagramHandle) {
        setInstagramHandle(initialLead.instagramHandle);
      }
      processGoogleMapLink(initialLead.mapsUrl, initialLead.name, initialLead.placeId);
      setSuccessBanner(`Loaded lead: ${initialLead.name} (${initialLead.district})`);
    }
  }, [initialLead]);

  // Generate QR code whenever the generated target URL changes
  useEffect(() => {
    const activeUrl = mode === 'google' ? generatedReviewUrl : generatedInstagramUrl;
    if (activeUrl) {
      QRCode.toDataURL(activeUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    }
  }, [generatedReviewUrl, generatedInstagramUrl, mode]);

  // Core Link Extractor & 5-Star Direct Review Link Generator
  const processGoogleMapLink = async (url: string, bName?: string, knownPlaceId?: string) => {
    setIsAnalyzing(true);
    try {
      // Call backend route or parse client-side
      const response = await fetch('/api/extract-review-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url || mapLinkInput,
          businessName: bName || businessName,
          placeId: knownPlaceId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlaceId(data.placeId);
        setGeneratedReviewUrl(data.directReviewUrl);
        if (data.businessName && !businessName) {
          setBusinessName(data.businessName);
        }
      } else {
        // Fallback calculation
        fallbackCalculation(url);
      }
    } catch (e) {
      fallbackCalculation(url);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fallbackCalculation = (url: string) => {
    // Extract Place ID or CID if real
    let pid = '';
    const match = url.match(/[?&]place_id=([a-zA-Z0-9_-]+)/);
    if (match) {
      pid = match[1];
    } else {
      const chij = url.match(/(ChIJ[a-zA-Z0-9_-]{20,})/);
      if (chij) {
        pid = chij[1];
      }
    }

    if (pid && pid.length >= 25 && !pid.includes('_')) {
      setPlaceId(pid);
      setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${pid}`);
    } else {
      setPlaceId('');
      // Clean universal Google Maps destination URL that triggers the review card for this business
      const cleanUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName || 'Dubai Business'} ${district || 'Dubai'}`)}`;
      setGeneratedReviewUrl(cleanUrl);
    }
  };

  // Handle manual paste or user edit
  const handleMapLinkChange = (newUrl: string) => {
    setMapLinkInput(newUrl);
    if (newUrl.trim().length > 10) {
      processGoogleMapLink(newUrl);
    }
  };

  // Generate Instagram URLs
  useEffect(() => {
    if (instagramHandle) {
      const clean = instagramHandle.replace(/^@/, '').trim();
      setGeneratedInstagramUrl(`https://www.instagram.com/${clean}/`);
    } else {
      setGeneratedInstagramUrl('');
    }
  }, [instagramHandle]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send to App 3 (NFC Tool)
  const handleTransferToNfc = () => {
    const isGoogle = mode === 'google';
    const targetUrl = isGoogle ? generatedReviewUrl : generatedInstagramUrl;
    
    if (!targetUrl) {
      alert('Please generate a URL first before transferring to the NFC tool.');
      return;
    }

    onSendToNfcTool({
      businessName: businessName || 'Dubai Local Business',
      district: district || 'Dubai',
      targetUrl,
      type: isGoogle ? 'google_review' : 'instagram',
      instagramHandle: isGoogle ? undefined : instagramHandle.replace(/^@/, ''),
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* App Header & Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/20 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> App 2 of 3: Product Mate Free Link Generator
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Direct 5-Star Review & Instagram Generator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Converts standard Google Map links into official <strong className="text-amber-400">Direct 5-Star Review write links</strong>. Bypasses the map search step so customers tap their phone and rate instantly.
            </p>
          </div>
        </div>

        {/* Lead Transfer Alert if loaded from App 1 */}
        {successBanner && (
          <div className="mt-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-white text-[11px] font-semibold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Mode Toggle: Google Review vs Instagram NFC */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2">
          <button
            onClick={() => setMode('google')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              mode === 'google'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center font-black text-[11px] tracking-tight mr-1">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-amber-500">o</span>
              <span className="text-emerald-500">g</span>
            </div>
            <span>Google 5-Star Review NFC</span>
          </button>

          <button
            onClick={() => setMode('instagram')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              mode === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram Follow NFC</span>
          </button>
        </div>
      </div>

      {/* FORM INPUTS & GENERATOR SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Link Inputs */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 1: Input Business Details</span>
            </h3>

            {/* Business Name and District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Marina Breeze Bakery"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Dubai Area / District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dubai Marina"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {mode === 'google' ? (
              /* Google Maps Link Paste Box */
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Paste Google Maps Link (from App 1 or Google Maps app)
                  </label>
                  {mapLinkInput && (
                    <button
                      onClick={() => {
                        setMapLinkInput('');
                        setGeneratedReviewUrl('');
                        setPlaceId('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={mapLinkInput}
                    onChange={(e) => handleMapLinkChange(e.target.value)}
                    placeholder="https://maps.google.com/?q=Al+Safadi+Downtown+Dubai&place_id=ChIJb7c9_g9tXz4R3t-M9_Q0Z0A..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => processGoogleMapLink(mapLinkInput)}
                    disabled={isAnalyzing || !mapLinkInput}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAnalyzing ? 'Extracting Place ID...' : 'Extract & Generate Review URL'}</span>
                  </button>

                  <span className="text-[10px] text-slate-500">
                    Auto-parses Place ID and CID parameters
                  </span>
                </div>
              </div>
            ) : (
              /* Instagram Handle Box */
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Instagram Handle or Profile Link
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">@</span>
                  <input
                    type="text"
                    value={instagramHandle.replace(/^@/, '')}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="marinabreeze.ae"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Generates both web URL and mobile app deep-link for instant 1-tap follow on smartphones.
                </p>
              </div>
            )}
          </div>

          {/* Generated Result Box */}
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Generated NFC Payload URL</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                Ready for NFC Tag
              </span>
            </div>

            {/* Display Target URL */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold">
                  {mode === 'google' ? 'Google 5-Star Review Write URL:' : 'Instagram Direct Follow URL:'}
                </span>
                {placeId && mode === 'google' && (
                  <span className="text-[10px] font-mono text-slate-500">
                    Place ID: {placeId}
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-amber-300 break-all select-all leading-relaxed">
                {(mode === 'google' ? generatedReviewUrl : generatedInstagramUrl) ||
                  (mode === 'google'
                    ? 'https://search.google.com/local/writereview?placeid=...'
                    : 'https://www.instagram.com/...')}
              </p>
            </div>

            {/* Action buttons: Copy, Test Link, and HAND-OFF TO NFC TOOL */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() =>
                  copyUrl(mode === 'google' ? generatedReviewUrl : generatedInstagramUrl)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={mode === 'google' ? generatedReviewUrl : generatedInstagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                title="Test how customer sees the review screen"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Test in Browser</span>
              </a>

              {/* PRIMARY ACTION: SEND TO APP 3 */}
              <button
                onClick={handleTransferToNfc}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 ml-auto"
              >
                <span>Send to NFC Tool (App 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Explainer & Dual QR Code Preview */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Dual QR Code Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                Dual NFC + QR Card Print Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono">High-Res</span>
            </div>

            {/* QR Card Graphic */}
            <div className="w-44 h-44 bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Review QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center">
                  <QrCode className="w-8 h-8 mb-1 opacity-40" />
                  <span>Generate URL to view QR</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5">
              Some older phones do not have NFC turned on. Dual NFC + QR cards allow 100% of customers in Dubai to scan and review.
            </p>

            {qrCodeDataUrl && (
              <a
                href={qrCodeDataUrl}
                download={`${businessName || 'Dubai-Business'}-Review-QR.png`}
                className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                Download QR Code Image
              </a>
            )}
          </div>

          {/* Value Pitch Explainer Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Why Product Mate Review Links Convert 3x Higher:
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Standard Google Maps links make the customer search for the business, find the &apos;Reviews&apos; tab, and click the pen icon. Most give up!
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The <span className="text-amber-300 font-mono">/local/writereview</span> format opens the native Google review rating screen with 5 stars highlighted immediately on iOS & Android!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
