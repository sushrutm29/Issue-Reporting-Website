const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
const deptData = require("./dept");
const users = mongoCollections.users;
const userData = require("./users");
const commentData = require("./comments");
const ObjectId = require("mongodb").ObjectID;
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
/** 
 * Creates a new post with the provided information; throws error if wrong type/number of
 * arguments were provided. Returns the newly created post afterwards.
 * 
 * @param deptID department that the post belongs to.
 * @param title title of the new post.
 * @param body description of the post.
 * @param username user who created the post.
*/
async function createPost(deptID, title, body, username) {
    //validates number of arguments
    if (arguments.length != 4) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptID || typeof (deptID) != "string" || deptID.length == 0) {
        throw new Error("Invalid department ID was provided");
    }
    if (!title || typeof (title) != "string" || title.length == 0) {
        throw new Error("Invalid post title was provided");
    }
    if (!body || typeof (body) != "string" || body.length == 0) {
        throw new Error("Invalid post body was provided");
    }
    if (!username || typeof (username) != "string" || username.length == 0) {
        throw new Error("Invalid post username was provided");
    }
    var currentdate = new Date();
    let creationTime = currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate();

    const postsCollection = await posts();
    //prevents duplicated post object to be inserted into the database
    postsCollection.createIndex({ "title": 1, "username": 1 }, { unique: true });
    let newPost = {
        deptID: deptID,
        title: title,
        body: body,
        username: username,
        resolvedStatus: false,
        CreationTime: creationTime,
        comments: []
    };

    const insertPost = await postsCollection.insertOne(newPost);
    //checks if post data was inserted correctly
    if (!insertPost || insertPost.insertedCount === 0) {
        throw new Error("Unable to add new post!");
    }
    //gets the inserted post and returns it
    const newPostID = insertPost.insertedId;
    const postResult = await this.getPost(newPostID.toString());
    //adds the new post into department collection
    let updatedDept = await deptData.addPost(postResult.deptID, newPostID.toString());
    await client.hsetAsync("depts", `${updatedDept._id}`, JSON.stringify(updatedDept));
    //adds the new post ID into user collection
    
    const usersCollection = await users();
    const currentUser = await usersCollection.findOne({ userName: username});
    let updatedUser = await userData.addPostToUser(currentUser._id.toString(), newPostID.toString());
    await client.hsetAsync("users", currentUser._id.toString(), JSON.stringify(updatedUser));
    return postResult;
}
/** 
 * Deletes a post with the matching post ID; throws error if wrong type/number of
 * arguments were provided. Returns the deleted post afterwards.
 * 
 * @param postID the ID of the post to be deleted.
*/
async function deletePost(postID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    const postsCollection = await posts();
    
    const deletedPost = await this.getPost(postID);
    const removedPost = await postsCollection.removeOne({ _id: ObjectId(postID) });
    if (!removedPost || removedPost.deletedCount == 0) {
        throw new Error(`Could not remove post with ${postID} ID!`);
    }
    //removes the post from department collection
    let updatedDept = await deptData.removePost(deletedPost.deptID, postID);
    await client.hsetAsync("depts", `${updatedDept._id}`, JSON.stringify(updatedDept));
    let deletedC = deletedPost.comments;
    let userName = deletedPost.username;
    const userCollection = await users();
    let currentUser = await userCollection.findOne({ userName: userName });
    let userID = currentUser._id.toString();
    //loop through the comments array and delete them
    for (let i = 0; i < deletedC.length; i++) {
        await commentData.deleteComment(deletedC[i], userID);
        await client.hdelAsync("comments", deletedC[i]);
    }
    //removes post from user collection
    let updatedUser = await userData.removePostFromUser(userID, postID);
    await client.hsetAsync("users", `${updatedUser._id}`, JSON.stringify(updatedUser));
    return deletedPost;
}
/** 
 * Updates a post's information with the provided arguments; throws error if wrong type/number of
 * arguments were provided.
 * 
 * @param postID the ID of the post to be updated.
 * @param title new title for the post.
 * @param body new description for the post.
*/
async function updatePost(postID, title, body) {
    //validates number of arguments
    if (arguments.length < 2) {    //must provide either title or body
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    if (title && (typeof(title) != "string" || title.length == 0)) {
        throw new Error("Invalid post title was provided");
    }
    if (body && (typeof(body) != "string" || body.length == 0)) {
        throw new Error("Invalid post body was provided");
    }
    const postsCollection = await posts();
    const oldPost = await postsCollection.findOne({_id: ObjectId(postID)});
    let newTitle = (title) ? title : oldPost.title;
    let newBody = (body) ? body : oldPost.body;
    const updatedPost = await postsCollection.updateOne({_id: ObjectId(postID)}, {$set: {"title": newTitle, "body": newBody}});
    if (!updatedPost || updatedPost.modifiedCount === 0) {
        throw new Error("Unable to update post!");
    }
    let resultPost = await this.getPost(postID);
    return resultPost;
}
/** 
 * Sets a specific post's resoled status to the opposite of what it had 
 * ('true' to 'false' or 'false' to 'true'); throws error if wrong type/number of
 * arguments were provided.
 * 
 * @param postID the ID of the post to be updated.
*/
async function resolvePost(postID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    const postsCollection = await posts();
    const oldPost = await postsCollection.findOne({_id: ObjectId(postID)});
    const updatedPost = await postsCollection.updateOne({_id: ObjectId(postID)}, {$set: {"resolvedStatus": !oldPost.resolvedStatus}});
    if (!updatedPost || updatedPost.modifiedCount === 0) {
        throw new Error(errorMessages.UpdateDestinationError);
    }
    let resultPost = await this.getPost(postID);
    return resultPost;
}
/** 
 * Retrieves a specific post with the matching ID; throws error if wrong type/number of
 * arguments were provided or no post found with matching ID.
 * 
 * @param postID the post ID of the post to be retrieved.
*/
async function getPost(postID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    //gets the specific post
    const postsCollection = await posts();
    const singlePost = await postsCollection.findOne({ _id: ObjectId(postID) });
    if (!singlePost) {
        throw new Error(`Post with ${postID} ID not found!`);
    }
    return singlePost;
}
/** 
 * Returns all the posts with the same department ID as the provided one; throws error if wrong type/number of
 * arguments were provided or no post found with matching department ID.
 * 
 * @param deptID the department ID of the posts to be retrieved.
*/
async function getAllPostsByDeptID(deptID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptID || typeof (deptID) != "string" || deptID.length == 0) {
        throw new Error("Invalid department ID was provided");
    }
    //gets the post with matching department ID
    const postsCollection = await posts();
    const allPosts = await postsCollection.find({ deptID: deptID }).toArray();
    if (!allPosts) {
        throw new Error(`Couldn't retrieve any post with department ID: ${deptID}`);
    }
    return allPosts;
}
/** 
 * Returns all the posts in the posts collection; throws error if wrong type/number of
 * arguments were provided.
*/
async function getAllPosts() {
    //validates number of arguments
    if (arguments.length != 0) {
        throw new Error("Wrong number of arguments");
    }
    //gets all the posts in the posts collection
    const postsCollection = await posts();
    const allPosts = await postsCollection.find({}).toArray();
    return allPosts;
}
/**
 * Adds a comment ID to a specific post; throws error if wrong type/number of
 * arguments were provided. Returns the updated post afterwards.
 * 
 * @param postID the ID of the post to be updated.
 * @param commentID the ID of the comment to be added.
 */
