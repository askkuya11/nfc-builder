import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BusinessLead } from '../types';
import { generateGisBuildingData } from '../utils/gisDubaiDirectory';
import {
  getCategoryVisualMeta,
  detectBusinessCategory,
  CategoryBadge,
} from '../utils/categoryIcons';
import {
  Footprints,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Layers,
  MapPin,
  ExternalLink,
  Star,
  Building2,
  DoorOpen,
  Sparkles,
  Scissors,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface RealInteractiveRadarMapProps {
  leads: BusinessLead[];
  district: string;
  centerInfo: {
    lat: number;
    lng: number;
    sectorName: string;
    landmark: string;
    metroLine: string;
  };
  activeLead: BusinessLead | null;
  onSelectLead: (lead: BusinessLead) => void;
  radarCategoryFilter: 'all' | 'barbershop' | 'dental' | 'high_need';
  setRadarCategoryFilter: (filter: 'all' | 'barbershop' | 'dental' | 'high_need') => void;
  showRouteTrail: boolean;
  setShowRouteTrail: (show: boolean) => void;
  routeMaxStops: number;
  setRouteMaxStops: (stops: number) => void;
  onOpenGisModal?: (lead: BusinessLead) => void;
  initialMapEngine?: 'google' | '2gis';
  onEngineChange?: (engine: 'google' | '2gis') => void;
}

export const RealInteractiveRadarMap: React.FC<RealInteractiveRadarMapProps> = ({
  leads,
  district,
  centerInfo,
  activeLead,
  onSelectLead,
  radarCategoryFilter,
  setRadarCategoryFilter,
  showRouteTrail,
  setShowRouteTrail,
  routeMaxStops,
  setRouteMaxStops,
  onOpenGisModal,
  initialMapEngine = 'google',
  onEngineChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeMidpointMarkerRef = useRef<L.Marker | null>(null);
  const radarCircleLayerRef = useRef<L.LayerGroup | null>(null);
  const gisBuildingsLayerRef = useRef<L.LayerGroup | null>(null);
  const gisEntranceLinesRef = useRef<L.Polyline[]>([]);

  // Map engine mode: Google Maps (standard POIs, road navigation) vs 2GIS (3D architectural buildings, entrances & indoor floors)
  const [mapEngine, setMapEngine] = useState<'google' | '2gis'>(initialMapEngine);
  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [showRadarRings, setShowRadarRings] = useState<boolean>(true);
  const [showGisEntrances, setShowGisEntrances] = useState<boolean>(true);
  const [routeMode, setRouteMode] = useState<'direct' | 'circuit'>('direct');
  const [currentZoom, setCurrentZoom] = useState<number>(16);

  const handleEngineSwitch = (engine: 'google' | '2gis') => {
    setMapEngine(engine);
    if (onEngineChange) onEngineChange(engine);
  };

  // Global window handler so Leaflet HTML popups can trigger React state
  useEffect(() => {
    (window as any).__openGisModal = (leadId: string) => {
      const target = leads.find((l) => l.id === leadId);
      if (target && onOpenGisModal) {
        onOpenGisModal(target);
      }
    };
    return () => {
      delete (window as any).__openGisModal;
    };
  }, [leads, onOpenGisModal]);

  // Filter leads based on selected category
  const displayedLeads = leads.filter((l) => {
    if (radarCategoryFilter === 'barbershop') {
      return detectBusinessCategory(l.category, l.name) === 'barbershop';
    }
    if (radarCategoryFilter === 'dental') {
      return detectBusinessCategory(l.category, l.name) === 'dental';
    }
    if (radarCategoryFilter === 'high_need') {
      return l.reviewCount < 50;
    }
    return true;
  });

  const barbershopCount = leads.filter(
    (l) => detectBusinessCategory(l.category, l.name) === 'barbershop'
  ).length;
  const dentalCount = leads.filter(
    (l) => detectBusinessCategory(l.category, l.name) === 'dental'
  ).length;
  const highNeedCount = leads.filter((l) => l.reviewCount < 50).length;

  // Tile configuration based on engine & sub-type
  const getTileConfig = (engine: 'google' | '2gis', type: 'streets' | 'satellite' | 'dark') => {
    if (engine === '2gis') {
      if (type === 'satellite') {
        return {
          url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        };
      }
      if (type === 'dark') {
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          subdomains: ['a', 'b', 'c', 'd'],
        };
      }
      // 2GIS high-detail architectural building footprints & pedestrian blocks (Carto Voyager)
      return {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        subdomains: ['a', 'b', 'c', 'd'],
      };
    }

    // Google Maps Standard Engine
    if (type === 'satellite') {
      return {
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      };
    }
    if (type === 'dark') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        subdomains: ['a', 'b', 'c', 'd'],
      };
    }
    // Google Roadmap standard
    return {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerInfo.lat, centerInfo.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      const tileConfig = getTileConfig(mapEngine, mapType);
      const baseTileLayer = L.tileLayer(tileConfig.url, {
        maxZoom: 20,
        subdomains: tileConfig.subdomains,
      }).addTo(map);

      tileLayerRef.current = baseTileLayer;

      // 3D Building Polygons Layer for 2GIS mode
      const buildingsGroup = L.layerGroup().addTo(map);
      gisBuildingsLayerRef.current = buildingsGroup;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      const radarGroup = L.layerGroup().addTo(map);
      radarCircleLayerRef.current = radarGroup;

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      // Trigger immediate size validation for mobile viewports
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      setTimeout(() => {
        map.invalidateSize();
      }, 350);
    }

    // Set up ResizeObserver to handle container size changes on mobile
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size whenever engine or type changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mapEngine, mapType]);

  // Update map center when district changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerInfo.lat, centerInfo.lng], 16, {
        animate: true,
      });
    }
  }, [centerInfo.lat, centerInfo.lng]);

  // Update Tile Layer when mapType or mapEngine changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const config = getTileConfig(mapEngine, mapType);
    const newLayer = L.tileLayer(config.url, {
      maxZoom: 20,
      subdomains: config.subdomains,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapEngine, mapType]);

  // Update Tactical Radar Rings on the Map
  useEffect(() => {
    if (!mapInstanceRef.current || !radarCircleLayerRef.current) return;

    radarCircleLayerRef.current.clearLayers();

    if (!showRadarRings) return;

    const hubCenter: [number, number] = [centerInfo.lat, centerInfo.lng];

    // Inner 250m ring
    L.circle(hubCenter, {
      radius: 250,
      color: mapEngine === '2gis' ? '#10b981' : '#3b82f6',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: mapEngine === '2gis' ? '#10b981' : '#3b82f6',
      fillOpacity: 0.04,
      interactive: false,
    }).addTo(radarCircleLayerRef.current);

    // Mid 500m ring
    L.circle(hubCenter, {
      radius: 500,
      color: mapEngine === '2gis' ? '#06b6d4' : '#0284c7',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: mapEngine === '2gis' ? '#06b6d4' : '#0284c7',
      fillOpacity: 0.02,
      interactive: false,
    }).addTo(radarCircleLayerRef.current);

    // Outer 1000m (1km) radar boundary ring
    L.circle(hubCenter, {
      radius: 1000,
      color: '#f59e0b',
      weight: 1.5,
      dashArray: '8, 8',
      fillColor: '#f59e0b',
      fillOpacity: 0.015,
      interactive: false,
    }).addTo(radarCircleLayerRef.current);
  }, [showRadarRings, centerInfo.lat, centerInfo.lng, mapEngine]);

  // Render 3D Building Polygons (in 2GIS Mode), Business Category Pins & Walking Route
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (gisBuildingsLayerRef.current) {
      gisBuildingsLayerRef.current.clearLayers();
    }

    if (routePolylineRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeMidpointMarkerRef.current) {
      mapInstanceRef.current.removeLayer(routeMidpointMarkerRef.current);
      routeMidpointMarkerRef.current = null;
    }

    // Clean up old entrance connector lines
    gisEntranceLinesRef.current.forEach((line) => line.remove());
    gisEntranceLinesRef.current = [];

    // Sort leads by rank to build the footsteps walk sequence
    const sortedLeads = [...displayedLeads]
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, routeMaxStops);

    const targetLead = (activeLead && displayedLeads.some((l) => l.id === activeLead.id))
      ? activeLead
      : sortedLeads[0];

    // 1. Add Metro Hub Marker (Point A - Center of Walk)
    const hubHtml = `
      <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
        <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-[#07070d] text-[10px] font-mono font-black shadow-lg uppercase tracking-wider mb-1 border border-emerald-300">
          <span>POINT A</span>
          <span>• METRO</span>
        </div>
        <div class="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#07070d] border-2 ${
          mapEngine === '2gis' ? 'border-emerald-400 shadow-emerald-500/50' : 'border-emerald-400 shadow-emerald-500/50'
        } shadow-2xl">
          <span class="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-40"></span>
          <span class="text-lg">🚇</span>
        </div>
        <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-[#07070d]/95 border border-emerald-400/80 text-emerald-300 text-[10px] font-mono font-bold shadow whitespace-nowrap">
          ${district.replace(/\(.*?\)/g, '').trim()} Metro (${targetLead?.metroExit || 'Exit 1'})
        </div>
      </div>
    `;

    const hubIcon = L.divIcon({
      html: hubHtml,
      className: 'metro-hub-marker',
      iconSize: [0, 0],
    });

    L.marker([centerInfo.lat, centerInfo.lng], { icon: hubIcon })
      .addTo(markersLayerRef.current)
      .bindPopup(
        `<div class="font-sans text-xs p-2 text-white">
          <div class="flex items-center gap-1 text-emerald-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">
            <span>🟢 POINT A: DEPARTURE METRO HUB</span>
          </div>
          <strong class="text-white font-bold block text-sm">📍 ${district.replace(/\(.*?\)/g, '').trim()} Metro Station</strong>
          <span class="text-white/60 block mt-0.5 text-xs font-mono">Exit: ${targetLead?.metroExit || 'Exit 1'} • Field walking departure point.</span>
        </div>`
      );

    // 2. Draw Footstep Walking Route Polyline (Direct Point A ➔ Point B OR Multi-stop Circuit)
    if (showRouteTrail) {
      if (routeMode === 'direct' && targetLead && typeof targetLead.lat === 'number' && typeof targetLead.lng === 'number') {
        // DIRECT POINT A (METRO) ➔ POINT B (TARGET BUSINESS)
        const directCoords: [number, number][] = [
          [centerInfo.lat, centerInfo.lng],
          [targetLead.lat, targetLead.lng],
        ];

        const polyline = L.polyline(directCoords, {
          color: mapEngine === '2gis' ? '#10b981' : '#f59e0b',
          weight: 4.5,
          dashArray: '10, 8',
          opacity: 0.95,
        }).addTo(mapInstanceRef.current);

        routePolylineRef.current = polyline;

        // Midpoint Footstep Distance Bubble
        const midLat = (centerInfo.lat + targetLead.lat) / 2;
        const midLng = (centerInfo.lng + targetLead.lng) / 2;
        const steps = targetLead.footsteps || Math.round((targetLead.distanceKm || 0.1) * 1300) || 160;
        const mins = targetLead.walkMinutes || Math.max(1, Math.ceil(steps / 100));
        const distMeters = Math.round(steps * 0.75);

        const midHtml = `
          <div class="px-2.5 py-1 rounded-full bg-[#07070d]/95 border-2 ${
            mapEngine === '2gis' ? 'border-emerald-400 text-emerald-300' : 'border-amber-400 text-amber-300'
          } text-[10px] font-mono font-bold shadow-2xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:scale-105 transition" style="transform: translate(-50%, -50%);">
            <span>👣</span>
            <span>${steps} Steps</span>
            <span class="text-white/40">•</span>
            <span>~${mins} min (${distMeters}m)</span>
          </div>
        `;

        const midMarker = L.marker([midLat, midLng], {
          icon: L.divIcon({ html: midHtml, className: 'route-midpoint-marker', iconSize: [0, 0] }),
          interactive: false,
        }).addTo(mapInstanceRef.current);

        routeMidpointMarkerRef.current = midMarker;
      } else if (routeMode === 'circuit') {
        // Build Route Points: Metro Hub -> #1 -> #2 -> #3...
        const routeCoords: [number, number][] = [
          [centerInfo.lat, centerInfo.lng],
          ...sortedLeads
            .filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number')
            .map((l) => [l.lat!, l.lng!] as [number, number]),
        ];

        if (routeCoords.length >= 2) {
          const polyline = L.polyline(routeCoords, {
            color: mapEngine === '2gis' ? '#10b981' : '#f59e0b',
            weight: 3.5,
            dashArray: '8, 8',
            opacity: 0.9,
          }).addTo(mapInstanceRef.current);

          routePolylineRef.current = polyline;
        }
      }
    }

    // 3. Render 3D Building Extrusions in 2GIS Mode
    if (mapEngine === '2gis' && gisBuildingsLayerRef.current) {
      displayedLeads.forEach((lead) => {
        if (typeof lead.lat !== 'number' || typeof lead.lng !== 'number') return;
        const isCurrentActive = activeLead?.id === lead.id;
        const bInfo = lead.buildingInfo || generateGisBuildingData(lead);

        // Compute simulated 3D building parcel geometry
        const dLat = 0.00016; // ~18 meters
        const dLng = 0.00022; // ~22 meters

        const base: [number, number][] = [
          [lead.lat - dLat, lead.lng - dLng],
          [lead.lat + dLat, lead.lng - dLng],
          [lead.lat + dLat, lead.lng + dLng],
          [lead.lat - dLat, lead.lng + dLng],
        ];

        // 3D Isometric height offset
        const hOffsetLat = 0.00010;
        const hOffsetLng = 0.00008;
        const roof: [number, number][] = [
          [lead.lat - dLat + hOffsetLat, lead.lng - dLng + hOffsetLng],
          [lead.lat + dLat + hOffsetLat, lead.lng - dLng + hOffsetLng],
          [lead.lat + dLat + hOffsetLat, lead.lng + dLng + hOffsetLng],
          [lead.lat - dLat + hOffsetLat, lead.lng + dLng + hOffsetLng],
        ];

        // 3D Facade wall polygons
        const wallEast: [number, number][] = [base[1], roof[1], roof[2], base[2]];
        const wallSouth: [number, number][] = [base[2], roof[2], roof[3], base[3]];

        // Ground shadow
        L.polygon(base, {
          color: isCurrentActive ? '#059669' : '#1e293b',
          weight: 1,
          fillColor: '#020617',
          fillOpacity: 0.7,
          interactive: false,
        }).addTo(gisBuildingsLayerRef.current!);

        // Side wall 1
        L.polygon(wallEast, {
          color: isCurrentActive ? '#10b981' : '#047857',
          weight: 1,
          fillColor: isCurrentActive ? '#065f46' : '#022c22',
          fillOpacity: 0.85,
          interactive: false,
        }).addTo(gisBuildingsLayerRef.current!);

        // Side wall 2
        L.polygon(wallSouth, {
          color: isCurrentActive ? '#10b981' : '#047857',
          weight: 1,
          fillColor: isCurrentActive ? '#047857' : '#064e3b',
          fillOpacity: 0.75,
          interactive: false,
        }).addTo(gisBuildingsLayerRef.current!);

        // 3D Roof polygon
        const roofPoly = L.polygon(roof, {
          color: isCurrentActive ? '#34d399' : '#10b981',
          weight: isCurrentActive ? 2.5 : 1.5,
          fillColor: isCurrentActive ? '#10b981' : '#065f46',
          fillOpacity: isCurrentActive ? 0.9 : 0.6,
          interactive: true,
        }).addTo(gisBuildingsLayerRef.current!);

        roofPoly.on('click', () => {
          onSelectLead(lead);
        });
      });
    }

    // 4. Render Each Business Establishment with DYNAMIC CATEGORY ICONS (Scissors, Tooth, Utensils, etc.)
    displayedLeads.forEach((lead) => {
      if (typeof lead.lat !== 'number' || typeof lead.lng !== 'number') return;

      const isSelected = activeLead?.id === lead.id;
      const isTop1 = lead.rank === 1;
      const isTargetPointB = targetLead?.id === lead.id;
      const visualMeta = getCategoryVisualMeta(lead.category, lead.name);

      // Ensure 2GIS Building Data is generated
      const buildingInfo = lead.buildingInfo || generateGisBuildingData(lead);

      // Styling for pin
      let pinBg = visualMeta.pinBgClass;
      let strokeColor = visualMeta.pinColor;
      let pointerBorder = visualMeta.borderClass.replace('border-', 'border-t-');

      if (isSelected || isTargetPointB || isTop1) {
        if (mapEngine === '2gis') {
          pinBg = 'bg-emerald-400 border-white text-[#07070d] shadow-emerald-500/60 ring-2 ring-emerald-300';
          strokeColor = '#07070d';
          pointerBorder = 'border-t-emerald-400';
        } else {
          pinBg = 'bg-amber-400 border-white text-[#07070d] shadow-amber-500/60 ring-2 ring-amber-300';
          strokeColor = '#07070d';
          pointerBorder = 'border-t-amber-400';
        }
      }

      // Dynamic Category SVG Icon Pin (Scissors for Barbershop, Tooth for Dental, Utensils for Food, etc.)
      const pinHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer transition-all duration-200 ${
          isSelected || isTargetPointB ? 'scale-125 z-50' : 'hover:scale-115 z-30'
        }" style="transform: translate(-50%, -100%);">
          
          ${
            isTargetPointB
              ? `<div class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400 text-[#07070d] text-[9px] font-mono font-black shadow-lg uppercase tracking-wider mb-1 border border-amber-200 whitespace-nowrap">
                  <span>POINT B</span>
                  <span>• TARGET</span>
                </div>`
              : ''
          }

          ${
            isSelected || isTargetPointB
              ? `<div class="absolute -inset-2 rounded-full border-2 ${
                  mapEngine === '2gis' ? 'border-emerald-400' : 'border-amber-400'
                } border-dashed animate-spin pointer-events-none"></div>`
              : ''
          }

          <!-- Pin Head with Exact Business Category Icon -->
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-lg backdrop-blur-md transition ${pinBg}">
            <!-- Category SVG Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${strokeColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
              ${visualMeta.pinSvg}
            </svg>

            <!-- Rank and Reviews -->
            <span class="font-mono font-black text-[11px] leading-none">#${lead.rank || '?'}</span>
            <span class="font-mono text-[9px] leading-none opacity-90">${lead.reviewCount} revs</span>
          </div>

          <!-- Bottom Pin Pointer Triangle -->
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${pointerBorder}"></div>

          <!-- Hover Business Name Label with Category Indicator -->
          <div class="mt-0.5 px-1.5 py-0.5 rounded bg-[#07070d]/95 border border-white/20 text-[9px] font-sans font-bold text-white shadow max-w-[140px] truncate text-center pointer-events-none flex items-center justify-center gap-1">
            <span>${visualMeta.emoji}</span>
            <span class="truncate">${lead.name}</span>
          </div>
        </div>
      `;

      const customDivIcon = L.divIcon({
        html: pinHtml,
        className: 'business-category-marker',
        iconSize: [0, 0],
      });

      const marker = L.marker([lead.lat, lead.lng], { icon: customDivIcon }).addTo(
        markersLayerRef.current!
      );

      marker.on('click', () => {
        onSelectLead(lead);
      });

      // Rich Telemetry Popup
      const popupHtml = `
        <div class="font-sans text-xs p-2.5 min-w-[250px] max-w-[290px] text-[#f4f4f8]">
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
            <div class="flex items-center gap-1 min-w-0">
              <span class="text-sm">${visualMeta.emoji}</span>
              <span class="font-bold text-sm text-white leading-tight truncate">#${lead.rank} ${lead.name}</span>
            </div>
            <span class="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
              ⭐ ${lead.rating} (${lead.reviewCount})
            </span>
          </div>

          <div class="space-y-1.5 text-[11px]">
            <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 font-medium text-[10px]">
              <span>Category: <strong class="text-white">${visualMeta.label}</strong></span>
            </div>

            <!-- Point A ➔ Point B Footsteps Route Box -->
            <div class="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] font-mono space-y-1 text-amber-200">
              <div class="flex items-center justify-between text-[9px] font-bold tracking-wider">
                <span class="px-1.5 py-0.5 rounded bg-emerald-500 text-[#07070d] uppercase">🟢 POINT A: METRO</span>
                <span class="text-white/40 font-bold">➔</span>
                <span class="px-1.5 py-0.5 rounded bg-amber-400 text-[#07070d] uppercase">🟠 POINT B: VENUE</span>
              </div>
              <div class="flex items-center justify-between text-amber-200 font-bold text-[11px] pt-0.5">
                <span>👣 <strong class="text-white">${lead.footsteps || 160}</strong> footsteps</span>
                <span class="text-emerald-300">~${lead.walkMinutes || 2} min walk (~${Math.round((lead.footsteps || 160) * 0.75)}m)</span>
              </div>
              <div class="text-[10px] text-white/70 leading-tight">
                📍 ${lead.walkingGuide || `From ${district.replace(/\(.*?\)/g, '').trim()} Metro (${lead.metroExit || 'Exit 1'}), walk directly to building entrance`}
              </div>
            </div>

            <!-- 2GIS.ae Building & Entrance Intelligence -->
            <div class="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] space-y-1 text-emerald-200">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white">🏢 ${buildingInfo.buildingName}</span>
              </div>
              <div class="text-[10px] text-white/70 font-mono flex items-center justify-between">
                <span>Makani: <strong class="text-white">${buildingInfo.makaniNumber}</strong></span>
                <span>${buildingInfo.currentLeadFloor}</span>
              </div>
              <div class="text-[10px] text-emerald-300 font-medium">
                🚪 <strong>Entrance:</strong> ${buildingInfo.primaryEntrance.name}
              </div>
              <div class="pt-1 border-t border-emerald-500/30">
                <button
                  type="button"
                  onclick="window.__openGisModal && window.__openGisModal('${lead.id}')"
                  class="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#07070d] font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm transition"
                >
                  <span>🏢 2GIS Inside Directory (${buildingInfo.indoorBusinesses.length} Tenants) ↗</span>
                </button>
              </div>
            </div>
          </div>

          <div class="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
            <a href="${buildingInfo.gisUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300">
              <span>🏢 Open 2GIS.ae ↗</span>
            </a>
            <a href="${lead.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' Dubai')}`}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300">
              <span>🗺️ Google Maps ↗</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // 5. Render 2GIS Building Entrances ONLY when this business is clicked/selected
      // User requirement: "show only building entrance once i click the business to make it more simple"
      if (showGisEntrances && isSelected) {
        buildingInfo.entrances.forEach((entrance) => {
          const entranceIconHtml = `
            <div class="flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
              <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/95 border-2 border-emerald-400 text-emerald-300 font-mono text-[9px] font-black shadow-xl hover:scale-115 transition">
                <span class="text-xs">🚪</span>
                <span class="truncate max-w-[120px] font-bold">${entrance.name.split('(')[0].trim()}</span>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-emerald-400"></div>
            </div>
          `;

          const entranceDivIcon = L.divIcon({
            html: entranceIconHtml,
            className: 'gis-entrance-marker',
            iconSize: [0, 0],
          });

          const entranceMarker = L.marker([entrance.lat, entrance.lng], {
            icon: entranceDivIcon,
          }).addTo(markersLayerRef.current!);

          // Dashed connector line from doorway directly to clicked business pin
          const entranceLine = L.polyline(
            [
              [entrance.lat, entrance.lng],
              [lead.lat, lead.lng],
            ],
            {
              color: '#10b981',
              weight: 2.5,
              dashArray: '5, 5',
              opacity: 0.85,
            }
          ).addTo(mapInstanceRef.current!);

          gisEntranceLinesRef.current.push(entranceLine);

          const entrancePopupHtml = `
            <div class="font-sans text-xs p-2 min-w-[210px] text-[#f4f4f8]">
              <div class="flex items-center justify-between gap-1 border-b border-white/10 pb-1 mb-1">
                <span class="font-bold text-xs text-emerald-400">🚪 ${entrance.name}</span>
                <span class="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">2GIS Verified Door</span>
              </div>
              <div class="space-y-1 text-[11px] text-white/80">
                <div class="text-[10px] bg-[#07070d] border border-white/10 p-1.5 rounded-lg font-mono text-white/90">
                  ${entrance.guidance}
                </div>
                <div class="text-[10px] text-emerald-300 pt-0.5">
                  🏢 <strong>${buildingInfo.buildingName}</strong> (Makani: ${buildingInfo.makaniNumber})
                </div>
                <div class="text-[10px] text-white/60">
                  📍 Accessing: <strong class="text-white">${lead.name}</strong> (${buildingInfo.currentLeadFloor} • ${buildingInfo.currentLeadUnit})
                </div>
              </div>
              <div class="mt-2 pt-1.5 border-t border-white/10 flex flex-col gap-1">
                <button
                  type="button"
                  onclick="window.__openGisModal && window.__openGisModal('${lead.id}')"
                  class="w-full py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#07070d] font-bold text-[10px] transition shadow-sm"
                >
                  🏢 Inside Building Directory (${buildingInfo.indoorBusinesses.length} Tenants)
                </button>
                <a href="${buildingInfo.gisUrl}" target="_blank" class="text-center text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition mt-0.5">
                  Open in 2GIS.ae ↗
                </a>
              </div>
            </div>
          `;

          entranceMarker.bindPopup(entrancePopupHtml);
        });
      }
    });
  }, [
    displayedLeads,
    centerInfo,
    activeLead,
    showRouteTrail,
    routeMaxStops,
    routeMode,
    district,
    showGisEntrances,
    currentZoom,
    mapEngine,
  ]);

  // Center or fit bounds on activeLead and Point A to Point B route
  useEffect(() => {
    if (activeLead && typeof activeLead.lat === 'number' && typeof activeLead.lng === 'number') {
      if (mapInstanceRef.current) {
        if (routeMode === 'direct') {
          const bounds = L.latLngBounds(
            [centerInfo.lat, centerInfo.lng],
            [activeLead.lat, activeLead.lng]
          );
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [75, 75],
            maxZoom: 18,
            animate: true,
          });
        } else {
          mapInstanceRef.current.setView([activeLead.lat, activeLead.lng], 18, {
            animate: true,
          });
        }
      }
    }
  }, [activeLead, routeMode, centerInfo.lat, centerInfo.lng]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleFocusRoute = () => {
    if (!mapInstanceRef.current) return;
    const sorted = [...displayedLeads].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    const target = (activeLead && displayedLeads.some((l) => l.id === activeLead.id))
      ? activeLead
      : sorted[0];

    if (routeMode === 'direct' && target && typeof target.lat === 'number' && typeof target.lng === 'number') {
      const bounds = L.latLngBounds(
        [centerInfo.lat, centerInfo.lng],
        [target.lat, target.lng]
      );
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [75, 75],
        maxZoom: 18,
        animate: true,
      });
    } else {
      handleFitWholeArea();
    }
  };

  const handleFitWholeArea = () => {
    if (!mapInstanceRef.current) return;

    const validCoords = displayedLeads
      .filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number')
      .map((l) => [l.lat!, l.lng!] as [number, number]);

    validCoords.push([centerInfo.lat, centerInfo.lng]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 17,
      });
    }
  };

  const handleFocusMetroHub = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([centerInfo.lat, centerInfo.lng], 17, {
      animate: true,
    });
  };

  const totalFootsteps = displayedLeads.slice(0, routeMaxStops).reduce((sum, l) => sum + (l.footsteps || 180), 0);
  const totalWalkMinutes = Math.max(1, Math.ceil(totalFootsteps / 100));

  const currentTargetLead = (activeLead && displayedLeads.some((l) => l.id === activeLead.id))
    ? activeLead
    : displayedLeads[0];

  const currentSteps = currentTargetLead?.footsteps || Math.round((currentTargetLead?.distanceKm || 0.1) * 1300) || 160;
  const currentWalkMins = currentTargetLead?.walkMinutes || Math.max(1, Math.ceil(currentSteps / 100));
  const currentDistMeters = Math.round(currentSteps * 0.75);

  return (
    <div className="bg-[#101019] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
      {/* Top HUD Control Bar with Prominent Switch Mode (Google Map vs 2GIS) */}
      <div className="flex flex-col gap-2.5 p-3.5 bg-[#07070d]/95 backdrop-blur-md border-b border-white/[0.08] z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Header title & GPS telemetry */}
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    mapEngine === '2gis' ? 'bg-emerald-400' : 'bg-cyan-400'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    mapEngine === '2gis' ? 'bg-emerald-500' : 'bg-cyan-400'
                  }`}
                />
              </span>
              <span
                className={`text-xs font-mono uppercase tracking-widest font-bold ${
                  mapEngine === '2gis' ? 'text-emerald-400' : 'text-cyan-300'
                }`}
              >
                {mapEngine === '2gis' ? '2GIS 3D ARCHITECTURAL RADAR • 100% FREE (NO API NEEDED)' : 'GOOGLE MAPS PROXIMITY RADAR • FREE'} • {centerInfo.sectorName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-white/50 font-mono">
              <span>GPS: {centerInfo.lat.toFixed(4)}° N, {centerInfo.lng.toFixed(4)}° E</span>
              <span>•</span>
              <span className="text-violet-300 font-medium">📍 {centerInfo.landmark}</span>
              <span className="hidden sm:inline text-emerald-400 font-bold">• 100% Free Public Map Engine</span>
            </div>
          </div>

          {/* Primary View Switch Mode: Google Maps vs 2GIS 3D Building Map */}
          <div className="flex items-center bg-[#101019] p-1 rounded-2xl border border-white/10 shadow-inner self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleEngineSwitch('google')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                mapEngine === 'google'
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Switch to Google Maps standard street navigation and POIs (Free)"
            >
              <span>🗺️ Google Maps</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-cyan-200 font-mono hidden sm:inline">
                Free
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleEngineSwitch('2gis')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                mapEngine === '2gis'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-white/50 hover:text-white'
              }`}
              title="100% Free - No API Key, No Account, No Payment. Instant 3D building architectural view, entrances and floor directories"
            >
              <span>🏢 2GIS 3D Buildings</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono flex items-center gap-1 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>100% Free</span>
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Controls Bar: Layer, Footsteps, Rings & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Map Layer Switcher */}
            <div className="flex items-center bg-[#101019] border border-white/10 rounded-xl p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setMapType('streets')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  mapType === 'streets'
                    ? mapEngine === '2gis' ? 'bg-emerald-500 text-[#07070d] font-bold' : 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Street vector view"
              >
                <Layers className="w-3 h-3" />
                <span>Streets</span>
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  mapType === 'satellite'
                    ? 'bg-violet-500 text-white font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Satellite Aerial View"
              >
                <span>🛰️ Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setMapType('dark')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  mapType === 'dark'
                    ? 'bg-cyan-500 text-[#07070d] font-bold'
                    : 'text-white/50 hover:text-white'
                }`}
                title="High-contrast Dark Mode"
              >
                <span>🌑 Dark</span>
              </button>
            </div>

            {/* Footsteps Route Controls & Mode Switcher */}
            <div className="flex items-center bg-[#101019] border border-white/10 rounded-xl p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setShowRouteTrail(!showRouteTrail)}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  showRouteTrail
                    ? 'bg-violet-500/20 text-violet-200 font-bold border border-violet-500/40 shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Toggle Footsteps Walk Path visibility"
              >
                <Footprints className="w-3.5 h-3.5 text-violet-400" />
                <span>Footsteps: {showRouteTrail ? 'ON' : 'OFF'}</span>
              </button>

              {showRouteTrail && (
                <>
                  <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => setRouteMode('direct')}
                    className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                      routeMode === 'direct'
                        ? 'bg-violet-500 text-white font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                    title="Direct Point A (Metro) to Point B (Selected Business)"
                  >
                    <span>🚶 Point A ➔ B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouteMode('circuit')}
                    className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                      routeMode === 'circuit'
                        ? 'bg-violet-500 text-white font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                    title="Multi-Stop Sales Circuit (Top stops)"
                  >
                    <span>🔁 Circuit</span>
                  </button>
                </>
              )}
            </div>

            {/* Sonar Rings Toggle */}
            <button
              type="button"
              onClick={() => setShowRadarRings(!showRadarRings)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition border flex items-center gap-1.5 ${
                showRadarRings
                  ? mapEngine === '2gis'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                    : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60'
                  : 'bg-[#101019] text-white/50 border-white/10'
              }`}
              title="Toggle sonar range rings (250m, 500m, 1km)"
            >
              <span className={`w-2 h-2 rounded-full ${mapEngine === '2gis' ? 'bg-emerald-400' : 'bg-cyan-400'} inline-block`} />
              <span>Sonar Rings: {showRadarRings ? 'ON' : 'OFF'}</span>
            </button>

            {/* 2GIS Entrance Doors Toggle */}
            <button
              type="button"
              onClick={() => setShowGisEntrances(!showGisEntrances)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition border flex items-center gap-1.5 ${
                showGisEntrances
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-sm shadow-emerald-500/20'
                  : 'bg-[#101019] text-white/50 border-white/10'
              }`}
              title="Show building entrance door only when a business is clicked"
            >
              <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entrance on Click: {showGisEntrances ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Category Quick Filter with Barbershop & Dental Pills */}
          <div className="flex items-center bg-[#101019] border border-white/10 rounded-xl p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setRadarCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-lg transition ${
                radarCategoryFilter === 'all'
                  ? 'bg-violet-500 text-white font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              All ({leads.length})
            </button>
            {barbershopCount > 0 && (
              <button
                type="button"
                onClick={() => setRadarCategoryFilter('barbershop')}
                className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                  radarCategoryFilter === 'barbershop'
                    ? 'bg-violet-500 text-white font-bold'
                    : 'text-violet-300 hover:text-white'
                }`}
                title="Filter Barbershops & Gents Salons (Scissors icon)"
              >
                <Scissors className="w-3 h-3" />
                <span>Barbers ({barbershopCount})</span>
              </button>
            )}
            {dentalCount > 0 && (
              <button
                type="button"
                onClick={() => setRadarCategoryFilter('dental')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  radarCategoryFilter === 'dental'
                    ? 'bg-cyan-500 text-[#07070d] font-bold'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                🦷 Dental ({dentalCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setRadarCategoryFilter('high_need')}
              className={`px-2 py-0.5 rounded-lg transition ${
                radarCategoryFilter === 'high_need'
                  ? 'bg-emerald-500 text-[#07070d] font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              &lt;50 Revs ({highNeedCount})
            </button>
          </div>
        </div>
      </div>

      {/* High-Usability Point A ➔ Point B Footstep Route Strip */}
      {showRouteTrail && currentTargetLead && (
        <div className="bg-[#07070d]/95 backdrop-blur-md border-b border-violet-500/30 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Point A: Metro */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] uppercase tracking-wider">
                POINT A
              </span>
              <span className="text-white text-xs truncate">
                🚇 {district.replace(/\(.*?\)/g, '').trim()} Metro ({currentTargetLead.metroExit || 'Exit 1'})
              </span>
            </div>

            {/* Steps & Walk Distance Connector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/40 text-violet-200 text-[11px] font-bold shadow-sm">
              <span>👣 {currentSteps} Steps</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400">~{currentWalkMins} min walk</span>
              <span className="text-white/30">•</span>
              <span className="text-white/70">~{currentDistMeters}m</span>
            </div>

            {/* Point B: Target Venue */}
            <div className="flex items-center gap-1.5 text-violet-200 font-bold min-w-0">
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] uppercase tracking-wider">
                POINT B
              </span>
              <span className="text-white text-xs truncate max-w-[180px] sm:max-w-[240px]">
                #{currentTargetLead.rank} {currentTargetLead.name}
              </span>
            </div>

            {/* Clicked Business Entrance Indicator */}
            {currentTargetLead.buildingInfo?.primaryEntrance && (
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px]">
                <span>🚪 Door:</span>
                <span className="text-white font-bold">{currentTargetLead.buildingInfo.primaryEntrance.name.split('(')[0].trim()}</span>
              </div>
            )}
          </div>

          {/* Quick Actions for Route */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFocusRoute}
              className="px-2.5 py-1 rounded-xl bg-[#101019] hover:bg-white/10 text-white/80 text-xs font-bold transition border border-white/10 flex items-center gap-1.5 shadow-sm"
              title="Focus map camera to fit both Point A (Metro) and Point B (Venue)"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Focus Route</span>
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${district.replace(/\(.*?\)/g, '').trim()} Metro Station Dubai`)}&destination=${encodeURIComponent(`${currentTargetLead.name} ${currentTargetLead.district} Dubai`)}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:brightness-110 text-white text-xs font-bold transition shadow-sm flex items-center gap-1"
              title="Open real walking directions in Google Maps"
            >
              <span>🚶 Google Walk ↗</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative w-full h-[380px] sm:h-[500px] md:h-[600px] bg-[#07070d] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Zoom & Navigation Controls */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex flex-col gap-1.5 shadow-2xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#101019]/90 hover:bg-[#101019] text-white border border-white/10 flex items-center justify-center transition shadow-lg backdrop-blur-sm"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#101019]/90 hover:bg-[#101019] text-white border border-white/10 flex items-center justify-center transition shadow-lg backdrop-blur-sm"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-white/10 my-0.5" />
          <button
            type="button"
            onClick={handleFitWholeArea}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:brightness-110 text-white font-bold flex items-center justify-center transition shadow-lg"
            title="Fit Whole Area (See All Establishments)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFocusMetroHub}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#101019]/90 hover:bg-[#101019] ${
              mapEngine === '2gis' ? 'text-emerald-400' : 'text-cyan-400'
            } border border-white/10 flex items-center justify-center transition shadow-lg backdrop-blur-sm`}
            title="Center on Metro Station Hub"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Route Summary Overlay */}
        {showRouteTrail && displayedLeads.length > 0 && (
          <div className="absolute bottom-2 left-2 z-20 bg-[#07070d]/95 backdrop-blur-md border border-violet-500/40 rounded-2xl p-2.5 text-xs font-mono shadow-2xl max-w-xs hidden sm:block">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-violet-300 font-bold text-[11px]">
                <Footprints className="w-3.5 h-3.5" />
                <span>{routeMode === 'direct' ? 'POINT A ➔ POINT B' : 'FIELD SALES CIRCUIT'}</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 text-[9px] font-bold border border-violet-500/30">
                {routeMode === 'direct' ? 'Direct Path' : `${routeMaxStops} Stops`}
              </span>
            </div>

            {routeMode === 'direct' && currentTargetLead ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-emerald-400 font-bold">🟢 Metro ({currentTargetLead.metroExit || 'Exit 1'})</span>
                  <span className="text-white/40">➔</span>
                  <span className="text-violet-300 font-bold truncate max-w-[120px]">🟣 #{currentTargetLead.rank} {currentTargetLead.name}</span>
                </div>
                <div className="flex items-center justify-between p-1 rounded-xl bg-[#101019] border border-white/10 text-[10px]">
                  <span className="text-violet-300 font-bold">👣 {currentSteps} steps</span>
                  <span className="text-emerald-400 font-semibold">~{currentWalkMins} min</span>
                  <span className="text-white/50 font-semibold">~{currentDistMeters}m</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-white/70 text-[10px]">
                  <span>Total Walk: <strong className="text-white">{totalFootsteps.toLocaleString()}</strong> steps</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">~{totalWalkMinutes} min</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top-Left Mode & Category Legend Overlay */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-[#07070d]/90 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 text-[9px] sm:text-[10px] font-mono text-white/70 flex items-center gap-2 shadow-xl max-w-[calc(100vw-5rem)] overflow-x-auto scrollbar-none">
          {mapEngine === '2gis' ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
              <Building2 className="w-3 h-3" />
              <span>2GIS 3D View</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-cyan-400 font-bold shrink-0">
              <Compass className="w-3 h-3" />
              <span>Google Maps</span>
            </span>
          )}
          <span className="text-white/20">|</span>
          <span className="text-violet-300 shrink-0">✂️ Barber</span>
          <span className="text-cyan-300 shrink-0">🦷 Dental</span>
          <span className="text-emerald-400 shrink-0">🚪 Doors</span>
        </div>

        {/* Floating Active Lead / Building Card on Map */}
        {activeLead && (() => {
          const activeBInfo = activeLead.buildingInfo || generateGisBuildingData(activeLead);
          const activeMeta = getCategoryVisualMeta(activeLead.category, activeLead.name);
          const ActiveIcon = activeMeta.iconComponent;

          return (
            <div
              className={`absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 z-20 bg-[#07070d]/95 backdrop-blur-md border ${
                mapEngine === '2gis' ? 'border-emerald-500/60 shadow-emerald-950/50' : 'border-white/10'
              } rounded-2xl p-2.5 sm:p-3 text-xs font-mono shadow-2xl max-w-full sm:max-w-sm animate-fadeIn`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`p-1.5 rounded-xl ${activeMeta.badgeBgClass} ${activeMeta.badgeTextClass} shrink-0`}>
                    <ActiveIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-[11px] sm:text-xs truncate leading-tight">
                      #{activeLead.rank} {activeLead.name}
                    </div>
                    <div className="text-[9px] text-white/50">{activeMeta.label}</div>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-lg shrink-0 border border-amber-400/20 font-bold">
                  ⭐ {activeLead.rating} ({activeLead.reviewCount})
                </span>
              </div>

              {/* 2GIS Building Intel Box */}
              <div className="bg-[#101019] border border-emerald-500/30 rounded-xl p-2 text-[10px] text-white/70 space-y-0.5 mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 truncate">🏢 {activeBInfo.buildingName}</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/40 shrink-0">
                    Makani: {activeBInfo.makaniNumber}
                  </span>
                </div>
                <div className="text-white/80 truncate text-[9px]">
                  🚪 <strong>{activeBInfo.primaryEntrance.name}</strong>
                </div>
              </div>

              {/* Point A (Metro) ➔ Point B (Business) Footstep Walk Box */}
              <div className="bg-[#101019] border border-violet-500/30 rounded-xl p-2 text-[10px] text-violet-200 space-y-0.5 mb-2">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-emerald-400">🟢 Metro ({activeLead.metroExit || 'Exit 1'})</span>
                  <span className="text-white/40">➔</span>
                  <span className="text-violet-300">🟣 Venue</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-white">
                  <span>👣 {activeLead.footsteps || 160} Steps</span>
                  <span className="text-emerald-400">~{activeLead.walkMinutes || 2} min walk</span>
                  <span className="text-white/50">~{Math.round((activeLead.footsteps || 160) * 0.75)}m</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenGisModal && onOpenGisModal(activeLead)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <DoorOpen className="w-3 h-3" />
                  <span>2GIS Inside Directory</span>
                </button>
                <a
                  href={activeBInfo.gisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 transition"
                  title="Open 3D building on 2GIS.ae"
                >
                  <Building2 className="w-3.5 h-3.5" />
                </a>
                <a
                  href={activeLead.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLead.name + ' Dubai')}` }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer Walking Guide & Telemetry */}
      <div className="p-3.5 bg-[#07070d] border-t border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-white/70">
          <Footprints className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            {mapEngine === '2gis' ? (
              <span>
                <strong className="text-white">2GIS 3D Building Mode (100% Free • No API Key Needed):</strong> Click any building footprint or doorway (🚪) to inspect indoor co-tenants, Makani ID, and floor layouts with zero fees or accounts.
              </span>
            ) : (
              <span>
                <strong className="text-white">Google Maps Mode (100% Free):</strong> Click any category pin (✂️ Barbershop, 🦷 Dental, etc.) to view reviews, footsteps, and live directions.
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-white/50 text-[11px]">
          <span>Zoom: <strong className="text-violet-400">{currentZoom}x</strong></span>
          <span>•</span>
          <span>Showing <strong className="text-white">{displayedLeads.length}</strong> Establishments</span>
        </div>
      </div>
    </div>
  );
};
