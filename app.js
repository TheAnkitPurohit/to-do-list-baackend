require("dotenv").config();

// express
const express = require("express");
const app = express();

// port
const port = process.env.PORT || 8000;

// mongoose
require("./db/dbConnection");

// routing
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Hello From Backend" });
});

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// cors
const cors = require("cors");
app.use(cors());

// /api/auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// /api/todos routes
const todoRoutes = require("./routes/todo");
app.use("/api/todo", todoRoutes);

// listen
app.listen(port, () => {
  console.log("App is started");
});
