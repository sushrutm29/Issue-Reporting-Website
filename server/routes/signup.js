const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const xss = require("xss");

router.post('/', async (req, res) => {
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

        const inserted = await usersData.createUser(userName, userEmail, req.body.admin, req.body.profilePic);
        if (!inserted) throw new Error("Error creating account!");
        else{
            const newUser = await usersData.getUserById(inserted._id+'');
            res.status(200).json(newUser);
        }
    } catch (error) {
        res.status(404).json({error: error});
    }
});

module.exports = router;