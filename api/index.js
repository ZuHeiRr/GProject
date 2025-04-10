const express = require("express");
const serverless = require("serverless-http");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });

const globalError = require("../middelwares/errorMiddleware");
const dbconnection = require("../config/database");
const ApiError = require("../utils/apiErrors");

const categoryRoute = require("../routes/categoryRoutes");
const subCategoryRoute = require("../routes/subCategoryRoute");
const brandRoute = require("../routes/brandRoutes");
const productRoute = require("../routes/productRoutes");
const userRoute = require("../routes/userRoutes");
const authRoute = require("../routes/authRoutes");
const favoriteRoutes = require("../routes/favoriteRoutes");
const courseRoutes = require("../routes/courseRoutes");
const requestRoutes = require("../routes/requestRoutes");
const reviewRoutes = require("../routes/reviewRoutes");

// Connect DB
dbconnection();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount routes
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

// Middleware
app.use(cors());
app.options("*", cors());
app.use(compression());

// Default route
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running 🚀" });
});

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

// 👇️ بدل من app.listen()، رجّع function
module.exports = serverless(app);
