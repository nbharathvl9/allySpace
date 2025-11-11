const express = require("express");
require("dotenv").config();
const connectdb = require("./db.js");
const cors = require("cors");
const AuthRouter = require("./router/Auth.js");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // you can replace * with your friend's frontend URL when hosted
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Connect to DB
connectdb()
  .then(() => {
    console.log("Connected to database!");
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.log("Connection failed!", err));

// Routes
app.use("/auth", AuthRouter);

const subteamRouter = require("./router/subteamRouter");
const teamRouter = require("./router/teamRouter");
app.use("/api/team", teamRouter);
app.use("/api/team", subteamRouter);

const taskRouter = require("./router/taskRouter");
app.use("/api/team", taskRouter);

const notificationRouter = require("./router/notification.js");
app.use("/api/notifications", notificationRouter);