async function addCommentToPost(postID, commentID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
        throw new Error("Invalid comment ID was provided");
    }
    const postsCollection = await posts();
    const updatedPost = await postsCollection.updateOne({ _id: ObjectId(postID) }, { $addToSet: { "comments": commentID } });
    if (!updatedPost || updatedPost.modifiedCount === 0) {
        throw new Error(`Unable to add comment ID to post ${postID}!`);
    }
    let resultPost = await this.getPost(postID);
    return resultPost;
}
/**
 * Removes a comment ID from a specific post; throws error if wrong type/number of
 * arguments were provided. Returns the updated post afterwards.
 * 
 * @param postID the ID of the post to be updated.
 * @param commentID the ID of the comment to be removed.
 */
async function removeCommentFromPost(postID, commentID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
        throw new Error("Invalid comment ID was provided");
    }
    const postsCollection = await posts();
    const updatedPost = await postsCollection.updateOne({ _id: ObjectId(postID) }, { $pull: { "comments": commentID } });
    
    if (!updatedPost || updatedPost.modifiedCount === 0) {
        throw new Error(`Unable to remove comment ID from post ${postID}!`);
    }
    let resultPost = await this.getPost(postID);
    return resultPost;
}


module.exports = {
    createPost,
    deletePost,
    updatePost,
    resolvePost,
    getPost,
    getAllPostsByDeptID,
    getAllPosts,
    addCommentToPost,
    removeCommentFromPost
};