/**
 * Business Hours & Closing Time Calculation Utility for Dubai Commercial Directory
 * Computes GST (Dubai Time UTC+4) open/closing status and formatted badges.
 */

export interface BusinessHoursInfo {
  openingTime: string;
  closingTime: string;
  hoursLabel: string;
  daysOpen: string;
  isOpenNow: boolean;
  closingNotice: string;
  statusBadge: {
    text: string;
    subText?: string;
    dotColor: string;
    badgeBg: string;
    badgeBorder: string;
    textColor: string;
    isClosingSoon: boolean;
    is24Hours: boolean;
  };
}

// Simple deterministic hash for consistent variations per business name
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Parse time string like "09:00 AM" or "11:30 PM" to minutes from 00:00
function parseTimeToMinutes(str: string): number {
  if (!str) return 540; // 9:00 AM default
  if (str.toLowerCase().includes('24')) return 0;
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 540;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const isPm = match[3].toUpperCase() === 'PM';
  if (isPm && h < 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return h * 60 + m;
}

export function getDubaiCurrentMinutes(): number {
  try {
    const now = new Date();
    // Dubai is GST (UTC+4)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const dubaiTime = new Date(utc + 4 * 3600000);
    return dubaiTime.getHours() * 60 + dubaiTime.getMinutes();
  } catch {
    return 12 * 60; // 12:00 PM default fallback
  }
}

export function getBusinessHours(business: {
  name: string;
  category?: string;
  id?: string;
  openingTime?: string;
  closingTime?: string;
}): BusinessHoursInfo {
  const nameLower = (business.name || '').toLowerCase();
  const catLower = (business.category || '').toLowerCase();
  const hash = getHash(business.id || business.name || 'dubai_lead');

  let openingTime = business.openingTime || '09:00 AM';
  let closingTime = business.closingTime || '10:00 PM';
  let daysOpen = 'Daily';

  // 1. Check for 24/7 indicators in name or category
  if (
    nameLower.includes('24/7') ||
    nameLower.includes('24 hours') ||
    nameLower.includes('24h') ||
    nameLower.includes('24-7') ||
    nameLower.includes('al khabaisi community pharmacy 24/7') ||
    nameLower.includes('life pharmacy 24/7') ||
    nameLower.includes('aster pharmacy 24/7')
  ) {
    openingTime = '24 Hours';
    closingTime = '24 Hours';
    daysOpen = 'Open 24/7';
  } else if (catLower.includes('barber') || catLower.includes('gents salon') || nameLower.includes('barber') || nameLower.includes('scissors') || nameLower.includes('gents')) {
    // Dubai Barbers & Gents Salons typically close late: 11:00 PM, 11:30 PM, or 12:00 AM
    const times = ['11:00 PM', '11:30 PM', '12:00 AM', '11:30 PM'];
    closingTime = times[hash % times.length];
    openingTime = hash % 2 === 0 ? '09:00 AM' : '10:00 AM';
    daysOpen = 'Daily';
  } else if (catLower.includes('ladies salon') || catLower.includes('spa') || catLower.includes('beauty') || nameLower.includes('salon') || nameLower.includes('spa')) {
    // Ladies Salons & Spas typically close 10:00 PM or 10:30 PM
    const times = ['10:00 PM', '10:30 PM', '09:30 PM', '10:00 PM'];
    closingTime = times[hash % times.length];
    openingTime = '10:00 AM';
    daysOpen = 'Daily';
  } else if (catLower.includes('restaurant') || catLower.includes('cafe') || catLower.includes('bakery') || catLower.includes('coffee') || nameLower.includes('cafe') || nameLower.includes('bakery') || nameLower.includes('restaurant')) {
    // Dubai Cafes & Restaurants typically close 11:30 PM, 12:00 AM (Midnight), or 01:00 AM
    const times = ['11:30 PM', '12:00 AM', '12:30 AM', '01:00 AM'];
    closingTime = times[hash % times.length];
    openingTime = hash % 2 === 0 ? '07:30 AM' : '08:00 AM';
    daysOpen = 'Daily';
  } else if (catLower.includes('dental') || catLower.includes('clinic') || catLower.includes('health') || nameLower.includes('dental') || nameLower.includes('clinic') || nameLower.includes('polyclinic')) {
    // Clinics & Healthcare typically close 09:00 PM, 09:30 PM, or 10:00 PM
    const times = ['09:00 PM', '09:30 PM', '10:00 PM', '08:30 PM'];
    closingTime = times[hash % times.length];
    openingTime = '09:00 AM';
    daysOpen = 'Mon - Sat (Sun by Appt)';
  } else if (catLower.includes('pharmacy')) {
    // Standard Pharmacies
    const times = ['11:00 PM', '12:00 AM', '24 Hours', '11:30 PM'];
    closingTime = times[hash % times.length];
    openingTime = closingTime === '24 Hours' ? '24 Hours' : '08:00 AM';
    daysOpen = 'Daily';
  } else if (catLower.includes('fitness') || catLower.includes('gym')) {
    // Gyms
    const times = ['11:00 PM', '11:30 PM', '24 Hours', '10:30 PM'];
    closingTime = times[hash % times.length];
    openingTime = closingTime === '24 Hours' ? '24 Hours' : '06:00 AM';
    daysOpen = 'Daily';
  } else if (catLower.includes('automotive') || catLower.includes('car') || catLower.includes('tyre')) {
    // Automotive
    closingTime = '08:30 PM';
    openingTime = '08:00 AM';
    daysOpen = 'Sat - Thu';
  } else {
    // Retail & Commercial Offices
    const times = ['09:30 PM', '10:00 PM', '10:30 PM', '09:00 PM'];
    closingTime = times[hash % times.length];
    openingTime = '09:00 AM';
    daysOpen = 'Daily';
  }

  const is24Hours = openingTime === '24 Hours' || closingTime === '24 Hours';
  const currentMinutes = getDubaiCurrentMinutes();

  let isOpenNow = true;
  let isClosingSoon = false;

  if (is24Hours) {
    isOpenNow = true;
    isClosingSoon = false;
  } else {
    const openMin = parseTimeToMinutes(openingTime);
    let closeMin = parseTimeToMinutes(closingTime);

    if (closeMin <= openMin) {
      // Midnight or early morning close e.g. 08:00 AM to 01:00 AM (+1 day)
      closeMin += 24 * 60;
      const effectiveCurrent = currentMinutes < openMin ? currentMinutes + 24 * 60 : currentMinutes;
      isOpenNow = effectiveCurrent >= openMin && effectiveCurrent <= closeMin;
      if (isOpenNow && closeMin - effectiveCurrent <= 60 && closeMin - effectiveCurrent >= 0) {
        isClosingSoon = true;
      }
    } else {
      isOpenNow = currentMinutes >= openMin && currentMinutes <= closeMin;
      if (isOpenNow && closeMin - currentMinutes <= 60 && closeMin - currentMinutes >= 0) {
        isClosingSoon = true;
      }
    }
  }

  const hoursLabel = is24Hours ? 'Open 24 Hours (Daily)' : `${openingTime} – ${closingTime} (${daysOpen})`;
  const closingNotice = is24Hours
    ? 'Open 24 Hours'
    : isOpenNow
    ? `Closes ${closingTime}`
    : `Closed · Opens ${openingTime}`;

  let statusBadge: BusinessHoursInfo['statusBadge'];

  if (is24Hours) {
    statusBadge = {
      text: 'Open 24/7',
      subText: 'Always Open',
      dotColor: 'bg-[#10b981]',
      badgeBg: 'bg-[#062419]',
      badgeBorder: 'border-[#059669]/50',
      textColor: 'text-[#34d399]',
      isClosingSoon: false,
      is24Hours: true,
    };
  } else if (isClosingSoon) {
    statusBadge = {
      text: `Closes Soon · ${closingTime}`,
      subText: `Closes at ${closingTime}`,
      dotColor: 'bg-amber-400 animate-ping',
      badgeBg: 'bg-[#291b07]',
      badgeBorder: 'border-amber-600/50',
      textColor: 'text-amber-300',
      isClosingSoon: true,
      is24Hours: false,
    };
  } else if (isOpenNow) {
    statusBadge = {
      text: `Closes ${closingTime}`,
      subText: `Open until ${closingTime}`,
      dotColor: 'bg-[#10b981]',
      badgeBg: 'bg-[#0a2018]',
      badgeBorder: 'border-[#10b981]/30',
      textColor: 'text-[#34d399]',
      isClosingSoon: false,
      is24Hours: false,
    };
  } else {
    statusBadge = {
      text: `Closed · Opens ${openingTime}`,
      subText: `Opens at ${openingTime}`,
      dotColor: 'bg-rose-500',
      badgeBg: 'bg-[#261016]',
      badgeBorder: 'border-rose-900/40',
      textColor: 'text-rose-300',
      isClosingSoon: false,
      is24Hours: false,
    };
  }

  return {
    openingTime,
    closingTime,
    hoursLabel,
    daysOpen,
    isOpenNow,
    closingNotice,
    statusBadge,
  };
}
