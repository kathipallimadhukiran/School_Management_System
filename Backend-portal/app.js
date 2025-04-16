const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
const fs = require('fs');

// Initialize the express app
const app = express();



// Serve static files - only ONE declaration needed
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Then use it in your static file middlew

// Remove the duplicate static file declaration later in the file
// Keep only one declaration of the uploads static route

// Rest of your configuration...
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middlewares
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Your routes...
const Feerouter = require("./src/routes/feerouters");
app.use("/feepayments", Feerouter);

const mainRouter = require("./src/routes/mainrouters");
app.use("/", mainRouter);

const aggregations = require("./src/routes/aggregations");
app.use("/aggregate", aggregations);

// Error handlers
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;