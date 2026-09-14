import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function WorkerAddress() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    houseNumber: "",
    streetArea: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const workerId = sessionStorage.getItem("workerId");

    if (!workerId) {
      alert("Worker account not found. Please sign up again.");
      navigate("/worker-signup");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/workers/${workerId}/address`,
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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save worker address.");
        return;
      }

      alert("Worker address saved successfully!");

      navigate("/worker-services");
    } catch (error) {
      console.error("Worker address error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
              📍
            </div>

            <h2 className="mt-5 text-3xl font-bold text-gray-900">
              Your Address
            </h2>

            <p className="mt-2 text-gray-500">
              Tell us where you provide your services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                House / Flat Number
              </label>

              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                placeholder="Enter house or flat number"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Street / Area
              </label>

              <input
                type="text"
                name="streetArea"
                value={formData.streetArea}
                onChange={handleChange}
                placeholder="Enter street or area"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                PIN Code
              </label>

              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="Enter PIN code"
                required
                maxLength="6"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving Address..." : "Continue"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/worker-auth"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

};
export default WorkerAddress;
