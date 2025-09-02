const express = require('express');
require('dotenv').config();

const app = express();
const connectdb = require("./db.js");
const { mongo, default: mongoose } = require('mongoose');


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/user', (res,req) => {
  
});


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


