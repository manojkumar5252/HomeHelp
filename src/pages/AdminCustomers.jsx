import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [removingCustomerId, setRemovingCustomerId] = useState(null);

  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");
    const storedAdmin = sessionStorage.getItem("admin");

    if (!adminId) {
      alert("Please login as an admin first.");
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

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/customers`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load customers."
          );
        }

        setCustomers(data);
      } catch (error) {
        console.error("Admin customers error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // REMOVE CUSTOMER
  // =====================================================

  const handleRemoveCustomer = async (customer) => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      alert("Admin session expired. Please login again.");
      navigate("/admin-login");
      return;
    }

    if (!isPrimaryAdmin) {
      alert("Only the super administrator can remove customers.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${customer.fullName || "this customer"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingCustomerId(customer._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer._id}`,
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
          data.message || "Failed to remove customer."
        );
      }

      // Remove the deleted customer immediately from the UI
      setCustomers((currentCustomers) =>
        currentCustomers.filter(
          (item) => item._id !== customer._id
        )
      );

      alert("Customer removed successfully.");
    } catch (error) {
      console.error("Remove customer error:", error);
      setError(error.message);
    } finally {
      setRemovingCustomerId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Admin • Customers
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin-dashboard")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-sm sm:p-10">
          <p className="text-sm font-medium text-blue-100">
            Customer Management
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Registered Customers
          </h2>

          <p className="mt-3 max-w-2xl text-blue-50">
            View HomeHelp customers, their contact information,
            saved addresses, and registration details.
          </p>
        </div>

        {/* Summary */}
        <section className="mt-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Customers
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900">
              {loading ? "..." : customers.length}
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Customers */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All registered HomeHelp customers.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Loading customers...
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="text-4xl">👤</div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No customers found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                There are currently no registered customers.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Contact
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Address
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Registered
                        </th>

                        {isPrimaryAdmin && (
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {customers.map((customer) => {
                        const address = customer.address || {};

                        return (
                          <tr
                            key={customer._id}
                            className="transition hover:bg-gray-50"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                  👤
                                </div>

                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {customer.fullName || "—"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-400">
                                    ID: {customer._id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-medium text-gray-800">
                                {customer.phone || "—"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {customer.email || "—"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-medium text-gray-800">
                                {[
                                  address.houseNumber,
                                  address.street,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "—"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {[
                                  address.city,
                                  address.state,
                                  address.pinCode,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "—"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-medium text-gray-800">
                                {formatDate(customer.createdAt)}
                              </p>
                            </td>

                            {isPrimaryAdmin && (
                              <td className="px-6 py-5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveCustomer(customer)
                                  }
                                  disabled={
                                    removingCustomerId ===
                                    customer._id
                                  }
                                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {removingCustomerId ===
                                  customer._id
                                    ? "Removing..."
                                    : "Remove"}
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile / tablet cards */}
              <div className="grid gap-5 lg:hidden">
                {customers.map((customer) => {
                  const address = customer.address || {};

                  return (
                    <div
                      key={customer._id}
                      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                          👤
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">
                            {customer.fullName || "—"}
                          </h3>

                          <p className="mt-1 break-all text-xs text-gray-400">
                            ID: {customer._id}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {customer.phone || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-600">
                            {customer.email || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Address
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {[
                              address.houseNumber,
                              address.street,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {[
                              address.city,
                              address.state,
                              address.pinCode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Registered
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {formatDate(customer.createdAt)}
                          </p>
                        </div>

                        {isPrimaryAdmin && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCustomer(customer)
                              }
                              disabled={
                                removingCustomerId === customer._id
                              }
                              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {removingCustomerId === customer._id
                                ? "Removing..."
                                : "Remove Customer"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminCustomers;