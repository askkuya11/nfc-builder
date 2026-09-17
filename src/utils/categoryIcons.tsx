import React from 'react';
import {
  Scissors,
  Utensils,
  Coffee,
  Sparkles,
  Stethoscope,
  Pill,
  Dumbbell,
  Car,
  ShoppingBag,
  Briefcase,
  Store,
  Building2,
} from 'lucide-react';

export type BusinessCategoryType =
  | 'barbershop'
  | 'salon_spa'
  | 'dental'
  | 'restaurant'
  | 'cafe'
  | 'healthcare'
  | 'fitness'
  | 'automotive'
  | 'retail'
  | 'corporate'
  | 'general';

export interface CategoryVisualMeta {
  type: BusinessCategoryType;
  label: string;
  emoji: string;
  pinSvg: string; // SVG path content for Leaflet DivIcon
  pinColor: string;
  pinBgClass: string;
  borderClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  iconComponent: React.ComponentType<{ className?: string }>;
}

export function detectBusinessCategory(category?: string, name?: string): BusinessCategoryType {
  const c = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();
  const combined = `${c} ${n}`;

  // 1. Barbershop & Gents Salon (User specifically requested: "if barbershop use scissor")
  if (
    combined.includes('barber') ||
    combined.includes('gents salon') ||
    combined.includes('grooming') ||
    combined.includes('haircut') ||
    combined.includes('fade') ||
    combined.includes('shave') ||
    combined.includes('men salon') ||
    combined.includes("men's salon")
  ) {
    return 'barbershop';
  }

  // 2. Ladies Salon, Nails & Spa
  if (
    combined.includes('ladies salon') ||
    combined.includes('beauty salon') ||
    combined.includes('spa') ||
    combined.includes('nails') ||
    combined.includes('lash') ||
    combined.includes('massage') ||
    combined.includes('aesthetics') ||
    combined.includes('skincare') ||
    combined.includes('wellness')
  ) {
    return 'salon_spa';
  }

  // 3. Dental Clinic
  if (
    combined.includes('dental') ||
    combined.includes('dentist') ||
    combined.includes('orthodont') ||
    combined.includes('teeth') ||
    combined.includes('oral') ||
    combined.includes('smile clinic')
  ) {
    return 'dental';
  }

  // 4. Cafe & Coffee Shops
  if (
    combined.includes('cafe') ||
    combined.includes('coffee') ||
    combined.includes('roastery') ||
    combined.includes('espresso') ||
    combined.includes('bakery') ||
    combined.includes('karak') ||
    combined.includes('tea house')
  ) {
    return 'cafe';
  }

  // 5. Restaurant & Dining
  if (
    combined.includes('restaurant') ||
    combined.includes('dining') ||
    combined.includes('bistro') ||
    combined.includes('eatery') ||
    combined.includes('grill') ||
    combined.includes('shawarma') ||
    combined.includes('mandi') ||
    combined.includes('biryani') ||
    combined.includes('kitchen') ||
    combined.includes('food') ||
    combined.includes('burger') ||
    combined.includes('pizza')
  ) {
    return 'restaurant';
  }

  // 6. Medical, Pharmacy & Healthcare
  if (
    combined.includes('clinic') ||
    combined.includes('pharmacy') ||
    combined.includes('medical') ||
    combined.includes('hospital') ||
    combined.includes('physio') ||
    combined.includes('doctor') ||
    combined.includes('laboratory') ||
    combined.includes('derma')
  ) {
    return 'healthcare';
  }

  // 7. Fitness & Gyms
  if (
    combined.includes('gym') ||
    combined.includes('fitness') ||
    combined.includes('crossfit') ||
    combined.includes('boxing') ||
    combined.includes('workout') ||
    combined.includes('training')
  ) {
    return 'fitness';
  }

  // 8. Automotive & Car Care
  if (
    combined.includes('auto') ||
    combined.includes('car') ||
    combined.includes('garage') ||
    combined.includes('tyre') ||
    combined.includes('tire') ||
    combined.includes('wash') ||
    combined.includes('mechanic') ||
    combined.includes('motor')
  ) {
    return 'automotive';
  }

  // 9. Retail & Boutiques
  if (
    combined.includes('retail') ||
    combined.includes('boutique') ||
    combined.includes('supermarket') ||
    combined.includes('grocery') ||
    combined.includes('fashion') ||
    combined.includes('perfume') ||
    combined.includes('jewel') ||
    combined.includes('shop') ||
    combined.includes('store')
  ) {
    return 'retail';
  }

  // 10. Corporate, Real Estate & Advisory
  if (
    combined.includes('real estate') ||
    combined.includes('corporate') ||
    combined.includes('typing') ||
    combined.includes('pro services') ||
    combined.includes('legal') ||
    combined.includes('consult') ||
    combined.includes('office') ||
    combined.includes('trading')
  ) {
    return 'corporate';
  }

  return 'general';
}

