import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";

function CustomerBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Please login as a customer first.");
      navigate("/customer-login");
      return;
    }

    fetchBookings(customerId);
  }, [navigate]);

  const fetchBookings = async (customerId) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/customer/${customerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch bookings.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Fetch bookings error:", error);
      setError(error.message || "Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking.");
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: "Cancelled",
              }
            : booking
        )
      );

      alert("Booking cancelled successfully.");
    } catch (error) {
      console.error("Cancel booking error:", error);
      alert(error.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-blue-100 text-blue-700";

      case "In Progress":
        return "bg-purple-100 text-purple-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getWorkerName = (booking) => {
    if (!booking.worker) {
      return "Not assigned";
    }

    if (typeof booking.worker === "string") {
      return "Assigned";
    }

    return booking.worker.fullName || booking.worker.name || "Assigned";
  };

  const getLocation = (booking) => {
    const address = booking.address || {};

    return (
      address.city ||
      booking.serviceLocation?.city ||
      "Location not available"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not selected";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600"
            >
              HomeHelp
            </Link>

            <button
              onClick={() => navigate("/customer-dashboard")}
              className="text-blue-600 font-medium hover:underline"
            >
              Dashboard
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <div className="text-5xl mb-4">⏳</div>

            <h1 className="text-2xl font-bold text-gray-900">
              Loading Bookings...
            </h1>

            <p className="text-gray-600 mt-2">
              Please wait while we fetch your bookings.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600"
            >
              HomeHelp
            </Link>

            <button
              onClick={() => navigate("/customer-dashboard")}
              className="text-blue-600 font-medium hover:underline"
            >
              Dashboard
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>

            <h1 className="text-2xl font-bold text-gray-900">
              Unable to Load Bookings
            </h1>

            <p className="text-red-600 mt-3">
              {error}
            </p>

            <button
              onClick={() => {
                const customerId =
                  sessionStorage.getItem("customerId");

                if (customerId) {
                  fetchBookings(customerId);
                }
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600"
          >
            HomeHelp
          </Link>

          <button
            onClick={() => navigate("/customer-dashboard")}
            className="text-blue-600 font-medium hover:underline"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Bookings
          </h1>

          <p className="text-gray-600 mt-2">
            View the status and details of your service bookings.
          </p>
        </div>

        {/* No bookings */}
        {bookings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <div className="text-5xl mb-4">📋</div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Bookings Yet
            </h2>

            <p className="text-gray-600 mt-2">
              You have not created any service bookings yet.
            </p>

            <button
              onClick={() => navigate("/services")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Book a Service
            </button>
          </div>
        )}

        {/* Booking Cards */}
        <div className="space-y-5">
          {bookings.map((booking) => {
            const selectedServices =
              booking.selectedServices || [];

            /*
             * Only the final total is displayed to the customer.
             *
             * Backend normally provides:
             * serviceTotal + travelCharge + platformFee = finalTotal
             *
             * The fallback below also protects older bookings where
             * finalTotal may not have been stored correctly.
             */
            const serviceTotal =
              Number(booking.serviceTotal) || 0;

            const travelCharge =
              Number(booking.travelCharge) || 0;

            const platformFee =
              Number(booking.platformFee) || 0;

            const calculatedFinalTotal =
              serviceTotal +
              travelCharge +
              platformFee;

            const finalTotal =
              Number(booking.finalTotal) > 0
                ? Number(booking.finalTotal)
                : calculatedFinalTotal;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedServices.length > 0
                        ? selectedServices[0]
                        : "HomeHelp Service"}
                    </h2>

                    {selectedServices.length > 1 && (
                      <div className="mt-1 space-y-1">
                        {selectedServices
                          .slice(1)
                          .map((service) => (
                            <p
                              key={service}
                              className="text-gray-700"
                            >
                              {service}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <span
                    className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusClasses(
                      booking.status
                    )}`}
                  >
                    Status: {booking.status || "Pending"}
                  </span>
                </div>

                {/* Booking Information */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Worker */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Worker
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {getWorkerName(booking)}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Date
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Time
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.bookingTime || "Not selected"}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Location
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {getLocation(booking)}
                    </p>
                  </div>
                </div>

                {/* Total Price Only */}
                <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total Price
                    </span>

                    <span className="text-2xl font-bold text-blue-600">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  {booking.status === "Pending" && (
                    <p className="text-sm text-yellow-700">
                      Your booking is waiting for a worker to accept it.
                    </p>
                  )}

                  {booking.status === "Accepted" && (
                    <p className="text-sm text-blue-700">
                      Your booking has been accepted by a worker.
                    </p>
                  )}

                  {booking.status === "In Progress" && (
                    <p className="text-sm text-purple-700">
                      Your service is currently in progress.
                    </p>
                  )}

                  {booking.status === "Completed" && (
                    <p className="text-sm text-green-700">
                      Your service has been completed successfully.
                    </p>
                  )}

                  {booking.status === "Cancelled" && (
                    <p className="text-sm text-red-700">
                      This booking has been cancelled.
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  {/* Cancel button */}
                  {booking.status !== "Cancelled" &&
                    booking.status !== "Completed" && (
                      <button
                        onClick={() =>
                          cancelBooking(booking._id)
                        }
                        disabled={
                          cancellingId === booking._id
                        }
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold"
                      >
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}

                  {/* Book another service */}
                  <button
                    onClick={() => navigate("/services")}
                    className="px-5 py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    Book Another Service
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/customer-dashboard")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default CustomerBookings;