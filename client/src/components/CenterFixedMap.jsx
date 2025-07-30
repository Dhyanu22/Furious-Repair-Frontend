import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function CenterFixedMap({ onChange }) {
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    pin: "",
    lat: null,
    lng: null,
  });

  const [mapReady, setMapReady] = useState(false);
  const hasSetInitialLocation = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Watch center change and update coordinates
  const CenterWatcher = () => {
    const map = useMap();

    useEffect(() => {
      const onMove = () => {
        const center = map.getCenter();
        setFormData((prev) => ({
          ...prev,
          lat: center.lat,
          lng: center.lng,
        }));
      };

      map.on("moveend", onMove);
      return () => {
        map.off("moveend", onMove);
      };
    }, [map]);

    return null;
  };

  // Call onChange when formData updates
  useEffect(() => {
    if (onChange && formData.lat && formData.lng) {
      onChange(formData);
    }
  }, [formData, onChange]);

  // Get user location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!hasSetInitialLocation.current) {
            hasSetInitialLocation.current = true;
            setFormData((prev) => ({
              ...prev,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }));
            setMapReady(true);
          }
        },
        (err) => {
          console.warn("Location access denied. Using default location.");
          setFormData((prev) => ({
            ...prev,
            lat: 28.6139,
            lng: 77.209,
          }));
          setMapReady(true);
        },
        { enableHighAccuracy: true }
      );
    } else {
      // fallback if geolocation not supported
      setFormData((prev) => ({
        ...prev,
        lat: 28.6139,
        lng: 77.209,
      }));
      setMapReady(true);
    }
  }, []);

  return (
    <div>
      <label className="block font-semibold text-orange-900 mb-1">
        Set Your Location
      </label>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className="w-full p-3 rounded border border-orange-300 bg-white text-orange-800 font-medium"
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <input
          type="text" className="w-full p-3 rounded border border-orange-300 bg-white text-orange-800 font-medium"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
        <input
          type="text" className="w-full p-3 rounded border border-orange-300 bg-white text-orange-800 font-medium"
          name="pin"
          placeholder="PIN Code"
          value={formData.pin}
          onChange={handleChange}
        />
        <input
          type="text"
          value={formData.lat ? formData.lat.toFixed(5) : ""}
          hidden
        />
        <input
          type="text"
          value={formData.lng ? formData.lng.toFixed(5) : ""}
          hidden
        />
      </div>

      {/* Render map only when location is ready */}
      {mapReady && formData.lat && formData.lng && (
        <div style={{ position: "relative" }}>
          <MapContainer
            center={[formData.lat, formData.lng]}
            zoom={16}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CenterWatcher />
          </MapContainer>

          {/* Fixed center marker */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="38"
              height="38"
            >
              <g clipPath="url(#clip0)">
                <g fill="#912f16">
                  <path d="M12.0002 22.9299L11.3402 22.3399C11.0202 22.0499 3.49023 15.2999 3.49023 9.9099C3.49023 5.2199 7.31024 1.3999 12.0002 1.3999C16.6902 1.3999 20.5103 5.2199 20.5103 9.9099C20.5103 15.3099 12.9802 22.0599 12.6602 22.3399L12.0002 22.9299ZM12.0002 3.3999C8.41024 3.3999 5.49023 6.3199 5.49023 9.9099C5.49023 13.2799 9.71024 18.0299 12.0002 20.2299C14.2902 18.0299 18.5103 13.2799 18.5103 9.9099C18.5103 6.3199 15.5902 3.3999 12.0002 3.3999Z" />
                  <path d="M12.0003 13C10.1203 13 8.60034 11.4699 8.60034 9.59995C8.60034 7.72995 10.1303 6.19995 12.0003 6.19995C13.8803 6.19995 15.4004 7.72995 15.4004 9.59995C15.4004 11.4699 13.8803 13 12.0003 13ZM12.0003 8.19995C11.2303 8.19995 10.6003 8.82995 10.6003 9.59995C10.6003 10.3699 11.2303 11 12.0003 11C12.7703 11 13.4004 10.3699 13.4004 9.59995C13.4004 8.82995 12.7703 8.19995 12.0003 8.19995Z" />
                </g>
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="24" height="24" fill="#fff" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
