const express = require('express');
const router = express.Router();
const Util = require("../utilities");

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

router.get('/', async (req, res) => {
    const nav = await Util.getNav();
    res.render('index', { nav });
});

module.exports = router;



