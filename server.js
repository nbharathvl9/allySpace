const express = require('express');
require('dotenv').config();

const mongoose = require("mongoose");
const connectdb = require("./db.js");
const userRouter = require("./router/userRouter.js")

const app = express();
app.use(express.json());


connectdb()
.then(() => {
    console.log("Connected to database!");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Connection failed!", err);
  });


  app.use("/user", userRouter);

