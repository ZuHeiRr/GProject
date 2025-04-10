// app.js
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });
const globalError = require("./middelwares/errorMiddleware");
const dbconnection = require("./config/database");
const ApiError = require("./utils/apiErrors");

// connect with db
dbconnection();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Enable CORS
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// routes
const categoryRoute = require("./routes/categoryRoutes");
const subCategoryRoute = require("./routes/subCategoryRoute");
const brandRoute = require("./routes/brandRoutes");
const productRoute = require("./routes/productRoutes");
const userRoute = require("./routes/userRoutes");
const authRoute = require("./routes/authRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const courseRoutes = require("./routes/courseRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/subCategories", subCategoryRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// test route
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running 🚀" });
});

app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
});

// global error handler
app.use(globalError);

module.exports = app;
