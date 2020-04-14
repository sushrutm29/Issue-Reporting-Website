const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const xss = require("xss");

router.post('/signup', async (req, res) => {
    try {
        const userName = xss(req.body.userName, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        const userEmail = xss(req.body.userEmail, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });
        let userPassword = xss(req.body.userPassword, {
            whiteList: [], 
            stripIgnoreTag: true,
            stripIgnoreTagBody: []
        });

        const inserted = await usersData.createUser(userName, userEmail, userPassword, req.body.admin, [], req.body.profilePic);
        if (inserted != true) throw new Error("Error creating account!");
    } catch (error) {
        res.status(404).json({error: error});
    }
});

module.exports = router;