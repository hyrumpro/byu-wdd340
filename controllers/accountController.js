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

    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
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
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        }
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
    } catch (error) {
        console.error("Login error:", error)
        req.flash("notice", "An error occurred during login. Please try again.")
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



module.exports = accountController;
