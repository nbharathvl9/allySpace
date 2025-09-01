const express = require('express');
const app = express();
require('dotenv').config();
const connectdb = require("./db.js")

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen( 3000, async () => {
    await connectdb();
    console.log('Server is running on port 3000');

});

