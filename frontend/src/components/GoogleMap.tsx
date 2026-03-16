"use client";
import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers?: { lat: number; lng: number; title: string }[];
}

const GoogleMap: React.FC<GoogleMapProps> = ({ center, zoom, markers }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const map = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });

      markers?.forEach(markerData => {
        new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map,
          title: markerData.title,
        });
      });
    }
  }, [center, zoom, markers]);

  return <div ref={ref} className="h-full w-full" />;
};

export default GoogleMap;