const express = require("express");
require("dotenv").config();
const connectdb = require("./db.js");
const AuthRouter = require("./router/Auth.js");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors());

// Connect to DB
connectdb()
  .then(() => {
    console.log("Connected to database!");
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.log("Connection failed!", err));

// Routes
app.use("/auth", AuthRouter);
