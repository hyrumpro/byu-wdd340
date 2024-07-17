const express = require('express');
const router = express.Router();
const Util = require("../utilities");
const invController = require("../controllers/invController");
const regValidate = require('../utilities/account-validation');
const classValidate = require('../utilities/classification-validation');
const invValidate = require('../utilities/inventory-validation');
const accountController = require("../controllers/accountController");

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

router.get("/account",Util.checkLogin, Util.handleErrors(accountController.buildAccountManagement));

router.get("/inv/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

router.get("/inv/detail/:inventoryId", Util.handleErrors(invController.getInventoryItemById));


router.get("/account/login", Util.handleErrors(accountController.buildLogin));

router.get("/account/register", Util.handleErrors(accountController.buildRegister));

router.get("/account/update/:account_id", Util.checkLogin, Util.handleErrors(accountController.buildAccountUpdate));


router.get("/inventory/management", Util.checkLogin, Util.checkAdminEmployee, Util.handleErrors(invController.buildManagementView));


router.get("/inv/add-classification", Util.checkLogin, Util.checkAdminEmployee, Util.handleErrors(invController.buildManagementView))


router.get("/inv/add-inventory", Util.checkLogin, Util.checkAdminEmployee, Util.handleErrors(invController.buildManagementView))


router.get("/inv/getInventory/:classification_id", Util.handleErrors(invController.getInventoryJSON))


router.get("inv/edit/:inv_id", Util.checkLogin, Util.checkAdminEmployee, Util.handleErrors(invController.buildManagementView));


router.get('/inv/delete/:inv_id', Util.checkLogin, Util.checkAdminEmployee, Util.handleErrors(invController.buildManagementView));

router.get("/account/logout", Util.handleErrors(accountController.logout));

router.post('/inv/delete', Util.handleErrors(invController.deleteInventoryItem));








router.post(
    "/inv/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    Util.handleErrors(invController.addInventoryItem)
)


router.post(
    "/inv/add-classification",
    classValidate.classificationRules(),
    classValidate.checkClassData,
    Util.handleErrors(invController.addClassification)
)



router.post(
    "/account/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    Util.handleErrors(accountController.accountLogin)
)

router.post(
    "/account/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    Util.handleErrors(accountController.registerAccount)
);


router.post("/update",
    regValidate.updateRules(),
    regValidate.checkUpdateData,
    Util.handleErrors(accountController.updateAccount)
);

// Post route for password change
router.post("/change-password",
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    Util.handleErrors(accountController.changePassword)
);



router.post("/update/", invController.updateInventory)




module.exports = router;



