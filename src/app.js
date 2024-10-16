const cors = require("cors");
const express = require("express");
const compression = require("compression");

const helmet = require("helmet");

const httpStatus = require("http-status");
const routes = require("./routes/v1");
const morgan = require("./config/morgan")
const config = require("./config/config");
const ApiError = require("./utils/ApiError");
const { errorConverter, errorHandler } = require("./middlewares/error");
const mongoose = require("mongoose");
const logger = require('./config/logger');

const app = express();
app.set('trust proxy', true);

app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    // Safely handle various response body types (JSON, string, Buffer)
    if (Buffer.isBuffer(body)) {
      res.locals.responseBody = body.toString();
    } else if (typeof body === 'string') {
      try {
        res.locals.responseBody = JSON.parse(body);
      } catch (error) {
        res.locals.responseBody = body;  // Keep string as is
      }
    } else {
      res.locals.responseBody = body;
    }

    return originalSend.apply(this, arguments);
  };

  next();
});

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// Reroute all API request starting with "/v1" route
app.use("/v1", routes);

app.use("/health", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Backend is Healthy and Okay!"
  });
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger().info(config.env === 'production' ? 'Production Database connected' : 'Staging database connected');
}).catch((err) => {
  console.log(err)
});

module.exports = app;
