const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model
                +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


Util.buildInventoryDetailHtml = async function(vehicle) {
    let html = '<section class="vehicle-detail">'
    html += `<div class="vehicle-image">
                <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
                <p class="certified">This vehicle has passed inspection by an ASE-certified technician.</p>
             </div>`
    html += `<div class="vehicle-info">
                <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
                <div class="price-mileage">
                    <p class="mileage">Mileage: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p>
                    <p class="price">No-Haggle Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
                </div>
                <ul class="vehicle-details">
                    <li>MPG: ${vehicle.inv_mpg || 'Unknown'}</li>
                    <li>Color: ${vehicle.inv_color}</li>
                    <li>Fuel Type: ${vehicle.inv_fuel_type || 'Unknown'}</li>
                    <li>Drivetrain: ${vehicle.inv_drivetrain || 'Unknown'}</li>
                    <li>Transmission: ${vehicle.inv_transmission || 'Unknown'}</li>
                </ul>
                <p class="description">${vehicle.inv_description}</p>
                <div class="cta-buttons">
                    <button class="primary-btn">START MY PURCHASE</button>
                    <button class="secondary-btn">CONTACT US</button>
                    <a href="/testdrive/schedule/${vehicle.inv_id}" class="secondary-btn">SCHEDULE TEST DRIVE</a>
                    <button class="secondary-btn">APPLY FOR FINANCING</button>
                </div>
                <a href="#" class="estimate-payments">ESTIMATE PAYMENTS</a>
                <div class="call-us">
                    <h3>Call Us</h3>
                    <p>801-224-7884</p>
                </div>
             </div>`
    html += '</section>'
    return html
}


Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

Util.checkJWTToken = (req, res, next) => {
    const token = req.cookies.jwt;
    console.log("JWT Token:", token); // Debug log

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log("JWT Verification Error:", err);
                res.locals.loggedin = 0;
                res.clearCookie('jwt');
            } else {
                console.log("Decoded Token:", decodedToken);
                res.locals.loggedin = 1;
                res.locals.accountData = decodedToken;
            }
            next();
        });
    } else {
        res.locals.loggedin = 0;
        next();
    }
};


Util.setGlobalVariables = (req, res, next) => {
    res.locals.loggedin = req.cookies.jwt ? 1 : 0;
    res.locals.accountData = null;

    if (req.cookies.jwt) {
        try {
            const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
            res.locals.accountData = decoded;
        } catch (error) {
            console.error("JWT verification failed:", error);
        }
    }

    console.log("Global variables set:", {
        loggedin: res.locals.loggedin,
        accountData: res.locals.accountData
    });

    next();
};

Util.checkAdminEmployee = (req, res, next) => {
    if (res.locals.accountData && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
        next();
    } else {
        req.flash("notice", "Please log in with appropriate credentials.");
        return res.redirect("/account/login");
    }
};


Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}




Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)




module.exports = Util



