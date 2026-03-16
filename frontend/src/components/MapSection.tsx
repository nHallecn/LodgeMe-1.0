"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

export default function MapSection() {
  return (
    <div className="bg-white rounded-xl shadow-lg h-[500px] mt-10 overflow-hidden">
      <LeafletMap
        latitude={5}
        longitude={12.5}
        zoom={7}
        popupText="Cameroon Center"
      />
    </div>
  );
}