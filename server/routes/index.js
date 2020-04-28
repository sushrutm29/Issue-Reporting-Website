const deptRoute = require("./dept");
const postRoute = require("./posts");

const constructorMethod = app => {
    app.use("/data/dept", deptRoute);
    app.use("/data/post", postRoute);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Page Not Found" });
    });

};

module.exports = constructorMethod;