const express = require("express");
const router = express.Router();
const postData = require("./../data/posts");
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();
var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
  apiVersion: '7.6'
});
// bluebird.promisifyAll(elasticsearch.Client.prototype);

// elasticClient.ping({
//         requestTimeout: 30000,
//         }, function(error) {
//         if (error) {
//             console.error('Cannot connect to Elasticsearch.');
//         } else {
//             console.log('@@@@@Connected to Elasticsearch was successful!');
//         }
//     });

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
            currentPost = await postData.getPostById(postID);
            await client.hsetAsync("posts", postID, JSON.stringify(currentPost));
        }
        return res.status(200).json(currentPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific post! ${error}` });
    }
});

router.get('/elastic/:keyword', async (req, res) => {
    try {
        if (!req.params || !req.params.keyword) {
            throw "Search keywords were not provided for searchElasticDoc method!";
        }
        console.log("calls searchElasticDoc");
        await searchElasticDoc();
        // await getElasticSearch();
        // await getAllElastic();
        return res.status(200).json({ success: "ran searchElasticDoc"});
    } catch (error) {
        return res.status(400).json({ error: `Could not get a specific post! ${error}` });
    }
});

router.get('/name/:name', async (req, res) => {
    try {
        if (!req.params || !req.params.name) {
            throw "User name was not provided for get method!";
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
        await createElasticDoc("issues", newPost._id.toString(), "posts", newPost);
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

router.patch('/addcom/:id', async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Post id was not provided for resolvePost function!";
        }
        if (!req.body || req.body.cID) {
            throw "No request body was provided for updatePost function!";
        }
        let postID = req.params.id;
        const newPost = await postData.addCommentToPost(postID, req.body.cID);
        await client.hsetAsync("posts", postID, JSON.stringify(newPost));
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
        if (!req.body || req.body.cID) {
            throw "No request body was provided for removeCommentFromPost function!";
        }
        let postID = req.params.id;
        const newPost = await postData.removeCommentFromPost(postID, req.body.cID);
        await client.hsetAsync("posts", postID, JSON.stringify(newPost));
        return res.status(200).json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `Could not remove comment from post! ${error}` });
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

/**
 * Creates a post elasticsearch document
 * 
 * @param docID the ID of the document.
 * @param data the data used to created the document.
 */
async function createElasticDoc(docIndex, docID, docType, dataBody) {
    //validates number of arguments
    if (arguments.length != 4) {
        throw new Error("Wrong number of arguments");
    }
    console.log(`###dataBody = ${JSON.stringify(dataBody)}`);
    //removes the underscore from id field
    // let data = dataBody;
    dataBody.id = dataBody._id;
    delete dataBody._id;
    console.log(`&&&&dataBody = ${JSON.stringify(dataBody)}`);
    //validates arguments type
    console.log("Starts createElasticDoc function");
    elasticClient.index({
        index: docIndex,
        type: docType,
        id: docID,    //an automatic id will be generated if not specified
        body: dataBody
    }, function(err, resp, status) {
        console.log(`resp = ${JSON.stringify(resp)}`);
    })
}

async function searchElasticDoc() {
    //createElasticDoc("issues", newPost._id.toString(), "posts", newPost);
    console.log("Starts searchElasticDoc function");
    await elasticClient.search({
        index: "issues",
        type: "posts",
        body: {
            query: {
                regexp: {
                    title: ".*05.*"
                }
            }
        }
    }).then(function(resp) {
        console.log(resp);
        console.log(`body.hits.hits = ${JSON.stringify(resp.hits.hits)}`);
    }, function(err) {
        console.trace(err.message);
    });
}

async function getAllElastic() {
    await elasticClient.search({
        index: "issues",
        type: "posts",
        body: {
            query: {
                match_all: {}
            }
        }
    }).then(function(resp) {
        console.log(resp);
        console.log(`body.hits.hits = ${JSON.stringify(resp.hits.hits)}`);
    }, function(err) {
        console.trace(err.message);
    });
}

async function getElasticSearch() {
    console.log("Starts getElasticSearch function");
    await elasticClient.get({
        index: "issues",
        id: "5eb9edfa8c60937b80ce4a5f"
    }).then(function(resp) {
        console.log(`getElasticSearch = ${JSON.stringify(resp)}`);
    }, function(err) {
        console.trace(err.message);
    });
}

module.exports = router;