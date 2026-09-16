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

// Famous known Dubai commercial buildings
interface KnownBuildingTemplate {
  name: string;
  arabicName: string;
  floors: number;
  makaniPrefix: string;
  entranceNames: string[];
  doorTypes: GisBuildingEntrance['doorType'][];
}

const KNOWN_BUILDINGS_BY_DISTRICT: Record<string, KnownBuildingTemplate[]> = {
  rigga: [
    {
      name: 'Al Ghurair Centre Office Tower',
      arabicName: 'مركز الغرير - برج المكاتب',
      floors: 8,
      makaniPrefix: '31284',
      entranceNames: ['Entrance 1 (Al Rigga Road Facing)', 'Entrance 2 (Metro Exit 1 Plaza)', 'Entrance 3 (Covered Parking & Taxi Drop)'],
      doorTypes: ['revolving_door', 'main_glass_door', 'side_entrance'],
    },
    {
      name: 'Rigga Central Business Tower',
      arabicName: 'برج الرقة سنترال للأعمال',
      floors: 6,
      makaniPrefix: '31340',
      entranceNames: ['Entrance A (Street Front)', 'Entrance B (Rear Alley & Metro Link)'],
      doorTypes: ['main_glass_door', 'side_entrance'],
    },
    {
      name: 'City Avenue Commercial Building',
      arabicName: 'مبنى سيتي أفينيو التجاري',
      floors: 5,
      makaniPrefix: '31405',
      entranceNames: ['Main Lobby Entrance (Al Rigga St)', 'Side Entrance (Al Muraqqabat Cut-through)'],
      doorTypes: ['revolving_door', 'side_entrance'],
    },
    {
      name: 'Al Muraqqabat Commercial Center',
      arabicName: 'مركز المرقبات التجاري',
      floors: 7,
      makaniPrefix: '31520',
      entranceNames: ['Entrance 1 (Opposite Metro Exit 2)', 'Entrance 2 (East Courtyard)'],
      doorTypes: ['main_glass_door', 'side_entrance'],
    },
    {
      name: 'Al Rigga Star Building',
      arabicName: 'بناية نجمة الرقة',
      floors: 5,
      makaniPrefix: '31310',
      entranceNames: ['Street Level Entrance 1', 'Entrance 2 (Service & Loading)'],
      doorTypes: ['main_glass_door', 'service_door'],
    },
    {
      name: 'Clock Tower Commercial Plaza',
      arabicName: 'بلازا برج الساعة التجاري',
      floors: 6,
      makaniPrefix: '31920',
      entranceNames: ['North Entrance (Clock Tower View)', 'South Entrance (Metro Connector)'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
  ],
  deira: [
    {
      name: 'Centurion Star Tower',
      arabicName: 'برج سنتوريون ستار',
      floors: 12,
      makaniPrefix: '31765',
      entranceNames: ['Block A Main Entrance (DCC Metro Side)', 'Block B Entrance (Port Saeed Road)'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Twin Towers Deira',
      arabicName: 'برجا ديرة التوأم',
      floors: 22,
      makaniPrefix: '30890',
      entranceNames: ['Creek Waterfront Entrance', 'Baniyas Road Lobby Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Reef Mall Commercial Complex',
      arabicName: 'مجمع ريف مول التجاري',
      floors: 6,
      makaniPrefix: '31560',
      entranceNames: ['Salah Al Din Metro Entrance', 'East Parking Lobby Entrance'],
      doorTypes: ['main_glass_door', 'parking_elevator'],
    },
    {
      name: 'Union Square Commercial Center',
      arabicName: 'مركز ساحة الاتحاد التجاري',
      floors: 8,
      makaniPrefix: '31120',
      entranceNames: ['Entrance 1 (Union Interchange North)', 'Entrance 2 (Al Maktoum St)'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
  ],
  burjuman: [
    {
      name: 'BurJuman Business Tower',
      arabicName: 'برج برجمان للأعمال',
      floors: 26,
      makaniPrefix: '30210',
      entranceNames: ['Tower Lobby Entrance (Khalid Bin Al Waleed St)', 'BurJuman Metro Interchange Walkway Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Al Fahidi Commercial Centre',
      arabicName: 'مركز الفهيدي التجاري',
      floors: 4,
      makaniPrefix: '29840',
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
      entranceNames: ['Zone B Tower Entrance', 'Bay Avenue Ground Walkway Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'The Prism Tower Business Bay',
      arabicName: 'برج ذا بريزم للأعمال',
      floors: 35,
      makaniPrefix: '27230',
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
      entranceNames: ['Main Plaza Entrance (Sobha Realty Metro)', 'Marina Promenade Entrance'],
      doorTypes: ['revolving_door', 'main_glass_door'],
    },
    {
      name: 'Silver Tower - Cluster I JLT',
      arabicName: 'البرج الفضي - مجموعة I',
      floors: 31,
      makaniPrefix: '18920',
      entranceNames: ['Lake Level Concourse Entrance', 'Cluster Parking Drop-Off Entrance'],
      doorTypes: ['main_glass_door', 'parking_elevator'],
    },
  ],
};

// Co-tenant business templates for building directory
const NEIGHBOR_BUSINESS_TEMPLATES = [
  { name: 'Aster Pharmacy', category: 'Pharmacy & Health', floor: 'Ground Floor', unit: 'G-02', rating: 4.6, reviewCount: 48 },
  { name: 'Starbucks Coffee Reserve', category: 'Restaurants & Cafes', floor: 'Ground Floor', unit: 'G-05', rating: 4.4, reviewCount: 82 },
  { name: 'Al Ansari Exchange', category: 'Financial & Exchange', floor: 'Ground Floor', unit: 'G-08', rating: 4.5, reviewCount: 114 },
  { name: 'Prime Medical Center', category: 'Clinics & Healthcare', floor: 'Mezzanine Floor', unit: 'M-03', rating: 4.7, reviewCount: 39 },
  { name: 'Chic Nails & Beauty Lounge', category: 'Ladies Salons & Spas', floor: 'Mezzanine Floor', unit: 'M-07', rating: 4.8, reviewCount: 29 },
  { name: 'Gulf Horizon Travel & Tourism', category: 'Travel Agency', floor: '1st Floor', unit: 'Suite 102', rating: 4.2, reviewCount: 18 },
  { name: 'Emirates Business Setup & PRO', category: 'Corporate Services', floor: '1st Floor', unit: 'Suite 108', rating: 4.3, reviewCount: 22 },
  { name: 'Elite Smile Dental Clinic', category: 'Dental Clinic', floor: '2nd Floor', unit: 'Suite 201', rating: 4.9, reviewCount: 34 },
  { name: 'Al Maktoum Legal Consultancy', category: 'Legal & Advisory', floor: '2nd Floor', unit: 'Suite 205', rating: 4.4, reviewCount: 15 },
  { name: 'Optima Tax & Accounting LLC', category: 'Corporate Services', floor: '3rd Floor', unit: 'Suite 304', rating: 4.5, reviewCount: 12 },
  { name: 'Modern Vision Optical', category: 'Retail & Boutiques', floor: 'Ground Floor', unit: 'G-11', rating: 4.3, reviewCount: 27 },
  { name: 'Caribou Coffee', category: 'Restaurants & Cafes', floor: 'Ground Floor', unit: 'G-03', rating: 4.5, reviewCount: 65 },
];

/**
 * Generate rich 2GIS Building Data, Entrances, and Indoor Directory
 * for any business lead in Dubai.
 */
export function generateGisBuildingData(lead: BusinessLead): GisBuildingInfo {
  const hash = getHash(lead.id + lead.name + (lead.address || ''));
  const dLower = (lead.district || '').toLowerCase();
  const aLower = (lead.address || '').toLowerCase();

  // 1. Pick or extract building name
  let districtCategory = 'rigga';
  if (dLower.includes('business bay') || aLower.includes('business bay')) {
    districtCategory = 'business_bay';
  } else if (dLower.includes('marina') || dLower.includes('jlt') || aLower.includes('marina')) {
    districtCategory = 'marina';
  } else if (dLower.includes('burjuman') || dLower.includes('fahidi') || aLower.includes('burjuman')) {
    districtCategory = 'burjuman';
  } else if (dLower.includes('deira') || dLower.includes('union') || dLower.includes('dcc') || dLower.includes('salah')) {
    districtCategory = 'deira';
  }

  const templates = KNOWN_BUILDINGS_BY_DISTRICT[districtCategory] || KNOWN_BUILDINGS_BY_DISTRICT.rigga;
  const template = templates[hash % templates.length];

  // Try extracting building name from lead address if present
  let buildingName = template.name;
  const commaTokens = lead.address.split(',').map((t) => t.trim());
  if (commaTokens.length >= 2 && !commaTokens[0].toLowerCase().includes('exit') && !commaTokens[0].toLowerCase().includes('road') && !commaTokens[0].toLowerCase().includes('street') && commaTokens[0].length >= 5) {
    buildingName = commaTokens[0];
  } else if (lead.name.toLowerCase().includes('al ghurair')) {
    buildingName = 'Al Ghurair Centre Office Tower';
  } else if (lead.name.toLowerCase().includes('burj al salam')) {
    buildingName = 'Burj Al Salam Tower';
  } else if (lead.name.toLowerCase().includes('centurion')) {
    buildingName = 'Centurion Star Tower';
  }

  // Makani 10-digit number (e.g. 31284 95412)
  const makaniSuffix = String(10000 + (hash % 89999));
  const makaniNumber = `${template.makaniPrefix} ${makaniSuffix}`;
  const gisId = `2gis-dxb-${hash % 900000 + 100000}`;

  // Direct 2GIS.ae search and geo link
  const gisSearchQuery = `${lead.name} ${buildingName} Dubai`;
  const gisUrl = `https://2gis.ae/dubai/search/${encodeURIComponent(`${buildingName} ${lead.district || 'Deira'}`)}`;

  // Determine current lead floor & unit
  const isGround = lead.category.includes('Restaurant') || lead.category.includes('Cafe') || lead.category.includes('Retail');
  const isMezzanine = lead.category.includes('Ladies') || lead.category.includes('Spa');
  const leadFloorNumber = isGround ? 0 : isMezzanine ? 0.5 : (hash % (template.floors - 1)) + 1;
  
  let currentLeadFloor = '1st Floor';
  let currentLeadUnit = `Suite ${100 + (hash % 18 + 1)}`;

  if (leadFloorNumber === 0) {
    currentLeadFloor = 'Ground Floor';
    currentLeadUnit = `Shop G-${String(hash % 15 + 1).padStart(2, '0')}`;
  } else if (leadFloorNumber === 0.5) {
    currentLeadFloor = 'Mezzanine Floor';
    currentLeadUnit = `Office M-${String(hash % 12 + 1).padStart(2, '0')}`;
  } else {
    currentLeadFloor = `${leadFloorNumber}${leadFloorNumber === 1 ? 'st' : leadFloorNumber === 2 ? 'nd' : leadFloorNumber === 3 ? 'rd' : 'th'} Floor`;
    currentLeadUnit = `Suite ${leadFloorNumber}0${hash % 8 + 1}`;
  }

  // Generate 2GIS Entrances with slight coordinate offsets on building perimeter
  const baseLat = lead.lat || 25.2635;
  const baseLng = lead.lng || 55.3245;

  const entrances: GisBuildingEntrance[] = template.entranceNames.map((eName, idx) => {
    // Offset entrances around building perimeter (~15 to 30 meters away in different directions)
    const angle = (idx * (360 / template.entranceNames.length) + (hash % 45)) * (Math.PI / 180);
    const radiusLat = 0.00018; // ~20m
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

  // Generate Indoor Businesses / Co-tenants inside this building
  const indoorCount = 4 + (hash % 5); // 4 to 8 co-tenants
  const neighborPool = [...NEIGHBOR_BUSINESS_TEMPLATES];
  const selectedNeighbors: GisIndoorBusiness[] = [];

  // 1. Add current target lead as the highlighted business inside
  selectedNeighbors.push({
    id: lead.id,
    name: lead.name,
    category: lead.category,
    floor: currentLeadFloor,
    floorNumber: typeof leadFloorNumber === 'number' ? leadFloorNumber : 1,
    unitNumber: currentLeadUnit,
    phone: lead.phone,
    reviewCount: lead.reviewCount,
    rating: lead.rating,
    pitchOpportunity: lead.pitchOpportunity,
    isTargetLead: true,
  });

  // 2. Add other co-tenants inside the building
  for (let i = 0; i < indoorCount; i++) {
    const neighborIdx = (hash + i * 3) % neighborPool.length;
    const templateBiz = neighborPool[neighborIdx];

    // Don't duplicate target lead's name or exact category
    if (templateBiz.name.toLowerCase() === lead.name.toLowerCase()) continue;

    const neighborRev = 10 + ((hash * (i + 1)) % 75);
    const neighborRating = 4.3 + Math.round(((hash + i) % 7) * 0.1 * 10) / 10;

    selectedNeighbors.push({
      id: `gis-neighbor-${lead.id}-${i}`,
      name: templateBiz.name,
      category: templateBiz.category,
      floor: templateBiz.floor,
      floorNumber: templateBiz.floor.includes('Ground') ? 0 : templateBiz.floor.includes('Mezzanine') ? 0.5 : 1,
      unitNumber: templateBiz.unit,
      phone: `+971 4 ${200 + (hash % 700)} ${1000 + ((hash * (i + 3)) % 8999)}`,
      reviewCount: neighborRev,
      rating: Math.min(5, neighborRating),
      pitchOpportunity: neighborRev < 40 ? 'high' : 'medium',
      isTargetLead: false,
    });
  }

  // Sort businesses inside building by floor ascending: Ground (0) -> Mezzanine (0.5) -> 1st (1) -> 2nd (2)...
  selectedNeighbors.sort((a, b) => a.floorNumber - b.floorNumber);

  const highOpportunityNeighbors = selectedNeighbors.filter(
    (b) => !b.isTargetLead && b.reviewCount < 50
  ).length;

  const salesAdvantageTip = highOpportunityNeighbors > 0
    ? `🔥 2GIS Advantage: ${highOpportunityNeighbors} other business${highOpportunityNeighbors > 1 ? 'es' : ''} with <50 reviews inside this same building! Pitch them on the same walk.`
    : `🏢 Comprehensive 2GIS Directory: ${selectedNeighbors.length} active organizations in ${buildingName}.`;

  return {
    buildingName,
    arabicName: template.arabicName,
    makaniNumber,
    gisId,
    gisUrl,
    gisSearchQuery,
    floorsCount: template.floors,
    totalOrganizations: selectedNeighbors.length,
    currentLeadFloor,
    currentLeadUnit,
    primaryEntrance: entrances[0],
    entrances,
    indoorBusinesses: selectedNeighbors,
    salesAdvantageTip,
  };
}
