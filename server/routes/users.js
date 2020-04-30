const express = require("express");
const router = express.Router();
const userData = require("./../data/users");

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/28/2020
 */
//getUserById(userID)
router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "User id was not provided for get method!";
        }
        const currentPost = await userData.getUserById(req.params.id);
        return res.status(200).json(currentPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not get a specific user!" });
    }
});

//createUser(userName, userEmail, admin, profilePic)
router.post('/', async (req, res) => {
    if (!req.body) {
        throw "No request body was provided for createUser function!";
    }
    const userInfo = req.body;
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
        return res.status(200).json(newUser);
    } catch (error) {
        return res.status(400).json({ error: "Could not create new user!" });
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
        const updatedUser = await userData.updateUser(req.params.id, req.body);
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ error: "Could not update user" });
    }
});

//addPostToUser(userID, postID)
router.patch('/addpost/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for addPostToUser function!";
        }
        if (!req.body || !req.body.postID) {
            throw "No post ID was provided for addPostToUser function!";
        }
        if (!req.body.postID || typeof req.body.postID != "string" || req.body.postID.length == 0) {
            return res.status(400).json({ error: "Invalid post ID was provided for addPostToUser function" });
        }
        const updatedUser = await userData.addPostToUser(req.params.id, req.body.postID);
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ error: "Could not add post to user" });
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
        const updatedUser = await userData.removePostFromUser(req.params.id, req.body.postID);
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json({ error: "Could not remove post from user" });
    }
});

module.exports = router;