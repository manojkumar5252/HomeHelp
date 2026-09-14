const Worker = require("../models/Worker");
const WorkerNotification = require("../models/WorkerNotification");

/*
  Calculate distance between two coordinates
  using the Haversine formula.

  Returns distance in kilometers.
*/
function calculateDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadiusKm = 6371;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const deltaLatitude =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const deltaLongitude =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatitude / 2) *
      Math.sin(deltaLatitude / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/*
  Check whether a worker can provide
  ALL services requested in the booking.
*/
function workerMatchesServices(
  workerServices,
  bookingServices
) {
  if (
    !Array.isArray(workerServices) ||
    !Array.isArray(bookingServices)
  ) {
    return false;
  }

  return bookingServices.every((bookingService) =>
    workerServices.includes(bookingService)
  );
}

/*
  Find nearby available workers who:
  1. Are available
  2. Have a valid current location
  3. Can provide all requested services
  4. Are within 5 km of the customer's service location

  Then create a notification for each matching worker.
*/
async function notifyNearbyWorkers(booking) {
  try {
    if (!booking) {
      return {
        success: false,
        message: "Booking is required.",
      };
    }

    const serviceLocation = booking.serviceLocation;

    /*
      Worker matching currently uses the map location
      selected during booking.
    */
    if (
      !serviceLocation ||
      serviceLocation.type !== "map" ||
      serviceLocation.latitude === null ||
      serviceLocation.latitude === undefined ||
      serviceLocation.longitude === null ||
      serviceLocation.longitude === undefined
    ) {
      console.log(
        "Booking does not have a valid map service location."
      );

      return {
        success: false,
        message:
          "Booking does not have a valid map service location.",
      };
    }

    const customerLatitude = Number(
      serviceLocation.latitude
    );

    const customerLongitude = Number(
      serviceLocation.longitude
    );

    if (
      !Number.isFinite(customerLatitude) ||
      !Number.isFinite(customerLongitude)
    ) {
      return {
        success: false,
        message:
          "Customer service location coordinates are invalid.",
      };
    }

    /*
      Only workers who are currently available
      can receive a new booking notification.
    */
    const workers = await Worker.find({
      isAvailable: true,
    });

    console.log(
      `Found ${workers.length} available worker(s).`
    );

    const matchingWorkers = [];

    for (const worker of workers) {
      /*
        Worker must have a valid current location.
      */
      if (
        !worker.currentLocation ||
        worker.currentLocation.latitude === null ||
        worker.currentLocation.latitude === undefined ||
        worker.currentLocation.longitude === null ||
        worker.currentLocation.longitude === undefined
      ) {
        continue;
      }

      const workerLatitude = Number(
        worker.currentLocation.latitude
      );

      const workerLongitude = Number(
        worker.currentLocation.longitude
      );

      if (
        !Number.isFinite(workerLatitude) ||
        !Number.isFinite(workerLongitude)
      ) {
        continue;
      }

      /*
        Worker must be able to provide ALL services
        selected by the customer.
      */
      if (
        !workerMatchesServices(
          worker.services,
          booking.selectedServices
        )
      ) {
        continue;
      }

      /*
        Calculate distance between worker and customer.
      */
      const distance = calculateDistance(
        customerLatitude,
        customerLongitude,
        workerLatitude,
        workerLongitude
      );

      matchingWorkers.push({
        worker,
        distance,
      });
    }

    /*
      Nearest workers first.
    */
    matchingWorkers.sort(
      (a, b) => a.distance - b.distance
    );

    console.log(
      `Found ${matchingWorkers.length} matching worker(s).`
    );

    /*
      Initial notification radius.
      Currently 5 km.
    */
    const initialRadiusKm = 5;

    const nearbyWorkers = matchingWorkers.filter(
      (item) => item.distance <= initialRadiusKm
    );

    console.log(
      `Found ${nearbyWorkers.length} matching worker(s) within ${initialRadiusKm} km.`
    );

    const notifications = [];

    /*
      Create a notification for every nearby
      matching worker.
    */
    for (const item of nearbyWorkers) {
      try {
        const notification =
          await WorkerNotification.create({
            worker: item.worker._id,
            booking: booking._id,
            distance: Number(
              item.distance.toFixed(2)
            ),
            status: "Unread",
            notificationStage: 1,
          });

        notifications.push(notification);
      } catch (error) {
        /*
          The WorkerNotification model has a unique
          worker + booking index.

          Therefore, don't create a duplicate notification.
        */
        if (error.code === 11000) {
          console.log(
            `Notification already exists for worker ${item.worker._id}`
          );
        } else {
          console.error(
            `Failed to create notification for worker ${item.worker._id}:`,
            error.message
          );
        }
      }
    }

    return {
      success: true,
      totalMatchingWorkers: matchingWorkers.length,
      notifiedWorkers: notifications.length,
      nearbyWorkers: nearbyWorkers.map((item) => ({
        workerId: item.worker._id,
        distance: Number(
          item.distance.toFixed(2)
        ),
      })),
    };
  } catch (error) {
    console.error(
      "Worker notification matching error:",
      error.message
    );

    return {
      success: false,
      message: "Failed to find nearby workers.",
      error: error.message,
    };
  }
}

/*
  EXPORT FUNCTIONS
*/
module.exports = {
  calculateDistance,
  workerMatchesServices,
  notifyNearbyWorkers,
};