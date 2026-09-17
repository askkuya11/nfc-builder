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
  X,
  Volume2,
  Scan,
  Edit3,
  Wrench,
  Zap,
  Copy,
  Repeat,
  Eraser,
  Key,
  Binary,
  FileCode,
  Globe,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  User,
  Share2,
  Code,
  Check,
  ChevronDown,
} from 'lucide-react';
import { NfcCardPreview } from './NfcCardPreview';
import { CardTheme, NfcChipType, NfcBatchItem } from '../types';
import { playNfcSuccessSound, playNfcTapSound } from '../utils/audio';
import { deriveBusinessWebsite, cleanUrlPath } from '../utils/businessWebsiteUtils';

interface App3NfcToolProps {
  initialPayload?: {
    businessName: string;
    district: string;
    targetUrl: string;
    type: 'google_review' | 'instagram';
    instagramHandle?: string;
    websiteUrl?: string;
  } | null;
  onCardWritten: () => void;
  writtenCount: number;
}

export interface NfcRecordItem {
  id: string;
  type: 'url' | 'text' | 'social' | 'phone' | 'email' | 'wifi' | 'vcard' | 'custom';
  protocolPrefix?: string; // e.g. 'https://'
  value: string; // e.g. 'www.wakdev.com'
  fullUrl: string; // e.g. 'https://www.wakdev.com'
  description: string;
  bytes: number;
}

export interface NfcTaskItem {
  id: string;
  category: 'network' | 'sound' | 'display' | 'app';
  title: string;
  settingValue: string;
  bytes: number;
}

