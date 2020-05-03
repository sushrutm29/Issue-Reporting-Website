const express = require("express");
const cors = require("cors");
const app = express();
const configRoutes = require("./routes");
app.use(express.json());
app.use(cors());

configRoutes(app);
let portNum = 3001;
app.listen(portNum, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${portNum}`);
});