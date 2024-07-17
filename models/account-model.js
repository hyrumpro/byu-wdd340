const pool = require("../database/")



/* *****************************
*   Register new account
* *************************** */
async function registerAccounts(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
        return result
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}


/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

async function getAccountByEmail (account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}


async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
            [account_id])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching account found")
    }
}

async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
    try {
        const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
        return result.rowCount > 0
    } catch (error) {
        console.error("model error: " + error)
        return false
    }
}

async function updatePassword(account_id, account_password) {
    try {
        const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
        const result = await pool.query(sql, [account_password, account_id])
        return result.rowCount > 0
    } catch (error) {
        console.error("model error: " + error)
        return false
    }
}


module.exports = {
    registerAccounts,
    checkExistingEmail,
    getAccountByEmail,
    getAccountById,
    updateAccount,
    updatePassword
};