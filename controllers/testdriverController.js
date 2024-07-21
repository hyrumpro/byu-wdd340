const {
    scheduleTestDrive,
    updateTestDriveStatus,
    getTestDrivesByVehicle,
    getTestDrivesByCustomer,
    getInventoryItemById,
    getAllTestDrives
} = require("../models/testdrive-model");
const utilities = require("../utilities/");

const testDriveController = {};


testDriveController.showScheduleForm = async function (req, res) {
    const vehicle_id = req.params.vehicle_id;
    const vehicle = await getInventoryItemById(vehicle_id);

    if (!vehicle) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/inventory");
    }

    const nav = await utilities.getNav();
    res.render("testdrive/schedule", {
        title: `Schedule Test Drive - ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        vehicle,
        errors: null,
    });
};



testDriveController.scheduleTestDrive = async function (req, res) {
    const { vehicle_id, date, time } = req.body;
    const customer_id = res.locals.accountData.account_id;
    const date_time = new Date(`${date}T${time}`);

    try {
        // Validate input
        if (!vehicle_id || !date || !time) {
            throw new Error("Missing required fields");
        }

        // Check if the date is in the future
        if (date_time <= new Date()) {
            throw new Error("Test drive must be scheduled for a future date and time");
        }

        const result = await scheduleTestDrive(vehicle_id, customer_id, date_time);
        if (result) {
            req.flash("notice", "Test drive scheduled successfully");
            return res.redirect("/account/");
        } else {
            throw new Error("Failed to schedule test drive");
        }
    } catch (error) {
        console.error("Error in scheduleTestDrive:", error);
        const vehicle = await getInventoryItemById(vehicle_id);
        const nav = await utilities.getNav();

        req.flash("error", error.message || "An error occurred while scheduling the test drive");
        return res.render("testdrive/schedule", {
            title: `Schedule Test Drive - ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            vehicle,
            errors: [{ msg: error.message }],
        });
    }
};

testDriveController.listTestDrives = async function (req, res) {
    try {
        let testDrives;
        if (res.locals.accountData.account_type === 'Admin') {
            console.log('Fetching all test drives for Admin');
            testDrives = await getAllTestDrives();
        } else if (res.locals.accountData.account_type === 'Employee') {
            console.log('Fetching test drives for vehicle:', req.params.vehicle_id);
            testDrives = await getTestDrivesByVehicle(req.params.vehicle_id);
        } else {
            console.log('Fetching test drives for customer:', res.locals.accountData.account_id);
            testDrives = await getTestDrivesByCustomer(res.locals.accountData.account_id);
        }

        console.log('Test drives fetched:', testDrives);

        if (!testDrives || testDrives.length === 0) {
            console.log('No test drives found');
            return res.render("testdrive/list", {
                title: "Scheduled Test Drives",
                nav: await utilities.getNav(),
                testDrives: []
            });
        }

        // Fetch vehicle details for each test drive
        const testDrivesWithVehicleDetails = await Promise.all(testDrives.map(async (drive) => {
            try {
                const vehicle = await getInventoryItemById(drive.vehicle_id);
                console.log('Vehicle details fetched:', vehicle);
                return {
                    ...drive,
                    vehicle_make: vehicle.inv_make,
                    vehicle_model: vehicle.inv_model,
                    vehicle_year: vehicle.inv_year
                };
            } catch (error) {
                console.error('Error fetching vehicle details:', error);
                return drive; // Return the original drive object if there's an error
            }
        }));

        console.log('Test drives with vehicle details:', testDrivesWithVehicleDetails);

        res.render("testdrive/list", {
            title: "Scheduled Test Drives",
            nav: await utilities.getNav(),
            testDrives: testDrivesWithVehicleDetails
        });
    } catch (error) {
        console.error('Error in listTestDrives:', error);
        res.status(500).render("errors/error", {
            title: "Server Error",
            nav: await utilities.getNav(),
            message: "There was an error processing your request. Please try again later."
        });
    }
};

testDriveController.updateTestDriveStatus = async function (req, res) {
    const { id, status } = req.body;
    const result = await updateTestDriveStatus(id, status);
    if (result) {
        req.flash("notice", "Test drive status updated successfully");
    } else {
        req.flash("notice", "Failed to update test drive status");
    }
    res.redirect("/testdrive/list");
};



module.exports = testDriveController;
