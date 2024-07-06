const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    if (isNaN(classification_id)) {
        return res.status(400).send("Invalid classification ID");
    }
    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data) {
        return res.status(404).send("No inventory found for this classification");
    }
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

invCont.getInventoryItemById = async function (req, res, next) {
    const inventoryId = req.params.inventoryId
    if (isNaN(inventoryId)) {
        return res.status(400).send("Invalid inventory ID");
    }
    const itemData = await invModel.getInventoryItemById(inventoryId)
    if (!itemData) {
        return res.status(404).send("No matching vehicle found");
    }
    const itemHtml = await utilities.buildInventoryDetailHtml(itemData)
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
        title: itemData.inv_year + " " + itemData.inv_make + " " + itemData.inv_model,
        nav,
        itemHtml
    })
}

invCont.getInventoryItemById = async function (req, res, next) {
    const inventoryId = req.params.inventoryId
    const itemData = await invModel.getInventoryItemById(inventoryId)
    if (itemData) {
        const itemHtml = await utilities.buildInventoryDetailHtml(itemData)
        let nav = await utilities.getNav()
        res.render("./inventory/detail", {
            title: itemData.inv_year + " " + itemData.inv_make + " " + itemData.inv_model,
            nav,
            itemHtml
        })
    } else {
        const nav = await utilities.getNav()
        const errorMessage = "Sorry, the specified inventory item could not be found."
        res.status(404).render("errors/error", {
            title: "No data found",
            message: errorMessage,
            nav
        })
    }
}


invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
    })
}


invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
}

invCont.addClassification = async function (req, res) {
    const { classification_name } = req.body
    const addResult = await invModel.addClassification(classification_name)

    if (addResult) {
        req.flash("notice", `Classification ${classification_name} added successfully.`)
        let nav = await utilities.getNav()
        res.status(201).render("inventory/management", {
            title: "Inventory Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Failed to add new classification.")
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav: await utilities.getNav(),
            errors: null,
        })
    }
}


invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
    })
}

invCont.addInventoryItem = async function (req, res) {
    let nav = await utilities.getNav()
    const {
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color, classification_id
    } = req.body
    const addResult = await invModel.addInventoryItem(
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color, classification_id
    )

    if (addResult) {
        req.flash("notice", `Vehicle ${inv_make} ${inv_model} added successfully.`)
        res.status(201).render("inventory/management", {
            title: "Inventory Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Failed to add new vehicle.")
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.status(501).render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            errors: null,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
            inv_price, inv_miles, inv_color, classification_id
        })
    }
}





module.exports = invCont