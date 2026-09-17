import React, { useState } from 'react';
import { CardTheme } from '../types';
import { Radio, Star, Sparkles, Instagram, ArrowRightLeft, ShieldCheck } from 'lucide-react';

interface NfcCardPreviewProps {
  businessName: string;
  district?: string;
  cardType: 'google_review' | 'instagram' | 'custom_url';
  theme: CardTheme;
  targetUrl: string;
  instagramHandle?: string;
  onTapSimulator?: () => void;
  isSimulatingTap?: boolean;
}

export const NfcCardPreview: React.FC<NfcCardPreviewProps> = ({
  businessName,
  district,
  cardType,
  theme,
  targetUrl,
  instagramHandle,
  onTapSimulator,
  isSimulatingTap = false,
}) => {
  const [showBack, setShowBack] = useState(false);

  // Card themes
  const getThemeStyles = () => {
    switch (theme) {
      case 'gold_black':
        return {
          cardBg: 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/80 border-amber-500/40 text-amber-100 shadow-amber-900/20',
          accent: 'text-amber-400',
          goldBadge: 'bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950',
          foilBorder: 'border-amber-400/40',
        };
      case 'google_clean':
        return {
          cardBg: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 border-neutral-300 text-neutral-900 shadow-neutral-400/20',
          accent: 'text-blue-600',
          goldBadge: 'bg-amber-400 text-neutral-950',
          foilBorder: 'border-neutral-300',
        };
      case 'instagram_sunset':
        return {
          cardBg: 'bg-gradient-to-tr from-purple-900 via-pink-700 to-amber-600 border-pink-400/40 text-white shadow-pink-900/30',
          accent: 'text-amber-300',
          goldBadge: 'bg-white text-purple-950',
          foilBorder: 'border-pink-300/40',
        };
      case 'dubai_emerald':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-950 via-[#07070d] to-teal-900 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40',
          accent: 'text-emerald-400',
          goldBadge: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950',
          foilBorder: 'border-emerald-400/30',
        };
      case 'matte_noir':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-zinc-700 text-zinc-100 shadow-black/40',
          accent: 'text-zinc-300',
          goldBadge: 'bg-zinc-200 text-zinc-950',
          foilBorder: 'border-zinc-700',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="flex flex-col items-center">
      {/* 3D Physical NFC Card Display */}
      <div className="relative w-full max-w-[340px] aspect-[1.586/1] select-none perspective-1000">
        <div
          onClick={() => setShowBack(!showBack)}
          className={`w-full h-full rounded-2xl p-5 border-2 shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            styles.cardBg
          } ${isSimulatingTap ? 'scale-95 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-[#101019]' : 'hover:scale-[1.02]'}`}
        >
          {/* Subtle glossy sheen reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none" />

          {!showBack ? (
            /* FRONT OF CARD */
            <>
              {/* Top Row: Business Identity & Contactless Wave Glyphs */}
              <div className="flex items-start justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    {cardType === 'instagram' ? (
                      <Instagram className="w-4 h-4 text-pink-400" />
                    ) : (
                      <div className="flex items-center justify-center font-black text-xs">
                        <span className="text-blue-400">G</span>
                        <span className="text-red-400">o</span>
                        <span className="text-amber-400">o</span>
                        <span className="text-emerald-400">g</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">
                      {cardType === 'instagram' ? 'INSTAGRAM TAP CARD' : 'GOOGLE REVIEW NFC'}
                    </p>
                    <p className="text-xs font-medium opacity-90 truncate max-w-[170px]">
                      {district || 'Dubai, UAE'}
                    </p>
                  </div>
                </div>

                {/* NFC Contactless Waves Glyph */}
                <div className="flex items-center gap-1 opacity-90">
                  <Radio className={`w-5 h-5 ${styles.accent} animate-pulse`} />
                  <span className="text-[10px] font-mono font-bold tracking-wider">NFC</span>
                </div>
              </div>

              {/* Center: Business Name & 5 Gold Review Stars */}
              <div className="my-auto z-10 text-center py-1">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight leading-snug line-clamp-1">
                  {businessName || 'Your Business Name'}
                </h3>
                
                {cardType === 'instagram' ? (
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold">
                    <span className="opacity-80">Tap to follow:</span>
                    <span className="underline decoration-pink-400 font-mono">
                      @{instagramHandle || 'dubaibusiness'}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold tracking-wide mt-1 uppercase text-amber-400/90">
                      Tap phone to rate 5-Stars
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Row: Microchip chip simulation & instruction */}
              <div className="flex items-end justify-between z-10 pt-1 border-t border-white/15">
                <div className="flex items-center gap-1.5">
                  {/* Embedded chip graphic */}
                  <div className="w-6 h-5 rounded bg-amber-500/30 border border-amber-400/60 flex items-center justify-center">
                    <div className="w-3 h-2 border border-amber-300/80 rounded-sm" />
                  </div>
                  <span className="text-[9px] font-mono opacity-60">NTAG213 • 144B</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-medium opacity-70">Tap back of phone</span>
                </div>
              </div>
            </>
          ) : (
            /* BACK OF CARD */
            <>
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono opacity-60">ID: DXB-NFC-{Math.abs((businessName || '').length * 179 + 42)}</span>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Encrypted NDEF
                </span>
              </div>

              <div className="my-auto z-10 text-center px-2">
                <p className="text-[10px] font-mono opacity-80 break-all line-clamp-3 bg-black/40 p-2 rounded border border-white/10 text-left">
                  {targetUrl || 'https://search.google.com/local/writereview?placeid=...'}
                </p>
                <p className="text-[10px] opacity-70 mt-2">
                  Permanent rewritable ISO 14443-A contactless smart chip
                </p>
              </div>

              <div className="flex items-center justify-between z-10 text-[9px] opacity-50 border-t border-white/10 pt-1">
                <span>Made for Dubai Business</span>
                <span>Flip back</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Controls & Flip Hint */}
      <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
        <button
          onClick={() => setShowBack(!showBack)}
          className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400" />
          <span>Flip to {showBack ? 'Front' : 'Back'}</span>
        </button>

        {onTapSimulator && (
          <button
            onClick={onTapSimulator}
            className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 font-semibold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Customer Tap</span>
          </button>
        )}
      </div>
    </div>
  );
};
