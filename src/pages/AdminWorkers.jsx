import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminWorkers() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [removingWorkerId, setRemovingWorkerId] = useState(null);

  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");
    const storedAdmin = sessionStorage.getItem("admin");

    if (!adminId) {
      navigate("/admin-login");
      return;
    }

    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        setIsPrimaryAdmin(Boolean(admin.isPrimaryAdmin));
      } catch (error) {
        console.error("Admin session data error:", error);
      }
    }

    const fetchWorkers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/workers`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch workers");
        }

        const data = await response.json();

        setWorkers(data.workers || data);
      } catch (err) {
        console.error(err);
        setError("Unable to load workers.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [navigate]);

  // =====================================================
  // REMOVE WORKER
  // =====================================================

  const handleRemoveWorker = async (worker) => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      alert("Admin session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    if (!isPrimaryAdmin) {
      alert("Only the super administrator can remove workers.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${
        worker.fullName || "this worker"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingWorkerId(worker._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/workers/${worker._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove worker."
        );
      }

      // Remove worker immediately from the UI
      setWorkers((currentWorkers) =>
        currentWorkers.filter(
          (item) => item._id !== worker._id
        )
      );

      alert("Worker removed successfully.");
    } catch (error) {
      console.error("Remove worker error:", error);
      setError(error.message);
    } finally {
      setRemovingWorkerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👷 Workers
            </h1>

            <p className="mt-1 text-gray-600">
              View all registered workers on the platform.
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

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">Loading workers...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {workers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  No workers registered yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Services
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Availability
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Address
                      </th>

                      {isPrimaryAdmin && (
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {workers.map((worker) => (
                      <tr
                        key={worker._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-900">
                            {worker.fullName || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {worker.phone || "—"}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {worker.email || "—"}
                        </td>

                        <td className="px-6 py-5">
                          {worker.services &&
                          worker.services.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {worker.services.map(
                                (service, index) => (
                                  <span
                                    key={`${worker._id}-${index}`}
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

                        <td className="px-6 py-5">
                          {worker.isAvailable ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Available
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Unavailable
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {worker.address ? (
                            <div className="space-y-1">
                              <p>
                                {worker.address.houseNumber || ""}
                                {worker.address.street
                                  ? `, ${worker.address.street}`
                                  : ""}
                              </p>

                              <p>
                                {worker.address.city || ""}
                                {worker.address.state
                                  ? `, ${worker.address.state}`
                                  : ""}
                              </p>

                              <p>
                                PIN:{" "}
                                {worker.address.pinCode || "—"}
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        {isPrimaryAdmin && (
                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveWorker(worker)
                              }
                              disabled={
                                removingWorkerId === worker._id
                              }
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {removingWorkerId === worker._id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          </td>
                        )}
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

export default AdminWorkers;