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


module.exports = invCont