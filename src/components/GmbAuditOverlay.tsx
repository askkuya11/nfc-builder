import React, { useState } from 'react';
import { GmbAuditData } from '../types';
import {
  CheckCircle2,
  Gauge,
  TrendingUp,
  Image as ImageIcon,
  Target,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react';

interface GmbAuditOverlayProps {
  audit: GmbAuditData;
  compact?: boolean;
}

export const GmbAuditOverlay: React.FC<GmbAuditOverlayProps> = ({
  audit,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Velocity styling helper
  const isVelocityLow = audit.velocityStatus === 'stagnant' || audit.velocityStatus === 'slow';
  const velocityColor = audit.velocityStatus === 'stagnant' 
    ? 'text-rose-400 bg-rose-950/60 border-rose-800/50' 
    : audit.velocityStatus === 'slow'
    ? 'text-amber-400 bg-amber-950/60 border-amber-800/50'
    : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50';

  // Completeness color
  const completenessColor = audit.profileCompleteness >= 80 
    ? 'bg-emerald-500' 
    : audit.profileCompleteness >= 65 
    ? 'bg-amber-500' 
    : 'bg-rose-500';

  return (
    <div className="bg-[#07070d] border border-white/10 rounded-2xl p-3 text-xs my-2.5 shadow-inner">
      {/* Top Banner with GMB Everywhere Branding & Audit Score */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400">
            GMB Everywhere™ Audit Overlay
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-white/50">Health Score:</span>
          <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-[#101019] border border-white/15 text-white flex items-center gap-1">
            <span className={audit.auditScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
              {audit.auditScore}
            </span>
            <span className="text-white/40 text-[9px]">/100</span>
          </span>
        </div>
      </div>

      {/* 4 Core Audit Points Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2.5">
        {/* 1. Category Match */}
        <div className="bg-[#101019] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>Category Match</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              {audit.categoryMatchScore}%
            </span>
          </div>
          <div className="text-[11px] font-semibold text-white truncate" title={audit.categoryMatch}>
            {audit.categoryMatch}
          </div>
        </div>

        {/* 2. Profile Completeness */}
        <div className="bg-[#101019] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>Profile Completeness</span>
            </span>
            <span className="font-mono text-white font-bold">
              {audit.profileCompleteness}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${completenessColor} transition-all duration-500`}
              style={{ width: `${audit.profileCompleteness}%` }}
            />
          </div>
        </div>

        {/* 3. Review Velocity */}
        <div className="bg-[#101019] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>Review Velocity</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono font-bold text-xs text-white">
              {audit.reviewVelocity.split(' ')[0]} <span className="text-[9px] font-normal text-white/50">rev/mo</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${velocityColor}`}>
              {isVelocityLow ? 'NFC Opportunity' : 'Active'}
            </span>
          </div>
        </div>

        {/* 4. Photos Count */}
        <div className="bg-[#101019] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-violet-400" />
              <span>Photos Count</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono font-bold text-xs text-white">
              {audit.photosCount} <span className="text-[9px] font-normal text-white/50">photos</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
              audit.photoStatus === 'deficient' 
                ? 'text-rose-400 bg-rose-950/60 border-rose-800/50' 
                : 'text-white/70 bg-white/5 border-white/10'
            }`}>
              {audit.photoStatus === 'deficient' ? 'Deficient' : 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Audit Details & Missing Attributes */}
      {audit.missingAttributes && audit.missingAttributes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-[10px] font-medium text-white/50 hover:text-amber-400 transition"
          >
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Audit Insights: {audit.missingAttributes.length} optimization points found</span>
            </span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-2 space-y-1 pl-1">
              {audit.missingAttributes.map((attr, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[10px] text-white/70">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{attr}</span>
                </div>
              ))}
              <div className="text-[10px] text-amber-300/90 font-mono mt-1 pt-1 border-t border-white/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>Field Angle: Pitch NFC card to boost stagnant {audit.reviewVelocity} review velocity.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
