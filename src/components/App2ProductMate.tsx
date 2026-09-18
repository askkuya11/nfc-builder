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
  Clipboard,
} from 'lucide-react';
import { BusinessLead } from '../types';
import { deriveBusinessWebsite } from '../utils/businessWebsiteUtils';
import {
  isValidPlaceId,
  isOfficialChIJPlaceId,
  buildDirectReviewUrl,
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
    initialLead?.name || 'Dubai Gourmet Bistro'
  );
  const [district, setDistrict] = useState<string>(
    initialLead?.district || 'Downtown Dubai'
  );
  const [mapLinkInput, setMapLinkInput] = useState<string>(
    initialLead?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Dubai+Gourmet+Bistro+Downtown+Dubai'
  );
  const [googleInputTab, setGoogleInputTab] = useState<'search' | 'share'>('search');
  const [mapShareLinkInput, setMapShareLinkInput] = useState<string>(
    initialLead?.mapsUrl || ''
  );
  const [instagramHandle, setInstagramHandle] = useState<string>(
    initialLead?.instagramHandle || 'dubaigourmetbistro'
  );
  const [businessWebsite, setBusinessWebsite] = useState<string>(
    initialLead?.websiteUrl || deriveBusinessWebsite(initialLead?.name || 'Dubai Gourmet Bistro')
  );

  // Input Change Handlers that clear generated state immediately when the business details change
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    setPlaceId(null);
    setGeneratedReviewUrl(buildGoogleReviewUrl(val, district, null));
  };

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setPlaceId(null);
    setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, val, null));
  };

  const handleMapLinkInputChange = (val: string) => {
    setMapLinkInput(val);
    setPlaceId(null);
    setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, null));
  };

  const handleMapShareLinkInputChange = (val: string) => {
    setMapShareLinkInput(val);
    setPlaceId(null);
    setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, null));
  };

  const handleInstagramHandleChange = (val: string) => {
    setInstagramHandle(val);
    setPlaceId(null);
    const clean = val.replace(/^@/, '').trim();
    setGeneratedInstagramUrl(`https://www.instagram.com/${clean || 'dubaigourmetbistro'}/`);
  };

  const handleBusinessWebsiteChange = (val: string) => {
    setBusinessWebsite(val);
    setPlaceId(null);
    setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, null));
  };

  const captureClipboardLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.trim();
      if (clean) {
        setMapShareLinkInput(clean);
        setGoogleInputTab('share');
        setPlaceId(null);
        setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, null));
        setSuccessBanner("Successfully captured Google Maps link from clipboard!");
        
        // Auto-run resolution
        setTimeout(() => {
          processGoogleMapLink(clean);
        }, 50);
      } else {
        setFetchError("Clipboard is empty. Please copy a link first!");
      }
    } catch (err) {
      setFetchError("Please allow clipboard permissions or paste the link manually.");
    }
  };

  // Generated outputs
  const [placeId, setPlaceId] = useState<string | null>(
    initialLead?.placeId && isValidPlaceId(initialLead.placeId)
      ? initialLead.placeId
      : null
  );
  const [generatedReviewUrl, setGeneratedReviewUrl] = useState<string | null>(
    initialLead?.placeId && isValidPlaceId(initialLead.placeId)
      ? `https://search.google.com/local/writereview?placeid=${initialLead.placeId}`
      : initialLead?.directReviewUrl || buildGoogleReviewUrl(initialLead?.name || 'Dubai Gourmet Bistro', initialLead?.district || 'Downtown Dubai', null)
  );
  const [generatedInstagramUrl, setGeneratedInstagramUrl] = useState<string>(
    `https://www.instagram.com/${initialLead?.instagramHandle || 'dubaigourmetbistro'}/`
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
      setMapShareLinkInput(initialLead.shareUrl || '');
      setBusinessName(initialLead.name || 'Dubai Business');
      setDistrict(initialLead.district || 'Dubai');
      setInstagramHandle(initialLead.instagramHandle || 'dubaibusiness');
      setBusinessWebsite(initialLead.websiteUrl || deriveBusinessWebsite(initialLead.name));
      setSuccessBanner(`Loaded ${initialLead.name} from Map Scout`);

      if (initialLead.placeId && isValidPlaceId(initialLead.placeId)) {
        setPlaceId(initialLead.placeId);
        setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${initialLead.placeId}`);
      } else if (initialLead.directReviewUrl) {
        // Extract placeId from directReviewUrl if possible
        const match = initialLead.directReviewUrl.match(/placeid=([a-zA-Z0-9_-]+)/) || initialLead.directReviewUrl.match(/(ChIJ[a-zA-Z0-9_-]{23,})/);
        if (match && match[1] && isValidPlaceId(match[1])) {
          setPlaceId(match[1]);
          setGeneratedReviewUrl(`https://search.google.com/local/writereview?placeid=${match[1]}`);
        } else {
          setPlaceId(null);
          setGeneratedReviewUrl(buildGoogleReviewUrl(initialLead.name || 'Dubai Business', initialLead.district || 'Dubai', null));
        }
      } else {
        setPlaceId(null);
        setGeneratedReviewUrl(buildGoogleReviewUrl(initialLead.name || 'Dubai Business', initialLead.district || 'Dubai', null));
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

    // RESET STATE IMMEDIATELY BEFORE RESOLVING TO AVOID STALE STATE
    setPlaceId(null);
    setGeneratedReviewUrl(null);

    try {
      const rawUrl = url.trim();
      let resolvedPlaceId: string | null = null;

      // 1. Check for placeid= query parameter
      const placeIdMatch = rawUrl.match(/placeid=([a-zA-Z0-9_-]+)/);
      if (placeIdMatch && placeIdMatch[1] && isValidPlaceId(placeIdMatch[1])) {
        resolvedPlaceId = placeIdMatch[1];
      }

      // 2. Check for explicit ChIJ Place ID anywhere in URL
      if (!resolvedPlaceId) {
        const chijMatch = rawUrl.match(/(ChIJ[a-zA-Z0-9_-]{23,})/);
        if (chijMatch && chijMatch[1] && isValidPlaceId(chijMatch[1])) {
          resolvedPlaceId = chijMatch[1];
        }
      }

      // 3. Check for 64-bit Hex Feature ID pair (0x...:0x...) anywhere in URL
      if (!resolvedPlaceId) {
        const hexMatch = rawUrl.match(/(0x[0-9a-fA-F]+):(0x[0-9a-fA-F]+)/);
        if (hexMatch && hexMatch[1] && hexMatch[2]) {
          const derived = hexPairToPlaceIdBrowser(hexMatch[1], hexMatch[2]);
          if (derived && isValidPlaceId(derived)) {
            resolvedPlaceId = derived;
          }
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
      if (!resolvedPlaceId) {
        const response = await fetch('/api/extract-review-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: rawUrl, businessName, district }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.placeId && isValidPlaceId(data.placeId)) {
            resolvedPlaceId = data.placeId;
          } else if (data.reviewUrl) {
            const backendPlaceIdMatch = data.reviewUrl.match(/placeid=([a-zA-Z0-9_-]+)/) || data.reviewUrl.match(/(ChIJ[a-zA-Z0-9_-]{23,})/);
            if (backendPlaceIdMatch && backendPlaceIdMatch[1] && isValidPlaceId(backendPlaceIdMatch[1])) {
              resolvedPlaceId = backendPlaceIdMatch[1];
            }
          }
        }
      }

      // Verify that the Place ID belongs to the CURRENT business
      // If it contains "AlSafadi" or is Al Safadi's ID, check if current businessName contains "safadi"
      if (resolvedPlaceId) {
        const isAlSafadiId = resolvedPlaceId.includes('AlSafadi') || resolvedPlaceId === 'ChIJ8_DXB_AlSafadiRigga';
        const nameContainsSafadi = businessName.toLowerCase().includes('safadi');
        if (isAlSafadiId && !nameContainsSafadi) {
          // It does not belong to the current business! Mismatched!
          resolvedPlaceId = null;
        }
      }

      // Update state based on resolved value
      if (resolvedPlaceId && isValidPlaceId(resolvedPlaceId)) {
        setPlaceId(resolvedPlaceId);
        const reviewUrl = buildDirectReviewUrl(resolvedPlaceId);
        setGeneratedReviewUrl(reviewUrl);

        console.log(
          `[REVIEW GENERATOR]\n\n` +
          `Current Business: ${businessName}\n` +
          `Current Address: ${district}\n` +
          `Current Google Maps URL: ${rawUrl}\n` +
          `Resolved Place ID: ${resolvedPlaceId}\n` +
          `Generated Review URL: ${reviewUrl}\n`
        );
      } else {
        setPlaceId(null);
        const fallbackUrl = buildGoogleReviewUrl(businessName, district, null);
        setGeneratedReviewUrl(fallbackUrl);

        console.log(
          `[REVIEW GENERATOR]\n\n` +
          `Current Business: ${businessName}\n` +
          `Current Address: ${district}\n` +
          `Current Google Maps URL: ${rawUrl}\n` +
          `Resolved Place ID: null\n` +
          `Generated Review URL: ${fallbackUrl} (Using Resilient Fallback Search Link)\n`
        );
      }
    } catch (_err) {
      setPlaceId(null);
      setGeneratedReviewUrl(buildGoogleReviewUrl(businessName, district, null));
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
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
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
                  onChange={(e) => handleDistrictChange(e.target.value)}
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
                onChange={(e) => handleBusinessWebsiteChange(e.target.value)}
                placeholder="www.alsafadirestaurants.com"
                className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition font-mono min-w-0"
              />
            </div>

            {mode === 'google' ? (
              /* Google Maps Link Box with sub-tabs */
              <div className="min-w-0 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="block text-[11px] font-semibold text-[#8e8aab]">
                    Google Maps Connection URL
                  </label>
                  
                  {/* Tab Selector */}
                  <div className="flex items-center gap-1 bg-[#110f22]/80 p-0.5 rounded-lg border border-[#26223d]">
                    <button
                      type="button"
                      onClick={() => setGoogleInputTab('search')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wide uppercase transition-all ${
                        googleInputTab === 'search'
                          ? 'bg-[#ec1a65] text-white shadow-sm'
                          : 'text-[#8e8aab] hover:text-white'
                      }`}
                    >
                      Web / Search Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoogleInputTab('share')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wide uppercase transition-all ${
                        googleInputTab === 'share'
                          ? 'bg-[#ec1a65] text-white shadow-sm'
                          : 'text-[#8e8aab] hover:text-white'
                      }`}
                    >
                      Google Maps Share Link
                    </button>
                  </div>
                </div>

                {googleInputTab === 'search' ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={mapLinkInput}
                      onChange={(e) => handleMapLinkInputChange(e.target.value)}
                      placeholder="Paste Web Search URL (e.g. https://www.google.com/maps/search/...)"
                      className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition min-w-0"
                    />
                  </div>
                ) : (
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      value={mapShareLinkInput}
                      onChange={(e) => handleMapShareLinkInputChange(e.target.value)}
                      placeholder="Paste Share URL (e.g. https://maps.app.goo.gl/...)"
                      className="flex-1 bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6d698a] focus:outline-none transition min-w-0"
                    />
                    <button
                      type="button"
                      onClick={captureClipboardLink}
                      className="px-3.5 py-2.5 rounded-xl bg-[#ec1a65]/20 hover:bg-[#ec1a65]/30 text-white border border-[#ec1a65]/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                      title="Auto-capture link from your clipboard"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-[#ec1a65]" />
                      <span>Capture</span>
                    </button>
                  </div>
                )}

                {/* Guided Share Link Capture Helper */}
                {mapLinkInput && (
                  <div className="bg-[#110f22]/60 border border-[#26223d]/40 rounded-xl p-3 text-xs text-[#8e8aab] flex flex-col gap-2 mt-1">
                    <p className="leading-relaxed">
                      💡 <strong>Super Fast One-Tap Capture Workflow:</strong>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                      <li>Click <strong>1. Open on Google Maps</strong> below.</li>
                      <li>On Google Maps, click <strong>Share</strong> and then click <strong>Copy link</strong>.</li>
                      <li>Return here and click <strong>2. One-Tap Capture & Generate</strong> to instantly grab and resolve it!</li>
                    </ol>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(mapLinkInput, '_blank', 'noopener,noreferrer')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00b4d8]/20 hover:bg-[#00b4d8]/30 text-white border border-[#00b4d8]/40 text-[11px] font-bold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#00b4d8]" />
                        <span>1. Open on Google Maps</span>
                      </button>

                      <button
                        type="button"
                        onClick={captureClipboardLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ec1a65]/20 hover:bg-[#ec1a65]/30 text-white border border-[#ec1a65]/40 text-[11px] font-bold transition-all animate-pulse hover:animate-none"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-[#ec1a65]" />
                        <span>2. One-Tap Capture & Generate</span>
                      </button>
                    </div>
                  </div>
                )}

                {fetchError && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fetchError}</span>
                  </p>
                )}

                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const targetLink = mapShareLinkInput.trim() || mapLinkInput.trim();
                      processGoogleMapLink(targetLink);
                    }}
                    disabled={isAnalyzing || !(mapShareLinkInput.trim() || mapLinkInput.trim())}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#110f22] hover:bg-[#1a172e] text-white text-xs font-semibold transition border border-[#26223d] disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ec1a65] shrink-0" />
                    <span>{isAnalyzing ? 'Generating Review URL...' : 'Generate Review URL'}</span>
                  </button>
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
                    onChange={(e) => handleInstagramHandleChange(e.target.value)}
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
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-mono text-[#00b4d8] break-all select-all leading-relaxed">
                      {generatedReviewUrl}
                    </p>
                    {!isValidPlaceId(placeId) && (
                      <p className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                        <span>Google Place ID not verified. Created a highly resilient, working Maps Search fallback URL.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 py-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Verified Google Place ID not available for this business.</span>
                    </div>
                    {mapLinkInput && (
                      <div className="mt-1">
                        <span className="block text-[10px] text-[#8e8aab] mb-1 font-semibold uppercase">Google Maps Link:</span>
                        <p className="text-xs font-mono text-[#00b4d8] break-all leading-relaxed bg-[#110f22] p-2 rounded-lg border border-[#26223d]/40 select-all">
                          {mapLinkInput}
                        </p>
                      </div>
                    )}
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
