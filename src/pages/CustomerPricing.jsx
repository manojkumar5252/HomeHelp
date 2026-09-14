import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";

function CustomerPricing() {
  const navigate = useNavigate();

  const [selectedServices, setSelectedServices] = useState([]);
  const [servicePrices, setServicePrices] = useState({});
  const [customer, setCustomer] = useState(null);

  // Current map-selected service location
  const [serviceLocation, setServiceLocation] = useState(null);

  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [agreeToBooking, setAgreeToBooking] = useState(false);

  // ============================================================
  // SERVICE NAME -> BACKEND PRICING KEY
  // ============================================================
  const serviceKeyMap = {
    "Surface Cleaning": "surfaceCleaning",
    "Floor Care": "floorCare",
    "Deep Cleaning": "deepCleaning",
    "Tidying Up": "tidyingUp",
    "Meal Prep": "mealPrep",
    "Dish Care": "dishCare",
    "Kitchen Upkeep": "kitchenUpkeep",
    Washing: "washing",
    Drying: "drying",
    "Post-Wash Care": "postWashCare",
    Linens: "linens",
  };

  // ============================================================
  // LOAD CUSTOMER / SERVICES / LOCATION / PRICING
  // ============================================================
  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Please login as a customer first.");
      navigate("/customer-login");
      return;
    }

    // ==========================================================
    // LOAD SELECTED SERVICES
    // ==========================================================
    const savedServices =
      sessionStorage.getItem("selectedServices");

    if (savedServices) {
      try {
        const parsedServices = JSON.parse(savedServices);

        if (Array.isArray(parsedServices)) {
          setSelectedServices(parsedServices);
        } else {
          setSelectedServices([]);
        }
      } catch (error) {
        console.error(
          "Failed to read selected services:",
          error
        );

        setSelectedServices([]);
      }
    }

    // ==========================================================
    // LOAD CUSTOMER FROM SESSION STORAGE
    // ==========================================================
    const savedCustomer =
      sessionStorage.getItem("customer");

    if (savedCustomer) {
      try {
        const parsedCustomer =
          JSON.parse(savedCustomer);

        setCustomer(parsedCustomer);

        if (
          parsedCustomer.serviceLocation &&
          parsedCustomer.serviceLocation.latitude !== null &&
          parsedCustomer.serviceLocation.longitude !== null
        ) {
          setServiceLocation(
            parsedCustomer.serviceLocation
          );
        }
      } catch (error) {
        console.error(
          "Failed to read customer data:",
          error
        );
      }
    }

    // ==========================================================
    // LOAD SERVICE LOCATION FROM SESSION STORAGE
    // ==========================================================
    const savedServiceLocation =
      sessionStorage.getItem("serviceLocation");

    if (savedServiceLocation) {
      try {
        const parsedLocation =
          JSON.parse(savedServiceLocation);

        if (
          parsedLocation &&
          parsedLocation.latitude !== undefined &&
          parsedLocation.longitude !== undefined
        ) {
          const normalizedLocation = {
            type: "map",
            latitude: Number(
              parsedLocation.latitude
            ),
            longitude: Number(
              parsedLocation.longitude
            ),
          };

          setServiceLocation(
            normalizedLocation
          );
        }
      } catch (error) {
        console.error(
          "Failed to read service location:",
          error
        );
      }
    }

    // ==========================================================
    // GET LATEST CUSTOMER DATA
    // ==========================================================
    fetch(
    `${API_URL}/api/customers/${customerId}/house-details`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch customer details."
          );
        }

        return response.json();
      })
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);

          sessionStorage.setItem(
            "customer",
            JSON.stringify(data.customer)
          );

          // ====================================================
          // LOAD SERVICE LOCATION FROM CUSTOMER DOCUMENT
          // ====================================================
          if (
            data.customer.serviceLocation &&
            data.customer.serviceLocation.latitude !== null &&
            data.customer.serviceLocation.longitude !== null
          ) {
            const normalizedLocation = {
              type:
                data.customer.serviceLocation.type ||
                "map",

              latitude: Number(
                data.customer.serviceLocation.latitude
              ),

              longitude: Number(
                data.customer.serviceLocation.longitude
              ),
            };

            setServiceLocation(
              normalizedLocation
            );

            sessionStorage.setItem(
              "serviceLocation",
              JSON.stringify(
                normalizedLocation
              )
            );
          }
        }

        // ========================================================
        // FALLBACK SERVICE LOCATION
        // ========================================================
        if (
          !data.customer?.serviceLocation &&
          data.serviceLocation &&
          data.serviceLocation.latitude !== null &&
          data.serviceLocation.longitude !== null
        ) {
          const normalizedLocation = {
            type:
              data.serviceLocation.type ||
              "map",

            latitude: Number(
              data.serviceLocation.latitude
            ),

            longitude: Number(
              data.serviceLocation.longitude
            ),
          };

          setServiceLocation(
            normalizedLocation
          );

          sessionStorage.setItem(
            "serviceLocation",
            JSON.stringify(
              normalizedLocation
            )
          );
        }
      })
      .catch((error) => {
        console.error(
          "Failed to load customer details:",
          error
        );
      })
      .finally(() => {
        setLoadingCustomer(false);
      });

    // ==========================================================
    // LOAD LATEST SERVICE PRICING
    // ==========================================================
    fetch(
      `${API_URL}/api/pricing`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch pricing."
          );
        }

        return response.json();
      })
      .then((data) => {
        setServicePrices(
          data.services || {}
        );
      })
      .catch((error) => {
        console.error(
          "Failed to load pricing:",
          error
        );
      })
      .finally(() => {
        setLoadingPricing(false);
      });
  }, [navigate]);

  // ============================================================
  // GET INDIVIDUAL SERVICE PRICE
  // ============================================================
  const getServicePrice = (service) => {
    const serviceKey =
      serviceKeyMap[service];

    return (
      Number(servicePrices[serviceKey]) || 0
    );
  };

  // ============================================================
  // SERVICE TOTAL
  // ============================================================
  const serviceTotal =
    selectedServices.reduce(
      (total, service) =>
        total + getServicePrice(service),
      0
    );

  // ============================================================
  // CUSTOMER ADDRESS / HOUSE DETAILS
  // ============================================================
  const address =
    customer?.address;

  const houseDetails =
    customer?.houseDetails;

  // ============================================================
  // TODAY'S DATE
  // ============================================================
  const getTodayDate = () => {
    const today = new Date();

    const year =
      today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================================
  // BACK TO SERVICE LOCATION
  // ============================================================
  const handleBack = () => {
    navigate(
      "/customer-service-location"
    );
  };

  // ============================================================
  // CONFIRM BOOKING
  // ============================================================
  const handleConfirmBooking = async () => {
    const customerId =
      sessionStorage.getItem("customerId");

    if (!customerId) {
      alert(
        "Customer account not found. Please login again."
      );

      navigate("/customer-login");
      return;
    }

    // ==========================================================
    // VALIDATE SERVICES
    // ==========================================================
    if (
      selectedServices.length < 3 ||
      selectedServices.length > 6
    ) {
      alert(
        "Please select between 3 and 6 services."
      );

      navigate("/services");
      return;
    }

    // ==========================================================
    // VALIDATE SERVICE LOCATION
    // ==========================================================
    if (
      !serviceLocation ||
      serviceLocation.latitude === undefined ||
      serviceLocation.longitude === undefined
    ) {
      alert(
        "Service location is missing. Please select your service location again."
      );

      navigate(
        "/customer-service-location"
      );

      return;
    }

    // ==========================================================
    // VALIDATE DATE
    // ==========================================================
    if (!bookingDate) {
      alert(
        "Please select a booking date."
      );

      return;
    }

    // ==========================================================
    // VALIDATE TIME
    // ==========================================================
    if (!bookingTime) {
      alert(
        "Please select a booking time."
      );

      return;
    }

    // ==========================================================
    // VALIDATE CONFIRMATION
    // ==========================================================
    if (!agreeToBooking) {
      alert(
        "Please confirm that the booking details are correct."
      );

      return;
    }

    // ==========================================================
    // VALIDATE PRICE
    // ==========================================================
    if (serviceTotal <= 0) {
      alert(
        "Unable to calculate the service total. Please check the pricing."
      );

      return;
    }

    setBookingLoading(true);

    try {
      // ========================================================
      // PREPARE SERVICE LOCATION
      // ========================================================
      const customerServiceLocation = {
        type: "map",
        latitude: Number(
          serviceLocation.latitude
        ),
        longitude: Number(
          serviceLocation.longitude
        ),
      };

      // ========================================================
      // SAVE SERVICE LOCATION TO CUSTOMER
      // ========================================================
      console.log(
        "========== SAVING CUSTOMER SERVICE LOCATION =========="
      );

      console.log(
        customerServiceLocation
      );

      const locationResponse =
        await fetch(
          `${API_URL}/api/customers/${customerId}/service-location`
          ,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              customerServiceLocation
            ),
          }
        );

      const locationResult =
        await locationResponse.json();

      if (!locationResponse.ok) {
        throw new Error(
          locationResult.message ||
            "Failed to save customer service location."
        );
      }

      console.log(
        "CUSTOMER SERVICE LOCATION SAVED:"
      );

      console.log(
        locationResult.customer
          ?.serviceLocation
      );

      console.log(
        "======================================================"
      );

      // ========================================================
      // GET EXACT LOCATION RETURNED BY BACKEND
      // ========================================================
      let savedServiceLocation =
        customerServiceLocation;

      if (
        locationResult.customer
          ?.serviceLocation
      ) {
        savedServiceLocation = {
          type:
            locationResult.customer
              .serviceLocation.type ||
            "map",

          latitude: Number(
            locationResult.customer
              .serviceLocation.latitude
          ),

          longitude: Number(
            locationResult.customer
              .serviceLocation.longitude
          ),
        };
      }

      // ========================================================
      // UPDATE FRONTEND STATE
      // ========================================================
      setServiceLocation(
        savedServiceLocation
      );

      // ========================================================
      // UPDATE SESSION STORAGE
      // ========================================================
      sessionStorage.setItem(
        "serviceLocation",
        JSON.stringify(
          savedServiceLocation
        )
      );

      // ========================================================
      // UPDATE CUSTOMER DATA
      // ========================================================
      if (locationResult.customer) {
        setCustomer(
          locationResult.customer
        );

        sessionStorage.setItem(
          "customer",
          JSON.stringify(
            locationResult.customer
          )
        );
      }

      // ========================================================
      // CREATE BOOKING DATA
      // ========================================================
      const bookingData = {
        customerId,

        selectedServices,

        serviceTotal,

        bookingDate,

        bookingTime,

        address:
          address || {},

        houseDetails:
          houseDetails || {},

        serviceLocation:
          savedServiceLocation,
      };

      // ========================================================
      // DEBUG BOOKING DATA
      // ========================================================
      console.log(
        "========== BOOKING DATA =========="
      );

      console.log(
        bookingData
      );

      console.log(
        "SERVICE LOCATION:",
        savedServiceLocation
      );

      console.log(
        "BOOKING DATE:",
        bookingDate
      );

      console.log(
        "BOOKING TIME:",
        bookingTime
      );

      console.log(
        "SERVICE TOTAL:",
        serviceTotal
      );

      console.log(
        "=================================="
      );

      // ========================================================
      // CREATE BOOKING
      // ========================================================
      const response =
        await fetch(
          `${API_URL}/api/bookings`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              bookingData
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create booking."
        );
      }

      if (!data.booking) {
        throw new Error(
          "Booking was created but no booking data was returned."
        );
      }

      // ========================================================
      // SAVE PENDING BOOKING
      // ========================================================
      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify(
          data.booking
        )
      );

      // ========================================================
      // CLEAR SELECTED SERVICES
      // ========================================================
      sessionStorage.removeItem(
        "selectedServices"
      );

      // ========================================================
      // SERVICE LOCATION IS ALREADY SAVED
      // IN CUSTOMER MONGODB DOCUMENT
      // ========================================================
      // Clear temporary booking-flow data after successful booking.
