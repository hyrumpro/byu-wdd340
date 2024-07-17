const express = require("express");
const dotenv = require("dotenv");
const path = require('path');
const utilities = require("./utilities/");
const baseController = require("./controllers/baseController");
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")


dotenv.config();

const app = express();
const static = require("./routes/static");

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');



/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));


app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser());
app.use(utilities.setGlobalVariables);


/* ***********************
 * Routes
 *************************/
// Index route with error handling
app.get("/", utilities.handleErrors(baseController.buildHome));

// Other routes
app.use(static);


app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(utilities.checkJWTToken);

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message
  if(err.status == 404){
    message = err.message
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
