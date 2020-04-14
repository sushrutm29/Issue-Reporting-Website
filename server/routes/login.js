const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const xss = require("xss");

router.post('/login', async (req, res) => {
    try {

    } catch (error) {
        res.status(404).json({error: error});
    }
});

module.exports = router;