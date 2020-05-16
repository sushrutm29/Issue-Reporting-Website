const express = require("express");
const router = express.Router();
const userData = require("./../data/users");
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/28/2020
 */
router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "User id was not provided for get method!";
        }
        let userID = req.params.id;
        let currentUser = await client.hgetAsync("users", userID);
        
        if (currentUser) {  //found the user in Redis cache
            currentUser = JSON.parse(currentUser);
        } else {    //did not find the user in Redis cache
            currentUser = await userData.getUserById(userID);
            await client.hsetAsync("users", userID, JSON.stringify(currentUser));
        }
        return res.status(200).json(currentUser);
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific user! ${error}` });
    }
});

router.get('/name/:username', async (req, res) => {
    try {
        if (!req.params || !req.params.username) {
            throw "Username was not provided for get method!";
        }

        let username = req.params.username;
        currentUser = await userData.getUserByName(username);
        
        return res.status(200).json(currentUser);
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific user! ${error}` });
    }
});

router.post('/', async (req, res) => {
    if (!req.body) {
        throw "No request body was provided for createUser function!";
    }
    const userInfo = req.body;
    console.log(userInfo);
    if (!userInfo) {
        return res.status(400).json({ error: "You must provide information to create a new user!" });
    }
    if (!userInfo.userName || typeof userInfo.userName != "string" || userInfo.userName.length == 0) {
        return res.status(400).json({ error: "Invalid user name was provided" });
    }
    if (!userInfo.userEmail || typeof userInfo.userEmail != "string" || userInfo.userEmail.length == 0) {
        return res.status(400).json({ error: "Invalid user email was provided" });
    }
    if (userInfo.admin == undefined || userInfo.admin == null || typeof userInfo.admin != "boolean") {
        return res.status(400).json({ error: "Invalid user admin status was provided" });
    }
    if (userInfo.profilePic == undefined || userInfo.profilePic == null || typeof userInfo.profilePic != "boolean") {
        return res.status(400).json({ error: "Invalid user profile picture status was provided" });
    }

    try {
        const newUser = await userData.createUser(userInfo.userName, userInfo.userEmail, userInfo.admin, userInfo.profilePic);
        await client.hsetAsync("users", `${newUser._id}`, JSON.stringify(newUser));
        return res.status(200).json(newUser);
    } catch (error) {
        return res.status(400).json({ error: `Could not create new user! ${error}` });
    }
});

//updateUser(userID, userInfo)
router.patch('/update/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "User id was not provided for updateUser function!";
        }
        if (!req.body) {
            throw "No request body was provided for updateUser function!";
        }
        let userID = req.params.id;
        const updatedUser = await userData.updateUser(req.params.id, req.body);
        await client.hsetAsync("users", userID, JSON.stringify(updatedUser));
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ error: `Could not update user information! ${error}` });
    }
});

//addPostToUser(userID, postID)
router.patch('/addpost/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for addPostToUser function!";
        }
        if (!req.body) {
            throw "No request body was provided for addPostToUser function!";
        }
        if (!req.body.postID || typeof req.body.postID != "string" || req.body.postID.length == 0) {
            return res.status(400).json({ error: "Invalid post ID was provided for addPostToUser function" });
        }
        let userID = req.params.id;
        const updatedUser = await userData.addPostToUser(userID, req.body.postID);
        await client.hsetAsync("users", userID, JSON.stringify(updatedUser));
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ error: `Could not add post to user! ${error}` });
    }
});

//removePostFromUser(userID, postID)
router.patch('/removepost/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for removePostFromUser function!";
        }
        if (!req.body || !req.body.postID) {
            throw "No post ID was provided for removePostFromUser function!";
        }
        if (!req.body.postID || typeof req.body.postID != "string" || req.body.postID.length == 0) {
            return res.status(400).json({ error: "Invalid post ID was provided for removePostFromUser function" });
        }
        let userID = req.params.id;
        const updatedUser = await userData.removePostFromUser(userID, req.body.postID);
        await client.hsetAsync("users", userID, JSON.stringify(updatedUser));
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ error: `Could not remove post from user! ${error}` });
    }
});

module.exports = router;