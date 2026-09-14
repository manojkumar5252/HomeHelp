import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../api";

function WorkerServices() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isEditMode = searchParams.get("edit") === "true";

  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const serviceCategories = [
    {
      title: "Cleaning & Organizing",
      services: [
        "Surface Cleaning",
        "Floor Care",
        "Deep Cleaning",
        "Tidying Up",
      ],
    },
    {
      title: "Kitchen & Meal Management",
      services: [
        "Meal Prep",
        "Dish Care",
        "Kitchen Upkeep",
      ],
    },
    {
      title: "Laundry & Fabric Care",
      services: [
        "Washing",
        "Drying",
        "Post-Wash Care",
        "Linens",
      ],
    },
  ];

  useEffect(() => {
    const loadWorkerServices = async () => {
      const workerId = sessionStorage.getItem("workerId");

      if (!workerId) {
        navigate("/worker-login", { replace: true });
        return;
      }

      /*
        New worker signup:
        Start with no selected services.
      */
      if (!isEditMode) {
        setSelectedServices([]);
        setIsLoading(false);
        return;
      }

      /*
        Edit mode:
        Always fetch the latest worker information from MongoDB.
        This prevents stale sessionStorage data from being displayed.
      */
      try {
        const response = await fetch(
          `${API_URL}/api/workers/${workerId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load worker services."
          );
        }

        if (data.worker && Array.isArray(data.worker.services)) {
          setSelectedServices(data.worker.services);

          /*
            Keep sessionStorage synchronized with MongoDB.
          */
          const savedWorker = sessionStorage.getItem("worker");

          if (savedWorker) {
            try {
              const worker = JSON.parse(savedWorker);

              worker.services = data.worker.services;

              sessionStorage.setItem(
                "worker",
                JSON.stringify(worker)
              );
            } catch (error) {
              console.error(
                "Failed to synchronize worker session:",
                error
              );
            }
          }
        } else {
          setSelectedServices([]);
        }
      } catch (error) {
        console.error(
          "Failed to load worker services:",
          error
        );

        alert(
          error.message ||
            "Unable to load your saved services. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkerServices();
  }, [navigate, isEditMode]);

  const handleServiceSelect = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(
        selectedServices.filter((item) => item !== service)
      );
      return;
    }

    if (selectedServices.length >= 11) {
      alert("You can select a maximum of 11 services.");
      return;
    }

    setSelectedServices([
      ...selectedServices,
      service,
    ]);
  };

  const handleSaveServices = async () => {
    if (selectedServices.length < 3) {
      alert("Please select at least 3 services.");
      return;
    }

    if (selectedServices.length > 11) {
      alert("You can select a maximum of 11 services.");
      return;
    }

    const workerId = sessionStorage.getItem("workerId");

    if (!workerId) {
      alert("Worker ID not found. Please log in again.");
      navigate("/worker-login");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/workers/${workerId}/services`,
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
        throw new Error(
          data.message ||
            "Failed to save worker services."
        );
      }

      /*
        Update sessionStorage with the latest worker
        returned by the backend.
      */
      if (data.worker) {
        sessionStorage.setItem(
          "worker",
          JSON.stringify(data.worker)
        );
      } else {
        const savedWorker = sessionStorage.getItem("worker");

        if (savedWorker) {
          try {
            const worker = JSON.parse(savedWorker);

            worker.services = selectedServices;

            sessionStorage.setItem(
              "worker",
              JSON.stringify(worker)
            );
          } catch (error) {
            console.error(
              "Failed to update saved worker session:",
              error
            );
          }
        }
      }

      alert(
        isEditMode
          ? "Your services were updated successfully!"
          : "Your services were saved successfully!"
      );

      navigate("/worker-dashboard");
    } catch (error) {
      console.error(
        "Worker services error:",
        error
      );

      alert(
        error.message ||
          "Unable to save your services. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            Loading services...
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-green-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
              🛠️
            </div>

            <h2 className="mt-5 text-3xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Your Services"
                : "What services can you provide?"}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              {isEditMode
                ? "Update the services you are comfortable providing to HomeHelp customers."
                : "Select the services you are comfortable providing to HomeHelp customers."}
            </p>

            <div className="mt-4 inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              Select at least 3 services
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {serviceCategories.map((category) => (
              <section
                key={category.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h3 className="text-xl font-bold text-gray-900">
                  {category.title}
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {category.services.map((service) => {
                    const isSelected =
                      selectedServices.includes(service);

                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() =>
                          handleServiceSelect(service)
                        }
                        className={`rounded-2xl border p-5 text-left transition ${
                          isSelected
                            ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                            : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-gray-800">
                            {service}
                          </span>

                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${
                              isSelected
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-gray-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="sticky bottom-4 mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedServices.length} services selected
                </p>

                <p className="text-sm text-gray-500">
                  You can select 3 to 11 services.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveServices}
                disabled={isSubmitting}
                className={`rounded-xl px-7 py-3.5 font-semibold text-white transition ${
                  isSubmitting
                    ? "cursor-not-allowed bg-green-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


export default WorkerServices;