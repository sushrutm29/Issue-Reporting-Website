const express = require("express");
const router = express.Router();
const postData = require("./../data/posts");

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/24/2020
 */
router.get('/', async (req, res) => {
    try {
        const multiPosts = await postData.getAllPosts();
        return res.status(200).json(multiPosts);
    } catch (error) {
        return res.status(400).json({ error: "Could not get all posts!" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for get method!";
        }
        const currentPost = await postData.getPost(req.params.id);
        return res.status(200).json(currentPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not get a specific post!" });
    }
});

router.get('/dept/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Department id was not provided for getAllPostsByDeptID method!";
        }
        const currentPosts = await postData.getAllPostsByDeptID(req.params.id);
        return res.status(200).json(currentPosts);
    } catch (error) {
        return res.status(400).json({ error: "Could not get posts by department ID!" });
    }
});

router.post('/', async (req, res) => {
    const postInfo = req.body;
    if (!postInfo) {
        return res.status(400).json({ error: "You must provide information to create a new post!" });
    }

    if (!postInfo.deptID || typeof postInfo.deptID != "string" || postInfo.deptID.length == 0) {
        return res.status(400).json({ error: "Invalid department id was provided" });
    }

    if (!postInfo.title || typeof postInfo.title != "string" || postInfo.title.length == 0) {
        return res.status(400).json({ error: "Invalid post title was provided" });
    }

    if (!postInfo.body || typeof postInfo.body != "string" || postInfo.body.length == 0) {
        return res.status(400).json({ error: "Invalid post body was provided" });
    }

    if (!postInfo.username || typeof postInfo.username != "string" || postInfo.username.length == 0) {
        return res.status(400).json({ error: "Invalid post creator was provided" });
    }

    try {
        const newPost = await postData.createPost(postInfo.deptID, postInfo.title, postInfo.body, postInfo.username);
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not create new post!" });
    }
});

router.patch('/update/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for updatePost function!";
        }
        if (!req.body) {
            throw "No request body was provided for updatePost function!";
        }
        let postInfo = req.body;
        const newPost = await postData.updatePost(req.params.id, postInfo.title, postInfo.body);
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not update post's title and body!" });
    }
});

router.patch('/resolve/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for resolvePost function!";
        }
        const newPost = await postData.resolvePost(req.params.id);
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not change post's resolved status!" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for updatePost function!";
        }
        const removedPost = await postData.deletePost(req.params.id);
        return res.status(200).json(removedPost);
    } catch (error) {
        return res.status(400).json({ error: "Could not delete post!" });
    }
});

module.exports = router;