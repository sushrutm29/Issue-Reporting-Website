const signupRoutes = require('./signup');
const loginRoutes = require('./login');

const constructorMethod = app => {
    app.use("/signup", signupRoutes);
    app.use("/login", loginRoutes);
};

module.exports = constructorMethod;
