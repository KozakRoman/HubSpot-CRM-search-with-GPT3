const express = require("express");
const cors = require("cors");
const path = require("path");
const router = require("./router");

const app = express();

app.use(cors({ origin: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", router);

const PORT = process.env.PORT || 5000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/api/v1/log`);
    console.log(`http://localhost:${PORT}/api/v1/settings`);
  });
}

module.exports = startServer;
