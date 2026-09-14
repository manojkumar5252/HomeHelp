import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminCreateAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // =====================================================
  // PROTECT PAGE
  // =====================================================

  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");
    const adminData = sessionStorage.getItem("admin");

    if (!adminId || !adminData) {
      alert("Please login as an admin first.");
      navigate("/admin-login", { replace: true });
      return;
    }

    try {
      const admin = JSON.parse(adminData);

      // Only the primary admin can access this page.
      if (!admin.isPrimaryAdmin) {
        alert("You do not have permission to create another admin.");
        navigate("/admin-dashboard", { replace: true });
        return;
      }

      setCheckingAccess(false);
    } catch (error) {
      console.error("Admin session check error:", error);

      sessionStorage.removeItem("adminId");
      sessionStorage.removeItem("admin");

      alert("Your admin session is invalid. Please login again.");
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE ADMIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (formData.password.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const adminId = sessionStorage.getItem("adminId");

      if (!adminId) {
        alert("Admin session expired. Please login again.");
        navigate("/admin-login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/create-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password.trim(),
            createdBy: adminId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create admin account."
        );
      }

      alert("New admin account created successfully.");

      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
      });

      navigate("/admin-dashboard", { replace: true });
    } catch (error) {
      console.error("Create admin error:", error);
      alert(error.message || "Failed to create admin account.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING / ACCESS CHECK
  // =====================================================

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="text-sm font-medium text-gray-600">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={() =>
              navigate("/admin-dashboard", { replace: true })
            }
            className="text-left"
          >
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin-dashboard", { replace: true })
            }
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Administration
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Create Another Admin
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Create a new HomeHelp administrator account. The new
            administrator can use these credentials to log in normally.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                autoComplete="tel"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Password must be at least 6 characters.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Admin..." : "Create Admin"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  navigate("/admin-dashboard", { replace: true })
                }
                className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm leading-6 text-blue-900">
            <strong>Admin access:</strong> The new administrator will
            log in through the normal Admin Login page using the email
            and password created here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default AdminCreateAdmin;