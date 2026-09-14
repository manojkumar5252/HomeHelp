import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

// ===============================
// CUSTOMER PAGES
// ===============================
import CustomerSignup from "./pages/CustomerSignup";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerHouseDetails from "./pages/CustomerHouseDetails";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerServices from "./pages/CustomerServices";
import Services from "./pages/Services";
import CustomerServiceLocation from "./pages/CustomerServiceLocation";
import CustomerPricing from "./pages/CustomerPricing";
import CustomerBookings from "./pages/CustomerBookings";

// ===============================
// WORKER PAGES
// ===============================
import WorkerSignup from "./pages/WorkerSignup";
import WorkerLogin from "./pages/WorkerLogin";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerProfile from "./pages/WorkerProfile";
import WorkerServices from "./pages/WorkerServices";
import WorkerJobs from "./pages/WorkerJobs";
import WorkerAddress from "./pages/WorkerAddress";

// ===============================
// ADMIN PAGES
// ===============================
import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlatformFee from "./pages/AdminPlatformFee";
import AdminServicePricing from "./pages/AdminServicePricing";
import AdminTravelPricing from "./pages/AdminTravelPricing";
import AdminCustomers from "./pages/AdminCustomers";
import AdminWorkers from "./pages/AdminWorkers";
import AdminBookings from "./pages/AdminBookings";
import AdminCreateAdmin from "./pages/AdminCreateAdmin";
import AdminProfile from "./pages/AdminProfile";

// ===============================
// SESSION TIMEOUT
// ===============================

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function SessionTimeout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const customerId =
          sessionStorage.getItem("customerId");

        const workerId =
          sessionStorage.getItem("workerId");

        const adminId =
          sessionStorage.getItem("adminId");

        const currentPath = location.pathname;

        // ===============================
        // CUSTOMER SESSION TIMEOUT
        // ===============================

        if (
          customerId &&
          currentPath.startsWith("/customer")
        ) {
          sessionStorage.removeItem("customerId");
          sessionStorage.removeItem("customer");

          // Clear temporary booking data
          sessionStorage.removeItem("selectedServices");
          sessionStorage.removeItem("serviceLocation");
          sessionStorage.removeItem("pendingBooking");

          alert(
            "Your customer session has expired. Please login again."
          );

          navigate("/customer-login", {
            replace: true,
          });

          return;
        }

        // ===============================
        // WORKER SESSION TIMEOUT
        // ===============================

        if (
          workerId &&
          currentPath.startsWith("/worker")
        ) {
          sessionStorage.removeItem("workerId");
          sessionStorage.removeItem("worker");

          alert(
            "Your worker session has expired. Please login again."
          );

          navigate("/worker-login", {
            replace: true,
          });

          return;
        }

        // ===============================
        // ADMIN SESSION TIMEOUT
        // ===============================

        if (
          adminId &&
          currentPath.startsWith("/admin")
        ) {
          sessionStorage.removeItem("adminId");
          sessionStorage.removeItem("admin");

          alert(
            "Your admin session has expired. Please login again."
          );

          navigate("/admin-login", {
            replace: true,
          });
        }
      }, SESSION_TIMEOUT);
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate, location.pathname]);

  return null;
}

// ===============================
// BOOKING FLOW GUARD
// ===============================

function BookingFlowGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedServices =
      sessionStorage.getItem("selectedServices");

    let selectedServices = [];

    try {
      selectedServices = savedServices
        ? JSON.parse(savedServices)
        : [];
    } catch (error) {
      console.error(
        "Failed to read selected booking services:",
        error
      );

      selectedServices = [];
    }

    // Booking requires 3–6 services
    if (
      !Array.isArray(selectedServices) ||
      selectedServices.length < 3 ||
      selectedServices.length > 6
    ) {
      navigate("/customer-dashboard", {
        replace: true,
      });
    }
  }, [navigate, location.pathname]);

  return children;
}

// ===============================
// CUSTOMER HISTORY GUARD
// ===============================
//
// When a logged-in customer reaches the
// dashboard, the browser Back button is
// prevented from taking them back into
// old login / booking pages.
//
// Example:
//
// Customer Login
//       ↓
// Customer Dashboard
//       ↓
// Services
//       ↓
// Location
//       ↓
// Pricing
//       ↓
// Customer Dashboard
//
// Pressing Back from Dashboard keeps the
// customer on Dashboard.

