require("colors");
require("express-async-ERRORS");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const Cronjobs = require("./services/Cron");
// Load env vars
dotenv.config({ path: ".env" });

// App initialization
const app = express();

// Pre-route middlewares
require("./middlewares/pre-route")(app);

// API routes
app.use("/api", require("./routes"));

// Ping route for testing connection
app.get("/ping", (req, res) => res.status(200).send("Hello world!"));

// Error middlewares
require("./middlewares/error")(app);
// PORT Handling
const PORT = process.env.PORT;

// Connecting to Database and listening to server
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`App listening: ${PORT}`.magenta);
    });
  })
  .catch((err) => {
    console.log("[App.Mongoose]".red, err);
  });
cron.schedule("01 01 * * *", () => {
  new Cronjobs();
  console.log("Corn is Running", new Date());
});
