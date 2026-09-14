import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API_URL from "../api";

function WorkerDashboard() {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);

  const [isAvailable, setIsAvailable] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // ================= NOTIFICATIONS =================
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [popupNotification, setPopupNotification] = useState(null);

  // IDs that this dashboard has already processed
  const knownNotificationIds = useRef(new Set());

  // Prevent overlapping notification requests
  const notificationRequestInProgress = useRef(false);

  // ================= LOAD WORKER FROM SESSION =================
  useEffect(() => {
    const workerId = sessionStorage.getItem("workerId");
    const savedWorker = sessionStorage.getItem("worker");

    if (!workerId) {
      navigate("/worker-login");
      return;
    }

    if (savedWorker) {
      try {
        const parsedWorker = JSON.parse(savedWorker);

        setWorker(parsedWorker);
        setIsAvailable(Boolean(parsedWorker.isAvailable));

        if (
          parsedWorker.currentLocation &&
          parsedWorker.currentLocation.latitude !== null &&
          parsedWorker.currentLocation.longitude !== null
        ) {
          setWorkerLocation({
            latitude: parsedWorker.currentLocation.latitude,
            longitude: parsedWorker.currentLocation.longitude,
          });
        }
      } catch (error) {
        console.error("Failed to read worker session:", error);
      }
    }

    const savedLocation = sessionStorage.getItem("workerLocation");

    if (savedLocation) {
      try {
        setWorkerLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error("Failed to read saved worker location:", error);
      }
    }
  }, [navigate]);

  // ================= LOAD WORKER NOTIFICATIONS =================
  const fetchNotifications = async () => {
    const workerId = sessionStorage.getItem("workerId");

    if (!workerId) {
      return;
    }

    // Prevent two requests from running at the same time
    if (notificationRequestInProgress.current) {
      return;
    }

    notificationRequestInProgress.current = true;

    try {
      const response = await fetch(
        `${API_URL}/api/workers/${workerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      const incomingNotifications = data.notifications || [];

      // API already returns newest first.
      setNotifications(incomingNotifications);

      // Find notifications that React has never seen before.
      const newNotifications = incomingNotifications.filter(
        (notification) =>
          !knownNotificationIds.current.has(notification._id)
      );

      // Add all returned notification IDs to the known list.
      incomingNotifications.forEach((notification) => {
        knownNotificationIds.current.add(notification._id);
      });

      // ================= SHOW POPUP =================
      if (newNotifications.length > 0) {
        // API returns newest first, so use [0].
        const newestNotification = newNotifications[0];

        console.log(
          "🔔 NEW WORKER NOTIFICATION:",
          newestNotification
        );

        setPopupNotification(newestNotification);
      }
    } catch (error) {
      console.error("Fetch worker notifications error:", error);
    } finally {
      notificationRequestInProgress.current = false;
    }
  };

  // ================= CHECK NOTIFICATIONS =================
  useEffect(() => {
    const workerId = sessionStorage.getItem("workerId");

    if (!workerId) {
      return;
    }

    // Check immediately
    fetchNotifications();

    // Then check every 5 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  // ================= OPEN NOTIFICATION / MY JOBS =================
  const handleNotificationClick = async (notification) => {
    const workerId = sessionStorage.getItem("workerId");

    if (!workerId || !notification?._id) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/workers/${workerId}/notifications/${notification._id}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        console.error(
          "Failed to mark notification as read:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
    }

    // Remove notification from the unread list
    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (item) => item._id !== notification._id
      )
    );

    // Close popup/dropdown
    setPopupNotification(null);
    setShowNotifications(false);

    // Open jobs
    navigate("/worker-jobs");
  };

  // ================= CLOSE POPUP =================
  const closePopup = () => {
    setPopupNotification(null);
  };

  // ================= UPDATE WORKER LOCATION / AVAILABILITY =================
  const updateWorkerLocation = async (location, available) => {
    const workerId = sessionStorage.getItem("workerId");

    if (!workerId) {
      throw new Error("Worker ID not found. Please login again.");
    }

    const response = await fetch(
      `${API_URL}/api/workers/${workerId}/location`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location ? location.latitude : null,
          longitude: location ? location.longitude : null,
          isAvailable: available,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update worker availability."
      );
    }

    return data;
  };

  // ================= AVAILABILITY BUTTON =================
  const handleAvailability = () => {
    // Worker is currently available -> turn offline
    if (isAvailable) {
      setIsUpdating(true);
      setLocationError("");

      updateWorkerLocation(null, false)
        .then((data) => {
          setIsAvailable(false);
          setWorkerLocation(null);

          sessionStorage.removeItem("workerLocation");

          if (data.worker) {
            setWorker(data.worker);

            sessionStorage.setItem(
              "worker",
              JSON.stringify(data.worker)
            );
          }
        })
        .catch((error) => {
          console.error("Worker offline update error:", error);

          setLocationError(
            error.message || "Unable to update availability."
          );
        })
        .finally(() => {
          setIsUpdating(false);
        });

      return;
    }

    // Worker is offline -> detect location and become available
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser."
      );
      return;
    }

    setIsUpdating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        try {
          const data = await updateWorkerLocation(
            location,
            true
          );

          setWorkerLocation(location);
          setIsAvailable(true);

          sessionStorage.setItem(
            "workerLocation",
            JSON.stringify(location)
          );

          if (data.worker) {
            setWorker(data.worker);

            sessionStorage.setItem(
              "worker",
              JSON.stringify(data.worker)
            );
          }
        } catch (error) {
          console.error(
            "Worker location update error:",
            error
          );

          setLocationError(
            error.message ||
              "Unable to save your location."
          );
        } finally {
          setIsUpdating(false);
        }
      },
      (error) => {
        console.error(
          "Worker location detection error:",
          error
        );

        setIsUpdating(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be detected."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to detect your location. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    sessionStorage.removeItem("workerId");
    sessionStorage.removeItem("worker");
    sessionStorage.removeItem("workerLocation");

    navigate("/worker-login");
  };

  // ================= PROTECT PAGE =================
  if (!sessionStorage.getItem("workerId")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          POPUP NOTIFICATION
      ====================================================== */}
      {popupNotification && (
        <div className="fixed right-5 top-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm">
          <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-2xl">

            <div className="flex items-start gap-4 p-5">

              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl">
                🔔
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-base font-bold text-gray-900">
                      New Job Available
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      A new customer service request is available near you.
                    </p>
                  </div>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={closePopup}
                    className="text-lg leading-none text-gray-400 transition hover:text-gray-700"
                    aria-label="Close notification"
                  >
                    ×
                  </button>

                </div>

                {/* Distance */}
                {popupNotification.distance !== undefined && (
                  <p className="mt-2 text-xs font-semibold text-green-600">
                    📍 {popupNotification.distance} km away
                  </p>
                )}

                {/* View Job */}
                <button
                  type="button"
                  onClick={() =>
                    handleNotificationClick(popupNotification)
                  }
                  className="mt-4 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  View Job →
                </button>

              </div>
            </div>

            {/* Bottom indicator */}
            <div className="h-1 bg-green-600" />
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tight">
              Home
              <span className="text-green-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>

          <div className="flex items-center gap-3">

            {/* ================= NOTIFICATION BUTTON ================= */}
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-xl transition hover:bg-gray-50"
                aria-label="Notifications"
              >
                🔔

                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {notifications.length > 9
                      ? "9+"
                      : notifications.length}
                  </span>
                )}
              </button>

              {/* ================= NOTIFICATION DROPDOWN ================= */}
              {showNotifications && (
                <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                  <div className="border-b border-gray-100 px-5 py-4">

                    <div className="flex items-center justify-between">

                      <h3 className="font-bold text-gray-900">
                        Notifications
                      </h3>

                      {notifications.length > 0 && (
                        <span className="text-xs font-semibold text-green-600">
                          {notifications.length} new
                        </span>
                      )}

                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center">

                      <div className="text-3xl">
                        🔕
                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-700">
                        No new notifications
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        New job requests will appear here.
                      </p>

                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">

                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className="border-b border-gray-100 p-4 last:border-b-0"
                        >
                          <div className="flex gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg">
                              📋
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="font-bold text-gray-900">
                                New Job Available
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                A new customer booking matches
                                your services and availability.
                              </p>

                              {notification.distance !==
                                undefined && (
                                <p className="mt-1 text-xs font-medium text-green-600">
                                  📍 {notification.distance} km
                                  away
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                              >
                                View Job →
                              </button>

                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ================= LOGOUT ================= */}
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

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ================= WELCOME ================= */}
        <div className="rounded-3xl bg-green-600 p-8 text-white shadow-sm sm:p-10">

          <p className="text-sm font-medium text-green-100">
            Worker Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome
            {worker?.fullName
              ? `, ${worker.fullName}`
              : ""}{" "}
            👋
          </h2>

          <p className="mt-3 max-w-2xl text-green-50">
            Manage your profile, services, availability, and
            customer jobs from here.
          </p>

        </div>

        {/* ================= AVAILABILITY ================= */}
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-lg font-bold text-gray-900">
                Availability
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Let customers know whether you are currently
                available for service requests.
              </p>

              {workerLocation && (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">

                  <p className="font-semibold">
                    📍 Current Location Detected
                  </p>

                  <p className="mt-1">
                    Latitude:{" "}
                    {Number(
                      workerLocation.latitude
                    ).toFixed(6)}
                  </p>

                  <p>
                    Longitude:{" "}
                    {Number(
                      workerLocation.longitude
                    ).toFixed(6)}
                  </p>

                </div>
              )}

              {locationError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {locationError}
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={handleAvailability}
              disabled={isUpdating}
              className={`w-fit rounded-full px-5 py-2 font-semibold transition ${
                isAvailable
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${
                isUpdating
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              {isUpdating
                ? "Updating..."
                : isAvailable
                ? "🟢 Available"
                : "⚪ Offline"}
            </button>

          </div>
        </div>

        {/* ================= DASHBOARD OPTIONS ================= */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* ================= MY PROFILE ================= */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="text-3xl">
              👤
            </div>

            <h3 className="mt-4 font-bold text-gray-900">
              My Profile
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              View your personal information and saved
              address details.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/worker-profile")
              }
              className="mt-5 text-sm font-semibold text-green-600 transition hover:text-green-700"
            >
              View Profile →
            </button>

          </div>

          {/* ================= MY SERVICES ================= */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="text-3xl">
              🛠️
            </div>

            <h3 className="mt-4 font-bold text-gray-900">
              My Services
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Change the services you offer to customers.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/worker-services?edit=true")
              }
              className="mt-5 text-sm font-semibold text-green-600 transition hover:text-green-700"
            >
              Edit Services →
            </button>

          </div>

          {/* ================= MY JOBS ================= */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="text-3xl">
              📋
            </div>

            <h3 className="mt-4 font-bold text-gray-900">
              My Jobs
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              View and manage customer bookings.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/worker-jobs")
              }
              className="mt-5 text-sm font-semibold text-green-600 transition hover:text-green-700"
            >
              View Jobs →
            </button>

          </div>

        </div>
      </main>
    </div>
  );
}

export default WorkerDashboard;