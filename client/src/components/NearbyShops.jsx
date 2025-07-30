import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// Shop marker icon
const shopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// User marker icon
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to change map view when user location is available
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
};

const NearbyShops = () => {
  const [shops, setShops] = useState([]);
  const [center, setCenter] = useState([28.6139, 77.209]); // Default to Delhi
  const [userLoc, setUserLoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setCenter(coords);
          setUserLoc(coords);
        },
        () => {
          // If denied, use default
        },
        { enableHighAccuracy: true }
      );
    }

    // Fetch all repairer shops
    const fetchShops = async () => {
      try {
        const res = await fetch("https://furious-repair-backend.onrender.com/api/repairer/all-shops");
        const data = await res.json();
        setShops(data.shops || []);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      }
    };

    fetchShops();
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900 transition"
      >
        ← Back to Main
      </button>

      <h2 className="text-3xl font-bold text-orange-900 mb-6 text-center">
        Nearby Repair Shops
      </h2>

      <div className="max-w-4xl mx-auto mt-4">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <ChangeMapView coords={userLoc} />

          <TileLayer
            attribution="@Furious Repair"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {userLoc && (
            <Marker position={userLoc} icon={userIcon}>
              <Popup>
                <strong>Your Location</strong>
              </Popup>
            </Marker>
          )}

          {/* Repair shop markers */}
          {shops.map((shop, idx) =>
            shop.geoloc?.lat && shop.geoloc?.long ? (
              <Marker
                key={shop._id || idx}
                position={[shop.geoloc.lat, shop.geoloc.long]}
                icon={shopIcon}
                eventHandlers={{
                  dblclick: () => {
                    window.open(
                      `https://www.google.com/maps?q=${shop.geoloc.lat},${shop.geoloc.long}`,
                      "_blank"
                    );
                  },
                }}
              >
                <Popup>
                  <div>
                    <strong>{shop.name}</strong>
                    <br />
                    {shop.city}, {shop.state}
                    <br />
                    PIN: {shop.pin}
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NearbyShops;
