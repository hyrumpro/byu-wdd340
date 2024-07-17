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
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationList
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


invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

invCont.editInventoryView = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id)
        let nav = await utilities.getNav()
        const itemData = await invModel.getInventoryItemById(inv_id)

        if (!itemData) {
            throw new Error("Inventory item not found");
        }

        const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
        const itemName = `${itemData.inv_make} ${itemData.inv_model}`
        res.render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_description: itemData.inv_description,
            inv_image: itemData.inv_image,
            inv_thumbnail: itemData.inv_thumbnail,
            inv_price: itemData.inv_price,
            inv_miles: itemData.inv_miles,
            inv_color: itemData.inv_color,
            classification_id: itemData.classification_id
        })
    } catch (error) {
        console.error("Error in editInventoryView:", error);
        res.status(404).render("errors/404", {
            title: "404 Not Found",
            nav: await utilities.getNav(),
            message: "The requested inventory item was not found."
        });
    }
}


invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body
    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("inventory/management")
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the insert failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}


invCont.buildDeleteConfirmation = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryItemById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    })
}


invCont.deleteInventoryItem = async function (req, res, next) {
    const inv_id = parseInt(req.body.inv_id)
    const deleteResult = await invModel.deleteInventoryItem(inv_id)
    if (deleteResult) {
        req.flash("notice", "The vehicle was successfully deleted.")
        res.redirect("/inventory/management")
    } else {
        req.flash("notice", "Sorry, the delete failed.")
        res.redirect("/inv/delete/" + inv_id)
    }
}








module.exports = invCont