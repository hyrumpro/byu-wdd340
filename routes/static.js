const express = require('express');
const router = express.Router();
const Util = require("../utilities");
const invController = require("../controllers/invController");

// Static Routes
router.use(express.static("public"));

// Wrap route handlers with error handling
router.get('/inventory', Util.handleErrors(async (req, res) => {
    const nav = await Util.getNav();
    res.render('index', { nav });
}));

router.get('/trigger-error', (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
});

router.get("/inv/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

router.get("/inv/detail/:inventoryId", Util.handleErrors(invController.getInventoryItemById));



module.exports = router;



