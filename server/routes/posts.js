const express = require("express");
const router = express.Router();
const postData = require("./../data/posts");
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const postsPerPage = 9;

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/24/2020
 */
router.get('/', async (req, res) => {
    try {
        let allPosts = await client.hvalsAsync("posts");
        if (allPosts !== undefined && allPosts !== null && allPosts.length !== 0) {   //posts exist in Redis cache
            let results = [];
            for (let i = 0; i < allPosts.length; i++) { //is there a way to do it without loop?
                results.push(JSON.parse(allPosts[i]));
            }
            allPosts = results;
        } else {    //no post exists in Redis cache
            allPosts = await postData.getAllPosts();
            //loop through all the posts and add them to cache
            for (let i = 0; i < allPosts.length; i++) {
                await client.hsetAsync(["posts", `${allPosts[i]._id}`, JSON.stringify(allPosts[i])]);
            }
        }
        return res.status(200).json(allPosts);
    } catch (error) {
        return res.status(400).json({ error: `Could not get all posts! ${error}` });
    }
});

router.get('/page/:pageNo', async (req, res) => {
    try {
        let pageNo = (parseInt(req.params.pageNo)) - 1;
        let offset = postsPerPage * pageNo;
        let stopIndex = offset + postsPerPage;

        let allPosts = await client.hvalsAsync("posts");
        if (allPosts !== undefined && allPosts !== null && allPosts.length !== 0) {   //Post exists in Redis cache
            let results = [];
            for (let i = 0; i < allPosts.length; i++) { 
                results.push(JSON.parse(allPosts[i]));
            }
            allPosts = results;
        } else {    //No post exists in Redis cache
            allPosts = await postData.getAllPosts();
            //Loop through all the posts and add them to cache
            for (let i = 0; i < allPosts.length; i++) {
                await client.hsetAsync(["posts", `${allPosts[i]._id}`, JSON.stringify(allPosts[i])]);
            }
        }
        return res.status(200).json(allPosts.slice(offset, stopIndex));
    } catch (error) {
        return res.status(400).json({ error: `Could not get all posts! ${error}` });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for get method!";
        }
        let postID = req.params.id;
        let currentPost = await client.hgetAsync("posts", postID);
        
        if (currentPost) {  //found the post in Redis cache
            currentPost = JSON.parse(currentPost);
        } else {    //did not find the post in Redis cache
            currentPost = await postData.getPost(postID);
            await client.hsetAsync("posts", postID, JSON.stringify(currentPost));
        }
        return res.status(200).json(currentPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific post! ${error}` });
    }
});

router.get('/dept/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Department id was not provided for getAllPostsByDeptID method!";
        }
        let deptID = req.params.id;

        let allPosts = await client.hvalsAsync("posts");
        let currentPosts = allPosts.filter(postObj => JSON.parse(postObj).deptID == deptID);
        if (currentPosts !== undefined && currentPosts !== null && currentPosts.length !== 0) {  //found the post in Redis cache
            allPosts = [];
            for (let i = 0; i < currentPosts.length; i++) {
                allPosts.push(JSON.parse(currentPosts[i]));
            }
            currentPosts = allPosts;
        } else {    //did not find the post in Redis cache
            currentPosts = await postData.getAllPostsByDeptID(deptID);
            for (let i = 0; i < currentPosts.length; i++) {
                await client.hsetAsync(["posts", `${currentPosts[i]._id}`, JSON.stringify(currentPosts[i])]);
            }
        }
        return res.status(200).json(currentPosts);
    } catch (error) {
        return res.status(400).json({ error: `Could not get posts by department ID! ${error}` });
    }
});

router.get('/dept/:id/:pageNo', async (req, res) => {
    try {
        if (!req.params || !req.params.id || !req.params.pageNo) {
            throw "Department id or page No. was not provided for getAllPostsByDeptID method!";
        }

        let deptID = req.params.id;
        let pageNo = (parseInt(req.params.pageNo)) - 1;
        let offset = postsPerPage * pageNo;
        let stopIndex = offset + postsPerPage;

        let allPosts = await client.hvalsAsync("posts");
        let currentPosts = allPosts.filter(postObj => JSON.parse(postObj).deptID == deptID);
        if (currentPosts !== undefined && currentPosts !== null && currentPosts.length !== 0) {  //found the post in Redis cache
            allPosts = [];
            for (let i = 0; i < currentPosts.length; i++) {
                allPosts.push(JSON.parse(currentPosts[i]));
            }
            currentPosts = allPosts;
        } else {    //did not find the post in Redis cache
            currentPosts = await postData.getAllPostsByDeptID(deptID);
            for (let i = 0; i < currentPosts.length; i++) {
                await client.hsetAsync(["posts", `${currentPosts[i]._id}`, JSON.stringify(currentPosts[i])]);
            }
        }
        return res.status(200).json(currentPosts.slice(offset, stopIndex)); //Return posts only for that page
    } catch (error) {
        return res.status(400).json({ error: `Could not get posts by department ID! ${error}` });
    }
});

router.post('/', async (req, res) => {
    if (!req.body) {
        throw "No request body was provided for createPost function!";
    }
    const postInfo = req.body;
    if (!postInfo) {
        return res.status(400).json({ error: `You must provide information to create a new post! ${error}` });
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
        await client.hsetAsync("posts", `${newPost._id}`, JSON.stringify(newPost));
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not create new post! ${error}` });
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
        let postID = req.params.id;
        let postInfo = req.body;
        const newPost = await postData.updatePost(postID, postInfo.title, postInfo.body);
        await client.hsetAsync("posts", postID, JSON.stringify(newPost));
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not update post's title and body! ${error}` });
    }
});

router.patch('/resolve/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for resolvePost function!";
        }
        let postID = req.params.id;
        const newPost = await postData.resolvePost(postID);
        await client.hsetAsync("posts", postID, JSON.stringify(newPost));
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not change post's resolved status! ${error}` });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for updatePost function!";
        }
        let postID = req.params.id;
        const removedPost = await postData.deletePost(postID);
        await client.hdelAsync("posts", postID);
        return res.status(200).json(removedPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not delete post! ${error}` });
    }
});

module.exports = router;