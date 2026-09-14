import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";

function AdminTravelPricing() {
  const navigate = useNavigate();

  const distanceSlabs = [
    { key: "zeroToTwoKm", label: "0–2 km" },
    { key: "twoToFiveKm", label: "2–5 km" },
    { key: "fiveToEightKm", label: "5–8 km" },
    { key: "eightToTwelveKm", label: "8–12 km" },
    { key: "twelveToFifteenKm", label: "12–15 km" },
    { key: "aboveFifteenKm", label: "15+ km" },
  ];

  const [travelPrices, setTravelPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Protect admin page
  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      alert("Please login as an admin first.");
      navigate("/admin-login");
    }
  }, [navigate]);

  // Load travel pricing from MongoDB
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/pricing`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pricing");
        }

        const data = await response.json();

        setTravelPrices(data.travel || {});
      } catch (error) {
        console.error(error);
        alert("Failed to load travel pricing.");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handlePriceChange = (key, value) => {
    setTravelPrices({
      ...travelPrices,
      [key]: value,
    });
  };

  // Save travel pricing to MongoDB
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Get current service pricing first
      const currentPricingResponse = await fetch(
        `${API_URL}/api/pricing`
      );

      if (!currentPricingResponse.ok) {
        throw new Error("Failed to get current pricing");
      }

      const currentPricing = await currentPricingResponse.json();

      // Update only travel pricing
      const response = await fetch(
        `${API_URL}/api/pricing`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            services: currentPricing.services,
            travel: travelPrices,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save travel pricing");
      }

      alert("Travel pricing saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save travel pricing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/admin-dashboard"
            className="text-2xl font-bold text-blue-600"
          >
            HomeHelp
          </Link>

          <span className="text-gray-600 font-medium">
            Admin Travel Pricing
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Travel Pricing
          </h1>

          <p className="text-gray-600 mt-2">
            Set the automatic travel charge based on the distance between the
            worker and customer's service location.
          </p>

          {loading ? (
            <p className="text-gray-600 mt-8">
              Loading travel pricing...
            </p>
          ) : (
            <form onSubmit={handleSave} className="mt-8">
              <div className="space-y-4">
                {distanceSlabs.map((slab) => (
                  <div
                    key={slab.key}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4"
                  >
                    <label
                      htmlFor={slab.key}
                      className="font-medium text-gray-800"
                    >
                      {slab.label}
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        ₹
                      </span>

                      <input
                        id={slab.key}
                        type="number"
                        min="0"
                        value={travelPrices[slab.key] ?? ""}
                        onChange={(e) =>
                          handlePriceChange(
                            slab.key,
                            e.target.value
                          )
                        }
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition"
              >
                {saving ? "Saving..." : "Save Travel Pricing"}
              </button>
            </form>
          )}

          {/* Information */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900">
              Important
            </h3>

            <p className="text-blue-800 text-sm mt-2 leading-6">
              Travel charges are controlled by HomeHelp Admin. Customers and
              workers do not enter or select travel charges. The system will
              automatically calculate the applicable charge using the worker's
              current location, customer's service location, and these Admin
              pricing rules.
            </p>
          </div>

          <Link
            to="/admin-dashboard"
            className="block text-center mt-6 text-blue-600 hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminTravelPricing;