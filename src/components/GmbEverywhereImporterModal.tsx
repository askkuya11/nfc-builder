import React, { useState } from 'react';
import { BusinessLead } from '../types';
import {
  parseGmbEverywhereCsv,
  parseGmbEverywhereJson,
  SAMPLE_GMB_EVERYWHERE_CSV,
} from '../utils/gmbEverywhereAudit';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface GmbEverywhereImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (leads: BusinessLead[], mode: 'replace' | 'append') => void;
}

export const GmbEverywhereImporterModal: React.FC<GmbEverywhereImporterModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
}) => {
  const [importTab, setImportTab] = useState<'paste' | 'file'>('paste');
  const [inputText, setInputText] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [parsedPreview, setParsedPreview] = useState<Partial<BusinessLead>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setInputText(text);
    setParseError(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setParsedPreview([]);
      return;
    }

    try {
      let leads: Partial<BusinessLead>[] = [];
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        leads = parseGmbEverywhereJson(trimmed);
      } else {
        leads = parseGmbEverywhereCsv(trimmed);
      }

      if (leads.length === 0) {
        setParseError('No valid business leads detected. Ensure the CSV has headers like "Business Name", "Category", "Review Count".');
        setParsedPreview([]);
      } else {
        setParsedPreview(leads);
      }
    } catch (err: any) {
      setParseError('Failed to parse file: ' + (err?.message || 'Invalid format'));
      setParsedPreview([]);
    }
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        handleParse(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleLoadSample = () => {
    setFileName('sample_gmb_everywhere_al_rigga.csv');
    setImportTab('paste');
    handleParse(SAMPLE_GMB_EVERYWHERE_CSV);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;

    const standardizedLeads: BusinessLead[] = parsedPreview.map((item, idx) => ({
      id: item.id || `gmb-imported-${Date.now()}-${idx}`,
      name: item.name || 'Unnamed Business',
      category: item.category || 'Local Business',
      rating: item.rating ?? 4.4,
      reviewCount: item.reviewCount ?? 25,
      district: item.district || 'Al Rigga',
      address: item.address || 'Dubai, UAE',
      phone: item.phone || '+971 4 000 0000',
      placeId: item.placeId || `gmb-${Date.now()}-${idx}`,
      mapsUrl: item.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name || 'Dubai')}`,
      directReviewUrl: item.directReviewUrl || item.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name || 'Dubai')}`,
      pitchOpportunity: item.pitchOpportunity || (item.reviewCount && item.reviewCount < 50 ? 'high' : 'medium'),
      pitchAngle: item.pitchAngle || 'High-conversion NFC Google review card opportunity.',
      lat: item.lat,
      lng: item.lng,
      audit: item.audit,
    }));

    onImportLeads(standardizedLeads, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Import GMB Everywhere™ Data
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CSV / JSON
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Import exported leads from the <strong className="text-amber-400">GMB Everywhere Chrome extension</strong>. Automatically parses audit points: <span className="text-slate-200 font-medium">Category Match, Profile Completeness, Review Velocity, &amp; Photos Count</span>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Action Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Need sample data to test?</span>
          </div>
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample GMB Everywhere Export (Al Rigga Clinics &amp; Cafes)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setImportTab('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                importTab === 'paste'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste CSV / JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setImportTab('file')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                importTab === 'file'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload File (.csv / .json)</span>
            </button>
          </div>

          {/* Paste Tab */}
          {importTab === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paste GMB Everywhere export text (CSV rows or JSON array)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => handleParse(e.target.value)}
                placeholder={`Business Name,Primary Category,Review Count,Rating,Category Match,Profile Completeness,Review Velocity,Photos Count,District,Address,Phone\n"Al Rigga Dental Clinic","Dental Clinic",38,4.3,"100% Primary Match",72,"+0.7 rev/mo (Stagnant)",18,"Al Rigga","Al Rigga Rd, Deira, Dubai","+971 4 223 9988"`}
                rows={6}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
              />
            </div>
          )}

          {/* File Upload Tab */}
          {importTab === 'file' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
                }`}
                onClick={() => document.getElementById('gmb-file-input')?.click()}
              >
                <input
                  id="gmb-file-input"
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="w-8 h-8 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-white">
                  {fileName ? fileName : 'Drop your GMB Everywhere CSV or JSON file here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or click to select from your computer
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {parseError && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedPreview.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Parsed {parsedPreview.length} Verified Leads with Audit Data
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-semibold">
                  {parsedPreview[0]?.district || 'Al Rigga'} Sector
                </span>
              </div>

              {/* Mini preview items list */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-850">
                {parsedPreview.map((lead, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-200 truncate">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {lead.category} • {lead.reviewCount} reviews ({lead.rating}★)
                      </div>
                    </div>

                    {lead.audit && (
                      <div className="flex items-center gap-2 text-[10px] font-mono flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
                          {lead.audit.profileCompleteness}% Complete
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300">
                          {lead.audit.reviewVelocity}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                          {lead.audit.photosCount} Photos
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Import Options (Replace vs Append) */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400 font-medium">
                  Destination Mode:
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-amber-500"
                    />
                    <span>Replace Current List</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-amber-500"
                    />
                    <span>Append to Current List</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <span>Import {parsedPreview.length > 0 ? `${parsedPreview.length} Leads` : ''} into Scout &amp; Radar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