export function getCategoryVisualMeta(category?: string, name?: string): CategoryVisualMeta {
  const type = detectBusinessCategory(category, name);

  switch (type) {
    case 'barbershop':
      return {
        type: 'barbershop',
        label: "Barbershop & Gents Salon",
        emoji: '✂️',
        // Scissors SVG path
        pinSvg: `<circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line>`,
        pinColor: '#f59e0b',
        pinBgClass: 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-amber-500/30',
        borderClass: 'border-amber-500',
        badgeBgClass: 'bg-amber-500/15 border-amber-500/30',
        badgeTextClass: 'text-amber-400',
        iconComponent: Scissors,
      };

    case 'salon_spa':
      return {
        type: 'salon_spa',
        label: 'Ladies Salon & Spa',
        emoji: '✨',
        // Sparkles SVG path
        pinSvg: `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path>`,
        pinColor: '#ec4899',
        pinBgClass: 'bg-pink-950/90 border-pink-500 text-pink-300 shadow-pink-500/30',
        borderClass: 'border-pink-500',
        badgeBgClass: 'bg-pink-500/15 border-pink-500/30',
        badgeTextClass: 'text-pink-400',
        iconComponent: Sparkles,
      };

    case 'dental':
      return {
        type: 'dental',
        label: 'Dental Clinic',
        emoji: '🦷',
        // Tooth outline SVG
        pinSvg: `<path d="M7 3C4.5 3 3 5.5 3 9c0 3.5 1.5 6 2.5 9 .8 2.4 2 3 3.5 3 1.5 0 2-2 3-2s1.5 2 3 2c1.5 0 2.7-.6 3.5-3 1-3 2.5-5.5 2.5-9 0-3.5-1.5-6-4-6-2.2 0-3.5 1.8-4.5 2C10.5 4.8 9.2 3 7 3z"></path>`,
        pinColor: '#06b6d4',
        pinBgClass: 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-cyan-500/30',
        borderClass: 'border-cyan-400',
        badgeBgClass: 'bg-cyan-500/15 border-cyan-500/30',
        badgeTextClass: 'text-cyan-300',
        iconComponent: Stethoscope,
      };

    case 'restaurant':
      return {
        type: 'restaurant',
        label: 'Restaurant & Dining',
        emoji: '🍽️',
        // Utensils SVG
        pinSvg: `<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><path d="M15 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V2"></path><line x1="15" y1="22" x2="15" y2="11"></line><path d="M6 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2"></path><path d="M8 11v11"></path>`,
        pinColor: '#f97316',
        pinBgClass: 'bg-orange-950/90 border-orange-500 text-orange-300 shadow-orange-500/30',
        borderClass: 'border-orange-500',
        badgeBgClass: 'bg-orange-500/15 border-orange-500/30',
        badgeTextClass: 'text-orange-400',
        iconComponent: Utensils,
      };

    case 'cafe':
      return {
        type: 'cafe',
        label: 'Cafe & Roastery',
        emoji: '☕',
        // Coffee Cup SVG
        pinSvg: `<path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line>`,
        pinColor: '#eab308',
        pinBgClass: 'bg-yellow-950/90 border-yellow-500 text-yellow-300 shadow-yellow-500/30',
        borderClass: 'border-yellow-500',
        badgeBgClass: 'bg-yellow-500/15 border-yellow-500/30',
        badgeTextClass: 'text-yellow-400',
        iconComponent: Coffee,
      };

    case 'healthcare':
      return {
        type: 'healthcare',
        label: 'Medical & Clinic',
        emoji: '💊',
        // Pill / Cross SVG
        pinSvg: `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path>`,
        pinColor: '#10b981',
        pinBgClass: 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/30',
        borderClass: 'border-emerald-400',
        badgeBgClass: 'bg-emerald-500/15 border-emerald-500/30',
        badgeTextClass: 'text-emerald-300',
        iconComponent: Pill,
      };

    case 'fitness':
      return {
        type: 'fitness',
        label: 'Fitness & Gym',
        emoji: '🏋️',
        // Dumbbell SVG
        pinSvg: `<path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1"></path><path d="m3 3 1 1"></path><path d="m18 22 4-4"></path><path d="m2 6 4-4"></path><path d="m3 10 7-7"></path><path d="m14 21 7-7"></path>`,
        pinColor: '#a855f7',
        pinBgClass: 'bg-purple-950/90 border-purple-500 text-purple-300 shadow-purple-500/30',
        borderClass: 'border-purple-500',
        badgeBgClass: 'bg-purple-500/15 border-purple-500/30',
        badgeTextClass: 'text-purple-400',
        iconComponent: Dumbbell,
      };

    case 'automotive':
      return {
        type: 'automotive',
        label: 'Auto & Garage',
        emoji: '🚗',
        // Car SVG
        pinSvg: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle>`,
        pinColor: '#3b82f6',
        pinBgClass: 'bg-blue-950/90 border-blue-500 text-blue-300 shadow-blue-500/30',
        borderClass: 'border-blue-500',
        badgeBgClass: 'bg-blue-500/15 border-blue-500/30',
        badgeTextClass: 'text-blue-400',
        iconComponent: Car,
      };

    case 'retail':
      return {
        type: 'retail',
        label: 'Retail & Boutique',
        emoji: '🛍️',
        // Shopping Bag SVG
        pinSvg: `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>`,
        pinColor: '#10b981',
        pinBgClass: 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-500/30',
        borderClass: 'border-emerald-400',
        badgeBgClass: 'bg-emerald-500/15 border-emerald-500/30',
        badgeTextClass: 'text-emerald-300',
        iconComponent: ShoppingBag,
      };

    case 'corporate':
      return {
        type: 'corporate',
        label: 'Corporate & Real Estate',
        emoji: '💼',
        // Briefcase SVG
        pinSvg: `<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>`,
        pinColor: '#6366f1',
        pinBgClass: 'bg-indigo-950/90 border-indigo-500 text-indigo-300 shadow-indigo-500/30',
        borderClass: 'border-indigo-500',
        badgeBgClass: 'bg-indigo-500/15 border-indigo-500/30',
        badgeTextClass: 'text-indigo-300',
        iconComponent: Briefcase,
      };

    default:
      return {
        type: 'general',
        label: 'Business Establishment',
        emoji: '🏪',
        // Storefront SVG
        pinSvg: `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path>`,
        pinColor: '#f59e0b',
        pinBgClass: 'bg-[#101019] border-amber-500/80 text-amber-300 shadow-amber-500/20',
        borderClass: 'border-amber-500',
        badgeBgClass: 'bg-amber-500/15 border-amber-500/30',
        badgeTextClass: 'text-amber-400',
        iconComponent: Store,
      };
  }
}

/**
 * Category Icon badge component for React UI
 */
export const CategoryBadge: React.FC<{
  category?: string;
  name?: string;
  className?: string;
  showIcon?: boolean;
}> = ({ category, name, className = '', showIcon = true }) => {
  const meta = getCategoryVisualMeta(category, name);
  const Icon = meta.iconComponent;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${meta.badgeBgClass} ${meta.badgeTextClass} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="truncate">{category || meta.label}</span>
    </span>
  );
};