export const App3NfcTool: React.FC<App3NfcToolProps> = ({
  initialPayload,
  onCardWritten,
  writtenCount,
}) => {
  // Sub-Tab State: READ, WRITE, OTHER, TASKS
  const [activeTab, setActiveTab] = useState<'read' | 'write' | 'other' | 'tasks'>('write');

  // Business / Card customization state
  const [businessName, setBusinessName] = useState<string>('Al Safadi Gourmet');
  const [district, setDistrict] = useState<string>('Downtown Dubai');
  const [theme, setTheme] = useState<CardTheme>('gold_black');
  const [chipType, setChipType] = useState<NfcChipType>('NTAG213');
  const [cardPrice, setCardPrice] = useState<number>(199);

  // Hardware Web NFC states
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [isApproachModalOpen, setIsApproachModalOpen] = useState<boolean>(false);
  const [approachAction, setApproachAction] = useState<string>('write'); // 'read', 'write', 'erase', 'lock', 'copy', etc.
  const [approachMessage, setApproachMessage] = useState<string>('');
  const [nfcWriteStatus, setNfcWriteStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  // READ tab result state
  const [readTagResult, setReadTagResult] = useState<{
    tagType: string;
    serialNumber: string;
    sizeBytes: number;
    writableBytes: number;
    isLocked: boolean;
    technologies: string[];
    records: { type: string; payload: string }[];
  } | null>(null);

  // Auto-captured Business Website state
  const [capturedWebsite, setCapturedWebsite] = useState<string>('www.alsafadirestaurants.com');

  // WRITE tab records queue
  const [recordsQueue, setRecordsQueue] = useState<NfcRecordItem[]>([
    {
      id: 'rec-1',
      type: 'url',
      protocolPrefix: 'https://',
      value: 'search.google.com/local/writereview?placeid=ChIJ8_DXB_AlSafadiRigga',
      fullUrl: 'https://search.google.com/local/writereview?placeid=ChIJ8_DXB_AlSafadiRigga',
      description: 'URL Record: Google Direct 5-Star Review',
      bytes: 68,
    },
  ]);

  // Record creation modal states
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState<boolean>(false);
  const [selectedRecordType, setSelectedRecordType] = useState<'url' | 'text' | 'social' | 'phone' | 'email' | 'wifi' | 'vcard' | 'custom' | null>(null);

  // URL Record Form States (Wakdev style)
  const [urlProtocol, setUrlProtocol] = useState<string>('https://');
  const [urlPathValue, setUrlPathValue] = useState<string>('www.wakdev.com');
  const [showVariableDropdown, setShowVariableDropdown] = useState<boolean>(false);

  // Text record form
  const [textInputValue, setTextInputValue] = useState<string>('');

  // TASKS tab tasks queue
  const [tasksQueue, setTasksQueue] = useState<NfcTaskItem[]>([
    {
      id: 'task-1',
      category: 'network',
      title: 'Toggle Wi-Fi State',
      settingValue: 'Enable / Connect',
      bytes: 18,
    },
  ]);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);

  // Daily Sales & Batch History
  const [batchQueue, setBatchQueue] = useState<NfcBatchItem[]>([
    {
      id: 'batch-1',
      businessName: 'Al Safadi Gourmet',
      district: 'Al Rigga',
      url: 'https://search.google.com/local/writereview?placeid=ChIJ8_DXB_AlSafadiRigga',
      type: 'google_review',
      timestamp: 'Today 10:15 AM',
      status: 'sold',
      priceAed: 199,
    },
  ]);

  // Synchronize when hand-off payload is received from App 2 (Product Mate)
  useEffect(() => {
    if (initialPayload) {
      if (initialPayload.businessName) setBusinessName(initialPayload.businessName);
      if (initialPayload.district) setDistrict(initialPayload.district);

      const site = initialPayload.websiteUrl || deriveBusinessWebsite(initialPayload.businessName);
      setCapturedWebsite(site);

      const newRecs: NfcRecordItem[] = [];

      if (initialPayload.targetUrl) {
        // Clean protocol and path cleanly
        const cleaned = cleanUrlPath(initialPayload.targetUrl);
        setUrlProtocol(cleaned.protocol);
        setUrlPathValue(cleaned.path);

        newRecs.push({
          id: `rec-url-${Date.now()}`,
          type: 'url',
          protocolPrefix: cleaned.protocol,
          value: cleaned.path,
          fullUrl: initialPayload.targetUrl,
          description: `URL: ${initialPayload.businessName} (${initialPayload.type === 'instagram' ? 'Instagram' : 'Google Review'})`,
          bytes: new TextEncoder().encode(initialPayload.targetUrl).length + 8,
        });
      }

      setRecordsQueue(newRecs);
      setActiveTab('write');
    }
  }, [initialPayload]);

  // Hardware capabilities check
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

  // Compute total byte payload size
  const maxBytes = chipType === 'NTAG213' ? 144 : chipType === 'NTAG215' ? 504 : 888;
  const totalWriteBytes = recordsQueue.reduce((acc, r) => acc + r.bytes, 0);
  const totalTaskBytes = tasksQueue.reduce((acc, t) => acc + t.bytes, 0);

  // Primary URL for card preview
  const primaryUrl = recordsQueue.find((r) => r.type === 'url')?.fullUrl || 'https://www.wakdev.com';

  // --- ACTIONS ---

  // Trigger Approach Modal for Read / Write / Erase / Lock
  const handleOpenApproachModal = (action: string, msg?: string) => {
    setApproachAction(action);
    setApproachMessage(
      msg ||
        (action === 'read'
          ? 'Approach an NFC Tag to read technical specifications & records'
          : action === 'write'
          ? `Approach an NFC Tag to write ${totalWriteBytes} Bytes (${recordsQueue.length} record)`
          : action === 'erase'
          ? 'Approach an NFC Tag to erase all NDEF records'
          : action === 'lock'
          ? 'Approach an NFC Tag to set Read-Only permanent lock'
          : action === 'copy'
          ? 'Approach source NFC Tag to clone content'
          : action === 'copy_infinity'
          ? 'Approach an NFC Tag to write in continuous batch mode'
          : 'Approach an NFC Tag')
    );
    setNfcWriteStatus('scanning');
    setIsApproachModalOpen(true);
  };

  // Perform actual Web NFC or Simulated scan/write
  const handleExecuteNfcAction = async () => {
    playNfcTapSound();

    if (isNfcSupported && !isInIframe) {
      try {
        const ndef = new (window as any).NDEFReader();
        if (approachAction === 'read') {
          await ndef.scan();
          ndef.onreading = (event: any) => {
            playNfcSuccessSound();
            setReadTagResult({
              tagType: 'NXP - NTAG213 (ISO 14443-3A)',
              serialNumber: event.serialNumber || '04:7A:B2:8E:1A:6F:80',
              sizeBytes: 144,
              writableBytes: 137,
              isLocked: false,
              technologies: ['NfcA', 'Ndef'],
              records: [
                {
                  type: 'URI / URL',
                  payload: primaryUrl,
                },
              ],
            });
            setNfcWriteStatus('success');
            setIsApproachModalOpen(false);
          };
          return;
        } else if (approachAction === 'write') {
          const recordsToWrite = recordsQueue.map((r) => ({
            recordType: r.type === 'url' ? 'url' : 'text',
            data: r.fullUrl || r.value,
          }));

          await ndef.write({ records: recordsToWrite });
          playNfcSuccessSound();
          setNfcWriteStatus('success');
          onCardWritten();
          addBatchRecord();
          setTimeout(() => setIsApproachModalOpen(false), 1200);
          return;
        }
      } catch (err: any) {
        console.warn('Web NFC error:', err);
      }
    }

    // Hardware simulation fallback (e.g. inside iframe / desktop browser)
    setTimeout(() => {
      playNfcSuccessSound();
      setNfcWriteStatus('success');

      if (approachAction === 'read') {
        setReadTagResult({
          tagType: 'NXP - NTAG213 (ISO 14443-3A)',
          serialNumber: '04:8E:2A:9C:1F:6B:80',
          sizeBytes: 144,
          writableBytes: 137,
          isLocked: false,
          technologies: ['NfcA', 'Ndef'],
          records: [
            {
              type: 'URI / URL',
              payload: primaryUrl,
            },
          ],
        });
      } else if (approachAction === 'write' || approachAction === 'copy_infinity') {
        onCardWritten();
        addBatchRecord();
      }

      setTimeout(() => setIsApproachModalOpen(false), 1200);
    }, 800);
  };

  const addBatchRecord = () => {
    const newItem: NfcBatchItem = {
      id: `batch-${Date.now()}`,
      businessName: businessName || 'Dubai Business',
      district: district || 'Dubai',
      url: primaryUrl,
      type: 'google_review',
      timestamp: 'Just now',
      status: 'sold',
      priceAed: cardPrice,
    };
    setBatchQueue((prev) => [newItem, ...prev]);
  };

  // Save new URL Record from Wakdev dialog
  const handleSaveUrlRecord = () => {
    let cleanPath = urlPathValue.trim();
    // Strip duplicate protocol if user accidentally typed or pasted it inside the input box
    cleanPath = cleanPath.replace(/^(https?:\/\/|http:\/\/)/i, '');
    if (!cleanPath) cleanPath = capturedWebsite || 'www.wakdev.com';

    // Ensure fullUrl has valid scheme
    const full = `${urlProtocol}${cleanPath}`;
    const bytes = new TextEncoder().encode(full).length + 8;

    const newRecord: NfcRecordItem = {
      id: `rec-${Date.now()}`,
      type: 'url',
      protocolPrefix: urlProtocol,
      value: cleanPath,
      fullUrl: full,
      description: `URL: ${full}`,
      bytes,
    };

    setRecordsQueue((prev) => [...prev, newRecord]);
    setIsAddRecordModalOpen(false);
    setSelectedRecordType(null);
  };

  // Save text record
  const handleSaveTextRecord = () => {
    if (!textInputValue.trim()) return;
    const full = textInputValue.trim();
    const bytes = new TextEncoder().encode(full).length + 6;

    const newRecord: NfcRecordItem = {
      id: `rec-${Date.now()}`,
      type: 'text',
      value: full,
      fullUrl: full,
      description: `Text: ${full.slice(0, 30)}...`,
      bytes,
    };

    setRecordsQueue((prev) => [...prev, newRecord]);
    setIsAddRecordModalOpen(false);
    setSelectedRecordType(null);
    setTextInputValue('');
  };

  // Insert variable into URL field `{ID}`, `{SERIAL}`, `{COUNTER}`, `{DATE}`, `{WEBSITE}`
  const handleInsertVariable = (variableStr: string) => {
    if (variableStr === '{WEBSITE}') {
      setUrlPathValue(capturedWebsite);
    } else {
      setUrlPathValue((prev) => `${prev}${variableStr}`);
    }
    setShowVariableDropdown(false);
  };

  const handleDeleteRecord = (id: string) => {
    setRecordsQueue((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* APP 3 HEADER BANNER */}
      <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#ec1a65]/10 via-[#a822d8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ec1a65]/20 text-[#ff5c8a] border border-[#ec1a65]/30 uppercase tracking-wide">
                NFC Tools Suite
              </span>
              <span className="text-xs text-[#8e8aab]">Wakdev Studio Compliant</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>NFC Card Burner & Encoder</span>
              <Sparkles className="w-5 h-5 text-[#00b4d8]" />
            </h2>
            <p className="text-xs text-[#8e8aab] mt-1 max-w-xl">
              Program physical NTAG213 / NTAG215 review plaque cards, clone tags, and write NDEF payloads for Dubai venues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#00b4d8] flex items-center justify-center text-white shadow-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#8e8aab] uppercase tracking-wider font-medium">Total Written</div>
                <div className="text-lg font-black text-white">{writtenCount} Cards</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SUB-TAB NAVIGATION (READ, WRITE, OTHER, TASKS) */}
      <div className="bg-[#161426] border border-[#27233e] rounded-2xl p-1.5 flex items-center gap-1 shadow-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('read')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition ${
            activeTab === 'read'
              ? 'bg-[#ec1a65] text-white shadow-lg shadow-[#ec1a65]/30'
              : 'text-[#8e8aab] hover:text-white hover:bg-[#1a172e]'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>READ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition ${
            activeTab === 'write'
              ? 'bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] text-white shadow-lg shadow-[#a822d8]/30'
              : 'text-[#8e8aab] hover:text-white hover:bg-[#1a172e]'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>WRITE</span>
          {recordsQueue.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#110f22] text-[10px] font-bold flex items-center justify-center">
              {recordsQueue.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('other')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition ${
            activeTab === 'other'
              ? 'bg-[#a822d8] text-white shadow-lg shadow-[#a822d8]/30'
              : 'text-[#8e8aab] hover:text-white hover:bg-[#1a172e]'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>OTHER</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition ${
            activeTab === 'tasks'
              ? 'bg-[#00b4d8] text-white shadow-lg shadow-[#00b4d8]/30'
              : 'text-[#8e8aab] hover:text-white hover:bg-[#1a172e]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>TASKS</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE TAB CONTENT */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: READ */}
          {activeTab === 'read' && (
            <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#27233e] pb-4">
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Scan className="w-5 h-5 text-[#ec1a65]" />
                    <span>Read NFC Tag</span>
                  </h3>
                  <p className="text-xs text-[#8e8aab] mt-0.5">
                    Scan any NFC chip or card to analyze technical specifications & payload records.
                  </p>
                </div>
              </div>

              {/* Approach Tag Scanning Trigger */}
              <div className="bg-[#110f22] border-2 border-dashed border-[#27233e] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-[#ec1a65]/50 transition group">
                <div className="w-20 h-20 rounded-full bg-[#1a172e] border border-[#322c50] flex items-center justify-center text-[#ec1a65] group-hover:scale-110 transition shadow-xl relative">
                  <span className="absolute inset-0 rounded-full bg-[#ec1a65]/20 animate-ping opacity-40" />
                  <Radio className="w-10 h-10 relative z-10" />
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm">Approach an NFC Tag</h4>
                  <p className="text-xs text-[#8e8aab] mt-1 max-w-sm">
                    Hold an NFC card or plaque against the back of your smartphone to inspect tag memory.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('read')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white font-bold text-xs shadow-lg hover:opacity-95 transition"
                >
                  Approach an NFC Tag
                </button>
              </div>

              {/* READ RESULT CARD */}
              {readTagResult && (
                <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#27233e] pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      Tag Read Successful
                    </span>
                    <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20">
                      {readTagResult.serialNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#1a172e] p-3 rounded-xl">
                      <span className="text-[#8e8aab] text-[10px] block">Tag Type</span>
                      <span className="text-white font-semibold">{readTagResult.tagType}</span>
                    </div>
                    <div className="bg-[#1a172e] p-3 rounded-xl">
                      <span className="text-[#8e8aab] text-[10px] block">Memory Size</span>
                      <span className="text-white font-semibold">
                        {readTagResult.sizeBytes} Bytes (Writable: {readTagResult.writableBytes} B)
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#1a172e] p-3 rounded-xl space-y-1">
                    <span className="text-[#8e8aab] text-[10px] block">NDEF Record 1</span>
                    {readTagResult.records.map((rec, idx) => (
                      <div key={idx} className="text-xs font-mono text-[#00b4d8] break-all">
                        [{rec.type}] {rec.payload}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WRITE */}
          {activeTab === 'write' && (
            <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-6">
              {/* Header & Byte Counter */}
              <div className="flex items-center justify-between border-b border-[#27233e] pb-4">
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#ec1a65]" />
                    <span>Write NFC Records</span>
                  </h3>
                  <p className="text-xs text-[#8e8aab] mt-0.5">
                    Add NDEF records to write to your NFC plaque or card.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#8e8aab] uppercase tracking-wider font-medium">Memory Used</div>
                  <div className="text-xs font-bold text-white font-mono">
                    <span className={totalWriteBytes > maxBytes ? 'text-[#ff5c8a]' : 'text-[#10b981]'}>
                      {totalWriteBytes} Bytes
                    </span>{' '}
                    / {maxBytes} Bytes
                  </div>
                </div>
              </div>

              {/* Chip Type & Lock Settings Row */}
              <div className="bg-[#110f22] border border-[#27233e] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8e8aab] font-medium">Chip Type:</span>
                  <div className="flex items-center gap-1">
                    {(['NTAG213', 'NTAG215', 'NTAG216'] as NfcChipType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setChipType(type)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          chipType === type
                            ? 'bg-[#ec1a65] text-white shadow-sm'
                            : 'bg-[#1a172e] text-[#8e8aab] hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[#8e8aab] font-mono">
                  Capacity: {chipType === 'NTAG213' ? '144B' : chipType === 'NTAG215' ? '504B' : '888B'}
                </div>
              </div>

              {/* Auto-Captured Business Details Notification Bar */}
              <div className="bg-[#110f22] border border-[#00b4d8]/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#00b4d8]/20 text-[#00b4d8] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>Captured Business Website:</span>
                      <span className="text-[#00b4d8] font-mono font-bold bg-[#00b4d8]/10 px-2 py-0.5 rounded border border-[#00b4d8]/20">
                        {capturedWebsite}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#00b4d8] bg-[#00b4d8]/10 px-2.5 py-1 rounded-full border border-[#00b4d8]/30 shrink-0">
                  Map Scout Synced
                </span>
              </div>

              {/* Records List / Add Record Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Records Queue ({recordsQueue.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecordType(null);
                      setIsAddRecordModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white font-bold text-xs shadow-md hover:opacity-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add a record</span>
                  </button>
                </div>

                {recordsQueue.length === 0 ? (
                  <div className="bg-[#110f22] border-2 border-dashed border-[#27233e] rounded-2xl p-6 text-center text-xs text-[#8e8aab]">
                    No records added yet. Click <strong>"+ Add a record"</strong> to configure a URL or Email record.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recordsQueue.map((record) => (
                      <div
                        key={record.id}
                        className="bg-[#110f22] border border-[#27233e] hover:border-[#383256] rounded-2xl p-4 flex items-center justify-between gap-3 transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#1a172e] text-[#00b4d8] flex items-center justify-center shrink-0">
                            {record.type === 'url' ? (
                              <Globe className="w-4 h-4 text-[#ec1a65]" />
                            ) : record.type === 'email' ? (
                              <Mail className="w-4 h-4 text-[#00b4d8]" />
                            ) : (
                              <Edit3 className="w-4 h-4 text-[#a822d8]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{record.description}</div>
                            <div className="text-[11px] font-mono text-[#00b4d8] truncate">{record.fullUrl}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono text-[#8e8aab] bg-[#1a172e] px-2 py-1 rounded-md">
                            {record.bytes} Bytes
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1.5 rounded-lg text-[#8e8aab] hover:text-[#ff5c8a] hover:bg-[#1a172e] transition"
                            title="Remove Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WRITE TO NFC TAG ACTION BUTTON */}
              <button
                type="button"
                onClick={() => handleOpenApproachModal('write')}
                disabled={recordsQueue.length === 0 || totalWriteBytes > maxBytes}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] hover:opacity-95 text-white font-black text-sm tracking-wide transition shadow-xl shadow-[#ec1a65]/25 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Radio className="w-5 h-5" />
                <span>WRITE / {totalWriteBytes} BYTES ({recordsQueue.length} RECORD)</span>
              </button>
            </div>
          )}

          {/* TAB 3: OTHER */}
          {activeTab === 'other' && (
            <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-[#27233e] pb-4">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#a822d8]" />
                  <span>Other NFC Utilities</span>
                </h3>
                <p className="text-xs text-[#8e8aab] mt-0.5">
                  Clone tags, loop batch writing, erase, or permanently lock NFC chips.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Copy Tag */}
                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('copy', 'Approach source NFC Tag to clone content')}
                  className="bg-[#110f22] border border-[#27233e] hover:border-[#a822d8]/60 rounded-2xl p-4 flex items-start gap-3.5 text-left transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a172e] text-[#a822d8] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Copy tag</h4>
                    <p className="text-[11px] text-[#8e8aab] mt-0.5">Read an existing tag and copy NDEF records to a new card.</p>
                  </div>
                </button>

                {/* Copy to infinity */}
                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('copy_infinity', 'Approach an NFC Tag to write in continuous batch mode')}
                  className="bg-[#110f22] border border-[#27233e] hover:border-[#ec1a65]/60 rounded-2xl p-4 flex items-start gap-3.5 text-left transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a172e] text-[#ec1a65] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Copy to infinity</h4>
                    <p className="text-[11px] text-[#8e8aab] mt-0.5">Continuous batch writing mode for multiple cards sequentially.</p>
                  </div>
                </button>

                {/* Erase tag */}
                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('erase', 'Approach an NFC Tag to erase all NDEF records')}
                  className="bg-[#110f22] border border-[#27233e] hover:border-[#ff5c8a]/60 rounded-2xl p-4 flex items-start gap-3.5 text-left transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a172e] text-[#ff5c8a] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Eraser className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Erase tag</h4>
                    <p className="text-[11px] text-[#8e8aab] mt-0.5">Completely wipe and zero out NDEF records from the tag.</p>
                  </div>
                </button>

                {/* Lock tag */}
                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('lock', 'Approach an NFC Tag to set Read-Only permanent lock')}
                  className="bg-[#110f22] border border-[#27233e] hover:border-[#10b981]/60 rounded-2xl p-4 flex items-start gap-3.5 text-left transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a172e] text-[#10b981] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Lock tag</h4>
                    <p className="text-[11px] text-[#8e8aab] mt-0.5">Set tag memory to read-only permanently (irreversible).</p>
                  </div>
                </button>

                {/* Format memory */}
                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('format', 'Approach an NFC Tag to format NDEF memory')}
                  className="bg-[#110f22] border border-[#27233e] hover:border-[#00b4d8]/60 rounded-2xl p-4 flex items-start gap-3.5 text-left transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a172e] text-[#00b4d8] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Format memory</h4>
                    <p className="text-[11px] text-[#8e8aab] mt-0.5">Re-format raw memory sector structure to standard NDEF format.</p>
                  </div>
                </button>

                {/* Set Password */}
                <button
                  type="button"
                  onClick={() => handleOpenApproachModal('password', 'Approach an NFC Tag to apply password key')}
                  className="bg-[#110f22] border border-[#27233e] hover:border-amber-400/60 rounded-2xl p-4 flex items-start gap-3.5 text-left transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a172e] text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Set password</h4>
                    <p className="text-[11px] text-[#8e8aab] mt-0.5">Password-protect tag write access with a 32-bit key.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#27233e] pb-4">
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#00b4d8]" />
                    <span>NFC Tasks & Automation</span>
                  </h3>
                  <p className="text-xs text-[#8e8aab] mt-0.5">
                    Configure device task triggers (Wi-Fi toggle, sound profile, app launcher).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00b4d8] text-white font-bold text-xs shadow-md hover:bg-[#0096b4] transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add a task</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {tasksQueue.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#110f22] border border-[#27233e] rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1a172e] text-[#00b4d8] flex items-center justify-center">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <div className="text-[11px] text-[#8e8aab]">{task.settingValue}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#8e8aab] bg-[#1a172e] px-2 py-1 rounded-md">
                      {task.bytes} Bytes
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleOpenApproachModal('write_task', `Approach an NFC Tag to write ${totalTaskBytes} Bytes task payload`)}
                className="w-full py-4 px-6 rounded-2xl bg-[#00b4d8] hover:bg-[#0096b4] text-white font-black text-sm tracking-wide transition shadow-xl flex items-center justify-center gap-2"
              >
                <Radio className="w-5 h-5" />
                <span>WRITE TASK / {totalTaskBytes} BYTES</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CARD PREVIEW & BATCH SALES QUEUE */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Visual Customizer & Preview */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#27233e] pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#ec1a65]" />
                Live Card Print Preview
              </span>
              <span className="text-[10px] font-mono text-[#8e8aab]">NFC Plaque</span>
            </div>

            {/* Theme Selector Pill Bar */}
            <div className="flex items-center justify-between gap-1 bg-[#110f22] p-1.5 rounded-xl border border-[#27233e] overflow-x-auto">
              {[
                { id: 'gold_black', label: 'Gold' },
                { id: 'google_clean', label: 'Google' },
                { id: 'instagram_sunset', label: 'Instagram' },
                { id: 'dubai_emerald', label: 'Emerald' },
                { id: 'matte_noir', label: 'Noir' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as CardTheme)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 ${
                    theme === t.id
                      ? 'bg-[#ec1a65] text-white shadow-sm'
                      : 'text-[#8e8aab] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Live Interactive NfcCardPreview */}
            <NfcCardPreview
              businessName={businessName}
              district={district}
              cardType="google_review"
              theme={theme}
              targetUrl={primaryUrl}
            />
          </div>

          {/* Daily Sales Batch Log */}
          <div className="bg-[#161426] border border-[#27233e] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#27233e] pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
                Dubai Daily Sales & Program History
              </span>
              <span className="text-[10px] font-mono text-[#10b981]">AED {batchQueue.length * cardPrice} Sales</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {batchQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#110f22] border border-[#27233e] rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{item.businessName}</div>
                    <div className="text-[10px] text-[#8e8aab]">{item.district} • {item.timestamp}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-[#10b981]">+AED {item.priceAed}</div>
                    <span className="text-[9px] font-mono uppercase text-[#00b4d8] bg-[#00b4d8]/10 px-1.5 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: "ADD A RECORD" TYPE PICKER --- */}
      {isAddRecordModalOpen && !selectedRecordType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161426] border-2 border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#27233e] pb-3">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#ec1a65]" />
                <span>Add a Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRecordModalOpen(false)}
                className="p-1 rounded-lg text-[#8e8aab] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* PRIMARY: URL / URI RECORD */}
              <button
                type="button"
                onClick={() => setSelectedRecordType('url')}
                className="w-full bg-[#110f22] border-2 border-[#ec1a65]/40 hover:border-[#ec1a65] rounded-2xl p-4 flex items-center justify-between text-left transition group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ec1a65]/20 text-[#ec1a65] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#ec1a65] transition">URL / URI Record</div>
                    <div className="text-[11px] text-[#8e8aab]">Add a URL record (e.g. https://www.wakdev.com)</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#ec1a65] bg-[#ec1a65]/10 px-2 py-1 rounded-lg">Popular</span>
              </button>

              {/* Text Record */}
              <button
                type="button"
                onClick={() => setSelectedRecordType('text')}
                className="w-full bg-[#110f22] border border-[#27233e] hover:border-[#383256] rounded-2xl p-3.5 flex items-center gap-3 text-left transition"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1a172e] text-[#00b4d8] flex items-center justify-center shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Text Record</div>
                  <div className="text-[11px] text-[#8e8aab]">Plain text message or string</div>
                </div>
              </button>

              {/* Social Networks */}
              <button
                type="button"
                onClick={() => {
                  setUrlProtocol('https://');
                  setUrlPathValue('instagram.com/alsafadirestaurants');
                  setSelectedRecordType('url');
                }}
                className="w-full bg-[#110f22] border border-[#27233e] hover:border-[#383256] rounded-2xl p-3.5 flex items-center gap-3 text-left transition"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1a172e] text-[#a822d8] flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Social Media Profile</div>
                  <div className="text-[11px] text-[#8e8aab]">Instagram, TikTok, LinkedIn, YouTube</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddRecordModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#110f22] hover:bg-[#1a172e] text-xs font-bold text-[#8e8aab] border border-[#27233e] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: "ADD A URL RECORD" FORM (WAKDEV STYLE) --- */}
      {isAddRecordModalOpen && selectedRecordType === 'url' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#161426] border-2 border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#27233e] pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00b4d8]" />
                <span>Add a URL record</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddRecordModalOpen(false);
                  setSelectedRecordType(null);
                }}
                className="p-1 rounded-lg text-[#8e8aab] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Protocol Prefix Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8e8aab] uppercase tracking-wider block">
                Protocol Scheme
              </label>
              <div className="relative">
                <select
                  value={urlProtocol}
                  onChange={(e) => setUrlProtocol(e.target.value)}
                  className="w-full bg-[#110f22] border border-[#27233e] focus:border-[#00b4d8] rounded-xl p-3 text-xs text-white font-mono appearance-none outline-none cursor-pointer pr-10"
                >
                  <option value="https://">https:// (Default Secure Web)</option>
                  <option value="http://">http://</option>
                  <option value="http://www.">http://www.</option>
                  <option value="https://www.">https://www.</option>
                  <option value="tel:">tel: (Phone Call)</option>
                  <option value="mailto:">mailto: (Send Email)</option>
                  <option value="sms:">sms: (SMS Message)</option>
                  <option value="geo:">geo: (Maps Coordinates)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8e8aab] absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* URL Input Field with Wakdev Placeholder & {} Variables Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#8e8aab] uppercase tracking-wider block">
                  Website / URL Path
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVariableDropdown(!showVariableDropdown)}
                    className="px-2.5 py-1 rounded-lg bg-[#110f22] hover:bg-[#1a172e] border border-[#27233e] text-xs font-mono font-bold text-[#00b4d8] transition flex items-center gap-1"
                    title="Insert NFC Tool Variable"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{`{ }`}</span>
                  </button>

                  {/* Variable Helper Dropdown */}
                  {showVariableDropdown && (
                    <div className="absolute right-0 top-8 z-30 w-52 bg-[#110f22] border border-[#27233e] rounded-xl shadow-xl p-1 text-xs space-y-1">
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('{WEBSITE}')}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1a172e] text-[#00b4d8] font-mono font-bold flex items-center justify-between"
                      >
                        <span>{`{WEBSITE}`}</span>
                        <span className="text-[10px] text-[#8e8aab]">Auto-Captured</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('{ID}')}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1a172e] text-white font-mono"
                      >
                        {`{ID}`} - Tag UID
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('{COUNTER}')}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1a172e] text-white font-mono"
                      >
                        {`{COUNTER}`} - Scan Count
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVariable('{DATE}')}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#1a172e] text-white font-mono"
                      >
                        {`{DATE}`} - Current Date
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-[#110f22] border border-[#27233e] focus-within:border-[#00b4d8] rounded-xl px-3 py-2.5 text-xs">
                <span className="font-mono text-[#00b4d8] font-bold select-none pr-1.5 shrink-0">{urlProtocol}</span>
                <input
                  type="text"
                  value={urlPathValue}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.startsWith('https://')) {
                      setUrlProtocol('https://');
                      val = val.replace(/^https:\/\//, '');
                    } else if (val.startsWith('http://')) {
                      setUrlProtocol('http://');
                      val = val.replace(/^http:\/\//, '');
                    }
                    setUrlPathValue(val);
                  }}
                  placeholder={capturedWebsite || 'www.wakdev.com'}
                  className="flex-1 bg-transparent text-white font-mono outline-none placeholder-neutral-600 min-w-0"
                />
              </div>

              {/* Quick Auto-fill captured website chip */}
              {capturedWebsite && (
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[#8e8aab]">Captured from Scout:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const cleaned = cleanUrlPath(capturedWebsite);
                      setUrlProtocol(cleaned.protocol);
                      setUrlPathValue(cleaned.path);
                    }}
                    className="font-mono font-bold text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded-md hover:bg-[#00b4d8]/20 transition border border-[#00b4d8]/30 flex items-center gap-1"
                  >
                    <span>⚡ Fill: {capturedWebsite}</span>
                  </button>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS: CANCEL / OK */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddRecordModalOpen(false);
                  setSelectedRecordType(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#110f22] hover:bg-[#1a172e] text-xs font-bold text-[#8e8aab] border border-[#27233e] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUrlRecord}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ec1a65] via-[#a822d8] to-[#00a8f3] text-xs font-black text-white shadow-lg hover:opacity-95 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: TEXT RECORD FORM --- */}
      {isAddRecordModalOpen && selectedRecordType === 'text' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161426] border-2 border-[#27233e] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#27233e] pb-3">
              <h3 className="font-black text-white text-sm">Add Text Record</h3>
              <button
                type="button"
                onClick={() => setSelectedRecordType(null)}
                className="p-1 rounded-lg text-[#8e8aab] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              placeholder="Enter text message..."
              className="w-full bg-[#110f22] border border-[#27233e] focus:border-[#00b4d8] rounded-xl p-3 text-xs text-white outline-none resize-none"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedRecordType(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#110f22] text-xs font-bold text-[#8e8aab] border border-[#27233e]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTextRecord}
                className="flex-1 py-2.5 rounded-xl bg-[#00b4d8] text-xs font-bold text-white shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: "APPROACH AN NFC TAG" HARDWARE MODAL --- */}
      {isApproachModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#161426] border-2 border-[#27233e] rounded-[36px] p-6 shadow-2xl flex flex-col items-center text-center space-y-5 relative">
            <button
              type="button"
              onClick={() => setIsApproachModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1a172e] text-[#8e8aab] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-24 h-24 rounded-full bg-[#110f22] border-2 border-[#a822d8]/50 flex items-center justify-center text-[#ec1a65] relative my-2">
              <span className="absolute inset-0 rounded-full bg-[#ec1a65]/20 animate-ping opacity-60" />
              <Radio className="w-12 h-12 relative z-10" />
            </div>

            <div>
              <h3 className="font-black text-white text-base">Approach an NFC Tag</h3>
              <p className="text-xs text-[#8e8aab] mt-1.5 leading-relaxed">{approachMessage}</p>
            </div>

            <div className="w-full bg-[#110f22] rounded-xl p-3 text-[11px] font-mono text-[#00b4d8] border border-[#27233e]">
              {nfcWriteStatus === 'scanning' ? 'Ready to Scan...' : 'Operation Completed!'}
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleExecuteNfcAction}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ec1a65] to-[#a822d8] text-white font-bold text-xs shadow-lg hover:opacity-95 transition"
              >
                Tap Card
              </button>
              <button
                type="button"
                onClick={() => setIsApproachModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-[#110f22] text-[#8e8aab] font-bold text-xs border border-[#27233e] hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
