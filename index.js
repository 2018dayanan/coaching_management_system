require("dotenv").config();
const express = require("express");
const db = require("./db/db");
const routes = require("./routes");
const app = express();
const port = process.env.PORT || 3022;
db();
app.use(express.json());
app.use(routes);
app.get("/testing", (req, res) => {
  res.send("Welcome to the Education API – Your request was successful!");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
