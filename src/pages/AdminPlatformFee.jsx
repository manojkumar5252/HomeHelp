import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminPlatformFee() {
  const navigate = useNavigate();

  const [platformFees, setPlatformFees] = useState([]);

  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    fee: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Protect admin page
  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      alert("Please login as an admin first.");
      navigate("/admin-login");
    }
  }, [navigate]);

  const fetchPlatformFees = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/platform-fees`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch platform fee rules.");
        return;
      }

      setPlatformFees(data.platformFees);
    } catch (error) {
      alert("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformFees();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.minAmount === "" || formData.fee === "") {
      alert("Minimum amount and fee are required.");
      return;
    }

    if (
      formData.maxAmount !== "" &&
      Number(formData.maxAmount) < Number(formData.minAmount)
    ) {
      alert("Maximum amount cannot be less than minimum amount.");
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/api/platform-fees/${editingId}`
        : `${API_URL}/api/platform-fees`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          minAmount: Number(formData.minAmount),
          maxAmount:
            formData.maxAmount === ""
              ? null
              : Number(formData.maxAmount),
          fee: Number(formData.fee),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save platform fee.");
        return;
      }

      alert(
        editingId
          ? "Platform fee updated successfully!"
          : "Platform fee added successfully!"
      );

      setFormData({
        minAmount: "",
        maxAmount: "",
        fee: "",
      });

      setEditingId(null);

      fetchPlatformFees();
    } catch (error) {
      alert("Unable to connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (platformFee) => {
    setEditingId(platformFee._id);

    setFormData({
      minAmount: platformFee.minAmount,
      maxAmount:
        platformFee.maxAmount === null
          ? ""
          : platformFee.maxAmount,
      fee: platformFee.fee,
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this platform fee rule?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/platform-fees/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete platform fee.");
        return;
      }

      alert("Platform fee deleted successfully!");

      fetchPlatformFees();
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setFormData({
      minAmount: "",
      maxAmount: "",
      fee: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Platform Fee
            </h1>

            <p className="mt-1 text-gray-600">
              Manage HomeHelp platform fee rules.
            </p>
          </div>

          <Link
            to="/admin-dashboard"
            className="rounded-lg bg-gray-700 px-5 py-2.5 font-medium text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-gray-800">
            {editingId
              ? "Edit Platform Fee Rule"
              : "Add Platform Fee Rule"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-3"
          >
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Minimum Amount (₹)
              </label>

              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                min="0"
                placeholder="Example: 0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Maximum Amount (₹)
              </label>

              <input
                type="number"
                name="maxAmount"
                value={formData.maxAmount}
                onChange={handleChange}
                min="0"
                placeholder="Leave empty for no limit"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Platform Fee (₹)
              </label>

              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                min="0"
                placeholder="Example: 30"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                  ? "Update Fee"
                  : "Add Fee"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-gray-800">
            Current Platform Fee Rules
          </h2>

          {isLoading ? (
            <p className="text-gray-600">
              Loading platform fee rules...
            </p>
          ) : platformFees.length === 0 ? (
            <p className="text-gray-600">
              No platform fee rules found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left">
                      Minimum Amount
                    </th>

                    <th className="px-4 py-3 text-left">
                      Maximum Amount
                    </th>

                    <th className="px-4 py-3 text-left">
                      Platform Fee
                    </th>

                    <th className="px-4 py-3 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {platformFees.map((platformFee) => (
                    <tr
                      key={platformFee._id}
                      className="border-b"
                    >
                      <td className="px-4 py-4">
                        ₹{platformFee.minAmount}
                      </td>

                      <td className="px-4 py-4">
                        {platformFee.maxAmount === null
                          ? "No limit"
                          : `₹${platformFee.maxAmount}`}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        ₹{platformFee.fee}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleEdit(platformFee)
                            }
                            className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(platformFee._id)
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPlatformFee;