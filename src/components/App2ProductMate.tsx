import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Mail,
  Globe,
} from 'lucide-react';
import { BusinessLead } from '../types';
import { deriveBusinessWebsite } from '../utils/businessWebsiteUtils';
import {
  isValidPlaceId,
  isOfficialChIJPlaceId,
  buildGoogleReviewUrl,
  hexPairToPlaceIdBrowser,
} from '../utils/googlePlaceIdUtils';

interface App2ProductMateProps {
  initialLead?: BusinessLead | null;
  onSendToNfcTool: (payload: {
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
    websiteUrl?: string;
  }) => void;
}

export const App2ProductMate: React.FC<App2ProductMateProps> = ({
  initialLead,
  onSendToNfcTool,
}) => {
  // Mode: Google Review Link or Instagram NFC Link
  const [mode, setMode] = useState<'google' | 'instagram'>('google');

  // Input states with robust defaults
  const [businessName, setBusinessName] = useState<string>(
    initialLead?.name || 'Al Safadi Restaurant'
  );
  const [district, setDistrict] = useState<string>(
    initialLead?.district || 'Al Rigga, Dubai'
  );
  const [mapLinkInput, setMapLinkInput] = useState<string>(
    initialLead?.mapsUrl || 'https://maps.app.goo.gl/yMHn9hGf2T3t9XRN6'
  );
  const [instagramHandle, setInstagramHandle] = useState<string>(
    initialLead?.instagramHandle || 'alsafadirestaurants'
  );
  const [businessWebsite, setBusinessWebsite] = useState<string>(
    initialLead?.websiteUrl || deriveBusinessWebsite(initialLead?.name || 'Al Safadi Restaurant')
  );

  // Generated outputs
  const initialDefaultName = initialLead?.name || 'Al Safadi Restaurant';
  const initialDefaultDistrict = initialLead?.district || 'Al Rigga, Dubai';
  const [placeId, setPlaceId] = useState<string>(
    initialLead?.placeId && isOfficialChIJPlaceId(initialLead.placeId)
      ? initialLead.placeId
      : ''
  );
  const [generatedReviewUrl, setGeneratedReviewUrl] = useState<string>(
    initialLead?.directReviewUrl ||
      buildGoogleReviewUrl(initialDefaultName, initialDefaultDistrict, initialLead?.placeId)
  );
  const [generatedInstagramUrl, setGeneratedInstagramUrl] = useState<string>(
    `https://www.instagram.com/${initialLead?.instagramHandle || 'alsafadirestaurants'}/`
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [fetchError, setFetchError] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Synchronize when a lead is passed from App 1 (Map Scout)
  useEffect(() => {
    if (initialLead) {
      setMapLinkInput(initialLead.mapsUrl || '');
      setBusinessName(initialLead.name || 'Dubai Business');
      setDistrict(initialLead.district || 'Dubai');
      setInstagramHandle(initialLead.instagramHandle || 'dubaibusiness');
      setBusinessWebsite(initialLead.websiteUrl || deriveBusinessWebsite(initialLead.name));
      setSuccessBanner(`Loaded ${initialLead.name} from Map Scout`);

      if (initialLead.placeId && isOfficialChIJPlaceId(initialLead.placeId)) {
        setPlaceId(initialLead.placeId);
        setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${initialLead.placeId}`);
      } else if (initialLead.directReviewUrl) {
        setGeneratedReviewUrl(initialLead.directReviewUrl);
      } else {
        setGeneratedReviewUrl(
          buildGoogleReviewUrl(
            initialLead.name || 'Dubai Business',
            initialLead.district || 'Dubai',
            initialLead.placeId
          )
        );
      }
    }
  }, [initialLead]);

  // Keep links updated when inputs change
  useEffect(() => {
    if (instagramHandle.trim()) {
      const clean = instagramHandle.replace(/^@/, '').trim();
      setGeneratedInstagramUrl(`https://www.instagram.com/${clean}/`);
    }
  }, [instagramHandle]);

  // Fallback link builder if generatedReviewUrl is missing or has old stub placeId
  useEffect(() => {
    if (!generatedReviewUrl || generatedReviewUrl.includes('ChIJ8_DXB_AlSafadiRigga')) {
      setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, placeId));
    }
  }, [businessName, district, placeId, generatedReviewUrl]);

  // Generate QR Code whenever the active URL changes
  useEffect(() => {
    const activeUrl = mode === 'google' ? generatedReviewUrl : generatedInstagramUrl;
    if (activeUrl) {
      QRCode.toDataURL(
        activeUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#110f22',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeDataUrl(url);
          }
        }
      );
    } else {
      setQrCodeDataUrl('');
    }
  }, [mode, generatedReviewUrl, generatedInstagramUrl]);

  const processGoogleMapLink = async (url: string) => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setFetchError('');

    try {
      const rawUrl = url.trim();

      // 1. Check for placeid= query parameter
      const placeIdMatch = rawUrl.match(/placeid=([a-zA-Z0-9_-]+)/);
      if (placeIdMatch && placeIdMatch[1] && isOfficialChIJPlaceId(placeIdMatch[1])) {
        const pid = placeIdMatch[1];
        setPlaceId(pid);
        setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${pid}`);
        setIsAnalyzing(false);
        return;
      }

      // 2. Check for explicit ChIJ Place ID anywhere in URL
      const chijMatch = rawUrl.match(/(ChIJ[a-zA-Z0-9_-]{23,})/);
      if (chijMatch && chijMatch[1] && isOfficialChIJPlaceId(chijMatch[1])) {
        const pid = chijMatch[1];
        setPlaceId(pid);
        setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${pid}`);
        setIsAnalyzing(false);
        return;
      }

      // 3. Check for 64-bit Hex Feature ID pair (0x...:0x...) anywhere in URL
      const hexMatch = rawUrl.match(/(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
      if (hexMatch && hexMatch[1] && hexMatch[2]) {
        const derived = hexPairToPlaceIdBrowser(hexMatch[1], hexMatch[2]);
        if (derived && isOfficialChIJPlaceId(derived)) {
          setPlaceId(derived);
          setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${derived}`);
          setIsAnalyzing(false);
          return;
        }
      }

      // 4. Extract business name from URL path if available
      const placeNameMatch = rawUrl.match(/\/maps\/place\/([^/@?]+)/);
      if (placeNameMatch && placeNameMatch[1]) {
        const nameFromUrl = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
        if (nameFromUrl && nameFromUrl.length > 2 && !businessName) {
          setBusinessName(nameFromUrl);
        }
      }

      // 5. Query server backend endpoint (works locally, in Cloud Run, and on Vercel)
      const response = await fetch('/api/extract-review-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl, businessName, district }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reviewUrl) {
          if (data.placeId && isOfficialChIJPlaceId(data.placeId)) setPlaceId(data.placeId);
          setGeneratedReviewUrl(data.reviewUrl);
          if (data.businessName && !businessName) {
            setBusinessName(data.businessName);
          }
          setIsAnalyzing(false);
          return;
        }
      }

      // 6. Resilient Fallback
      setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, placeId));
    } catch (_err) {
      setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, placeId));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyUrl = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      websiteUrl: businessWebsite || deriveBusinessWebsite(businessName),
    });
  };

  return (
    <div className="flex flex-col gap-5 pb-20 text-white">
      {/* App Header & Banner */}
      <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> App 2 of 3: Product Mate Free Link Generator
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Direct 5-Star Review & Instagram Generator
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8aab] mt-1 max-w-xl leading-relaxed">
              Converts standard Google Map links into official <strong className="text-[#ff5c8a]">Direct 5-Star Review write links</strong>. Bypasses the map search step so customers tap their phone and rate instantly.
            </p>
          </div>
        </div>

        {/* Lead Transfer Alert if loaded from App 1 */}
        {successBanner && (
          <div className="mt-4 bg-[#110f22] border border-[#10b981]/40 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-[#34d399]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-[#34d399] hover:text-white text-[11px] font-semibold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* GMB Everywhere Audit Strip */}
        {initialLead?.audit && (
          <div className="mt-3.5 bg-[#110f22] border border-[#26223d] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-[#ff5c8a] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5c8a] animate-pulse" />
              <span>GMB Everywhere™ Audit:</span>
              <span className="text-white bg-[#161426] px-2 py-0.5 rounded-lg border border-[#27233e] font-bold">
                {initialLead.audit.auditScore}/100
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-[#8e8aab]">Category: <strong className="text-[#00b4d8]">{initialLead.audit.categoryMatchScore}%</strong></span>
              <span className="text-[#8e8aab]">Completeness: <strong className="text-[#34d399]">{initialLead.audit.profileCompleteness}%</strong></span>
              <span className="text-[#8e8aab]">Velocity: <strong className="text-[#ff5c8a]">{initialLead.audit.reviewVelocity.split(' ')[0]}/mo</strong></span>
              <span className="text-[#8e8aab]">Photos: <strong className="text-white">{initialLead.audit.photosCount}</strong></span>
            </div>
          </div>
        )}

        {/* Mode Toggle: Google Review vs Instagram NFC */}
        <div className="mt-5 pt-4 border-t border-[#26223e]">
          <div className="p-1.5 bg-[#110f22] border border-[#26223d] rounded-2xl flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode('google')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                mode === 'google'
                  ? 'bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white border-transparent shadow-md shadow-[#ec1a65]/20'
                  : 'text-[#8e8aab] border-transparent hover:text-white hover:bg-[#1a172e]'
              }`}
            >
              <div className="flex items-center font-black text-xs tracking-tight shrink-0">
                <span className="text-blue-400">G</span>
                <span className="text-red-400">o</span>
                <span className="text-amber-400">o</span>
                <span className="text-emerald-400">g</span>
              </div>
              <span className="whitespace-nowrap">Google 5★ Review</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('instagram')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                mode === 'instagram'
                  ? 'bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white border-transparent shadow-md shadow-[#ec1a65]/20'
                  : 'text-[#8e8aab] border-transparent hover:text-white hover:bg-[#1a172e]'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="whitespace-nowrap">Instagram Follow</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORM INPUTS & GENERATOR SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Link Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-5 min-w-0">
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8e8aab] flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#ec1a65] shrink-0" />
              <span>Step 1: Input Business Details</span>
            </h3>

            {/* Business Name and District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#8e8aab] mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Marina Breeze Bakery"
                  className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition min-w-0"
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#8e8aab] mb-1.5">
                  Dubai Area / District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dubai Marina"
                  className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition min-w-0"
                />
              </div>
            </div>

            {/* Business Website URL (Auto-captured from Tab 1 for NFC) */}
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <label className="text-[11px] font-semibold text-[#8e8aab] flex items-center gap-1 min-w-0">
                  <Globe className="w-3 h-3 text-[#ec1a65] shrink-0" />
                  <span className="truncate">Business Website Domain</span>
                </label>
                <span className="text-[10px] text-[#ec1a65] font-mono shrink-0">Auto-Synced</span>
              </div>
              <input
                type="text"
                value={businessWebsite}
                onChange={(e) => setBusinessWebsite(e.target.value)}
                placeholder="www.alsafadirestaurants.com"
                className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition font-mono min-w-0"
              />
            </div>

            {mode === 'google' ? (
              /* Google Review Setup Box */
              <div className="flex flex-col gap-3 min-w-0">
                {/* Google Maps Link Box */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <label className="text-[11px] font-semibold text-[#8e8aab]">
                      Google Maps Link or Place URL
                    </label>
                    <span className="text-[10px] text-[#00b4d8] font-mono">Auto-extracts Place ID</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={mapLinkInput}
                      onChange={(e) => setMapLinkInput(e.target.value)}
                      placeholder="Paste Google Maps URL (e.g. https://maps.app.goo.gl/... or https://google.com/maps/...)"
                      className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition min-w-0"
                    />
                  </div>

                  {fetchError && (
                    <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{fetchError}</span>
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => processGoogleMapLink(mapLinkInput)}
                      disabled={isAnalyzing || !mapLinkInput}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ec1a65] to-[#a822d8] hover:opacity-90 text-white text-xs font-bold transition disabled:opacity-40 shadow-md shadow-[#ec1a65]/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAnalyzing ? 'Extracting Place ID...' : 'Extract & Generate Review URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Google Place ID (ChIJ...) Field */}
                <div className="min-w-0 pt-2 border-t border-[#26223d]">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <label className="text-[11px] font-semibold text-[#8e8aab] flex items-center gap-1">
                      <span>Google Place ID (`ChIJ...`)</span>
                    </label>
                    <span className="text-[10px] text-[#34d399] font-mono">Direct 5★ Modal Trigger</span>
                  </div>
                  <input
                    type="text"
                    value={placeId}
                    onChange={(e) => {
                      const newPid = e.target.value.trim();
                      setPlaceId(newPid);
                      if (newPid) {
                        const cleanPid = newPid.startsWith('ChIJ') ? newPid : `ChIJ${newPid}`;
                        setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${cleanPid}`);
                      } else {
                        setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district));
                      }
                    }}
                    placeholder="e.g. ChIJk_FT689cXz4RgmjEHf8HKms"
                    className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition font-mono min-w-0"
                  />
                  <p className="text-[10px] text-[#8e8aab] mt-1">
                    Entering a Place ID generates the direct review popup link: <code className="text-[#00b4d8]">search.google.com/local/writereview?placeid=...</code>
                  </p>
                </div>
              </div>
            ) : (
              /* Instagram Handle Box */
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-[#8e8aab] mb-1.5">
                  Instagram Handle or Profile Link
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#8e8aab] font-semibold">@</span>
                  <input
                    type="text"
                    value={instagramHandle.replace(/^@/, '')}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="marinabreeze.ae"
                    className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl pl-8 pr-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition min-w-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generated Result Box */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#ff5c8a] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Generated NFC Payload URL</span>
              </span>
              <span className="text-[10px] font-mono text-[#34d399] bg-[#102a20] px-2.5 py-0.5 rounded-full border border-[#059669]/40 shrink-0">
                Ready for NFC Tag
              </span>
            </div>

            {/* Display Target URL */}
            <div className="bg-[#110f22] border border-[#26223d] rounded-2xl p-4 flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between gap-2 text-[11px] text-[#8e8aab] flex-wrap">
                <span className="font-semibold">
                  {mode === 'google' ? 'Google 5-Star Review Write URL:' : 'Instagram Direct Follow URL:'}
                </span>
                {mode === 'google' && isValidPlaceId(placeId) && (
                  <span className="text-[10px] font-mono text-[#ff5c8a] bg-[#381423] px-2 py-0.5 rounded-lg border border-[#ec1a65]/30 shrink-0">
                    Place ID: {placeId}
                  </span>
                )}
              </div>

              {mode === 'google' ? (
                generatedReviewUrl ? (
                  <p className="text-xs font-mono text-[#00b4d8] break-all select-all leading-relaxed">
                    {generatedReviewUrl}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Verified Google Place ID not available.</span>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs font-mono text-pink-400 break-all select-all leading-relaxed">
                  {generatedInstagramUrl || 'https://www.instagram.com/...'}
                </p>
              )}
            </div>

            {/* Action buttons: Copy, Test Link, and HAND-OFF TO NFC TOOL */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() =>
                  copyUrl(mode === 'google' ? generatedReviewUrl : generatedInstagramUrl)
                }
                disabled={mode === 'google' && !generatedReviewUrl}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#110f22] hover:bg-[#1a172e] text-white text-xs font-medium border border-[#26223d] transition disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const urlToTest = mode === 'google' ? generatedReviewUrl : generatedInstagramUrl;
                  if (urlToTest) {
                    window.open(urlToTest, '_blank', 'noopener,noreferrer');
                  }
                }}
                disabled={mode === 'google' ? !generatedReviewUrl : !generatedInstagramUrl}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#110f22] hover:bg-[#1a172e] text-white text-xs font-medium border border-[#26223d] transition hover:border-[#00b4d8]/50 disabled:opacity-40"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#00b4d8]" />
                <span>Test in Browser</span>
              </button>

              {/* PRIMARY ACTION: SEND TO APP 3 */}
              <button
                onClick={handleTransferToNfc}
                disabled={mode === 'google' && !generatedReviewUrl}
                className="w-full sm:w-auto flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-[#ec1a65]/25 disabled:opacity-40"
              >
                <span>Send to NFC Tool (App 3)</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Explainer & Dual QR Code Preview */}
        <div className="lg:col-span-5 flex flex-col gap-5 min-w-0">
          {/* Dual QR Code Display */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-6 flex flex-col items-center text-center shadow-2xl min-w-0">
            <div className="flex items-center justify-between w-full mb-4 gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 min-w-0">
                <QrCode className="w-3.5 h-3.5 text-[#ec1a65] shrink-0" />
                <span className="truncate">Dual NFC + QR Preview</span>
              </span>
              <span className="text-[10px] text-[#8e8aab] font-mono shrink-0">High-Res</span>
            </div>

            {/* QR Card Graphic */}
            <div className="w-full max-w-[180px] sm:max-w-[200px] aspect-square bg-white p-3 rounded-2xl shadow-md flex items-center justify-center mx-auto shrink-0">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Review QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-neutral-400 text-xs flex flex-col items-center">
                  <QrCode className="w-8 h-8 mb-1 opacity-40" />
                  <span>Generate URL to view QR</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#8e8aab] mt-3 leading-relaxed max-w-xs">
              Dual NFC + QR cards allow 100% of customers in Dubai to scan and review instantly.
            </p>

            {qrCodeDataUrl && (
              <a
                href={qrCodeDataUrl}
                download={`${businessName || 'Dubai-Business'}-Review-QR.png`}
                className="mt-3 text-xs font-semibold text-[#00b4d8] hover:underline"
              >
                Download QR Code Image
              </a>
            )}
          </div>

          {/* Value Pitch Explainer Box */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-5 text-xs text-[#8e8aab] space-y-2.5 shadow-2xl min-w-0">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
              <span>Why Review Links Convert 3x Higher:</span>
            </h4>
            <p className="text-[#8e8aab] text-[11px] leading-relaxed">
              The <span className="text-[#ff5c8a] font-mono">/local/writereview</span> format opens the native Google review rating screen with 5 stars highlighted immediately on iOS & Android!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
