import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Marker + map click handling
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} />
  ) : null;
}

// Move map when position changes
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 16);
    }
  }, [position, map]);

  return null;
}

function CustomerServiceLocation() {
  const navigate = useNavigate();

  const [mapPosition, setMapPosition] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Detect customer's current location
  const detectCustomerLocation = () => {
    setDetecting(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setDetecting(false);
      setLocationError(
        "Your browser does not support location detection."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setMapPosition({
          lat: latitude,
          lng: longitude,
        });

        setDetecting(false);
      },

      (error) => {
        setDetecting(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access for HomeHelp."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be detected. Please try again."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location detection timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to detect your location. Please try again."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Automatically detect location when page opens
  useEffect(() => {
    detectCustomerLocation();
  }, []);

  // Save selected service location
  const handleContinue = async () => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Customer account not found. Please login again.");
      navigate("/customer-login");
      return;
    }

    if (!mapPosition) {
      alert("Please wait until your location is detected.");
      return;
    }

    try {
      setIsSaving(true);

      const locationData = {
        type: "map",
        latitude: mapPosition.lat,
        longitude: mapPosition.lng,
      };

      const response = await fetch(
       `${API_URL}/api/customers/${customerId}/service-location`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(locationData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to save customer service location."
        );
        return;
      }

      alert("Service location saved successfully!");

      navigate("/customer-pricing");
    } catch (error) {
      console.error("Save service location error:", error);

      alert("Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>

          <Link
            to="/services"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Services
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Heading */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-blue-600">
            Booking
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Where should the service be provided?
          </h2>

          <p className="mt-2 max-w-2xl text-gray-500">
            We automatically detected your current location.
            Check the pin and move it if necessary.
          </p>

        </div>

        {/* Detecting */}
        {detecting && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">

            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

            <p className="font-semibold text-gray-900">
              Detecting your location...
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Please allow location access when your browser asks.
            </p>

          </div>
        )}

        {/* Location Error */}
        {!detecting && locationError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">

            <p className="font-semibold text-red-700">
              Location Detection Failed
            </p>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {locationError}
            </p>

            <button
              type="button"
              onClick={detectCustomerLocation}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Map */}
        {!detecting && mapPosition && (
          <>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">

              <MapContainer
                center={[
                  mapPosition.lat,
                  mapPosition.lng,
                ]}
                zoom={16}
                scrollWheelZoom={true}
                className="h-[500px] w-full"
              >

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater position={mapPosition} />

                <LocationMarker
                  position={mapPosition}
                  setPosition={setMapPosition}
                />

              </MapContainer>

            </div>

            {/* Location Information */}
            <div className="mt-5 rounded-2xl bg-blue-50 p-5">

              <p className="font-bold text-gray-900">
                📍 Service Location
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Latitude: {mapPosition.lat.toFixed(6)}
              </p>

              <p className="text-sm text-gray-600">
                Longitude: {mapPosition.lng.toFixed(6)}
              </p>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                This location will be used to find nearby workers
                and calculate travel distance.
              </p>

              <button
                type="button"
                onClick={detectCustomerLocation}
                className="mt-4 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                📍 Detect My Location Again
              </button>

            </div>
          </>
        )}

        {/* Confirm */}
        <div className="mt-8 flex justify-end">

          <button
            type="button"
            onClick={handleContinue}
            disabled={isSaving || detecting || !mapPosition}
            className={`rounded-xl px-7 py-3.5 font-semibold text-white transition ${
              isSaving || detecting || !mapPosition
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving
              ? "Saving Location..."
              : "Confirm Location →"}
          </button>

        </div>

      </main>

    </div>
  );
}

export default CustomerServiceLocation;