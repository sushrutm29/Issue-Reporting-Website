const deptRoute = require("./dept");

const constructorMethod = app => {
  app.use("/data/dept", deptRoute);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });

};

module.exports = constructorMethod;