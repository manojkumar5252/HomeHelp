import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../api";

function CustomerHouseDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isEditMode = searchParams.get("edit") === "true";

  const [formData, setFormData] = useState({
    houseNumber: "",
    streetArea: "",
    city: "",
    state: "Andhra Pradesh",
    pinCode: "",
    houseType: "",
    bathrooms: "",
    floors: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Protect customer page and load saved details
  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Please login as a customer first.");
      navigate("/customer-login");
      return;
    }

    const loadCustomerDetails = async () => {
      try {
        // First try customer data stored during login/signup
        const storedCustomer = sessionStorage.getItem("customer");

        if (storedCustomer) {
          const customer = JSON.parse(storedCustomer);

          if (customer.address || customer.houseDetails) {
            setFormData({
              houseNumber: customer.address?.houseNumber || "",
              streetArea: customer.address?.street || "",
              city: customer.address?.city || "",
              state: customer.address?.state || "Andhra Pradesh",
              pinCode: customer.address?.pinCode || "",
              houseType: customer.houseDetails?.houseType || "",
              bathrooms:
                customer.houseDetails?.bathrooms !== undefined
                  ? String(customer.houseDetails.bathrooms)
                  : "",
              floors:
                customer.houseDetails?.floors !== undefined
                  ? String(customer.houseDetails.floors)
                  : "",
            });
          }
        }

        // Fetch latest details from backend
        const response = await fetch(
       `${API_URL}/api/customers/${customerId}/house-details`
        );

        if (response.ok) {
          const data = await response.json();
          const customer = data.customer;

          setFormData({
            houseNumber: customer.address?.houseNumber || "",
            streetArea: customer.address?.street || "",
            city: customer.address?.city || "",
            state: customer.address?.state || "Andhra Pradesh",
            pinCode: customer.address?.pinCode || "",
            houseType: customer.houseDetails?.houseType || "",
            bathrooms:
              customer.houseDetails?.bathrooms !== undefined
                ? String(customer.houseDetails.bathrooms)
                : "",
            floors:
              customer.houseDetails?.floors !== undefined
                ? String(customer.houseDetails.floors)
                : "",
          });

          // Keep sessionStorage updated
          sessionStorage.setItem("customer", JSON.stringify(customer));
        }
      } catch (error) {
        console.error("Load house details error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerDetails();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Customer ID not found. Please login again.");
      navigate("/customer-login");
      return;
    }

    // PIN validation
    if (!/^\d{6}$/.test(formData.pinCode)) {
      alert("PIN code must be exactly 6 digits.");
      return;
    }

    // Bathrooms validation
    if (!formData.bathrooms) {
      alert("Please select the number of bathrooms.");
      return;
    }

    // Floors validation for independent house
    if (
      formData.houseType === "Independent House" &&
      !formData.floors
    ) {
      alert("Please select the number of floors.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/customers/${customerId}/house-details`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            houseNumber: formData.houseNumber,
            streetArea: formData.streetArea,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
            houseType: formData.houseType,
            bathrooms:
              formData.bathrooms === "5+"
                ? 5
                : Number(formData.bathrooms),
            floors:
              formData.houseType === "Independent House"
                ? formData.floors === "5+"
                  ? 5
                  : Number(formData.floors)
                : 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save house details.");
        return;
      }

      // Save updated customer information in session
      if (data.customer) {
        sessionStorage.setItem(
          "customer",
          JSON.stringify(data.customer)
        );
      }

      alert(
        isEditMode
          ? "House details updated successfully!"
          : "House details saved successfully!"
      );

      // Both signup and edit return to dashboard
      navigate("/customer-dashboard");
    } catch (error) {
      console.error("House details error:", error);
      alert("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-3xl">🏠</div>
          <p className="mt-3 text-gray-600">
            Loading your house details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">

          {/* Heading */}
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🏠
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-blue-600">
              {isEditMode ? "My Address" : "House Details"}
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              {isEditMode
                ? "Your House Details"
                : "Tell us about your home"}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              {isEditMode
                ? "View and update your saved house and address details."
                : "These details help HomeHelp understand your home and provide better service estimates."}
            </p>
          </div>

          {/* Form */}
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Address Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  📍 House Address
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the address where your HomeHelp service will be
                  provided.
                </p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  {/* House Number */}
                  <div>
                    <label
                      htmlFor="houseNumber"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      House / Flat Number
                    </label>

                    <input
                      id="houseNumber"
                      name="houseNumber"
                      type="text"
                      value={formData.houseNumber}
                      onChange={handleChange}
                      placeholder="Example: 12-34"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Street / Area */}
                  <div>
                    <label
                      htmlFor="streetArea"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Street / Area
                    </label>

                    <input
                      id="streetArea"
                      name="streetArea"
                      type="text"
                      value={formData.streetArea}
                      onChange={handleChange}
                      placeholder="Enter street or area"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      State
                    </label>

                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Andhra Pradesh">
                        Andhra Pradesh
                      </option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* PIN Code */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="pinCode"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      PIN Code
                    </label>

                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      value={formData.pinCode}
                      onChange={handleChange}
                      placeholder="Enter 6-digit PIN code"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* House Information */}
              <div className="border-t border-gray-100 pt-8">

                <h3 className="text-xl font-bold text-gray-900">
                  🏡 House Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  This information helps HomeHelp estimate the work required.
                </p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  {/* House Type */}
                  <div>
                    <label
                      htmlFor="houseType"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      House Type
                    </label>

                    <select
                      id="houseType"
                      name="houseType"
                      value={formData.houseType}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select house type</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4 BHK">4 BHK</option>
                      <option value="5+ BHK">5+ BHK</option>
                      <option value="Independent House">
                        Independent House
                      </option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label
                      htmlFor="bathrooms"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Number of Bathrooms
                    </label>

                    <select
                      id="bathrooms"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select bathrooms</option>
                      <option value="1">1 Bathroom</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="3">3 Bathrooms</option>
                      <option value="4">4 Bathrooms</option>
                      <option value="5">5+ Bathrooms</option>
                    </select>
                  </div>

                  {/* Floors */}
                  {formData.houseType === "Independent House" && (
                    <div className="sm:col-span-2">

                      <label
                        htmlFor="floors"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Number of Floors
                      </label>

                      <select
                        id="floors"
                        name="floors"
                        value={formData.floors}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">
                          Select number of floors
                        </option>
                        <option value="1">1 Floor</option>
                        <option value="2">2 Floors</option>
                        <option value="3">3 Floors</option>
                        <option value="4">4 Floors</option>
                        <option value="5+">5+ Floors</option>
                      </select>

                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="border-t border-gray-100 pt-8">

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Saving House Details..."
                    : isEditMode
                    ? "Update & Save"
                    : "Save House Details →"}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => navigate("/customer-dashboard")}
                    className="mt-3 w-full rounded-xl border border-gray-300 bg-white py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}

              </div>
            </form>

            {/* Back */}
            {!isEditMode && (
              <div className="mt-6 text-center">
                <Link
                  to="/customer-signup"
                  className="text-sm font-medium text-gray-500 hover:text-blue-600"
                >
                  ← Back to Registration
                </Link>
              </div>
            )}

          </div>

          {/* Progress - Signup only */}
          {!isEditMode && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <span className="font-semibold text-blue-600">
                1. Account
              </span>

              <span className="text-gray-300">→</span>

              <span className="font-semibold text-blue-600">
                2. House Details
              </span>

              <span className="text-gray-300">→</span>

              <span className="text-gray-400">
                3. Services
              </span>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default CustomerHouseDetails;