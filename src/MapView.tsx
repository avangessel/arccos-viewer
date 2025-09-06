import { useEffect, useRef } from 'react';
import L, { Map as LeafletMap } from 'leaflet';
import type { HoleDetail } from './types';
import { holePolylineCoordinates, colorForHole } from './dataLoader';

interface MapViewProps {
  holes: HoleDetail[];
  focusHole: number | null;
  onFocusHole: (holeId: number | null) => void;
  showAllHoles: boolean;
  showShotMarkers: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ holes, focusHole, onFocusHole, showAllHoles, showShotMarkers }) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('round-map', { attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true
      }).addTo(mapRef.current);
    }
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    const holesToDraw = showAllHoles ? holes : holes.filter(h => h.holeId === focusHole);
    const bounds: L.LatLngExpression[] = [];

    holesToDraw.forEach((hole, idx) => {
      const polyCoords = holePolylineCoordinates(hole);
      if (polyCoords.length < 2) return;
      polyCoords.forEach(c => bounds.push(c as L.LatLngExpression));
      const color = colorForHole(hole.holeId - 1, holes.length);
      const weight = focusHole && hole.holeId === focusHole ? 5 : 3;
      const opacity = focusHole && hole.holeId !== focusHole ? 0.35 : 0.9;
      const poly = L.polyline(polyCoords, { color, weight, opacity, lineJoin: 'round', lineCap: 'round' });
      poly.on('click', () => onFocusHole(hole.holeId));
      poly.bindTooltip(`Hole ${hole.holeId} • ${hole.noOfShots} shots`);
      poly.addTo(layerGroup);
      if (showShotMarkers) {
        hole.shots.forEach((shot, i) => {
          const isFocus = hole.holeId === focusHole;
          const marker = L.marker([shot.endLat, shot.endLong], {
            icon: L.divIcon({
              className: 'shot-marker' + (isFocus ? ' hole-focus' : ''),
              html: String(i + 1)
            })
          });
          marker.bindPopup(`<div class=shot-popup><strong>Hole ${hole.holeId}</strong><br/>Shot ${i + 1}<br/>Dist: ${shot.distance?.toFixed(1) ?? '—'} m</div>`);
          marker.addTo(layerGroup);
        });
      }
    });

    if (bounds.length) {
      map.fitBounds(bounds as L.LatLngExpression[], { padding: [20, 20] });
    }
  }, [holes, focusHole, showAllHoles, showShotMarkers, onFocusHole]);

  return <div id="round-map" className="map-container" />;
};
