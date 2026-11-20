import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ShieldCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom Leaflet icon for people pins
const personIcon = new L.DivIcon({
  className: 'custom-person-pin',
  html: `<div style="background-color: #4f46e5; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const centerIcon = new L.DivIcon({
  className: 'custom-center-pin',
  html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">🎯</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const MapView = ({
  center = [28.6139, 77.209], // [lat, lng]
  radiusKm = 25,
  users = [],
}) => {
  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-subtle relative">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Center Point Marker */}
        <Marker position={center} icon={centerIcon}>
          <Popup>
            <div className="text-xs p-1">
              <p className="font-bold text-slate-900">Current Search Center</p>
              <p className="text-slate-500">Radius: {radiusKm} km</p>
            </div>
          </Popup>
        </Marker>

        {/* Radius Search Circle */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#4f46e5',
            fillColor: '#818cf8',
            fillOpacity: 0.12,
            weight: 1.5,
          }}
        />

        {/* Nearby Users Markers */}
        {users.map((u) => {
          if (!u.location?.coordinates || u.location.coordinates.length !== 2) return null;
          const pos = [u.location.coordinates[1], u.location.coordinates[0]]; // [lat, lng]

          return (
            <Marker key={u._id} position={pos} icon={personIcon}>
              <Popup>
                <div className="text-xs p-1 max-w-[180px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={
                        u.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={u.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.currentCity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2 text-[10px]">
                    <span className="font-bold text-emerald-600">{u.trustScore || 80}% Trust</span>
                    <span>•</span>
                    <span className="font-bold text-amber-600">{u.rewardPoints || 0} pts</span>
                  </div>

                  {u.canHelpCategories?.length > 0 && (
                    <p className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium truncate mb-2">
                      {u.canHelpCategories[0]}
                    </p>
                  )}

                  <Link
                    to={`/profile/${u._id}`}
                    className="block text-center py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
