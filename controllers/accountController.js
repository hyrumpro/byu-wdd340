const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}


accountController.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}


accountController.registerAccount = async function(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    try {
        // Hash the password
        let hashedPassword = await bcrypt.hashSync(account_password, 10)
        console.log(account_firstname, account_lastname, account_email, account_password);
        // Attempt to register the account
        const regResult = await accountModel.registerAccounts(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        )

        if (regResult) {
            req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please log in.`)
            res.status(201).render("account/login", {
                title: "Login",
                nav,
            })
        } else {
            throw new Error("Registration failed")
        }
    } catch (error) {
        console.error("Registration error:", error)
        req.flash("notice", "An error occurred during registration. Please try again.")
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

accountController.accountLogin = async function(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    console.log("Login attempt for:", account_email);

    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
        console.log("Account not found for:", account_email);
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }

    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

            console.log("Login successful for:", account_email);
            console.log("JWT Token:", accessToken);

            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        }
        console.log("Invalid password for:", account_email);
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
    } catch (error) {
        console.error("Login error:", error)
        req.flash("notice", "An error occurred during login. Please try again.", error)
        res.status(500).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
    }
}

accountController.buildAccountManagement = async function (req, res) {
    let nav = await utilities.getNav()
    res.render("account/account_management", {
        title: "Account Management",
        nav,
        errors: null,
    })
}



accountController.buildAccountUpdate = async function (req, res, next) {
    const account_id = parseInt(req.params.account_id)
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
    })
}

accountController.updateAccount = async function (req, res) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
    if (updateResult) {
        req.flash("notice", "Account updated successfully.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Update failed. Please try again.")
        res.status(501).render("account/update", {
            title: "Update Account",
            nav: await utilities.getNav(),
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
    }
}

accountController.changePassword = async function (req, res) {
    const { account_id, account_password } = req.body
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Password encryption failed.")
        res.status(500).render("account/update", {
            title: "Update Account",
            nav: await utilities.getNav(),
            errors: null,
        })
        return
    }
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
    if (updateResult) {
        req.flash("notice", "Password updated successfully.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Password update failed. Please try again.")
        res.status(501).render("account/update", {
            title: "Update Account",
            nav: await utilities.getNav(),
            errors: null,
        })
    }
}

accountController.logout = async function (req, res) {
    res.clearCookie("jwt")
    req.flash("success", "You have been logged out successfully.")
    res.redirect("/")
}



module.exports = accountController;
