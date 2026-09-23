import { BusinessLead, GisBuildingInfo, GisBuildingEntrance, GisIndoorBusiness } from '../types';

// Deterministic pseudo-random number generator for consistent building generation
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function checkIsOpenNow(openStr: string, closeStr: string): boolean {
  if (!openStr || !closeStr) return true;
  if (openStr.includes('24') || closeStr.includes('24')) return true;
  try {
    const now = new Date();
    // Dubai is UTC+4 (GST)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const dubaiTime = new Date(utc + 4 * 3600000);
    const currentMinutes = dubaiTime.getHours() * 60 + dubaiTime.getMinutes();

    const parseToMinutes = (str: string) => {
      const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 540; // 9:00 AM default
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
      return h * 60 + m;
    };

    const openMin = parseToMinutes(openStr);
    let closeMin = parseToMinutes(closeStr);
    if (closeMin <= openMin) {
      // Overnight closing e.g. 11:00 AM to 01:00 AM
      closeMin += 24 * 60;
      const effectiveCurrent = currentMinutes < openMin ? currentMinutes + 24 * 60 : currentMinutes;
      return effectiveCurrent >= openMin && effectiveCurrent <= closeMin;
    }
    return currentMinutes >= openMin && currentMinutes <= closeMin;
  } catch {
    return true;
  }
}

// Dubai commercial building template definition
export interface KnownBuildingTemplate {
  name: string;
  arabicName: string;
  floors: number;
  makaniPrefix: string;
  metroStation: string;
  metroExit: string;
  distanceFromMetro: string;
  lat: number;
  lng: number;
  entranceNames: string[];
  doorTypes: GisBuildingEntrance['doorType'][];
  curatedCompanies?: Partial<GisIndoorBusiness>[];
}

