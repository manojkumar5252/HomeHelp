import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../api";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotification, setNewNotification] = useState(null);

  const notificationDropdownRef = useRef(null);
  const knownNotificationIds = useRef(new Set());
  const notificationRequestInProgress = useRef(false);

  // ======================================================
  // PROTECT CUSTOMER DASHBOARD
  // ======================================================
  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Please login as a customer first.");
      navigate("/customer-login");
    }
  }, [navigate]);

  // ======================================================
  // FETCH CUSTOMER NOTIFICATIONS
  // ======================================================
  const fetchNotifications = async () => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      return;
    }

    // Prevent overlapping requests
    if (notificationRequestInProgress.current) {
      return;
    }

    notificationRequestInProgress.current = true;

    try {
      const response = await fetch(
        `${API_URL}/api/customers/${customerId}/notifications`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to fetch customer notifications:",
          data.message
        );
        return;
      }

      const fetchedNotifications = data.notifications || [];

      // ==================================================
      // DETECT NEW NOTIFICATIONS
      // ==================================================
      const newNotifications = fetchedNotifications.filter(
        (notification) =>
          !knownNotificationIds.current.has(notification._id)
      );

      if (newNotifications.length > 0) {
        // API returns newest notifications first.
        const newestNotification = newNotifications[0];

        console.log(
          "🔔 NEW CUSTOMER NOTIFICATION:",
          newestNotification
        );

        setNewNotification(newestNotification);
      }

      // Remember all currently received notification IDs
      fetchedNotifications.forEach((notification) => {
        knownNotificationIds.current.add(notification._id);
      });

      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error(
        "Customer notification fetch error:",
        error
      );
    } finally {
      notificationRequestInProgress.current = false;
    }
  };

  // ======================================================
  // INITIAL LOAD + POLLING
  // ======================================================
  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Check every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // MARK NOTIFICATION AS READ
  // ======================================================
  const markNotificationAsRead = async (notificationId) => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId || !notificationId) {
      return;
    }

    try {
      const response = await fetch(
       `${API_URL}/api/customers/${customerId}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Failed to mark notification as read:",
          data.message
        );
        return;
      }

      setNotifications((previousNotifications) =>
        previousNotifications.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );

      knownNotificationIds.current.delete(notificationId);
    } catch (error) {
      console.error(
        "Mark customer notification error:",
        error
      );
    }
  };

  // ======================================================
  // CLOSE NEW NOTIFICATION POPUP
  // ======================================================
  const closeNotificationPopup = async () => {
    if (newNotification?._id) {
      await markNotificationAsRead(newNotification._id);
    }

    setNewNotification(null);
  };

  // ======================================================
  // CLOSE NOTIFICATION DROPDOWN WHEN CLICKING OUTSIDE
  // ======================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================
  const handleLogout = () => {
    sessionStorage.removeItem("customerId");
    sessionStorage.removeItem("selectedServices");
    sessionStorage.removeItem("estimatedServiceTotal");

    alert("Logged out successfully.");

    navigate("/customer-login");
  };

  // ======================================================
  // DASHBOARD OPTIONS
  // ======================================================
  const dashboardItems = [
    {
      icon: "🧹",
      title: "Services",
      description:
        "View the household services available through HomeHelp.",
      action: "View Services",
    },
    {
      icon: "📅",
      title: "Book Service",
      description:
        "Select your services, choose your service location, and find suitable workers.",
      action: "Book Now",
    },
    {
      icon: "📋",
      title: "My Bookings",
      description:
        "View your current, upcoming, completed, and previous bookings.",
      action: "View Bookings",
    },
    {
      icon: "📍",
      title: "My Address",
      description:
        "View and update your saved house and address details.",
      action: "Manage Address",
    },
  ];

  // ======================================================
  // DASHBOARD ACTIONS
  // ======================================================
  const handleAction = (title) => {
    if (title === "Services") {
      navigate("/customer-services");
      return;
    }

    if (title === "Book Service") {
      navigate("/services");
      return;
    }

    if (title === "My Bookings") {
      navigate("/customer-bookings");
      return;
    }

    if (title === "My Address") {
      navigate("/customer-house-details");
      return;
    }
  };

  // ======================================================
  // NOTIFICATION ICON
  // ======================================================
  const getNotificationIcon = (type) => {
    if (type === "Booking Accepted") {
      return "✅";
    }

    if (type === "Booking Started") {
      return "🔄";
    }

    if (type === "Booking Completed") {
      return "🎉";
    }

    if (type === "Booking Cancelled") {
      return "❌";
    }

    return "🔔";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================================================
          HEADER
      ================================================== */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div
              ref={notificationDropdownRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (previous) => !previous
                  )
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl transition hover:bg-gray-50"
                aria-label="Notifications"
              >
                🔔

                {/* Unread Count */}
                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {notifications.length > 9
                      ? "9+"
                      : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">
                        Notifications
                      </h3>

                      {notifications.length > 0 && (
                        <span className="text-xs font-medium text-blue-600">
                          {notifications.length} unread
                        </span>
                      )}
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <div className="text-3xl">🔔</div>

                      <p className="mt-3 text-sm font-semibold text-gray-700">
                        No new notifications
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        You're all caught up.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(
                        (notification) => (
                          <button
                            key={notification._id}
                            type="button"
                            onClick={() =>
                              markNotificationAsRead(
                                notification._id
                              )
                            }
                            className="w-full border-b border-gray-100 px-4 py-4 text-left transition hover:bg-gray-50"
                          >
                            <div className="flex gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                                {getNotificationIcon(
                                  notification.type
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">
                                  {notification.type}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                  {notification.message}
                                </p>

                                <p className="mt-2 text-[11px] text-gray-400">
                                  {notification.createdAt
                                    ? new Date(
                                        notification.createdAt
                                      ).toLocaleString()
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Section */}
        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-sm sm:p-10">
          <p className="text-sm font-medium text-blue-100">
            Customer Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome back! 👋
          </h2>

          <p className="mt-3 max-w-2xl text-blue-50">
            Manage your services, bookings, and address from
            one place.
          </p>
        </div>

        {/* Dashboard Options */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {dashboardItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                {item.title}
              </h3>

              {/* Description */}
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                {item.description}
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={() =>
                  handleAction(item.title)
                }
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>

            <div>
              <h3 className="font-bold text-gray-900">
                How HomeHelp works
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Choose the household services you need,
                provide your service location, and HomeHelp
                will help you find suitable workers based on
                their services, availability, distance, and
                other matching factors.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ==================================================
          NEW NOTIFICATION POPUP
      ================================================== */}
      {newNotification && (
        <div className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] max-w-sm">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                {getNotificationIcon(
                  newNotification.type
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {newNotification.type}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {newNotification.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeNotificationPopup}
                    className="text-gray-400 transition hover:text-gray-700"
                    aria-label="Close notification"
                  >
                    ✕
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeNotificationPopup}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;