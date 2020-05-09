const express = require("express");
const router = express.Router();
const commentData = require("./../data/comments");
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
router.post('/', async (req, res) => {
    if (!req.body) {
        throw "No request body was provided for createPost function!";
    }
    const cInfo = req.body; //comment information
    if (!cInfo) {
        return res.status(400).json({ error: "You must provide information to create a new comment!" });
    }

    if (!cInfo.commentBody || typeof cInfo.commentBody != "string" || cInfo.commentBody.length == 0) {
        return res.status(400).json({ error: "Invalid comment body was provided" });
    }
    if (!cInfo.userID || typeof cInfo.userID != "string" || cInfo.userID.length == 0) {
        return res.status(400).json({ error: "Invalid comment user ID was provided" });
    }
    if (!cInfo.postID || typeof cInfo.postID != "string" || cInfo.postID.length == 0) {
        return res.status(400).json({ error: "Invalid comment post ID was provided" });
    }
    if (!cInfo.time || typeof cInfo.time != "string" || cInfo.time.length == 0) {
        return res.status(400).json({ error: "Invalid comment creation time was provided" });
    }

    try {
        const newComment = await commentData.addComment(cInfo.commentBody, cInfo.userID, cInfo.postID, cInfo.time);
        await client.hsetAsync("comments", `${newComment._id}`, JSON.stringify(newComment));
        return res.status(200).json(newComment);
    } catch (error) {
        return res.status(400).json({ error: `Could not create new comment! ${error}` });
    }
});

router.patch('/update/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Commet id was not provided for editComment function!";
        }
        if (!req.body) {
            throw "No request body was provided for editComment function!";
        }
        let commentInfo = req.body;
        if (!commentInfo.userID || typeof commentInfo.userID != "string" || commentInfo.userID.length == 0) {
            return res.status(400).json({ error: "Invalid user id was provided for editComment function" });
        }
        if (!commentInfo.commentBody || typeof commentInfo.commentBody != "string" || commentInfo.commentBody.length == 0) {
            return res.status(400).json({ error: "Invalid comment body was provided for editComment function" });
        }
        if (!commentInfo.time || typeof commentInfo.time != "string" || commentInfo.time.length == 0) {
            return res.status(400).json({ error: "Invalid creation time was provided for editComment function" });
        }
        let commentID = req.params.id;
        const newComment = await commentData.editComment(req.params.id, commentInfo.userID, commentInfo.commentBody, commentInfo.time);
        await client.hsetAsync("comments", commentID, JSON.stringify(newComment));
        return res.status(200).json(newComment);
    } catch (error) {
        return res.status(400).json({ error: `Could not update comment! ${error}` });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Comment id was not provided for deleteComment function!";
        }
        const commentID = req.params.id;
        let commentInfo = req.body;
        if (!commentInfo.userID || typeof commentInfo.userID != "string" || commentInfo.userID.length == 0) {
            return res.status(400).json({ error: "Invalid user id was provided for editComment function" });
        }
        const removedPost = await commentData.deleteComment(commentID, commentInfo.userID);
        await client.hdelAsync("comments", commentID);
        return res.status(200).json(removedPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not delete comment! ${error}` });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Comment id was not provided for getComment method!";
        }
        const commentID = req.params.id;
        let currentComment = await client.hgetAsync("comments", commentID);
        
        if (currentComment) {  //found the comment in Redis cache
            currentComment = JSON.parse(currentComment);
        } else {    //did not find the comment in Redis cache
            currentComment = await commentData.getComment(commentID);
            await client.hsetAsync("comments", commentID, JSON.stringify(currentComment));
        }
        return res.status(200).json(currentComment);
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific comment! ${error}` });
    }
});

module.exports = router;