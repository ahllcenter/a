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
  className?: string;
}

const LocationMap = ({
  lat, lng, interactive = false,
  radiusKm, onLocationSelect, className
}: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    markerRef.current = marker;

    if (radiusKm) {
      const circle = L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);
      circleRef.current = circle;
    }

    if (interactive && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
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

  // Update circle radius
  useEffect(() => {
    if (circleRef.current && radiusKm) {
      circleRef.current.setRadius(radiusKm * 1000);
    } else if (!circleRef.current && radiusKm && mapRef.current && markerRef.current) {
      const pos = markerRef.current.getLatLng();
      circleRef.current = L.circle([pos.lat, pos.lng], {
        radius: radiusKm * 1000,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);
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
