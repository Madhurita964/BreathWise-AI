import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { severity } from './domain';
function Move({ lat, lon, routes }) {
  const map = useMap();
  useEffect(() => {
    if (routes?.length) {
      const points = routes.flatMap((r) => r.geometry);
      if (points.length) map.fitBounds(points, { padding: [30, 30], maxZoom: 14 });
    } else map.setView([lat, lon], 12);
  }, [lat, lon, routes, map]);
  return null;
}
function Pick({ onPick }) {
  useMapEvents({ click: (e) => onPick?.(e.latlng) });
  return null;
}
export default function MapView({ data, routes, large = false, onPick }) {
  const loc = data.location;
  const demo = data.mode === 'demo';
  return (
    <div className={'map-shell ' + (large ? 'map-large' : '')}>
      <MapContainer
        center={[loc.latitude, loc.longitude]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#122329' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Pick onPick={onPick} />
        <Move lat={loc.latitude} lon={loc.longitude} routes={routes} />
        <CircleMarker
          center={[loc.latitude, loc.longitude]}
          radius={35}
          pathOptions={{
            color: severity(data.current.aqi).color,
            fillOpacity: 0.12,
            weight: 1,
          }}
        />
        <CircleMarker
          center={[loc.latitude, loc.longitude]}
          radius={8}
          pathOptions={{
            color: '#fff',
            fillColor: severity(data.current.aqi).color,
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup>
            {loc.name}
            <br />
            US AQI {Math.round(data.current.aqi)}
            <br />
            {demo ? 'Illustrative demo point' : 'Regional model estimate · Not a station'}
          </Popup>
        </CircleMarker>
        {routes?.map((r, i) => (
          <Polyline
            key={r.name}
            positions={r.geometry}
            pathOptions={{
              color: i === 0 ? '#5edcaf' : '#729bc5',
              weight: 5,
              opacity: 0.85,
            }}
          >
            <Popup>
              {r.name} · {r.distance.toFixed(1)} km
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
      <div className="map-caption">
        <span className="dot" />
        {demo
          ? 'Illustrative location · no sensor layer'
          : 'Regional model · no station layer'}
      </div>
    </div>
  );
}
