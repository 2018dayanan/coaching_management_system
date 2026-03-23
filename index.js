require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db.config");
const routes = require("./routes");
const AppError = require("./utils/appError");
const errorMiddleware = require("./middlewares/error.middleware");
const app = express();
const port = process.env.PORT || 3022;

connectDB();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
    }
  },
  credentials: true,
}));
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
