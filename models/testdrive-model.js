const pool = require("../database/")

/* *****************************
*   Schedule a new test drive
* *************************** */
async function scheduleTestDrive(vehicle_id, customer_id, date_time) {
    try {
        const sql = "INSERT INTO test_drives (vehicle_id, customer_id, date_time, status) VALUES ($1, $2, $3, 'scheduled') RETURNING *"
        const result = await pool.query(sql, [vehicle_id, customer_id, date_time])
        return result.rows[0]
    } catch (error) {
        console.error("scheduleTestDrive error:", error);
        throw error;
    }
}

/* *****************************
*   Update test drive status
* *************************** */
async function updateTestDriveStatus(id, status) {
    try {
        const sql = "UPDATE test_drives SET status = $1 WHERE id = $2 RETURNING *"
        const result = await pool.query(sql, [status, id])
        return result.rows[0]
    } catch (error) {
        console.error("updateTestDriveStatus error:", error);
        throw error;
    }
}

/* *****************************
*   Get test drives by vehicle
* *************************** */
async function getTestDrivesByVehicle(vehicle_id) {
    try {
        const sql = "SELECT * FROM test_drives WHERE vehicle_id = $1"
        const result = await pool.query(sql, [vehicle_id])
        return result.rows
    } catch (error) {
        console.error("getTestDrivesByVehicle error:", error);
        throw error;
    }
}

/* *****************************
*   Get test drives by customer
* *************************** */
async function getTestDrivesByCustomer(customer_id) {
    try {
        const sql = "SELECT * FROM test_drives WHERE customer_id = $1"
        const result = await pool.query(sql, [customer_id])
        return result.rows
    } catch (error) {
        console.error("getTestDrivesByCustomer error:", error);
        throw error;
    }
}

async function getAllTestDrives() {
    try {
        const sql = "SELECT * FROM test_drives"
        const result = await pool.query(sql)
        return result.rows
    } catch (error) {
        console.error("getAllTestDrives error:", error);
        throw error;
    }
}

/* *****************************
*   Get inventory item by ID
* *************************** */
async function getInventoryItemById(vehicle_id) {
    try {
        const sql = "SELECT * FROM inventory WHERE inv_id = $1"
        const result = await pool.query(sql, [vehicle_id])
        return result.rows[0]
    } catch (error) {
        console.error("getInventoryItemById error:", error);
        throw error;
    }
}

module.exports = {
    scheduleTestDrive,
    updateTestDriveStatus,
    getTestDrivesByVehicle,
    getTestDrivesByCustomer,
    getInventoryItemById,
    getAllTestDrives
}
