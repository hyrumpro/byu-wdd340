/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const dotenv = require("dotenv");
const path = require('path');

// Load environment variables from .env file if it exists
dotenv.config();

const app = express();
const static = require("./routes/static");

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

/* ***********************
 * Routes
 *************************/
app.use(static);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file or default values
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
