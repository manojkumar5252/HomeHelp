import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";

function AdminServicePricing() {
  const navigate = useNavigate();

  const services = [
    { key: "surfaceCleaning", name: "Surface Cleaning" },
    { key: "floorCare", name: "Floor Care" },
    { key: "deepCleaning", name: "Deep Cleaning" },
    { key: "tidyingUp", name: "Tidying Up" },
    { key: "mealPrep", name: "Meal Prep" },
    { key: "dishCare", name: "Dish Care" },
    { key: "kitchenUpkeep", name: "Kitchen Upkeep" },
    { key: "washing", name: "Washing" },
    { key: "drying", name: "Drying" },
    { key: "postWashCare", name: "Post-Wash Care" },
    { key: "linens", name: "Linens" },
  ];

  const [prices, setPrices] = useState({});
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

  // Get current prices from MongoDB
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

        setPrices(data.services || {});
      } catch (error) {
        console.error(error);
        alert("Failed to load pricing.");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handlePriceChange = (key, value) => {
    setPrices({
      ...prices,
      [key]: value,
    });
  };

  // Save prices to MongoDB
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const currentPricingResponse = await fetch(
        `${API_URL}/api/pricing`
      );

      const currentPricing = await currentPricingResponse.json();

      const response = await fetch(
        `${API_URL}/api/pricing`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            services: {
              ...prices,
            },
            travel: currentPricing.travel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save pricing");
      }

      alert("Service pricing saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save pricing.");
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
            Admin Service Pricing
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Service Pricing
          </h1>

          <p className="text-gray-600 mt-2">
            Set the estimated price for each HomeHelp service.
          </p>

          {loading ? (
            <p className="text-gray-600 mt-8">
              Loading pricing...
            </p>
          ) : (
            <form onSubmit={handleSave} className="mt-8">
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.key}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4"
                  >
                    <label
                      htmlFor={service.key}
                      className="font-medium text-gray-800"
                    >
                      {service.name}
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        ₹
                      </span>

                      <input
                        id={service.key}
                        type="number"
                        min="0"
                        value={prices[service.key] ?? ""}
                        onChange={(e) =>
                          handlePriceChange(
                            service.key,
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
                {saving ? "Saving..." : "Save Pricing"}
              </button>
            </form>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900">
              Important
            </h3>

            <p className="text-blue-800 text-sm mt-2 leading-6">
              These prices are controlled by HomeHelp Admin. Workers do not
              enter service prices. Customers will receive the prices saved
              here.
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

export default AdminServicePricing;