function CustomerHistoryGuard() {
  const location = useLocation();

  useEffect(() => {
    const customerId =
      sessionStorage.getItem("customerId");

    // Only apply to logged-in customers
    if (!customerId) {
      return;
    }

    // Only protect the customer dashboard
    if (location.pathname !== "/customer-dashboard") {
      return;
    }

    // Create a dashboard history state
    window.history.pushState(
      {
        customerDashboard: true,
      },
      "",
      "/customer-dashboard"
    );

    const handlePopState = () => {
      // Keep the customer on Dashboard
      window.history.pushState(
        {
          customerDashboard: true,
        },
        "",
        "/customer-dashboard"
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [location.pathname]);

  return null;
}

// ===============================
// MAIN APP
// ===============================

function App() {
  return (
    <BrowserRouter>
      {/* ==========================
          SESSION TIMEOUT
          ========================== */}
      <SessionTimeout />

      {/* ==========================
          CUSTOMER HISTORY PROTECTION
          ========================== */}
      <CustomerHistoryGuard />

      <Routes>

        {/* =================================
            CUSTOMER AUTHENTICATION
            ================================= */}

        <Route
          path="/customer-signup"
          element={<CustomerSignup />}
        />

        <Route
          path="/customer-login"
          element={<CustomerLogin />}
        />

        {/* =================================
            CUSTOMER HOUSE DETAILS
            ================================= */}

        <Route
          path="/customer-house-details"
          element={<CustomerHouseDetails />}
        />

        {/* =================================
            CUSTOMER DASHBOARD
            ================================= */}

        <Route
          path="/customer-dashboard"
          element={<CustomerDashboard />}
        />

        {/* =================================
            CUSTOMER SERVICES
            ================================= */}

        <Route
          path="/customer-services"
          element={<CustomerServices />}
        />

        {/* =================================
            CUSTOMER BOOKING
            ================================= */}

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/customer-service-location"
          element={
            <BookingFlowGuard>
              <CustomerServiceLocation />
            </BookingFlowGuard>
          }
        />

        <Route
          path="/customer-pricing"
          element={
            <BookingFlowGuard>
              <CustomerPricing />
            </BookingFlowGuard>
          }
        />

        {/* =================================
            CUSTOMER BOOKINGS
            ================================= */}

        <Route
          path="/customer-bookings"
          element={<CustomerBookings />}
        />

        {/* =================================
            WORKER AUTHENTICATION
            ================================= */}

        <Route
          path="/worker-signup"
          element={<WorkerSignup />}
        />

        <Route
          path="/worker-login"
          element={<WorkerLogin />}
        />

        {/* =================================
            WORKER DASHBOARD
            ================================= */}

        <Route
          path="/worker-dashboard"
          element={<WorkerDashboard />}
        />

        {/* =================================
            WORKER PROFILE
            ================================= */}

        <Route
          path="/worker-profile"
          element={<WorkerProfile />}
        />

        {/* =================================
            WORKER SERVICES
            ================================= */}

        <Route
          path="/worker-services"
          element={<WorkerServices />}
        />

        {/* =================================
            WORKER JOBS
            ================================= */}

        <Route
          path="/worker-jobs"
          element={<WorkerJobs />}
        />

        {/* =================================
            ADMIN AUTHENTICATION
            ================================= */}

        <Route
          path="/admin-signup"
          element={<AdminSignup />}
        />

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* =================================
            ADMIN DASHBOARD
            ================================= */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        {/* =================================
            ADMIN PLATFORM FEE
            ================================= */}

        <Route
          path="/admin-platform-fee"
          element={<AdminPlatformFee />}
        />

        {/* =================================
            ADMIN SERVICE PRICING
            ================================= */}

        <Route
          path="/admin-service-pricing"
          element={<AdminServicePricing />}
        />

        {/* =================================
            ADMIN TRAVEL PRICING
            ================================= */}

        <Route
          path="/admin-travel-pricing"
          element={<AdminTravelPricing />}
        />

        {/* =================================
            ADMIN CUSTOMERS
            ================================= */}

        <Route
          path="/admin-customers"
          element={<AdminCustomers />}
        />
        <Route
  path="/admin-create-admin"
  element={<AdminCreateAdmin />}
/>

<Route
  path="/worker-address"
  element={<WorkerAddress />}
/>

        {/* =================================
            ADMIN WORKERS
            ================================= */}

        <Route
          path="/admin-workers"
          element={<AdminWorkers />}
        />

        <Route path="/" element={<CustomerLogin />} />

<Route path="/admin-profile" element={<AdminProfile />} />

        {/* =================================
            ADMIN BOOKINGS
            ================================= */}

        <Route
          path="/admin-bookings"
          element={<AdminBookings />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;