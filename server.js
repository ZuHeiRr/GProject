const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });
const globalError = require("./middelwares/errorMiddleware");
const dbconnection = require("./config/database");
const ApiError = require("./utils/apiErrors");

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

//connect with db
dbconnection();
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

//mount routes
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
// app.use("/api/v1/courses", reviewRoutes);

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running 🚀" });
});

app.all("*", (req, res, next) => {
  //creat error and send it to error handling middleware
  // const err = new Error (`can't find this route ${req.originalUrl}`)
  // next(err.message);
  next(new ApiError(`con't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`listing on port ${PORT}`);
});

//handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandleRejectionErrors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting down....`);
    process.exit(1);
  });
});
