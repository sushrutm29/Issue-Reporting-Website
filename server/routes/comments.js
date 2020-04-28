const express = require("express");
const router = express.Router();
const commentData = require("./../data/comments");

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/28/2020
 */
//addComment
router.post('/', async (req, res) => {
    if (!req.body) {
        throw "No request body was provided for createPost function!";
    }
    const cInfo = req.body; //comment information
    if (!cInfo) {
        return res.status(400).json({ error: "You must provide information to create a new comment!" });
    }

    if (!cInfo.cBody || typeof cInfo.cBody != "string" || cInfo.cBody.length == 0) {
        return res.status(400).json({ error: "Invalid comment body was provided" });
    }
    if (!cInfo.uID || typeof cInfo.uID != "string" || cInfo.uID.length == 0) {
        return res.status(400).json({ error: "Invalid comment user ID was provided" });
    }
    if (!cInfo.pID || typeof cInfo.pID != "string" || cInfo.pID.length == 0) {
        return res.status(400).json({ error: "Invalid comment post ID was provided" });
    }
    if (!cInfo.time || typeof cInfo.time != "string" || cInfo.time.length == 0) {
        return res.status(400).json({ error: "Invalid comment creation time was provided" });
    }

    try {
        const newComment = await commentData.addComment(cInfo.cBody, cInfo.uID, cInfo.pID, cInfo.time);
        return res.status(200).json(newComment);
    } catch (error) {
        return res.status(400).json({ error: "Could not create new comment!" });
    }
});

//editComment
router.patch('/update/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Commet id was not provided for editComment function!";
        }
        if (!req.body) {
            throw "No request body was provided for editComment function!";
        }
        let commentInfo = req.body;
        if (!commentInfo.uID || typeof commentInfo.uID != "string" || commentInfo.uID.length == 0) {
            return res.status(400).json({ error: "Invalid user id was provided for editComment function" });
        }
        if (!commentInfo.newBody || typeof commentInfo.newBody != "string" || commentInfo.newBody.length == 0) {
            return res.status(400).json({ error: "Invalid comment body was provided for editComment function" });
        }
        if (!commentInfo.newTime || typeof commentInfo.newTime != "string" || commentInfo.newTime.length == 0) {
            return res.status(400).json({ error: "Invalid creation time was provided for editComment function" });
        }
        
        const newComment = await commentData.editComment(req.params.id, commentInfo.uID, commentInfo.newBody, commentInfo.newTime);
        return res.status(200).json(newComment);
    } catch (error) {
        return res.status(400).json({ error: "Could not update comment!" });
    }
});

//deleteComment
router.delete('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Comment id was not provided for deleteComment function!";
        }
        const removedPost = await commentData.deleteComment(req.params.id);
        return res.status(200).json(removedPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not delete comment!" });
    }
});

//getComment
router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Comment id was not provided for getComment method!";
        }
        const currentComment = await commentData.getComment(req.params.id);
        return res.status(200).json(currentComment);
    } catch (error) {
        return res.status(400).json({ error: "Could not get a specific comment!" });
    }
});

module.exports = router;