sessionStorage.removeItem("selectedServices");
sessionStorage.removeItem("serviceLocation");

alert("Booking created successfully!");

navigate("/customer-dashboard", { replace: true });} catch (error) {
      console.error(
        "Booking creation error:",
        error
      );

      alert(
        error.message ||
          "Failed to create booking. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loadingCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

          <p className="font-semibold text-gray-900">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tight">
              Home
              <span className="text-blue-600">
                Help
              </span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>

          <span className="text-sm font-semibold text-gray-600">
            Booking Confirmation
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            Step 4 of 4
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Confirm Your Booking
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Review your services, location, date, time,
            and estimated price before confirming your
            booking.
          </p>
        </div>

        {/* ======================================================
            01 SELECTED SERVICES
        ====================================================== */}
        <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                01
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Selected Services
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/services")
              }
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {selectedServices.length === 0 ? (
              <p className="text-gray-500">
                No services selected.
              </p>
            ) : loadingPricing ? (
              <p className="text-gray-500">
                Loading latest pricing...
              </p>
            ) : (
              <>
                {selectedServices.map(
                  (service) => (
                    <div
                      key={service}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-4"
                    >
                      <span className="font-medium text-gray-800">
                        {service}
                      </span>

                      <span className="font-semibold text-gray-900">
                        ₹
                        {getServicePrice(
                          service
                        )}
                      </span>
                    </div>
                  )
                )}

                {/* Service Total */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-5">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-gray-900">
                    ₹{serviceTotal}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ======================================================
            02 SERVICE ADDRESS
        ====================================================== */}
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                02
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Service Address
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/customer-house-details?edit=true"
                )
              }
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          </div>

          {address ? (
            <div className="mt-5 rounded-2xl bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">
                {address.houseNumber}
              </p>

              <p className="mt-1 text-gray-700">
                {address.street}
              </p>

              <p className="mt-1 text-gray-700">
                {address.city},{" "}
                {address.state}
              </p>

              <p className="mt-1 text-gray-700">
                PIN Code:{" "}
                {address.pinCode}
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-red-600">
              House address details are not available.
            </p>
          )}

          {houseDetails && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  House Type
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {houseDetails.houseType}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Bathrooms
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {houseDetails.bathrooms}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Floors
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {houseDetails.floors}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================
            03 SERVICE LOCATION
        ====================================================== */}
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                03
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Service Location
              </h2>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          </div>

          {serviceLocation?.type ===
          "map" ? (
            <div className="mt-5 rounded-2xl bg-blue-50 p-5">
              <p className="font-semibold text-gray-900">
                📍 Map Location Selected
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Latitude:{" "}
                {Number(
                  serviceLocation.latitude
                ).toFixed(6)}
              </p>

              <p className="text-sm text-gray-600">
                Longitude:{" "}
                {Number(
                  serviceLocation.longitude
                ).toFixed(6)}
              </p>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                This location will be used to find nearby
                workers and calculate travel distance.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-red-50 p-5">
              <p className="font-semibold text-red-700">
                Service location not selected.
              </p>

              <button
                type="button"
                onClick={handleBack}
                className="mt-3 text-sm font-semibold text-red-700 underline"
              >
                Select location
              </button>
            </div>
          )}
        </section>

        {/* ======================================================
            04 DATE & TIME
        ====================================================== */}
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              04
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Choose Date & Time
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select when you would like the service to be
              provided.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Service Date
              </label>

              <input
                type="date"
                min={getTodayDate()}
                value={bookingDate}
                onChange={(e) =>
                  setBookingDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Service Time
              </label>

              <input
                type="time"
                value={bookingTime}
                onChange={(e) =>
                  setBookingTime(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* ======================================================
            ESTIMATED PRICE
        ====================================================== */}
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                PRICE
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Estimated Total
              </h2>
            </div>

            <span className="text-3xl font-bold text-gray-900">
              ₹
              {loadingPricing
                ? "..."
                : serviceTotal}
            </span>
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 p-5">
            <p className="font-semibold text-blue-900">
              About this estimate
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              This amount is based on the current service
              pricing. The final booking amount may vary
              depending on the actual work required.
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              The final booking price will be shown in
              My Bookings after a worker accepts your booking.
            </p>
          </div>
        </section>

        {/* ======================================================
            CONFIRMATION
        ====================================================== */}
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreeToBooking}
              onChange={(e) =>
                setAgreeToBooking(
                  e.target.checked
                )
              }
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <span className="text-sm leading-6 text-gray-700">
              I confirm that the selected services, service
              address, service location, date, and time are
              correct.
            </span>
          </label>
        </section>

        {/* ======================================================
            BUTTONS
        ====================================================== */}
        <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={bookingLoading}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Change Location
          </button>

          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={
              loadingPricing ||
              bookingLoading ||
              selectedServices.length < 3 ||
              selectedServices.length > 6 ||
              !serviceLocation ||
              !bookingDate ||
              !bookingTime ||
              !agreeToBooking
            }
            className={`rounded-xl px-7 py-3.5 font-semibold text-white transition ${
              loadingPricing ||
              bookingLoading ||
              selectedServices.length < 3 ||
              selectedServices.length > 6 ||
              !serviceLocation ||
              !bookingDate ||
              !bookingTime ||
              !agreeToBooking
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {bookingLoading
              ? "Creating Booking..."
              : "Confirm Booking →"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default CustomerPricing;