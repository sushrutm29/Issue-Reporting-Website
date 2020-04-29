const deptRoute = require("./dept");
const postRoute = require("./posts");
const commentRoute = require("./comments");
const userRoute = require("./users");

const constructorMethod = app => {
    app.use("/data/dept", deptRoute);
    app.use("/data/post", postRoute);
    app.use("/data/comment", commentRoute);
    app.user("/data/user", userRoute);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Invalid URL was provided for server side routes!" });
    });

};

module.exports = constructorMethod;