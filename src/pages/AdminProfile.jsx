import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingAdminId, setRemovingAdminId] = useState(null);

  useEffect(() => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      alert("Please login as an admin first.");
      navigate("/admin-login", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/${adminId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load admin profile."
          );
        }

        setProfile(data);
      } catch (error) {
        console.error("Admin profile error:", error);
        alert(error.message || "Failed to load admin profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // REMOVE ADMIN
  // =====================================================

  const handleRemoveAdmin = async (admin) => {
    const adminId = sessionStorage.getItem("adminId");

    if (!adminId) {
      alert("Admin session expired. Please login again.");
      navigate("/admin-login", { replace: true });
      return;
    }

    if (!profile?.isPrimaryAdmin) {
      alert("Only the super administrator can remove admins.");
      return;
    }

    if (admin.isPrimaryAdmin) {
      alert("The super administrator cannot be removed.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${
        admin.fullName || "this admin"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingAdminId(admin._id);

      const response = await fetch(
        `http://localhost:5000/api/admin/admins/${admin._id}`,
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
          data.message || "Failed to remove admin."
        );
      }

      // Remove the admin from the current list immediately
      setProfile((currentProfile) => ({
        ...currentProfile,
        admins: (currentProfile.admins || []).filter(
          (item) => item._id !== admin._id
        ),
        totalAdmins: Math.max(
          0,
          (currentProfile.totalAdmins || 0) - 1
        ),
      }));

      alert("Admin removed successfully.");
    } catch (error) {
      console.error("Remove admin error:", error);
      alert(error.message || "Failed to remove admin.");
    } finally {
      setRemovingAdminId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="text-sm font-medium text-gray-600">
            Loading admin profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Profile unavailable
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/admin-dashboard", { replace: true })
            }
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Administration
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            My Profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            View your HomeHelp administrator account information.
          </p>
        </div>

        {/* PERSONAL PROFILE */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* PROFILE ICON */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              👤
            </div>

            {/* NAME + ROLE */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profile.fullName}
              </h3>

              <div className="mt-2">
                {profile.isPrimaryAdmin ? (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                    👑 Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="mt-8 grid gap-5 border-t border-gray-100 pt-8 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Full Name
              </p>

              <p className="mt-2 text-base font-semibold text-gray-900">
                {profile.fullName || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Phone Number
              </p>

              <p className="mt-2 text-base font-semibold text-gray-900">
                {profile.phone || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </p>

              <p className="mt-2 break-all text-base font-semibold text-gray-900">
                {profile.email}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Account Created
              </p>

              <p className="mt-2 text-base font-semibold text-gray-900">
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* SUPER ADMIN SECTION */}
        {profile.isPrimaryAdmin && (
          <section className="mt-8">
            {/* SECTION HEADER */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Super Admin
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                  Administrator Management
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage all HomeHelp administrator accounts.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                  Total Admins
                </p>

                <p className="mt-1 text-3xl font-bold text-purple-900">
                  {profile.totalAdmins || 0}
                </p>
              </div>
            </div>

            {/* ADMIN LIST */}
            <div className="space-y-4">
              {profile.admins && profile.admins.length > 0 ? (
                profile.admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* ADMIN NAME */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                          👤
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {admin.fullName}
                          </h4>

                          {admin.isPrimaryAdmin ? (
                            <span className="mt-1 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                              👑 Super Admin
                            </span>
                          ) : (
                            <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ADMIN DETAILS */}
                      <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {admin.phone || "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                            {admin.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Created
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDate(admin.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* REMOVE ADMIN */}
                      {!admin.isPrimaryAdmin && (
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveAdmin(admin)
                            }
                            disabled={
                              removingAdminId === admin._id
                            }
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {removingAdminId === admin._id
                              ? "Removing..."
                              : "Remove Admin"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    No administrator accounts found.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminProfile;