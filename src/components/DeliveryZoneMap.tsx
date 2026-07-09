import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { Language } from '../types';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeliveryZoneMapProps {
  language: Language;
}

const maudahaCenter: [number, number] = [25.6920, 80.1380];

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function DeliveryZoneMap({ language }: DeliveryZoneMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Try to get user location, otherwise default to Maudaha center
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setUserLocation(maudahaCenter);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation(maudahaCenter);
    }
  }, []);

  const displayLocation = userLocation || maudahaCenter;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-black text-slate-800">
          {language === 'en' ? 'Active Delivery Zones' : 'सक्रिय वितरण क्षेत्र'}
        </h2>
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        {language === 'en' 
          ? 'Check your delivery radius and estimated speeds in Maudaha.' 
          : 'मौदहा में अपना डिलीवरी रेडियस और अनुमानित गति जांचें।'}
      </p>

      <div className="h-[300px] rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-0">
        <MapContainer 
          center={displayLocation} 
          zoom={13} 
          scrollWheelZoom={false} 
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterAutomatically lat={displayLocation[0]} lng={displayLocation[1]} />
          
          {/* Main Delivery Radius - 3km (Fast Delivery) */}
          <Circle 
            center={maudahaCenter} 
            pathOptions={{ fillColor: '#10b981', color: '#059669', fillOpacity: 0.2 }} 
            radius={3000} 
          >
            <Popup>
              <div className="font-bold text-emerald-700">
                {language === 'en' ? 'Fast Delivery Zone (Under 30 mins)' : 'फास्ट डिलीवरी क्षेत्र (30 मिनट के अंदर)'}
              </div>
            </Popup>
          </Circle>

          {/* Extended Delivery Radius - 7km (Standard Delivery) */}
          <Circle 
            center={maudahaCenter} 
            pathOptions={{ fillColor: '#f59e0b', color: '#d97706', fillOpacity: 0.1, dashArray: '4' }} 
            radius={7000} 
          >
            <Popup>
              <div className="font-bold text-amber-700">
                {language === 'en' ? 'Standard Delivery Zone (30-60 mins)' : 'स्टैंडर्ड डिलीवरी क्षेत्र (30-60 मिनट)'}
              </div>
            </Popup>
          </Circle>

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="font-bold text-slate-800">
                  {language === 'en' ? 'Your Location' : 'आपका स्थान'}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="mt-4 flex gap-4 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-600 inline-block"></span>
          <span>{language === 'en' ? '< 30 mins' : '< 30 मिनट'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-600 border-dashed inline-block"></span>
          <span>{language === 'en' ? '30-60 mins' : '30-60 मिनट'}</span>
        </div>
      </div>
    </div>
  );
}