export const KNOWN_BUILDINGS_BY_DISTRICT: Record<string, KnownBuildingTemplate[]> = {
  rigga: [
    {
      name: 'Al Zarooni Commercial Building',
      arabicName: 'بناية الزرعوني التجارية - الرقة',
      floors: 7,
      makaniPrefix: '31295',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 1 (Directly Opposite Al Rigga Metro Plaza)',
      distanceFromMetro: '25m from Al Rigga Metro Exit 1',
      lat: 25.2636,
      lng: 55.3242,
      entranceNames: [
        'Main Concourse Entrance (Al Rigga Metro Plaza)',
        'Side Arcade Entrance (Al Rigga Road Facing)',
        'Rear Service & Taxi Drop Entrance',
      ],
      doorTypes: ['main_glass_door', 'main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Al Zarooni Typing & Tasheel Center',
          category: 'Corporate Services',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 102',
          openingTime: '08:00 AM',
          closingTime: '08:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.5,
          reviewCount: 18,
          pitchOpportunity: 'high',
        },
        {
          name: 'Rigga Smile Dental Clinic',
          category: 'Dental Clinic',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 201',
          openingTime: '09:00 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.9,
          reviewCount: 24,
          pitchOpportunity: 'high',
        },
        {
          name: 'Golden Scissors Executive Gents Salon',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-03',
          openingTime: '09:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 38,
          pitchOpportunity: 'high',
        },
        {
          name: 'Kaya Skin & Aesthetic Clinic Rigga',
          category: 'Clinics & Healthcare',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 104',
          openingTime: '10:00 AM',
          closingTime: '08:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.7,
          reviewCount: 31,
          pitchOpportunity: 'high',
        },
        {
          name: 'Life Pharmacy 24/7 Rigga Metro',
          category: 'Pharmacy & Health',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '24 Hours',
          closingTime: '24 Hours',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 58,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Al Maya Supermarket Rigga Metro',
          category: 'Retail & Boutiques',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-02',
          openingTime: '24 Hours',
          closingTime: '24 Hours',
          daysOpen: 'Daily',
          rating: 4.4,
          reviewCount: 72,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Gulf Horizons Travel & Tourism',
          category: 'Travel Agency',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 305',
          openingTime: '09:00 AM',
          closingTime: '07:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.3,
          reviewCount: 19,
          pitchOpportunity: 'high',
        },
        {
          name: 'Bella Donna Ladies Beauty Lounge',
          category: 'Ladies Salons & Spas',
          floor: 'Mezzanine Floor',
          floorNumber: 0.5,
          unitNumber: 'M-04',
          openingTime: '10:00 AM',
          closingTime: '10:00 PM',
          daysOpen: 'Daily',
          rating: 4.8,
          reviewCount: 29,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Ibrahim Al Khaja Commercial Building',
      arabicName: 'بناية إبراهيم الخاجة التجارية',
      floors: 6,
      makaniPrefix: '31320',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 1 (Al Rigga Road)',
      distanceFromMetro: '45m from Al Rigga Metro Exit 1',
      lat: 25.2632,
      lng: 55.3248,
      entranceNames: [
        'Main Entrance (Al Rigga Road Walkway)',
        'Side Metro Connector Entrance',
      ],
      doorTypes: ['main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Al Khaja Travel & Tourism LLC',
          category: 'Travel Agency',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 101',
          openingTime: '09:00 AM',
          closingTime: '08:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.3,
          reviewCount: 21,
          pitchOpportunity: 'high',
        },
        {
          name: 'Modern Vision Optical Rigga Metro',
          category: 'Retail & Boutiques',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-02',
          openingTime: '09:30 AM',
          closingTime: '10:30 PM',
          daysOpen: 'Daily',
          rating: 4.4,
          reviewCount: 28,
          pitchOpportunity: 'high',
        },
        {
          name: 'Dr. Joy Dental Care Al Rigga',
          category: 'Dental Clinic',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 202',
          openingTime: '09:30 AM',
          closingTime: '08:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.9,
          reviewCount: 32,
          pitchOpportunity: 'high',
        },
        {
          name: 'Glamour Zone Ladies Salon',
          category: 'Ladies Salons & Spas',
          floor: 'Mezzanine Floor',
          floorNumber: 0.5,
          unitNumber: 'M-02',
          openingTime: '10:00 AM',
          closingTime: '10:00 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 26,
          pitchOpportunity: 'high',
        },
        {
          name: 'Emirates Business Setup & PRO Services',
          category: 'Corporate Services',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 303',
          openingTime: '08:30 AM',
          closingTime: '05:30 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.4,
          reviewCount: 16,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Al Hawai Commercial Building',
      arabicName: 'بناية الهواي التجارية - شارع الرقة',
      floors: 7,
      makaniPrefix: '31375',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 2 (Al Rigga Street)',
      distanceFromMetro: '75m from Al Rigga Metro Exit 2',
      lat: 25.2625,
      lng: 55.3255,
      entranceNames: [
        'Main Lobby Entrance (Al Rigga Street)',
        'Rear Parking Concourse Entrance',
      ],
      doorTypes: ['main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Al Hawai Typing & Documents Clearing',
          category: 'Corporate Services',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 104',
          openingTime: '08:00 AM',
          closingTime: '07:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.4,
          reviewCount: 15,
          pitchOpportunity: 'high',
        },
        {
          name: 'Prime Gents Barbershop Al Rigga',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-03',
          openingTime: '09:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 36,
          pitchOpportunity: 'high',
        },
        {
          name: 'Al Rigga Modern Medical Polyclinic',
          category: 'Clinics & Healthcare',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 204',
          openingTime: '08:30 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.6,
          reviewCount: 41,
          pitchOpportunity: 'high',
        },
        {
          name: 'Universal Vision Optics',
          category: 'Retail & Boutiques',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '09:30 AM',
          closingTime: '10:30 PM',
          daysOpen: 'Daily',
          rating: 4.3,
          reviewCount: 27,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Rigga Central Business Tower',
      arabicName: 'برج الرقة سنترال للأعمال',
      floors: 6,
      makaniPrefix: '31340',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 2 (Al Rigga Street)',
      distanceFromMetro: '80m from Metro Exit 2',
      lat: 25.2638,
      lng: 55.3235,
      entranceNames: ['Entrance A (Street Front)', 'Entrance B (Rear Alley & Metro Link)'],
      doorTypes: ['main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Captain Gents Salon - Al Rigga Metro',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-02',
          openingTime: '09:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 48,
          pitchOpportunity: 'high',
        },
        {
          name: 'Life Pharmacy 24/7 Rigga',
          category: 'Pharmacy & Health',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '24 Hours',
          closingTime: '24 Hours',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 65,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Rigga Smiles Dental Specialty',
          category: 'Dental Clinic',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 101',
          openingTime: '09:00 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.9,
          reviewCount: 32,
          pitchOpportunity: 'high',
        },
        {
          name: 'Skyline Business Setup & Typing',
          category: 'Corporate Services',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 204',
          openingTime: '08:30 AM',
          closingTime: '06:30 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.4,
          reviewCount: 16,
          pitchOpportunity: 'high',
        },
        {
          name: 'Orient Express Cargo & Logistics',
          category: 'Corporate Services',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 302',
          openingTime: '09:00 AM',
          closingTime: '07:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.2,
          reviewCount: 21,
          pitchOpportunity: 'high',
        },
        {
          name: 'Caribou Coffee Rigga Concourse',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-05',
          openingTime: '07:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 74,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Glow Up Beauty & Nail Lounge',
          category: 'Ladies Salons & Spas',
          floor: 'Mezzanine Floor',
          floorNumber: 0.5,
          unitNumber: 'M-02',
          openingTime: '10:00 AM',
          closingTime: '09:30 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 29,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'City Avenue Commercial Building',
      arabicName: 'مبنى سيتي أفينيو التجاري',
      floors: 5,
      makaniPrefix: '31405',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 1 (North Concourse)',
      distanceFromMetro: '110m from Metro Exit 1',
      lat: 25.2632,
      lng: 55.3242,
      entranceNames: ['Main Lobby Entrance (Al Rigga St)', 'Side Entrance (Al Muraqqabat Cut-through)'],
      doorTypes: ['revolving_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Super Trim Gents Salon - Al Rigga',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-03',
          openingTime: '09:30 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 51,
          pitchOpportunity: 'high',
        },
        {
          name: 'Dr. Noor Polyclinic & Dental',
          category: 'Clinics & Healthcare',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 102',
          openingTime: '08:30 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.8,
          reviewCount: 34,
          pitchOpportunity: 'high',
        },
        {
          name: 'Prestige Accounting & VAT Auditing',
          category: 'Corporate Services',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 205',
          openingTime: '08:30 AM',
          closingTime: '05:30 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.5,
          reviewCount: 14,
          pitchOpportunity: 'high',
        },
        {
          name: 'Lavish Touch Ladies Salon',
          category: 'Ladies Salons & Spas',
          floor: 'Mezzanine Floor',
          floorNumber: 0.5,
          unitNumber: 'M-04',
          openingTime: '10:00 AM',
          closingTime: '10:00 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 38,
          pitchOpportunity: 'high',
        },
        {
          name: 'Al Safadi Gourmet Express',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '10:30 AM',
          closingTime: '01:00 AM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 82,
          pitchOpportunity: 'medium',
        },
      ],
    },
    {
      name: 'Al Muraqqabat Commercial Center',
      arabicName: 'مركز المرقبات التجاري',
      floors: 7,
      makaniPrefix: '31520',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 2 (Muraqqabat Corridor)',
      distanceFromMetro: '160m from Metro Exit 2',
      lat: 25.2650,
      lng: 55.3260,
      entranceNames: ['Entrance 1 (Opposite Metro Exit 2)', 'Entrance 2 (East Courtyard)'],
      doorTypes: ['main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Bait Al Mandi Traditional Kitchen',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '11:00 AM',
          closingTime: '01:30 AM',
          daysOpen: 'Daily',
          rating: 4.3,
          reviewCount: 88,
          pitchOpportunity: 'high',
        },
        {
          name: 'Al Muraqqabat Dental Center',
          category: 'Dental Clinic',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 201',
          openingTime: '09:00 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.8,
          reviewCount: 37,
          pitchOpportunity: 'high',
        },
        {
          name: 'Crown Falcon Men Barbering',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-04',
          openingTime: '09:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 43,
          pitchOpportunity: 'high',
        },
        {
          name: 'Al Ahli Translation & Attestation',
          category: 'Corporate Services',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 106',
          openingTime: '08:30 AM',
          closingTime: '06:00 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.4,
          reviewCount: 18,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Al Rigga Star Building',
      arabicName: 'بناية نجمة الرقة',
      floors: 5,
      makaniPrefix: '31310',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 1 (Stairs & Elevator)',
      distanceFromMetro: '60m from Metro Exit 1',
      lat: 25.2636,
      lng: 55.3248,
      entranceNames: ['Street Level Entrance 1', 'Entrance 2 (Service & Loading)'],
      doorTypes: ['main_glass_door', 'service_door'],
      curatedCompanies: [
        {
          name: 'Style & Scissors Gents Salon',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-02',
          openingTime: '09:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 88,
          pitchOpportunity: 'high',
        },
        {
          name: 'Al Rigga Opticals & Sunglasses',
          category: 'Retail & Boutiques',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '10:00 AM',
          closingTime: '10:00 PM',
          daysOpen: 'Daily',
          rating: 4.3,
          reviewCount: 22,
          pitchOpportunity: 'high',
        },
        {
          name: 'Gulf Horizon Visa Consultancy',
          category: 'Corporate Services',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 203',
          openingTime: '09:00 AM',
          closingTime: '06:00 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.2,
          reviewCount: 15,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Clock Tower Commercial Plaza',
      arabicName: 'بلازا برج الساعة التجاري',
      floors: 6,
      makaniPrefix: '31920',
      metroStation: 'Al Rigga (Red Line)',
      metroExit: 'Exit 2 (Clock Tower Direction)',
      distanceFromMetro: '250m towards Clock Tower',
      lat: 25.2595,
      lng: 55.3280,
      entranceNames: ['North Entrance (Clock Tower View)', 'South Entrance (Metro Connector)'],
      doorTypes: ['revolving_door', 'main_glass_door'],
      curatedCompanies: [
        {
          name: 'Clock Tower Medical Center',
          category: 'Clinics & Healthcare',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 101',
          openingTime: '08:30 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.7,
          reviewCount: 39,
          pitchOpportunity: 'high',
        },
        {
          name: 'Elite Clock Barbershop',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-03',
          openingTime: '09:30 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 44,
          pitchOpportunity: 'high',
        },
      ],
    },
  ],
  dcc: [
    {
      name: 'Centurion Star Tower',
      arabicName: 'برج سنتوريون ستار',
      floors: 12,
      makaniPrefix: '31765',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 2 (Port Saeed)',
      distanceFromMetro: '70m from DCC Metro Exit 2',
      lat: 25.2535,
      lng: 55.3335,
      entranceNames: ['Block A Main Entrance (DCC Metro Side)', 'Block B Entrance (Port Saeed Road)', 'Direct Metro Concourse Walkway'],
      doorTypes: ['revolving_door', 'main_glass_door', 'parking_elevator'],
      curatedCompanies: [
        {
          name: 'Centurion Dental & Orthodontic Clinic',
          category: 'Dental Clinic',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 204',
          openingTime: '09:00 AM',
          closingTime: '08:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.8,
          reviewCount: 38,
          pitchOpportunity: 'high',
        },
        {
          name: 'First Gulf Business Center & PRO',
          category: 'Corporate Services',
          floor: '4th Floor',
          floorNumber: 4,
          unitNumber: 'Suite 401',
          openingTime: '08:30 AM',
          closingTime: '06:00 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.5,
          reviewCount: 22,
          pitchOpportunity: 'high',
        },
        {
          name: 'Prime Cut Executive Gents Salon',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-03',
          openingTime: '09:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 46,
          pitchOpportunity: 'high',
        },
        {
          name: 'Dr. Joy Dental Care DCC',
          category: 'Dental Clinic',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 302',
          openingTime: '09:30 AM',
          closingTime: '08:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.9,
          reviewCount: 31,
          pitchOpportunity: 'high',
        },
        {
          name: 'Port Saeed Travel & Tourism LLC',
          category: 'Corporate Services',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 105',
          openingTime: '09:00 AM',
          closingTime: '07:00 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.3,
          reviewCount: 19,
          pitchOpportunity: 'high',
        },
        {
          name: 'Aster Pharmacy Centurion Star',
          category: 'Retail & Boutiques',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '08:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 52,
          pitchOpportunity: 'medium',
        },
      ],
    },
    {
      name: 'City Centre Offices - Deira',
      arabicName: 'مكاتب سيتي سنتر ديرة',
      floors: 10,
      makaniPrefix: '31820',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 1 (City Centre Deira Direct Walkway)',
      distanceFromMetro: '35m from DCC Metro Exit 1',
      lat: 25.2520,
      lng: 55.3315,
      entranceNames: ['Direct Metro Walkway Entrance (Exit 1)', 'East Office Tower Concourse Entrance', 'City Centre Mall Concourse Gate'],
      doorTypes: ['revolving_door', 'main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'City Centre Executive Dental Clinic',
          category: 'Dental Clinic',
          floor: '4th Floor',
          floorNumber: 4,
          unitNumber: 'Suite 402',
          openingTime: '09:00 AM',
          closingTime: '08:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.9,
          reviewCount: 29,
          pitchOpportunity: 'high',
        },
        {
          name: 'Urban Gentleman Barbershop Lounge',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-02',
          openingTime: '09:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.8,
          reviewCount: 44,
          pitchOpportunity: 'high',
        },
        {
          name: 'Kaya Skin Clinic Deira City Centre',
          category: 'Ladies Salons & Spas',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 305',
          openingTime: '10:00 AM',
          closingTime: '09:00 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 35,
          pitchOpportunity: 'high',
        },
        {
          name: 'Deira Global Business Center',
          category: 'Corporate Services',
          floor: '5th Floor',
          floorNumber: 5,
          unitNumber: 'Suite 501',
          openingTime: '08:30 AM',
          closingTime: '06:00 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.4,
          reviewCount: 18,
          pitchOpportunity: 'high',
        },
        {
          name: 'Tim Hortons Cafe & Bake Shop',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-05',
          openingTime: '06:30 AM',
          closingTime: '12:00 AM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 78,
          pitchOpportunity: 'medium',
        },
      ],
    },
    {
      name: 'Al Sondos Tower - Port Saeed',
      arabicName: 'برج السندس التجاري - بورسعيد',
      floors: 14,
      makaniPrefix: '31690',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 2 (Port Saeed Commercial Strip)',
      distanceFromMetro: '85m from DCC Metro Exit 2',
      lat: 25.2545,
      lng: 55.3345,
      entranceNames: ['Main Lobby Entrance (8th Street)', 'Port Saeed Service Concourse Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
      curatedCompanies: [
        {
          name: 'Al Sondos Typing & Tasheel Center',
          category: 'Corporate Services',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-02',
          openingTime: '08:00 AM',
          closingTime: '08:00 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 41,
          pitchOpportunity: 'high',
        },
        {
          name: 'Port Saeed Dental Speciality Clinic',
          category: 'Dental Clinic',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 301',
          openingTime: '09:00 AM',
          closingTime: '08:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.8,
          reviewCount: 33,
          pitchOpportunity: 'high',
        },
        {
          name: 'Classic Scissors Men Salon',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-06',
          openingTime: '09:30 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 39,
          pitchOpportunity: 'high',
        },
        {
          name: 'Fast Track Legal & Visa Documents',
          category: 'Corporate Services',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 104',
          openingTime: '08:30 AM',
          closingTime: '06:00 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.3,
          reviewCount: 16,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Port Saeed Business Tower',
      arabicName: 'برج بورسعيد للأعمال',
      floors: 11,
      makaniPrefix: '31610',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 2 (Al Ittihad Road Side)',
      distanceFromMetro: '115m from DCC Metro Exit 2',
      lat: 25.2550,
      lng: 55.3320,
      entranceNames: ['Tower Entrance (Al Ittihad Road)', 'Rear Parking Entrance'],
      doorTypes: ['main_glass_door', 'parking_elevator'],
    },
    {
      name: 'Dnata Travel Centre Complex',
      arabicName: 'مبنى مركز دناتا للسفريات',
      floors: 7,
      makaniPrefix: '31940',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 2 (Airport Road Concourse)',
      distanceFromMetro: '140m from DCC Metro Exit 2',
      lat: 25.2515,
      lng: 55.3360,
      entranceNames: ['Main Dnata Customer Lobby Entrance', 'Corporate Travel Concourse Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Pullman Dubai Creek City Centre Annex',
      arabicName: 'ملحق فندق بولمان ديرة سيتي سنتر',
      floors: 9,
      makaniPrefix: '31870',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 1 (Pullman & City Centre Walkway)',
      distanceFromMetro: '50m from DCC Metro Exit 1',
      lat: 25.2525,
      lng: 55.3325,
      entranceNames: ['Pullman Commercial Lobby Entrance', 'Creek Concourse Gate'],
      doorTypes: ['revolving_door', 'main_glass_door'],
      curatedCompanies: [
        {
          name: 'Classic Fade Men Grooming - Pullman DCC',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '09:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.8,
          reviewCount: 54,
          pitchOpportunity: 'high',
        },
        {
          name: 'Soma Spa & Wellness Lounge',
          category: 'Ladies Salons & Spas',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 102',
          openingTime: '10:00 AM',
          closingTime: '10:00 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 38,
          pitchOpportunity: 'high',
        },
        {
          name: 'Creek View Executive Lounge Cafe',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-04',
          openingTime: '07:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 65,
          pitchOpportunity: 'medium',
        },
      ],
    },
    {
      name: 'City Centre Deira (DCC) Shopping Mall',
      arabicName: 'سيتي سنتر ديرة - مركز التسوق',
      floors: 4,
      makaniPrefix: '31800',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 1 (Direct Metro Link Bridge into Mall)',
      distanceFromMetro: '25m from DCC Metro Exit 1',
      lat: 25.2518,
      lng: 55.3310,
      entranceNames: ['Direct Metro Link Bridge Entrance (Exit 1)', 'East Main Atrium Gate', 'Port Saeed Valet Drop Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Urban Gentleman Barbershop Lounge',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-22',
          openingTime: '10:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.8,
          reviewCount: 44,
          pitchOpportunity: 'high',
        },
        {
          name: 'Tips and Toes Nail Spa - City Centre Deira',
          category: 'Ladies Salons & Spas',
          floor: 'Level 1',
          floorNumber: 1,
          unitNumber: 'Shop 142',
          openingTime: '10:00 AM',
          closingTime: '10:30 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 62,
          pitchOpportunity: 'high',
        },
        {
          name: 'Paul Bakery & Restaurant - City Centre Deira',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-10',
          openingTime: '08:00 AM',
          closingTime: '12:00 AM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 110,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Virgin Megastore - Deira City Centre',
          category: 'Retail & Boutiques',
          floor: 'Level 1',
          floorNumber: 1,
          unitNumber: 'Shop 108',
          openingTime: '10:00 AM',
          closingTime: '11:00 PM',
          daysOpen: 'Daily',
          rating: 4.5,
          reviewCount: 95,
          pitchOpportunity: 'medium',
        },
      ],
    },
  ],
  union: [
    {
      name: 'Al Ghurair Centre Office Tower',
      arabicName: 'مركز الغرير - برج المكاتب',
      floors: 8,
      makaniPrefix: '31284',
      metroStation: 'Union (Red & Green Line Interchange)',
      metroExit: 'Exit 1 (Al Rigga Road / Al Ghurair Side)',
      distanceFromMetro: '180m from Union Metro Exit 1',
      lat: 25.2678,
      lng: 55.3165,
      entranceNames: [
        'Entrance 1 (Al Rigga Road / Union Walkway)',
        'Entrance 2 (Centre Concourse Entrance)',
        'Entrance 3 (Covered Parking & Taxi Drop)',
      ],
      doorTypes: ['revolving_door', 'main_glass_door', 'side_entrance'],
      curatedCompanies: [
        {
          name: 'Al Ghurair Executive Gents Salon',
          category: "Men's Barbershops & Gents Salons",
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-01',
          openingTime: '09:00 AM',
          closingTime: '11:30 PM',
          daysOpen: 'Daily',
          rating: 4.8,
          reviewCount: 94,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Aster Clinic Al Ghurair',
          category: 'Clinics & Healthcare',
          floor: '1st Floor',
          floorNumber: 1,
          unitNumber: 'Suite 104',
          openingTime: '08:00 AM',
          closingTime: '09:30 PM',
          daysOpen: 'Daily',
          rating: 4.6,
          reviewCount: 42,
          pitchOpportunity: 'high',
        },
        {
          name: 'Smile Craft Dental Care',
          category: 'Dental Clinic',
          floor: '2nd Floor',
          floorNumber: 2,
          unitNumber: 'Suite 202',
          openingTime: '09:30 AM',
          closingTime: '08:30 PM',
          daysOpen: 'Mon - Sat',
          rating: 4.9,
          reviewCount: 28,
          pitchOpportunity: 'high',
        },
        {
          name: 'Bella Donna Ladies Salon & Spa',
          category: 'Ladies Salons & Spas',
          floor: 'Mezzanine Floor',
          floorNumber: 0.5,
          unitNumber: 'M-05',
          openingTime: '10:00 AM',
          closingTime: '10:00 PM',
          daysOpen: 'Daily',
          rating: 4.7,
          reviewCount: 36,
          pitchOpportunity: 'high',
        },
        {
          name: 'Starbucks Reserve Al Ghurair',
          category: 'Restaurants & Cafes',
          floor: 'Ground Floor',
          floorNumber: 0,
          unitNumber: 'Shop G-04',
          openingTime: '06:30 AM',
          closingTime: '12:00 AM',
          daysOpen: 'Daily',
          rating: 4.4,
          reviewCount: 88,
          pitchOpportunity: 'medium',
        },
        {
          name: 'Emirates Advocates & Legal Advisors',
          category: 'Corporate Services',
          floor: '3rd Floor',
          floorNumber: 3,
          unitNumber: 'Suite 305',
          openingTime: '08:30 AM',
          closingTime: '06:00 PM',
          daysOpen: 'Mon - Fri',
          rating: 4.5,
          reviewCount: 19,
          pitchOpportunity: 'high',
        },
      ],
    },
    {
      name: 'Union Square Commercial Center',
      arabicName: 'مركز ساحة الاتحاد التجاري',
      floors: 8,
      makaniPrefix: '31120',
      metroStation: 'Union Metro (Red & Green Line Interchange)',
      metroExit: 'Exit 1 (North Concourse)',
      distanceFromMetro: '50m from Union Metro Exit 1',
      lat: 25.2662,
      lng: 55.3135,
      entranceNames: ['Entrance 1 (Union Interchange North)', 'Entrance 2 (Al Maktoum St)'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Al Maktoum Commercial Plaza',
      arabicName: 'بلازا آل مكتوم التجارية',
      floors: 9,
      makaniPrefix: '31180',
      metroStation: 'Union Metro (Red & Green Line Interchange)',
      metroExit: 'Exit 2 (Al Maktoum Road)',
      distanceFromMetro: '120m from Union Metro Exit 2',
      lat: 25.2655,
      lng: 55.3150,
      entranceNames: ['Main Plaza Entrance', 'Side Walkway Entrance'],
      doorTypes: ['main_glass_door', 'side_entrance'],
    },
  ],
  salah_al_din: [
    {
      name: 'Reef Mall Commercial Complex',
      arabicName: 'مجمع ريف مول التجاري',
      floors: 6,
      makaniPrefix: '31560',
      metroStation: 'Salah Al Din (Green Line)',
      metroExit: 'Exit 1 (Opposite Reef Mall)',
      distanceFromMetro: '40m from Salah Al Din Metro',
      lat: 25.2692,
      lng: 55.3285,
      entranceNames: ['Salah Al Din Metro Entrance', 'East Parking Lobby Entrance'],
      doorTypes: ['main_glass_door', 'parking_elevator'],
    },
    {
      name: 'Salah Al Din Commercial Center',
      arabicName: 'مركز صلاح الدين التجاري',
      floors: 7,
      makaniPrefix: '31590',
      metroStation: 'Salah Al Din (Green Line)',
      metroExit: 'Exit 2 (Muraqqabat St)',
      distanceFromMetro: '65m from Salah Al Din Metro',
      lat: 25.2685,
      lng: 55.3295,
      entranceNames: ['Front Entrance (Salahuddin Road)', 'Rear Plaza Entrance'],
      doorTypes: ['main_glass_door', 'side_entrance'],
    },
  ],
  baniyas: [
    {
      name: 'Twin Towers Deira',
      arabicName: 'برجا ديرة التوأم',
      floors: 22,
      makaniPrefix: '30890',
      metroStation: 'Baniyas Square (Green Line)',
      metroExit: 'Exit 1 (Creek Waterfront)',
      distanceFromMetro: '90m from Baniyas Metro',
      lat: 25.2680,
      lng: 55.3090,
      entranceNames: ['Creek Waterfront Entrance', 'Baniyas Road Lobby Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Baniyas Commercial Center',
      arabicName: 'مركز بني ياس التجاري',
      floors: 8,
      makaniPrefix: '30920',
      metroStation: 'Baniyas Square (Green Line)',
      metroExit: 'Exit 2 (Nasser Square)',
      distanceFromMetro: '45m from Baniyas Metro',
      lat: 25.2688,
      lng: 55.3075,
      entranceNames: ['Main Entrance (Square Facing)', 'Side Alley Entrance'],
      doorTypes: ['main_glass_door'],
    },
  ],
  deira: [
    {
      name: 'Centurion Star Tower',
      arabicName: 'برج سنتوريون ستار',
      floors: 12,
      makaniPrefix: '31765',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 2 (Port Saeed)',
      distanceFromMetro: '70m from DCC Metro Exit 2',
      lat: 25.2535,
      lng: 55.3335,
      entranceNames: ['Block A Main Entrance (DCC Metro Side)', 'Block B Entrance (Port Saeed Road)'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'City Centre Offices - Deira',
      arabicName: 'مكاتب سيتي سنتر ديرة',
      floors: 10,
      makaniPrefix: '31820',
      metroStation: 'DCC Area / Deira City Centre (Red Line)',
      metroExit: 'Exit 1 (Direct Metro Walkway)',
      distanceFromMetro: '35m from DCC Metro Exit 1',
      lat: 25.2520,
      lng: 55.3315,
      entranceNames: ['Direct Metro Walkway Entrance', 'East Office Tower Concourse'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
  ],
  burjuman: [
    {
      name: 'BurJuman Business Tower',
      arabicName: 'برج برجمان للأعمال',
      floors: 26,
      makaniPrefix: '30210',
      metroStation: 'BurJuman (Red & Green Line Interchange)',
      metroExit: 'Exit 3 (Bank Street)',
      distanceFromMetro: '35m from BurJuman Exit 3',
      lat: 25.2528,
      lng: 55.3025,
      entranceNames: ['Tower Lobby Entrance (Khalid Bin Al Waleed St)', 'BurJuman Metro Interchange Walkway Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Al Fahidi Commercial Centre',
      arabicName: 'مركز الفهيدي التجاري',
      floors: 4,
      makaniPrefix: '29840',
      metroStation: 'Al Fahidi / Meena Bazaar (Green Line)',
      metroExit: 'Exit 1 (Meena Bazaar)',
      distanceFromMetro: '55m from Al Fahidi Metro',
      lat: 25.2570,
      lng: 55.2970,
      entranceNames: ['Main Entrance (Meena Bazaar Road)', 'Al Fahidi Metro Exit 1 Gate'],
      doorTypes: ['main_glass_door', 'side_entrance'],
    },
  ],
  business_bay: [
    {
      name: 'Aspect Tower - Executive Towers',
      arabicName: 'برج أسبكت - الأبراج التنفيذية',
      floors: 39,
      makaniPrefix: '27410',
      metroStation: 'Business Bay (Red Line)',
      metroExit: 'Exit 1 (Bay Avenue)',
      distanceFromMetro: '120m from Business Bay Metro',
      lat: 25.1884,
      lng: 55.2662,
      entranceNames: ['Zone B Tower Entrance', 'Bay Avenue Ground Walkway Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'The Prism Tower Business Bay',
      arabicName: 'برج ذا بريزم للأعمال',
      floors: 35,
      makaniPrefix: '27230',
      metroStation: 'Business Bay (Red Line)',
      metroExit: 'Exit 1 (Canal Concourse)',
      distanceFromMetro: '95m from Business Bay Metro',
      lat: 25.1865,
      lng: 55.2650,
      entranceNames: ['Main Concourse Entrance (Business Bay Metro)', 'Canal Level Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
  ],
  marina: [
    {
      name: 'Marina Plaza Commercial Tower',
      arabicName: 'برج مارينا بلازا',
      floors: 29,
      makaniPrefix: '19450',
      metroStation: 'Sobha Realty / Dubai Marina (Red Line)',
      metroExit: 'Exit 1 (Marina Mall)',
      distanceFromMetro: '85m from Sobha Realty Metro',
      lat: 25.0805,
      lng: 55.1403,
      entranceNames: ['Main Plaza Entrance (Sobha Realty Metro)', 'Marina Promenade Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Silver Tower - Cluster I JLT',
      arabicName: 'البرج الفضي - مجموعة I',
      floors: 31,
      makaniPrefix: '18920',
      metroStation: 'DMCC / JLT (Red Line)',
      metroExit: 'Exit 1 (Lake Level)',
      distanceFromMetro: '110m from DMCC Metro',
      lat: 25.0740,
      lng: 55.1460,
      entranceNames: ['Lake Level Concourse Entrance', 'Cluster Parking Drop-Off Entrance'],
      doorTypes: ['main_glass_door', 'parking_elevator'],
    },
  ],
};

// Generic co-tenant business templates for building directory
const NEIGHBOR_BUSINESS_TEMPLATES = [
  { name: 'Aster Pharmacy', category: 'Pharmacy & Health', floor: 'Ground Floor', unit: 'G-02', rating: 4.6, reviewCount: 48, open: '08:00 AM', close: '11:30 PM', days: 'Daily' },
  { name: 'Starbucks Coffee Reserve', category: 'Restaurants & Cafes', floor: 'Ground Floor', unit: 'G-05', rating: 4.4, reviewCount: 82, open: '06:30 AM', close: '11:30 PM', days: 'Daily' },
  { name: 'Al Ansari Exchange', category: 'Financial & Exchange', floor: 'Ground Floor', unit: 'G-08', rating: 4.5, reviewCount: 114, open: '08:00 AM', close: '10:30 PM', days: 'Daily' },
  { name: 'Prime Medical Center', category: 'Clinics & Healthcare', floor: 'Mezzanine Floor', unit: 'M-03', rating: 4.7, reviewCount: 39, open: '08:30 AM', close: '09:00 PM', days: 'Mon - Sat' },
  { name: 'Chic Nails & Beauty Lounge', category: 'Ladies Salons & Spas', floor: 'Mezzanine Floor', unit: 'M-07', rating: 4.8, reviewCount: 29, open: '10:00 AM', close: '10:00 PM', days: 'Daily' },
  { name: 'Gulf Horizon Travel & Tourism', category: 'Travel Agency', floor: '1st Floor', unit: 'Suite 102', rating: 4.2, reviewCount: 18, open: '09:00 AM', close: '07:30 PM', days: 'Mon - Sat' },
  { name: 'Emirates Business Setup & PRO', category: 'Corporate Services', floor: '1st Floor', unit: 'Suite 108', rating: 4.3, reviewCount: 22, open: '08:30 AM', close: '05:30 PM', days: 'Mon - Fri' },
  { name: 'Elite Smile Dental Clinic', category: 'Dental Clinic', floor: '2nd Floor', unit: 'Suite 201', rating: 4.9, reviewCount: 34, open: '09:00 AM', close: '08:30 PM', days: 'Mon - Sat' },
  { name: 'Al Maktoum Legal Consultancy', category: 'Legal & Advisory', floor: '2nd Floor', unit: 'Suite 205', rating: 4.4, reviewCount: 15, open: '09:00 AM', close: '06:00 PM', days: 'Mon - Fri' },
  { name: 'Optima Tax & Accounting LLC', category: 'Corporate Services', floor: '3rd Floor', unit: 'Suite 304', rating: 4.5, reviewCount: 12, open: '08:30 AM', close: '05:30 PM', days: 'Mon - Fri' },
  { name: 'Modern Vision Optical', category: 'Retail & Boutiques', floor: 'Ground Floor', unit: 'G-11', rating: 4.3, reviewCount: 27, open: '09:30 AM', close: '10:30 PM', days: 'Daily' },
  { name: 'Caribou Coffee', category: 'Restaurants & Cafes', floor: 'Ground Floor', unit: 'G-03', rating: 4.5, reviewCount: 65, open: '07:00 AM', close: '11:00 PM', days: 'Daily' },
  { name: 'Dr. Michael Specialized Dental', category: 'Dental Clinic', floor: '3rd Floor', unit: 'Suite 301', rating: 4.9, reviewCount: 26, open: '09:30 AM', close: '08:00 PM', days: 'Mon - Sat' },
  { name: 'Golden Scissor Executive Grooming', category: "Men's Barbershops & Gents Salons", floor: 'Ground Floor', unit: 'G-04', rating: 4.7, reviewCount: 41, open: '09:00 AM', close: '11:30 PM', days: 'Daily' },
];

/**
 * Builds complete GisBuildingInfo from a known template
 */
export function buildBuildingInfoFromTemplate(template: KnownBuildingTemplate, lead?: BusinessLead): GisBuildingInfo {
  const hash = getHash(template.name + template.makaniPrefix);
  const makaniSuffix = String(10000 + (hash % 89999));
  const makaniNumber = `${template.makaniPrefix} ${makaniSuffix}`;
  const gisId = `2gis-dxb-${(hash % 900000) + 100000}`;

  // Direct 2GIS.ae search and geo link
  const gisSearchQuery = `${template.name} ${template.metroStation} Dubai`;
  const gisUrl = `https://2gis.ae/dubai/search/${encodeURIComponent(`${template.name} Dubai`)}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${template.name} ${template.metroStation} Dubai`
  )}`;

  const baseLat = template.lat || 25.2635;
  const baseLng = template.lng || 55.3245;

  const entrances: GisBuildingEntrance[] = template.entranceNames.map((eName, idx) => {
    const angle = (idx * (360 / template.entranceNames.length) + (hash % 45)) * (Math.PI / 180);
    const radiusLat = 0.00018;
    const radiusLng = 0.00020;
    const lat = baseLat + Math.sin(angle) * radiusLat;
    const lng = baseLng + Math.cos(angle) * radiusLng;
    const doorType = template.doorTypes[idx % template.doorTypes.length];
    const isPrimary = idx === 0;

    let guidance = 'Main sliding glass doors. Security concierge desk directly inside.';
    if (eName.toLowerCase().includes('metro')) {
      guidance = 'Direct pedestrian entrance facing the metro exit plaza. Elevators immediately right.';
    } else if (eName.toLowerCase().includes('parking') || eName.toLowerCase().includes('rear')) {
      guidance = 'Car park & taxi drop entrance with elevator bank directly accessing commercial floors.';
    } else if (eName.toLowerCase().includes('side')) {
      guidance = 'Side avenue entrance. Use intercom or badge access after 8:00 PM.';
    }

    return {
      id: `${gisId}-entrance-${idx + 1}`,
      name: eName,
      doorType,
      side: idx === 0 ? 'street' : idx === 1 ? 'north' : 'courtyard',
      lat,
      lng,
      guidance,
      isPrimary,
    };
  });

  const indoorBusinesses: GisIndoorBusiness[] = [];

  // If curated companies exist on the template, use them
  if (template.curatedCompanies && template.curatedCompanies.length > 0) {
    template.curatedCompanies.forEach((c, idx) => {
      const openTime = c.openingTime || '09:00 AM';
      const closeTime = c.closingTime || '09:00 PM';
      const isOpen = checkIsOpenNow(openTime, closeTime);
      const isLead = lead && lead.name.toLowerCase() === (c.name || '').toLowerCase();

      indoorBusinesses.push({
        id: `gis-org-${hash}-${idx}`,
        name: c.name || `Organization ${idx + 1}`,
        category: c.category || 'Commercial Enterprise',
        floor: c.floor || '1st Floor',
        floorNumber: c.floorNumber !== undefined ? c.floorNumber : 1,
        unitNumber: c.unitNumber || `Suite ${100 + idx}`,
        phone: c.phone || `+971 4 ${220 + (hash % 60)} ${(1000 + idx * 111) % 9999}`,
        reviewCount: c.reviewCount || 35,
        rating: c.rating || 4.6,
        pitchOpportunity: c.pitchOpportunity || (c.reviewCount && c.reviewCount < 50 ? 'high' : 'medium'),
        isTargetLead: isLead,
        openingTime: openTime,
        closingTime: closeTime,
        hoursLabel: `${openTime} – ${closeTime} (${c.daysOpen || 'Daily'})`,
        isOpenNow: isOpen,
        daysOpen: c.daysOpen || 'Daily',
        directReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          (c.name || '') + ' ' + template.name + ' Dubai'
        )}`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          (c.name || '') + ' ' + template.name + ' Dubai'
        )}`,
      });
    });
  } else {
    // Generate from pool
    const indoorCount = 6 + (hash % 6);
    for (let i = 0; i < indoorCount; i++) {
      const t = NEIGHBOR_BUSINESS_TEMPLATES[(hash + i * 3) % NEIGHBOR_BUSINESS_TEMPLATES.length];
      const rev = 12 + ((hash * (i + 1)) % 78);
      const rating = 4.3 + Math.round(((hash + i) % 7) * 0.1 * 10) / 10;
      const isOpen = checkIsOpenNow(t.open, t.close);

      indoorBusinesses.push({
        id: `gis-org-${hash}-${i}`,
        name: t.name,
        category: t.category,
        floor: t.floor,
        floorNumber: t.floor.includes('Ground') ? 0 : t.floor.includes('Mezzanine') ? 0.5 : 1,
        unitNumber: t.unit,
        phone: `+971 4 ${220 + (hash % 60)} ${1000 + ((hash * (i + 2)) % 8999)}`,
        reviewCount: rev,
        rating: Math.min(5, rating),
        pitchOpportunity: rev < 50 ? 'high' : 'medium',
        isTargetLead: false,
        openingTime: t.open,
        closingTime: t.close,
        hoursLabel: `${t.open} – ${t.close} (${t.days})`,
        isOpenNow: isOpen,
        daysOpen: t.days,
        directReviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          t.name + ' ' + template.name + ' Dubai'
        )}`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          t.name + ' ' + template.name + ' Dubai'
        )}`,
      });
    }
  }

  // If a lead was provided and isn't already inside, add it
  if (lead && !indoorBusinesses.some((b) => b.name.toLowerCase() === lead.name.toLowerCase())) {
    indoorBusinesses.unshift({
      id: lead.id,
      name: lead.name,
      category: lead.category,
      floor: 'Ground Floor',
      floorNumber: 0,
      unitNumber: 'Shop G-01',
      phone: lead.phone,
      reviewCount: lead.reviewCount,
      rating: lead.rating,
      pitchOpportunity: lead.pitchOpportunity,
      isTargetLead: true,
      openingTime: '09:00 AM',
      closingTime: '10:30 PM',
      hoursLabel: '09:00 AM – 10:30 PM (Daily)',
      isOpenNow: checkIsOpenNow('09:00 AM', '10:30 PM'),
      daysOpen: 'Daily',
      directReviewUrl: lead.directReviewUrl,
      googleMapsUrl: lead.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + template.name + ' Dubai')}`,
    });
  }

  // Sort by floor
  indoorBusinesses.sort((a, b) => a.floorNumber - b.floorNumber);

  const sweetSpotCount = indoorBusinesses.filter((b) => b.reviewCount < 50).length;

  const salesAdvantageTip =
    sweetSpotCount > 0
      ? `🔥 2GIS Advantage: ${sweetSpotCount} businesses with <50 reviews inside ${template.name}! High NFC review conversion opportunity on one visit.`
      : `🏢 High-density 2GIS Building: ${indoorBusinesses.length} active organizations at ${template.name}.`;

  return {
    buildingName: template.name,
    arabicName: template.arabicName,
    makaniNumber,
    gisId,
    gisUrl,
    googleMapsUrl,
    gisSearchQuery,
    floorsCount: template.floors,
    totalOrganizations: indoorBusinesses.length,
    currentLeadFloor: indoorBusinesses[0]?.floor || 'Ground Floor',
    currentLeadUnit: indoorBusinesses[0]?.unitNumber || 'Shop G-01',
    primaryEntrance: entrances[0],
    entrances,
    indoorBusinesses,
    salesAdvantageTip,
    metroStation: template.metroStation,
    metroExit: template.metroExit,
    distanceFromMetro: template.distanceFromMetro,
    lat: baseLat,
    lng: baseLng,
  };
}

/**
 * Returns a list of target commercial buildings for a given metro station
 */
export function getBuildingsForMetroStation(stationName: string): GisBuildingInfo[] {
  const clean = (stationName || '').toLowerCase();
  let templates: KnownBuildingTemplate[] = [];

  // DCC / Deira City Centre - Red Line (Port Saeed)
  if (clean.includes('dcc') || clean.includes('city centre') || clean.includes('city center')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.dcc;
  }
  // Union Metro Interchange - Red & Green Line
  else if (clean.includes('union')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.union;
  }
  // Al Rigga Corridor - Red Line
  else if (clean.includes('rigga')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.rigga;
  }
  // Salah Al Din - Green Line (Reef Mall & Muraqqabat)
  else if (clean.includes('salah')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.salah_al_din;
  }
  // Baniyas Square - Green Line (Creek & Twin Towers)
  else if (clean.includes('baniyas')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.baniyas;
  }
  // BurJuman Interchange Hub
  else if (clean.includes('burjuman')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.burjuman;
  }
  // Al Fahidi / Meena Bazaar
  else if (clean.includes('fahidi') || clean.includes('meena bazaar')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.burjuman;
  }
  // Business Bay Corridor
  else if (clean.includes('business bay')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.business_bay;
  }
  // Dubai Marina / DMCC / JLT / Sobha
  else if (clean.includes('marina') || clean.includes('jlt') || clean.includes('dmcc') || clean.includes('sobha')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.marina;
  }
  // General Deira fallback defaults to DCC commercial hub
  else if (clean.includes('deira')) {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.dcc;
  } else {
    templates = KNOWN_BUILDINGS_BY_DISTRICT.rigga;
  }

  return templates.map((tpl) => buildBuildingInfoFromTemplate(tpl));
}

/**
 * Generate rich 2GIS Building Data, Entrances, and Indoor Directory
 * for any business lead in Dubai.
 */
export function generateGisBuildingData(lead: BusinessLead): GisBuildingInfo {
  const hash = getHash(lead.id + lead.name + (lead.address || ''));
  const dLower = (lead.district || '').toLowerCase();
  const aLower = (lead.address || '').toLowerCase();

  let districtCategory: keyof typeof KNOWN_BUILDINGS_BY_DISTRICT = 'rigga';
  if (dLower.includes('dcc') || dLower.includes('city centre') || aLower.includes('dcc') || aLower.includes('port saeed')) {
    districtCategory = 'dcc';
  } else if (dLower.includes('union') || aLower.includes('union')) {
    districtCategory = 'union';
  } else if (dLower.includes('salah') || aLower.includes('salah')) {
    districtCategory = 'salah_al_din';
  } else if (dLower.includes('baniyas') || aLower.includes('baniyas')) {
    districtCategory = 'baniyas';
  } else if (dLower.includes('business bay') || aLower.includes('business bay')) {
    districtCategory = 'business_bay';
  } else if (dLower.includes('marina') || dLower.includes('jlt') || aLower.includes('marina')) {
    districtCategory = 'marina';
  } else if (dLower.includes('burjuman') || aLower.includes('burjuman')) {
    districtCategory = 'burjuman';
  } else if (dLower.includes('rigga') || aLower.includes('rigga')) {
    districtCategory = 'rigga';
  }

  const templates = KNOWN_BUILDINGS_BY_DISTRICT[districtCategory] || KNOWN_BUILDINGS_BY_DISTRICT.rigga;
  const template = templates[hash % templates.length];

  return buildBuildingInfoFromTemplate(template, lead);
}

/**
 * Instant CSV export for all companies in a building
 * Includes timings, status, floors, contact, review metrics, and 2GIS links
 */
export function exportBuildingCompaniesToCsv(building: GisBuildingInfo): void {
  const headers = [
    'Building Name',
    'Makani Number',
    'Metro Station',
    'Metro Exit & Distance',
    'Company Name',
    'Category / Industry',
    'Floor',
    'Unit / Suite Number',
    'Opening Time',
    'Closing Time',
    'Days Open',
    'Operating Hours',
    'Current Status (GST)',
    'Phone',
    'Google Star Rating',
    'Review Count',
    'Pitch Opportunity',
    '2GIS Map URL',
    'Google Maps URL',
    'Direct 5-Star Review URL',
  ];

  const rows = building.indoorBusinesses.map((b) => [
    `"${(building.buildingName || '').replace(/"/g, '""')}"`,
    `"${(building.makaniNumber || '').replace(/"/g, '""')}"`,
    `"${(building.metroStation || 'Al Rigga').replace(/"/g, '""')}"`,
    `"${(building.distanceFromMetro || building.metroExit || '').replace(/"/g, '""')}"`,
    `"${(b.name || '').replace(/"/g, '""')}"`,
    `"${(b.category || '').replace(/"/g, '""')}"`,
    `"${(b.floor || '').replace(/"/g, '""')}"`,
    `"${(b.unitNumber || '').replace(/"/g, '""')}"`,
    `"${(b.openingTime || '09:00 AM').replace(/"/g, '""')}"`,
    `"${(b.closingTime || '09:00 PM').replace(/"/g, '""')}"`,
    `"${(b.daysOpen || 'Daily').replace(/"/g, '""')}"`,
    `"${(b.hoursLabel || '09:00 AM - 09:00 PM').replace(/"/g, '""')}"`,
    `"${b.isOpenNow ? 'Open Now' : 'Closed'}"`,
    `"${(b.phone || '').replace(/"/g, '""')}"`,
    `"${b.rating || 0}"`,
    `"${b.reviewCount || 0}"`,
    `"${(b.pitchOpportunity || 'medium').toUpperCase()}"`,
    `"${building.gisUrl || ''}"`,
    `"${b.googleMapsUrl || building.googleMapsUrl || ''}"`,
    `"${(b.directReviewUrl || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanBuildingName = building.buildingName.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `${cleanBuildingName}_Dubai_Companies_Directory.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
