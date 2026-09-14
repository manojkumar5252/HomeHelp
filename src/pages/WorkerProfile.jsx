import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function WorkerProfile() {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workerId = sessionStorage.getItem("workerId");

    if (!workerId) {
      navigate("/worker-login");
      return;
    }

    fetch(`${API_URL}/api/workers/${workerId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Worker profile data:", data);

        if (data.worker) {
          setWorker(data.worker);
        }
      })
      .catch((error) => {
        console.error("Profile error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-2xl font-bold">
          Loading Profile...
        </h1>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Worker profile not found
        </h1>

        <button
          onClick={() => navigate("/worker-dashboard")}
          className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const address = worker.address || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Home<span className="text-green-600">Help</span>
            </h1>

            <p className="text-xs text-gray-500">
              Worker Profile
            </p>
          </div>

          <button
            onClick={() => navigate("/worker-dashboard")}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl bg-green-600 p-8 text-white">
          <p className="text-sm text-green-100">
            My Profile
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {worker.fullName}
          </h2>

          <p className="mt-2 text-green-100">
            View your worker account information.
          </p>
        </div>

        {/* Account Information */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Full Name
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {worker.fullName || "Not provided"}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {worker.phone || "Not provided"}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {worker.email || "Not provided"}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Availability
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {worker.isAvailable
                ? "🟢 Available"
                : "⚪ Offline"}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">
            My Address
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                House Number
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {address.houseNumber || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Street
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {address.street || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                City
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {address.city || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                State
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {address.state || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                PIN Code
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {address.pinCode || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            My Services
          </p>

          {worker.services &&
          worker.services.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {worker.services.map((service, index) => (
                <span
                  key={index}
                  className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700"
                >
                  {service}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-gray-500">
              No services selected.
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/worker-dashboard")}
          className="mt-8 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white"
        >
          ← Back to Dashboard
        </button>
      </main>
    </div>
  );
}

export default WorkerProfile;