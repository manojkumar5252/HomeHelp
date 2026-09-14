import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWorkers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);

  // =====================================================
  // PROTECT ADMIN DASHBOARD AND LOAD ADMIN ACCESS
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

      setIsPrimaryAdmin(admin.isPrimaryAdmin === true);
    } catch (error) {
      console.error("Admin session data error:", error);

      sessionStorage.removeItem("adminId");
      sessionStorage.removeItem("admin");

      alert("Your admin session is invalid. Please login again.");
      navigate("/admin-login", { replace: true });
      return;
    }

    // ===================================================
    // FETCH DASHBOARD STATISTICS
    // ===================================================

    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError("");

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard-stats"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard statistics."
          );
        }

        setStats(data);
      } catch (error) {
        console.error("Admin dashboard stats error:", error);
        setStatsError(error.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  // =====================================================
  // DASHBOARD ITEMS
  // =====================================================

  const dashboardItems = [
    {
      icon: "💰",
      title: "Service Pricing",
      description:
        "Set and manage the estimated price for all HomeHelp services.",
      action: "Manage Pricing",
    },
    {
      icon: "🚗",
      title: "Travel Pricing",
      description:
        "Configure automatic travel charges based on worker distance.",
      action: "Manage Travel",
    },
    {
      icon: "🏷️",
      title: "Platform Fee",
      description:
        "Set and manage the HomeHelp platform fee based on the estimated job amount.",
      action: "Manage Platform Fee",
    },
    {
      icon: "👷",
      title: "Workers",
      description:
        "View workers, their services, locations, and availability.",
      action: "View Workers",
    },
    {
      icon: "👤",
      title: "Customers",
      description:
        "View and manage registered HomeHelp customers.",
      action: "View Customers",
    },
    {
      icon: "📋",
      title: "Bookings",
      description:
        "View and manage customer bookings and job requests.",
      action: "View Bookings",
    },

    // ===================================================
    // MY PROFILE
    // ===================================================

    {
      icon: "🧑‍💼",
      title: "My Profile",
      description:
        "View your admin profile, contact details, role, and account information.",
      action: "View Profile",
    },
  ];

  // =====================================================
  // ADD CREATE ADMIN ONLY FOR PRIMARY ADMIN
  // =====================================================

  if (isPrimaryAdmin) {
    dashboardItems.push({
      icon: "👑",
      title: "Create Another Admin",
      description:
        "Create a new HomeHelp administrator account for platform management.",
      action: "Create Admin",
    });
  }

  // =====================================================
  // HANDLE DASHBOARD ACTIONS
  // =====================================================

  const handleAction = (title) => {
    if (title === "Service Pricing") {
      navigate("/admin-service-pricing");
      return;
    }

    if (title === "Travel Pricing") {
      navigate("/admin-travel-pricing");
      return;
    }

    if (title === "Platform Fee") {
      navigate("/admin-platform-fee");
      return;
    }

    if (title === "Workers") {
      navigate("/admin-workers");
      return;
    }

    if (title === "Customers") {
      navigate("/admin-customers");
      return;
    }

    if (title === "Bookings") {
      navigate("/admin-bookings");
      return;
    }

    if (title === "My Profile") {
      navigate("/admin-profile");
      return;
    }

    if (title === "Create Another Admin") {
      navigate("/admin-create-admin", { replace: true });
      return;
    }
  };

  // =====================================================
  // ADMIN LOGOUT
  // =====================================================

  const handleLogout = () => {
    sessionStorage.removeItem("adminId");
    sessionStorage.removeItem("admin");

    alert("Admin logged out successfully.");

    navigate("/admin-login", { replace: true });
  };

  // =====================================================
  // STATISTICS CARDS
  // =====================================================

  const statCards = [
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: "👤",
    },
    {
      label: "Total Workers",
      value: stats.totalWorkers,
      icon: "👷",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: "📋",
    },
    {
      label: "Pending",
      value: stats.pendingBookings,
      icon: "⏳",
    },
    {
      label: "Accepted",
      value: stats.acceptedBookings,
      icon: "✅",
    },
    {
      label: "In Progress",
      value: stats.inProgressBookings,
      icon: "🔧",
    },
    {
      label: "Completed",
      value: stats.completedBookings,
      icon: "🎉",
    },
    {
      label: "Cancelled",
      value: stats.cancelledBookings,
      icon: "❌",
    },
  ];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-sm sm:p-10">
          <p className="text-sm font-medium text-blue-100">
            Administration
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome to the Admin Dashboard 👋
          </h2>

          <p className="mt-3 max-w-2xl text-blue-50">
            Manage HomeHelp services, pricing, workers, customers, and
            bookings from one place.
          </p>
        </div>

        {/* Statistics */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Platform Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current HomeHelp platform statistics.
            </p>
          </div>

          {statsError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {statsError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    {card.icon}
                  </div>

                  <span className="text-2xl font-bold text-gray-900">
                    {loadingStats ? "..." : card.value}
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-500">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Cards */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage HomeHelp platform operations.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboardItems.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  {item.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                  {item.description}
                </p>

                <button
                  onClick={() => handleAction(item.title)}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Reminder */}
        <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>

            <div>
              <h3 className="font-bold text-gray-900">
                Pricing Control
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Workers do not set their own prices. HomeHelp administrators
                control service pricing, travel pricing, and platform fees.
                Customers will receive an estimated total based on these
                rules.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;