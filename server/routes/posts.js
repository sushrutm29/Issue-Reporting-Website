const express = require("express");
const router = express.Router();
const postData = require("./../data/posts");
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();
const elasticClient = require("../config/elasticConnection");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

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

// // for testing Elasticsearch getAll function
// router.get('/elasticAll', async (req, res) => {
//     console.log("starts getAllResults");
//     try {
//         let getAllResults = await getAllElastic();
//         console.log(`getAllResults = ${JSON.stringify(getAllResults)}`);
//         return res.status(200).json(getAllResults);
//     } catch (error) {
//         return res.status(400).json({ error: `Could not get all elastic posts! ${error}` });
//     }
// });

router.get('/elasticsearch', async (req, res) => {
    try {
        let keyWord = "";   //keyword to be searched among post's title and body
        // let keyWord = ".*";
        const postInfo = req.body;
        if (postInfo) { //search keywords are provided
            if (postInfo.keyword && typeof postInfo.keyword == "string" && postInfo.keyword.length != 0) {
                keyWord = postInfo.keyword;
                // keyWord = `.*${postInfo.keyword}.*`;
            }
        }
        await elasticClient.search({
            index: "issues",
            type: "posts",
            body: {
                query: {  
                    bool: {
                        should: [
                            { match_phrase : { title: keyWord }},
                            { match_phrase : { body: keyWord }}
                        ]
                    }
                }
            }
        }).then(function(resp) {
            return res.status(200).json(resp.hits.hits);
        }, function(error) {
            return res.status(400).json({ error: `Could not get a specific post via elastic search! ${error}` });
        });
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific post via elastic search! ${error}` });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for getPostById method!";
        }
        let postID = req.params.id;
        let currentPost = await client.hgetAsync("posts", postID);
        
        if (currentPost) {  //found the post in Redis cache
            currentPost = JSON.parse(currentPost);
        } else {    //did not find the post in Redis cache
            currentPost = await postData.getPostById(postID);
            await client.hsetAsync("posts", postID, JSON.stringify(currentPost));
        }
        return res.status(200).json(currentPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific post! ${error}` });
    }
});

router.get('/name/:name', async (req, res) => {
    try {
        if (!req.params || !req.params.name) {
            throw "User name was not provided for getPostByUsername method!";
        }
        let userName = req.params.name;
        currentPost = await postData.getPostByUsername(userName);
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
        //creates post document in elasticsearch server
        let newPostID = newPost._id.toString();
        let dataBody = newPost;
        dataBody.id = dataBody._id;
        delete dataBody._id;
        await elasticClient.index({
            index: "issues",
            type: "posts",
            id: newPostID, 
            body: dataBody
        }).then(function(resp) {
            console.log(`createPost elasticsearch response = ${resp}`);
        }, function(err) {
            console.trace(err.message);
        });
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
        //updates post document in elasticsearch server
        let newPostID = newPost._id.toString();
        let dataBody = newPost;
        dataBody.id = dataBody._id;
        delete dataBody._id;
        await elasticClient.index({
            index: "issues",
            type: "posts",
            id: newPostID, 
            body: dataBody
        }).then(function(resp) {
            console.log(`updatePost elasticsearch response = ${resp}`);
        }, function(err) {
            console.trace(err.message);
        });
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
        //updates post document in elasticsearch server
        let newPostID = newPost._id.toString();
        let dataBody = newPost;
        dataBody.id = dataBody._id;
        delete dataBody._id;
        await elasticClient.index({
            index: "issues",
            type: "posts",
            id: newPostID, 
            body: dataBody
        }).then(function(resp) {
            console.log(`resolvePost elasticsearch response = ${resp}`);
        }, function(err) {
            console.trace(err.message);
        });
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not change post's resolved status! ${error}` });
    }
});

router.patch('/addcom/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for addCommentToPost function!";
        }
        if (!req.body || !req.body.cID) {
            throw "No request body was provided for addCommentToPost function!";
        }
        let postID = req.params.id;
        const newPost = await postData.addCommentToPost(postID, req.body.cID);
        await client.hsetAsync("posts", postID, JSON.stringify(newPost));
        //updates post document in elasticsearch server
        let newPostID = newPost._id.toString();
        let dataBody = newPost;
        dataBody.id = dataBody._id;
        delete dataBody._id;
        await elasticClient.index({
            index: "issues",
            type: "posts",
            id: newPostID, 
            body: dataBody
        }).then(function(resp) {
            console.log(`addCommentToPost elasticsearch response = ${resp}`);
        }, function(err) {
            console.trace(err.message);
        });
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not add comment to post! ${error}` });
    }
});

router.patch('/deletecom/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for removeCommentFromPost function!";
        }
        if (!req.body || !req.body.cID) {
            throw "No request body was provided for removeCommentFromPost function!";
        }
        let postID = req.params.id;
        const deletedPost = await postData.removeCommentFromPost(postID, req.body.cID);
        await client.hsetAsync("posts", postID, JSON.stringify(deletedPost));
        //updates post document in elasticsearch server
        let deletedPostID = deletedPost._id.toString();
        let dataBody = deletedPost;
        dataBody.id = dataBody._id;
        delete dataBody._id;
        await elasticClient.index({
            index: "issues",
            type: "posts",
            id: deletedPostID, 
            body: dataBody
        }).then(function(resp) {
            console.log(`removeCommentFromPost elasticsearch response = ${resp}`);
        }, function(err) {
            console.trace(err.message);
        });
        return res.status(200).json(deletedPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not remove comment from post! ${error}` });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for deletePost function!";
        }
        let postID = req.params.id;
        const removedPost = await postData.deletePost(postID);
        await client.hdelAsync("posts", postID);
        //deletes the post document in elasticsearch server
        await elasticClient.delete({
            index: "issues",
            id: postID,
            type: "posts"
        }).then(function(resp) {
            console.log(`deletePost elasticsearch response = ${resp}`);
        }, function(err) {
            console.trace(`Deleted Elasticsearch document error = ${err.message}`);
        });
        return res.status(200).json(removedPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not delete post! ${error}` });
    }
});

// for testing elasticsearch
// async function getAllElastic() {
//     let results = await elasticClient.search({
//         index: "issues",
//         type: "posts",
//         body: {
//             query: {
//                 match_all: {}
//             }
//         }
//     }).then(function(resp) {
//         return resp.hits.hits;
//     }, function(err) {
//         console.trace(err.message);
//     });
//     return results;
// }

module.exports = router;