import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      navigate("/admin-login");
      return;
    }

    fetch(`${API_URL}/api/admin/bookings`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        return response.json();
      })
      .then((data) => {
        console.log("📋 ADMIN BOOKINGS RESPONSE:", data);

        setBookings(data.bookings || data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ ADMIN BOOKINGS ERROR:", err);
        setError("Unable to load bookings.");
        setLoading(false);
      });
  }, [navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700";

      case "Accepted":
        return "bg-blue-50 text-blue-700";

      case "In Progress":
        return "bg-purple-50 text-purple-700";

      case "Completed":
        return "bg-green-50 text-green-700";

      case "Cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📋 Bookings
            </h1>

            <p className="mt-1 text-gray-600">
              View all customer service bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin-dashboard")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {/* Bookings */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {bookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  No bookings found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Worker
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Services
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Location
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Customer */}
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-900">
                            {booking.customer?.fullName || "—"}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {booking.customer?.phone || ""}
                          </p>

                          <p className="text-sm text-gray-500">
                            {booking.customer?.email || ""}
                          </p>
                        </td>

                        {/* Worker */}
                        <td className="px-6 py-5">
                          {booking.worker ? (
                            <>
                              <p className="font-semibold text-gray-900">
                                {booking.worker.fullName || "—"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {booking.worker.phone || ""}
                              </p>

                              <p className="text-sm text-gray-500">
                                {booking.worker.email || ""}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Not assigned
                            </span>
                          )}
                        </td>

                        {/* Services */}
                        <td className="px-6 py-5">
                          {Array.isArray(booking.selectedServices) &&
                          booking.selectedServices.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {booking.selectedServices.map(
                                (service, index) => (
                                  <span
                                    key={`${booking._id}-${index}`}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                  >
                                    {service}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No services
                            </span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {booking.serviceLocation ? (
                            booking.serviceLocation.type === "map" ? (
                              <div>
                                <p>
                                  Latitude:{" "}
                                  {booking.serviceLocation.latitude ?? "—"}
                                </p>

                                <p>
                                  Longitude:{" "}
                                  {booking.serviceLocation.longitude ?? "—"}
                                </p>
                              </div>
                            ) : (
                              <span>
                                {booking.serviceLocation.address ||
                                  "Address provided"}
                              </span>
                            )
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {booking.status || "Unknown"}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {booking.createdAt
                            ? new Date(
                                booking.createdAt
                              ).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookings;