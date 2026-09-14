import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

const WorkerJobs = () => {
  const navigate = useNavigate();

  const [workerId, setWorkerId] = useState("");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [acceptingJob, setAcceptingJob] = useState("");
  const [updatingJob, setUpdatingJob] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedWorkerId = sessionStorage.getItem("workerId");

    if (!storedWorkerId) {
      navigate("/worker-login");
      return;
    }

    setWorkerId(storedWorkerId);
    fetchJobs(storedWorkerId);
  }, [navigate]);

  const fetchJobs = async (id) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [availableResponse, myJobsResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/api/bookings/available?workerId=${id}`
          ),
          fetch(
            `${API_URL}/api/bookings/worker/${id}`
          ),
        ]);

      const availableData = await availableResponse.json();
      const myJobsData = await myJobsResponse.json();

      if (!availableResponse.ok) {
        throw new Error(
          availableData.message ||
            "Failed to fetch available jobs"
        );
      }

      if (!myJobsResponse.ok) {
        throw new Error(
          myJobsData.message ||
            "Failed to fetch your jobs"
        );
      }

      setAvailableJobs(
        availableData.bookings || []
      );

      setMyJobs(
        myJobsData.bookings || []
      );
    } catch (err) {
      console.error("Fetch jobs error:", err);

      setError(
        err.message || "Failed to load jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (bookingId) => {
    try {
      setAcceptingJob(bookingId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to accept job"
        );
      }

      setSuccess(
        "Job accepted successfully."
      );

      await fetchJobs(workerId);
    } catch (err) {
      console.error(
        "Accept job error:",
        err
      );

      setError(
        err.message ||
          "Failed to accept job"
      );
    } finally {
      setAcceptingJob("");
    }
  };

  const updateJobStatus = async (
    bookingId,
    action,
    successMessage
  ) => {
    try {
      setUpdatingJob(bookingId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action.replace(
              "-",
              " "
            )} job`
        );
      }

      setSuccess(
        data.message || successMessage
      );

      await fetchJobs(workerId);
    } catch (err) {
      console.error(
        `Update job status error (${action}):`,
        err
      );

      setError(
        err.message ||
          "Failed to update job status"
      );
    } finally {
      setUpdatingJob("");
    }
  };

  const startJob = (bookingId) => {
    updateJobStatus(
      bookingId,
      "start",
      "Job started successfully."
    );
  };

  const completeJob = (bookingId) => {
    updateJobStatus(
      bookingId,
      "complete",
      "Job completed successfully."
    );
  };

  // Open Google Maps using the customer's
  // selected booking service location.
  const navigateToCustomer = (job) => {
    const latitude =
      job?.serviceLocation?.latitude;

    const longitude =
      job?.serviceLocation?.longitude;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      setError(
        "Customer service location is not available."
      );
      return;
    }

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-blue-100 text-blue-700";

      case "In Progress":
        return "bg-yellow-100 text-yellow-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "Pending":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const JobDetails = ({
    job,
    showAcceptButton,
  }) => {
    const navigationDisabled =
      job.status === "Completed" ||
      job.status === "Cancelled";

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Customer Booking
            </h2>

            <p className="mt-1 break-all text-sm text-gray-500">
              Booking ID: {job._id}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
              job.status
            )}`}
          >
            {job.status}
          </span>
        </div>

        {/* CUSTOMER */}
        {job.customer && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Customer
            </h3>

            <p className="mt-2 font-semibold text-gray-900">
              {job.customer.fullName ||
                "Customer"}
            </p>

            {job.customer.phone && (
              <p className="mt-1 text-sm text-gray-600">
                Phone: {job.customer.phone}
              </p>
            )}

            {job.customer.email && (
              <p className="mt-1 text-sm text-gray-600">
                Email: {job.customer.email}
              </p>
            )}
          </div>
        )}

        {/* SERVICES */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700">
            Services
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            {job.selectedServices?.map(
              (service, index) => (
                <span
                  key={index}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {service}
                </span>
              )
            )}
          </div>
        </div>

        {/* DATE & TIME */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Date
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {job.bookingDate ||
                "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Time
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {job.bookingTime ||
                "Not provided"}
            </p>
          </div>
        </div>

        {/* SERVICE ADDRESS */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700">
            Service Address
          </h3>

          <div className="mt-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            {job.address ? (
              <>
                {job.address.houseNumber && (
                  <p>
                    {job.address.houseNumber}
                  </p>
                )}

                {job.address.street && (
                  <p>
                    {job.address.street}
                  </p>
                )}

                {(job.address.city ||
                  job.address.state) && (
                  <p>
                    {job.address.city}

                    {job.address.city &&
                    job.address.state
                      ? ", "
                      : ""}

                    {job.address.state}
                  </p>
                )}

                {job.address.pinCode && (
                  <p>
                    {job.address.pinCode}
                  </p>
                )}
              </>
            ) : (
              <p>
                Address not available
              </p>
            )}
          </div>

          {/* NAVIGATION */}
          {job.serviceLocation &&
            typeof job.serviceLocation.latitude ===
              "number" &&
            typeof job.serviceLocation.longitude ===
              "number" && (
              <button
                type="button"
                onClick={() =>
                  navigateToCustomer(job)
                }
                disabled={navigationDisabled}
                className={`mt-3 w-full rounded-xl px-5 py-3 font-semibold text-white transition ${
                  navigationDisabled
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {navigationDisabled
                  ? "📍 Navigation Disabled"
                  : "📍 Navigate to Customer"}
              </button>
            )}
        </div>

        {/* HOUSE DETAILS */}
        {job.houseDetails && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700">
              House Details
            </h3>

            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              {job.houseDetails.houseType && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    House Type
                  </p>

                  <p className="font-medium text-gray-900">
                    {job.houseDetails.houseType}
                  </p>
                </div>
              )}

              {job.houseDetails.bathrooms > 0 && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Bathrooms
                  </p>

                  <p className="font-medium text-gray-900">
                    {job.houseDetails.bathrooms}
                  </p>
                </div>
              )}

              {job.houseDetails.floors > 0 && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Floors
                  </p>

                  <p className="font-medium text-gray-900">
                    {job.houseDetails.floors}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOB AMOUNT */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <span className="font-semibold text-gray-700">
            Job Amount
          </span>

          <span className="text-xl font-bold text-gray-900">
            ₹{job.finalTotal || 0}
          </span>
        </div>

        {/* ACCEPT JOB */}
        {showAcceptButton && (
          <button
            type="button"
            onClick={() =>
              acceptJob(job._id)
            }
            disabled={
              acceptingJob === job._id
            }
            className="mt-5 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {acceptingJob === job._id
              ? "Accepting..."
              : "Accept Job"}
          </button>
        )}

        {/* START JOB */}
        {!showAcceptButton &&
          job.status === "Accepted" && (
            <button
              type="button"
              onClick={() =>
                startJob(job._id)
              }
              disabled={
                updatingJob === job._id
              }
              className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingJob === job._id
                ? "Starting..."
                : "Start Job"}
            </button>
          )}

        {/* COMPLETE JOB */}
        {!showAcceptButton &&
          job.status === "In Progress" && (
            <button
              type="button"
              onClick={() =>
                completeJob(job._id)
              }
              disabled={
                updatingJob === job._id
              }
              className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingJob === job._id
                ? "Completing..."
                : "Complete Job"}
            </button>
          )}

        {/* COMPLETED MESSAGE */}
        {!showAcceptButton &&
          job.status === "Completed" && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-center">
              <p className="font-semibold text-green-700">
                Job Completed
              </p>

              <p className="mt-1 text-sm text-green-600">
                This job has been successfully
                completed.
              </p>
            </div>
          )}

        {/* CANCELLED MESSAGE */}
        {!showAcceptButton &&
          job.status === "Cancelled" && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-center">
              <p className="font-semibold text-red-700">
                Job Cancelled
              </p>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Jobs
            </h1>

            <p className="mt-1 text-gray-600">
              View available customer bookings
              and manage your accepted jobs.
            </p>
          </div>

          <Link
            to="/worker-dashboard"
            className="inline-flex w-fit items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* ERROR */}
        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchJobs(workerId)
              }
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {!loading && success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              Loading jobs...
            </p>
          </div>
        )}

        {/* CONTENT */}
        {!loading && !error && (
          <>
            {/* AVAILABLE JOBS */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Jobs
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Pending customer bookings
                    available for available workers.
                  </p>
                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  {availableJobs.length}
                </span>
              </div>

              {availableJobs.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">
                    No Available Jobs
                  </h3>

                  <p className="mt-2 text-gray-600">
                    New customer bookings will
                    appear here when you are
                    available.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {availableJobs.map(
                    (job) => (
                      <JobDetails
                        key={job._id}
                        job={job}
                        showAcceptButton={true}
                      />
                    )
                  )}
                </div>
              )}
            </section>

            {/* MY ACCEPTED JOBS */}
            <section className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Accepted Jobs
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Customer bookings assigned
                    to you.
                  </p>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {myJobs.length}
                </span>
              </div>

              {myJobs.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">
                    No Accepted Jobs Yet
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Jobs you accept will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {myJobs.map(
                    (job) => (
                      <JobDetails
                        key={job._id}
                        job={job}
                        showAcceptButton={false}
                      />
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerJobs;