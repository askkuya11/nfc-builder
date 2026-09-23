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
  Users,
  Layers,
  Download,
  Search,
  Trash2,
  Radio,
  Plus,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { BusinessLead, CollatedCustomerLead } from '../types';
import { deriveBusinessWebsite } from '../utils/businessWebsiteUtils';
import {
  isValidPlaceId,
  isOfficialChIJPlaceId,
  buildDirectReviewUrl,
  buildGoogleReviewUrl,
  hexPairToPlaceIdBrowser,
} from '../utils/googlePlaceIdUtils';
import {
  collateTargetCompanies,
  exportCollatedCustomersCsv,
} from '../utils/collateHelper';

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
  collatedCustomers?: CollatedCustomerLead[];
  onUpdateCollatedCustomers?: (customers: CollatedCustomerLead[]) => void;
  onSendBatchToNfcTool?: (batch?: CollatedCustomerLead[]) => void;
}

export const App2ProductMate: React.FC<App2ProductMateProps> = ({
  initialLead,
  onSendToNfcTool,
  collatedCustomers = [],
  onUpdateCollatedCustomers,
  onSendBatchToNfcTool,
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

  // Batch collation state
  const [collateBatchSize, setCollateBatchSize] = useState<number>(15);
  const [isCollatingBatch, setIsCollatingBatch] = useState<boolean>(false);
  const [collatedSearchTerm, setCollatedSearchTerm] = useState<string>('');
  const [collatedStatusFilter, setCollatedStatusFilter] = useState<'all' | 'pending' | 'written'>('all');
  const [copiedBatchLeadId, setCopiedBatchLeadId] = useState<string | null>(null);
  const [copiedAllLinks, setCopiedAllLinks] = useState<boolean>(false);

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

  // --- BATCH COLLATION HANDLERS ---

  // Batch Collate 10-20 Companies
  const handleBatchCollate = (count: number) => {
    setIsCollatingBatch(true);
    setTimeout(() => {
      const generated = collateTargetCompanies(count, district, collatedCustomers);
      const merged = [...collatedCustomers, ...generated];
      onUpdateCollatedCustomers?.(merged);
      setIsCollatingBatch(false);
      setSuccessBanner(`Successfully collated ${generated.length} target companies in ${district} with Direct Review URLs!`);
    }, 400);
  };

  // Add the current single edited lead to the collated batch
  const handleAddCurrentToCollation = () => {
    const isGoogle = mode === 'google';
    const targetUrl = isGoogle ? generatedReviewUrl : generatedInstagramUrl;
    if (!targetUrl) {
      alert('Please generate a review URL first before adding to the collated batch.');
      return;
    }

    const exists = collatedCustomers.some(
      (c) => c.businessName.toLowerCase() === businessName.toLowerCase()
    );

    if (exists) {
      setSuccessBanner(`"${businessName}" is already in the collated customer batch!`);
      return;
    }

    const newItem: CollatedCustomerLead = {
      id: `collate-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      businessName: businessName || 'Dubai Local Business',
      district: district || 'Dubai',
      category: 'General Commercial Lead',
      targetUrl,
      type: isGoogle ? 'google_review' : 'instagram',
      placeId: isGoogle ? placeId : null,
      instagramHandle: isGoogle ? undefined : instagramHandle.replace(/^@/, ''),
      websiteUrl: businessWebsite || deriveBusinessWebsite(businessName),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      priceAed: 199,
    };

    onUpdateCollatedCustomers?.([newItem, ...collatedCustomers]);
    setSuccessBanner(`Added "${businessName}" to collated customer queue! Ready for NFC Writer.`);
  };

  // Load a customer from collated list back into the editor
  const handleLoadCollatedIntoEditor = (c: CollatedCustomerLead) => {
    setBusinessName(c.businessName);
    setDistrict(c.district);
    setBusinessWebsite(c.websiteUrl || deriveBusinessWebsite(c.businessName));
    if (c.type === 'instagram') {
      setMode('instagram');
      setInstagramHandle(c.instagramHandle || c.businessName.toLowerCase().replace(/[^a-z0-9]/g, ''));
      setGeneratedInstagramUrl(c.targetUrl);
    } else {
      setMode('google');
      setPlaceId(c.placeId || null);
      setGeneratedReviewUrl(c.targetUrl);
      setMapLinkInput(c.targetUrl);
    }
    setSuccessBanner(`Loaded "${c.businessName}" into Product Mate preview & editor.`);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Remove a customer from the collated list
  const handleRemoveCollated = (id: string) => {
    const updated = collatedCustomers.filter((c) => c.id !== id);
    onUpdateCollatedCustomers?.(updated);
  };

  // Clear all collated
  const handleClearCollated = () => {
    if (window.confirm('Clear all collated companies in batch?')) {
      onUpdateCollatedCustomers?.([]);
    }
  };

  // Export collated customers to CSV
  const handleExportCsv = () => {
    exportCollatedCustomersCsv(collatedCustomers);
  };

  // Copy all direct links
  const handleCopyAllLinks = () => {
    if (!collatedCustomers.length) return;
    const text = collatedCustomers
      .map((c, i) => `${i + 1}. ${c.businessName} (${c.district}): ${c.targetUrl}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAllLinks(true);
    setTimeout(() => setCopiedAllLinks(false), 2000);
  };

  // Send single customer straight to NFC Tool
  const handleSendSingleToNfc = (c: CollatedCustomerLead) => {
    onSendToNfcTool({
      businessName: c.businessName,
      district: c.district,
      targetUrl: c.targetUrl,
      type: c.type,
      instagramHandle: c.instagramHandle,
      websiteUrl: c.websiteUrl,
    });
  };

  // Send entire batch to Tab 3 NFC Writer
  const handleCaptureAllToNfc = () => {
    if (!collatedCustomers.length) {
      alert('Please collate at least one customer before capturing in NFC Writer.');
      return;
    }
    onSendBatchToNfcTool?.(collatedCustomers);
  };

  // Filtered collated list
  const filteredCollated = collatedCustomers.filter((c) => {
    const matchesSearch =
      !collatedSearchTerm.trim() ||
      c.businessName.toLowerCase().includes(collatedSearchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(collatedSearchTerm.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(collatedSearchTerm.toLowerCase()));

    const matchesFilter =
      collatedStatusFilter === 'all' ||
      (collatedStatusFilter === 'pending' && c.status === 'pending') ||
      (collatedStatusFilter === 'written' && c.status === 'written');

    return matchesSearch && matchesFilter;
  });

  const pendingCount = collatedCustomers.filter((c) => c.status === 'pending').length;
  const writtenInBatchCount = collatedCustomers.filter((c) => c.status === 'written').length;

  return (
    <div className="flex flex-col gap-5 pb-28 sm:pb-36 text-white">
      {/* App Header & Banner */}
      <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#381423] border border-[#ec1a65]/40 text-[#ff5c8a] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Direct Review Link & Payload Generator
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Direct 5-Star Review & Instagram Generator
            </h2>
            <p className="text-xs sm:text-sm text-[#8e8aab] mt-1 max-w-xl leading-relaxed">
              Converts Google Business Profiles into official <strong className="text-[#ff5c8a]">Direct 5-Star Review write links</strong>. Bypasses map searches so customers tap and rate instantly.
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
          <div className="p-1 bg-[#110f22] border border-[#26223d] rounded-2xl flex items-center gap-1">
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

              <a
                id="btn-productmate-action"
                href="https://productmate.com/google-review-link-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#110f22] hover:bg-[#1a172e] text-[#ff5c8a] hover:text-white text-xs font-semibold border border-[#ec1a65]/40 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#ec1a65]" />
                <span>ProductMate Link Generator</span>
              </a>

              {/* Add Current Lead to Collated Batch */}
              <button
                type="button"
                onClick={handleAddCurrentToCollation}
                disabled={mode === 'google' && !generatedReviewUrl}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#381423] hover:bg-[#4d1c31] text-[#ff5c8a] border border-[#ec1a65]/40 text-xs font-bold transition shadow-sm disabled:opacity-40"
                title="Add current business to the collated customer list"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add to Collated Batch</span>
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

      {/* ========================================================================= */}
      {/* PRE-TRIP FIELD VISIT PLAN & SELECTED BUSINESS HISTORY (10-20 TARGETS)     */}
      {/* ========================================================================= */}
      <section className="bg-[#161426] border border-[#27233e] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5 min-w-0">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#26223d] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1338] border border-[#8b5cf6]/40 text-[#c084fc] text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>Pre-Trip Field Visit Plan</span>
              </span>
              <span className="text-xs font-mono text-[#34d399] bg-[#102a20] px-2.5 py-0.5 rounded-full border border-[#059669]/40">
                {collatedCustomers.length} / 15 Targets Planned
              </span>
              {writtenInBatchCount > 0 && (
                <span className="text-xs font-mono text-[#34d399] bg-[#102a20] px-2.5 py-0.5 rounded-full border border-[#059669]/40">
                  {writtenInBatchCount} Written &amp; Packed ✅
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-xs font-mono text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {pendingCount} Need NFC Tag Before Trip
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1.5">
              Pre-Trip Field Visit Route &amp; Selected Business History
            </h3>
            <p className="text-xs text-[#8e8aab] mt-0.5">
              Plan 10 to 20 target businesses in <strong className="text-white">{district}</strong>, verify direct 5-star Google review links, and burn all NFC cards in Tab 3 before heading out.
            </p>
          </div>

          {/* Primary Quick Batch Hand-off CTA */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleCaptureAllToNfc}
              disabled={!collatedCustomers.length}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] via-[#ec1a65] to-[#00b4d8] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#ec1a65]/20 transition disabled:opacity-40"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Capture All in Tab 3 NFC Writer ({collatedCustomers.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Batch Generator Control Strip */}
        <div className="bg-[#110f22] border border-[#26223d] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left: 10 - 20 Target Selector & Generate Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-[#8e8aab] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#ec1a65]" />
              <span>Collate Target Count:</span>
            </span>

            {/* Count Selector Pills */}
            <div className="flex items-center bg-[#1a172e] p-1 rounded-xl border border-[#2e2a48]">
              {[10, 15, 20].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setCollateBatchSize(sz)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    collateBatchSize === sz
                      ? 'bg-[#ec1a65] text-white shadow-sm'
                      : 'text-[#8e8aab] hover:text-white'
                  }`}
                >
                  {sz} Companies
                </button>
              ))}
            </div>

            {/* Action: Collate Button */}
            <button
              type="button"
              onClick={() => handleBatchCollate(collateBatchSize)}
              disabled={isCollatingBatch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ec1a65] hover:bg-[#d61358] text-white text-xs font-bold transition shadow-md shadow-[#ec1a65]/20 disabled:opacity-50"
            >
              {isCollatingBatch ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Collating Targets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Collate {collateBatchSize} Target Companies</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Batch Utilities (Export CSV, Copy All, Clear) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!collatedCustomers.length}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161426] hover:bg-[#1f1c35] text-white border border-[#27233e] text-xs font-semibold transition disabled:opacity-40"
              title="Download entire batch as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAllLinks}
              disabled={!collatedCustomers.length}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161426] hover:bg-[#1f1c35] text-white border border-[#27233e] text-xs font-semibold transition disabled:opacity-40"
              title="Copy all generated review links to clipboard"
            >
              {copiedAllLinks ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#ec1a65]" />
                  <span>Copy All Links</span>
                </>
              )}
            </button>

            {collatedCustomers.length > 0 && (
              <button
                type="button"
                onClick={handleClearCollated}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#261520] hover:bg-[#381a29] text-rose-300 border border-rose-900/40 text-xs font-semibold transition"
                title="Clear current collated batch"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#6d698a] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={collatedSearchTerm}
              onChange={(e) => setCollatedSearchTerm(e.target.value)}
              placeholder="Search collated companies, district, category..."
              className="w-full bg-[#110f22] border border-[#26223d] focus:border-[#ec1a65] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#6d698a] focus:outline-none transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#110f22] p-1 rounded-xl border border-[#26223d] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCollatedStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                collatedStatusFilter === 'all'
                  ? 'bg-[#27233e] text-white font-bold'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              All ({collatedCustomers.length})
            </button>
            <button
              type="button"
              onClick={() => setCollatedStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                collatedStatusFilter === 'pending'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40 font-bold'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              Pending NFC ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setCollatedStatusFilter('written')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                collatedStatusFilter === 'written'
                  ? 'bg-[#102a20] text-[#34d399] border border-[#059669]/40 font-bold'
                  : 'text-[#8e8aab] hover:text-white'
              }`}
            >
              Written ({writtenInBatchCount})
            </button>
          </div>
        </div>

        {/* Collated Companies List / Table Cards */}
        {collatedCustomers.length === 0 ? (
          <div className="bg-[#110f22] border border-dashed border-[#26223d] rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a172e] border border-[#2e2a48] flex items-center justify-center text-[#ff5c8a]">
              <Layers className="w-7 h-7" />
            </div>
            <div className="max-w-md">
              <h4 className="text-base font-bold text-white">You haven&apos;t selected any companies yet</h4>
              <p className="text-xs text-[#8e8aab] mt-1.5 leading-relaxed">
                Before heading out into the field, compile your 10 to 20 target business visit itinerary. Select targets directly from <strong>Map Scout (Tab 1)</strong> using <span className="text-[#34d399] font-semibold">&ldquo;+ Plan Visit&rdquo;</span>, or auto-plan 15 businesses in {district} below.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => handleBatchCollate(15)}
                disabled={isCollatingBatch}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white text-xs font-bold transition shadow-lg shadow-[#ec1a65]/20 hover:opacity-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Plan 15 Target Businesses in {district}</span>
              </button>
              <button
                type="button"
                onClick={handleAddCurrentToCollation}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161426] border border-[#27233e] hover:border-[#ec1a65]/50 text-white text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#ff5c8a]" />
                <span>Add &quot;{businessName}&quot; to Visit Plan</span>
              </button>
            </div>
          </div>
        ) : filteredCollated.length === 0 ? (
          <div className="bg-[#110f22] border border-[#26223d] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1f1c33] flex items-center justify-center text-[#8e8aab]">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No companies match this filter.</p>
            <p className="text-xs text-[#8e8aab]">Try switching between All, Pending NFC, or Written tabs above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredCollated.map((comp, idx) => {
              const isCopied = copiedBatchLeadId === comp.id;

              return (
                <div
                  key={comp.id}
                  className={`bg-[#110f22] border rounded-2xl p-3 sm:p-4 transition-all hover:border-[#ec1a65]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    comp.status === 'written'
                      ? 'border-[#059669]/30 bg-[#0d1c16]/30'
                      : 'border-[#26223d]'
                  }`}
                >
                  {/* Left: Stop Index + Company Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-[#1a172e] border border-[#2e2a48] text-xs font-mono font-bold text-[#ff5c8a] flex items-center justify-center shrink-0 mt-0.5">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-[#8e8aab] uppercase tracking-wider">
                          Stop #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">
                          {comp.businessName}
                        </h4>
                        {comp.category && (
                          <span className="text-[10px] font-medium text-[#c084fc] bg-[#2a1745] px-2 py-0.5 rounded-full border border-[#8b5cf6]/30 shrink-0">
                            {comp.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                            comp.status === 'written'
                              ? 'text-[#34d399] bg-[#102a20] border-[#059669]/40'
                              : 'text-amber-300 bg-amber-950/50 border-amber-600/40'
                          }`}
                        >
                          {comp.status === 'written'
                            ? `NFC In Bag ✅ (${comp.writtenAt || 'Burned'})`
                            : 'Needs NFC Tag ⚠️'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#8e8aab] flex-wrap">
                        <span>📍 {comp.address || comp.district}</span>
                        {comp.footsteps && <span>• 🚶 {comp.footsteps}</span>}
                        {comp.rating && (
                          <span>• ⭐ {comp.rating} ({comp.reviewCount || 0} reviews)</span>
                        )}
                        {comp.websiteUrl && (
                          <a
                            href={comp.websiteUrl.startsWith('http') ? comp.websiteUrl : `https://${comp.websiteUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00b4d8] hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{comp.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                      </div>

                      {/* Direct URL Box */}
                      <div className="flex items-center gap-2 mt-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#ec1a65] uppercase shrink-0">Direct 5★:</span>
                        <span className="text-[11px] font-mono text-[#00b4d8] truncate max-w-full select-all bg-[#0c0a18] px-2 py-1 rounded-lg border border-[#201d36]">
                          {comp.targetUrl}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#26223d]/60 w-full md:w-auto justify-end">
                    {/* Test link */}
                    <button
                      type="button"
                      onClick={() => window.open(comp.targetUrl, '_blank', 'noopener,noreferrer')}
                      className="p-2 rounded-xl bg-[#161426] hover:bg-[#1f1c35] text-[#00b4d8] border border-[#27233e] text-xs font-semibold transition"
                      title="Open Review Link in Browser"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(comp.targetUrl);
                        setCopiedBatchLeadId(comp.id);
                        setTimeout(() => setCopiedBatchLeadId(null), 1800);
                      }}
                      className="p-2 rounded-xl bg-[#161426] hover:bg-[#1f1c35] text-white border border-[#27233e] text-xs font-semibold transition"
                      title="Copy Direct Review URL"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#8e8aab]" />
                      )}
                    </button>

                    {/* Load into Editor & Dual QR */}
                    <button
                      type="button"
                      onClick={() => handleLoadCollatedIntoEditor(comp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a172e] hover:bg-[#25203f] text-[#ff5c8a] border border-[#ec1a65]/30 text-xs font-semibold transition"
                      title="Load into top QR Code Preview & Editor"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {/* Single NFC Write Jump */}
                    <button
                      type="button"
                      onClick={() => handleSendSingleToNfc(comp)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ec1a65] to-[#a822d8] hover:opacity-95 text-white text-xs font-bold transition shadow-sm"
                      title="Transfer directly to NFC Tool"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Write Tag</span>
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCollated(comp.id)}
                      className="p-2 rounded-xl bg-[#1a1016] hover:bg-[#2b1522] text-rose-400 border border-rose-900/30 text-xs transition"
                      title="Remove from batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
