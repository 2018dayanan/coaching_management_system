require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const db = require("./db/db");
const routes = require("./routes");
const AppError = require("./utils/appError");
const errorMiddleware = require("./middlewares/errorMiddleware");
const app = express();
const port = process.env.PORT || 3022;

db();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: false
}));
app.use(routes);

app.all("/{*path}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorMiddleware);
app.get("/testing", (req, res) => {
  res.send("Welcome to the Education API – Your request was successful!");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
