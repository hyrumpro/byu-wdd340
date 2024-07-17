const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invValidate = {}

invValidate.inventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a make."),
        body("inv_model")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a model."),
        body("inv_year")
            .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
            .withMessage("Please provide a valid year."),
        body("inv_description")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a description."),
        body("inv_image")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide an image path."),
        body("inv_thumbnail")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a thumbnail path."),
        body("inv_price")
            .isFloat({ min: 0 })
            .withMessage("Please provide a valid price."),
        body("inv_miles")
            .isInt({ min: 0 })
            .withMessage("Please provide valid mileage."),
        body("inv_color")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a color."),
        body("classification_id")
            .isInt({ min: 1 })
            .withMessage("Please select a classification."),
    ]
}

invValidate.checkInventoryData = async (req, res, next) => {
    const {
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color, classification_id
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationList,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
            inv_price, inv_miles, inv_color, classification_id
        })
        return
    }
    next()
}

invValidate.checkUpdateData = async (req, res, next) => {
    const {
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color, classification_id, inv_id
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationSelect = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit " + inv_make + " " + inv_model,
            nav,
            classificationSelect,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
            inv_price, inv_miles, inv_color, classification_id, inv_id
        })
        return
    }
    next()
}

module.exports = invValidate
