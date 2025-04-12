// api/index.js
const serverless = require("serverless-http"); // Correct module name
const app = require("../app");

module.exports = serverless(app);
