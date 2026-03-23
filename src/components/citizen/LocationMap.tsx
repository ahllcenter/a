import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationMapProps {
  lat: number;
  lng: number;
  interactive?: boolean;
  radiusKm?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  onRadiusChange?: (km: number) => void;
  markers?: { lat: number; lng: number; name?: string; city?: string }[];
  className?: string;
}

const LocationMap = ({
  lat, lng, interactive = false,
  radiusKm, onLocationSelect, markers, className
}: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userMarkersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: interactive,
      dragging: interactive || !!markers,
      scrollWheelZoom: interactive || !!markers,
      doubleClickZoom: interactive,
      touchZoom: interactive || !!markers,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Only add center marker if not a user-markers-only map
    if (!markers || interactive) {
      const marker = L.marker([lat, lng]).addTo(map);
      markerRef.current = marker;
    }

    if (radiusKm) {
      const circle = L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);
      circleRef.current = circle;
      // Fit map to show the full circle
      map.fitBounds(circle.getBounds(), { padding: [20, 20] });
    }

    // Add user markers layer
    if (markers && markers.length > 0) {
      const layerGroup = L.layerGroup().addTo(map);
      const userIcon = L.divIcon({
        className: 'user-map-marker',
        html: '<div style="background:#3b82f6;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const bounds = L.latLngBounds([]);
      markers.forEach(m => {
        if (m.lat && m.lng) {
          const mk = L.marker([m.lat, m.lng], { icon: userIcon }).addTo(layerGroup);
          if (m.name) {
            mk.bindPopup(`<div dir="rtl" style="font-size:12px"><b>${m.name}</b><br/>${m.city || ''}</div>`);
          }
          bounds.extend([m.lat, m.lng]);
        }
      });
      userMarkersRef.current = layerGroup;
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
      }
    }

    if (interactive && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        }
        if (circleRef.current) {
          circleRef.current.setLatLng([newLat, newLng]);
        }
        onLocationSelect(newLat, newLng);
      });
    }

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when lat/lng changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng]);

  // Update circle radius and fit map to show full circle
  useEffect(() => {
    if (circleRef.current && radiusKm) {
      circleRef.current.setRadius(radiusKm * 1000);
      if (mapRef.current) {
        mapRef.current.fitBounds(circleRef.current.getBounds(), { padding: [20, 20] });
      }
    } else if (!circleRef.current && radiusKm && mapRef.current && markerRef.current) {
      const pos = markerRef.current.getLatLng();
      const circle = L.circle([pos.lat, pos.lng], {
        radius: radiusKm * 1000,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);
      circleRef.current = circle;
      mapRef.current.fitBounds(circle.getBounds(), { padding: [20, 20] });
    }
  }, [radiusKm]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '200px' }}
    />
  );
};

export default LocationMap;
