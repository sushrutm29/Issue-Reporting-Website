const connection = require("../config//mongoConnection");
const users = require("../data/Seed-Data/users.json");
const departments = require("../data/Seed-Data/departments.json");
const posts = require("../data/Seed-Data/posts.json")
const comments = require("../data/Seed-Data/comments.json")
const userFunctions = require("../data/users");
const deptFunctions = require("../data/dept");
const postFunctions = require("../data/posts");
const comFunctions = require("../data/comments");
const bluebird = require("bluebird");
const redis = require("redis");
const redisClient = redis.createClient();
const elasticClient = require("../config/elasticConnection");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @author Shiwani Deo, Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020
 */
function getDepartmentId(depts, deptName) {
    for (index in depts) {
        if (depts[index].deptName == deptName) {
            return depts[index]._id.toString();
        }
    }
}

(async () => {
    try {
        let userIDs = [];   //array used to store all users' IDs
        let index;
        //cleas redis cache
        await redisClient.delAsync("users", "depts", "posts", "comments");
        //deletes old issues elasticsearch index
        await elasticClient.indices.delete({
            index: "issues"
        }).then(function(resp) {
            console.log(`Deleted Elasticsearch index = ${JSON.stringify(resp)}`);
        }, function(err) {
            console.trace(err.message);
        });
        //creates new issues elasticsearch index
        await elasticClient.indices.create({  
            index: "issues"
        },function(err,resp,status) {
            if(err) {
                console.log(err);
            }
            else {
                console.log("create",resp);
            }
        });
        //specify the elasticsearch posts type document fields' types
        await elasticClient.indices.putMapping({
            index: "issues",
            type: "posts",
             body: {
                properties: {
                    id: {
                        type: "keyword"
                    },
                    deptID: {
                        type: "keyword"
                    },
                    title: {
                        type: "keyword"
                    },
                    body: {
                        type: "keyword"
                    },
                    username: {
                        type: "keyword"
                    },
                    resolvedStatus: {
                        type: "boolean"
                    },
                    CreationTime: {
                        type: "date"
                    },
                    comments: {
                        type: "object"
                    }
                }
            },
        }, (err, resp, status) => {
            if (err) {
                console.log(err);
            } else {
                console.log(resp);
            }
        });
        
        //inserts initial user(s) from users.json into the database
        for (index in users) {
            try {
                let user = users[index];
                email = user.userEmail.toLowerCase();
                let newUser = await userFunctions.createUser(user.userName, user.userEmail, user.admin, user.profilePic);
                //adds the new user into the Redis cache
                await redisClient.hsetAsync("users", `${newUser._id}`, JSON.stringify(newUser));
                userIDs.push(newUser._id.toString());
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        //inserts departments from departments.json into the database 
        for (index in departments) {
            try {
                let dept = departments[index];
                let newDept = await deptFunctions.createDept(dept);
                //adds the new department into the Redis cache
                await redisClient.hsetAsync("depts", `${newDept._id}`, JSON.stringify(newDept));
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        const allDepartments = await deptFunctions.getAllDept();
        //inserts posts from posts.json into the database 
        for (index in posts) {
            try {
                let post = posts[index];
                let departmentID = getDepartmentId(allDepartments, post.dept); //Get department ID for post department
                //randomly selected a user as post's creator
                let randomNum = Math.floor(Math.random() * Math.floor(6));
                let uID = userIDs[randomNum];
                let currentUser = await userFunctions.getUserById(uID);
                let newPost = await postFunctions.createPost(departmentID, post.title, post.body, currentUser.userName.toString(), currentUser.userEmail.toString());
                //adds the new post into the Redis cache
                await redisClient.hsetAsync("posts", `${newPost._id}`, JSON.stringify(newPost));
                //creates post document in elasticsearch server
                let newPostID = newPost._id.toString();
                let dataBody = newPost;
                dataBody.id = dataBody._id;
                delete dataBody._id;
                await elasticClient.index({
                    index: "issues",
                    id: newPostID, 
                    type: "posts",
                    body: dataBody
                }).then(function(resp) {
                    console.log(`creates post elasticsearch document = ${JSON.stringify(resp)}`);
                }, function(err) {
                    console.trace(err.message);
                });
                index++;
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        let allPosts = await postFunctions.getAllPosts();
        let counter = 0;  //comment array index
        // inserts comments from comments.json
        var BreakException = {};
        // while (counter < comments.length) {
        for (let i = 0; i < comments.length; i++) {
            try {
                let post = allPosts[i];
                let currentComment = comments[i];
                let cBody = currentComment.commentBody;
                let currentUser = await userFunctions.getUserByName(post.username);
                //adds the comment to mongoDB
                let newComment = await comFunctions.addComment(cBody, currentUser._id.toString());
                //adds the comment into the Redis cache
                await redisClient.hsetAsync("comments", `${newComment._id}`, JSON.stringify(newComment));
                //adds the comment to post
                let updatedPost = await postFunctions.addCommentToPost(post._id.toString(), newComment._id.toString());
                //adds the updated post into the Redis cache
                await redisClient.hsetAsync("posts", `${updatedPost._id}`, JSON.stringify(updatedPost));
                
                //updates post document in elasticsearch server
                let dataBody = updatedPost;
                dataBody.id = dataBody._id;
                delete dataBody._id;
                await elasticClient.index({
                    index: "issues",
                    id: updatedPost.id.toString(),
                    type: "posts",
                    body: dataBody
                });
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }
        
    } catch (error) {
        console.log(error.message);
    }
    const db = await connection();
    await db.serverConfig.close();
    process.exit(0);
})();