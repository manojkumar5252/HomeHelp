import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function Services() {
  const navigate = useNavigate();

  const [selectedServices, setSelectedServices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Protect Services page
  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Please login as a customer first.");
      navigate("/customer-login");
    }
  }, [navigate]);

  const serviceCategories = [
    {
      title: "Cleaning & Organizing",
      description:
        "Choose the cleaning and organizing services you need for your home.",
      services: [
        "Surface Cleaning",
        "Floor Care",
        "Deep Cleaning",
        "Tidying Up",
      ],
    },

    {
      title: "Kitchen & Meal Management",
      description:
        "Select the kitchen and meal services that you need.",
      services: [
        "Meal Prep",
        "Dish Care",
        "Kitchen Upkeep",
      ],
    },

    {
      title: "Laundry & Fabric Care",
      description:
        "Choose the laundry and fabric care services required for your home.",
      services: [
        "Washing",
        "Drying",
        "Post-Wash Care",
        "Linens",
      ],
    },
  ];

  const handleServiceSelect = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(
        selectedServices.filter((item) => item !== service)
      );
      return;
    }

    if (selectedServices.length >= 6) {
      alert("You can select a maximum of 6 services.");
      return;
    }

    setSelectedServices([...selectedServices, service]);
  };

  const handleContinue = async () => {
    if (selectedServices.length < 3) {
      alert("Please select at least 3 services.");
      return;
    }

    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Customer account not found. Please login again.");
      navigate("/customer-login");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `${API_URL}/api/customers/${customerId}/services`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            services: selectedServices,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save selected services.");
        return;
      }

      // Keep a temporary copy for the current request flow
      sessionStorage.setItem(
        "selectedServices",
        JSON.stringify(selectedServices)
      );

      alert("Services saved successfully!");

      navigate("/customer-service-location");
    } catch (error) {
      console.error("Save services error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">

          <p className="mb-3 text-sm font-semibold tracking-widest">
            HOMEHELP SERVICES
          </p>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Services That Make Home Life Easier
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-blue-100">
            Choose the services you need and build a complete home service
            request.
          </p>

        </div>
      </section>

      {/* Selection Status */}
      <section className="mx-auto max-w-6xl px-6 pt-10">

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Build your home service request
              </h2>

              <p className="mt-2 text-gray-600">
                Select a minimum of 3 and a maximum of 6 services.
                All selected services will be combined into one request.
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-white px-5 py-3 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                Selected
              </p>

              <p className="text-2xl font-bold text-blue-600">
                {selectedServices.length} / 6
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-14">

        <div className="space-y-12">

          {serviceCategories.map((category) => (

            <div key={category.title}>

              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                {category.title}
              </h2>

              <p className="mb-6 text-gray-600">
                {category.description}
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                {category.services.map((service) => {

                  const isSelected =
                    selectedServices.includes(service);

                  return (
                    <div
                      key={service}
                      className={`rounded-xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-gray-200"
                      }`}
                    >

                      {/* Icon / Selection */}
                      <button
                        type="button"
                        onClick={() => handleServiceSelect(service)}
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-xl transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }`}
                      >
                        {isSelected ? "✓" : "+"}
                      </button>

                      <h3 className="mb-2 text-lg font-semibold text-gray-800">
                        {service}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Add {service.toLowerCase()} to your home service
                        request.
                      </p>

                      {/* Select Button */}
                      <button
                        type="button"
                        onClick={() => handleServiceSelect(service)}
                        className={`mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        {isSelected
                          ? "Selected ✓"
                          : "Select Service"}
                      </button>

                    </div>
                  );
                })}

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <section className="border-t border-gray-200 bg-white px-6 py-10">

          <div className="mx-auto max-w-6xl">

            <h2 className="text-2xl font-bold text-gray-900">
              Your Selected Services
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">

              {selectedServices.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                >
                  <span>✓</span>
                  {service}
                </div>
              ))}

            </div>

          </div>

        </section>
      )}

      {/* Continue */}
      <section className="bg-gray-50 px-6 pb-16 pt-4">

        <div className="mx-auto max-w-6xl text-center">

          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedServices.length < 3 || isSaving}
            className={`rounded-xl px-10 py-4 font-semibold transition ${
              selectedServices.length >= 3 && !isSaving
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {isSaving
              ? "Saving Services..."
              : "Continue with Selected Services →"}
          </button>

          <p className="mt-3 text-sm text-gray-500">
            Select at least 3 services to continue.
          </p>

        </div>

      </section>

      {/* Bottom Information */}
      <section className="bg-white px-6 py-16">

        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-3xl font-bold text-gray-900">
            One request. Multiple services.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            HomeHelp allows you to combine multiple services into one
            request. We'll help you find a worker who can handle your
            selected work.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Services;