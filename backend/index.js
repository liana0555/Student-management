const express = require("express");
const dotenv = require("dotenv");
const db = require("./connectors/db");
const AuthRouter = require("./routes/auth");
const StudentsRouter = require("./routes/students");
const cors = require("cors");
const app = express();
const port = 8080;
dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/api", AuthRouter);
app.use("/api/students", StudentsRouter);

const dbConnector = new db();

dbConnector.Connector(process.env.dbUrl);

app.listen(port, () => {
  console.log("Running in port " + port);
});
