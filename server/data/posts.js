const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
const comments = mongoCollections.comments;
const ObjectId = require("mongodb").ObjectID;

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
let exportedMethods = {
    /** 
     * Creates a new post with the provided information; throws error if wrong type/number of
     * arguments were provided. Returns the newly created post afterwards.
     * 
     * @param deptID department that the post belongs to.
     * @param title title of the new post.
     * @param body description of the post.
     * @param username user who created the post.
    */
    async createPost(deptID, title, body, username)  {
        //validates number of arguments
        if (arguments.length != 4) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!deptID || typeof(deptID) != "string" || deptID.length == 0) {
            throw new Error("Invalid Department ID was provided");
        }
        if (!title || typeof(title) != "string" || title.length == 0) {
            throw new Error("Invalid post title was provided");
        }
        if (!body || typeof(body) != "string" || body.length == 0) {
            throw new Error("Invalid post body was provided");
        }
        if (!username || typeof(username) != "string" || username.length == 0) {
            throw new Error("Invalid post username was provided");
        }
        var currentdate = new Date(); 
        let creationTime = currentdate.getFullYear() + '-' +(currentdate.getMonth() + 1) + '-' + currentdate.getDate();

        const postsCollection = await posts();
        // //prevents duplicated post object to be inserted into the database
        // postsCollection.createIndex({"deptID":1},{unique:true});
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
        const newId = insertPost.insertedId;
        const postResult = await this.getPost(newId.toString()); 
        return postResult; 
    },
    /** 
     * Deletes a post with the matching post ID; throws error if wrong type/number of
     * arguments were provided. Returns the deleted post afterwards.
     * 
     * @param postID the ID of the post to be deleted.
    */
    async deletePost(postID) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!postID || typeof(postID) != "string" || postID.length == 0) {
            throw new Error("Invalid post ID was provided");
        }
        const postsCollection = await posts();
        const removedPost = await postsCollection.removeOne({_id: ObjectId(postID)});
        if (!removedPost || removedPost.deletedCount == 0) {
            throw new Error(`Could not remove post with ${postID} ID!`);
        }
        
        return removedPost;
    },
    /** 
     * Updates a post's information with the provided arguments; throws error if wrong type/number of
     * arguments were provided.
     * 
     * @param postID the ID of the post to be updated.
     * @param title new title for the post.
     * @param body new description for the post.
    */
    async updatePost(postID, title, body) {
        //validates number of arguments
        if (arguments.length != 3) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!postID || typeof(postID) != "string" || postID.length == 0) {
            throw new Error("Invalid post ID was provided");
        }
        if (!title || typeof(title) != "string" || title.length == 0) {
            throw new Error("Invalid post title was provided");
        }
        if (!body || typeof(body) != "string" || body.length == 0) {
            throw new Error("Invalid post body was provided");
        }
        const postsCollection = await posts();
        const updatedDestination = await postsCollection.updateOne({_id: ObjectId(postID)}, {$set: {"title": title, "body": body}});
        if (!updatedDestination || updatedDestination.modifiedCount === 0) {
            throw new Error("Unable to update post!");
        }
    },
    /** 
     * Sets a specific post's resoled status to true; throws error if wrong type/number of
     * arguments were provided.
     * 
     * @param postID the ID of the post to be updated.
    */
    async resolvePost(postID) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!postID || typeof(postID) != "string" || postID.length == 0) {
            throw new Error("Invalid Department ID was provided");
        }
        const postsCollection = await posts();
        const updatedPost = await postsCollection.updateOne({_id: ObjectId(postID)}, {$set: {"resolvedStatus": true}});
        if (!updatedPost || updatedPost.modifiedCount === 0) {
            throw new Error(errorMessages.UpdateDestinationError);
        }
    }, 
    /** 
     * Retrieves a specific post with the matching ID; throws error if wrong type/number of
     * arguments were provided or no post found with matching ID.
     * 
     * @param postID the post ID of the post to be retrieved.
    */
    async getPost(postID) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!postID || typeof(postID) != "string" || postID.length == 0) {
            throw new Error("Invalid Department ID was provided");
        }
        //gets the specific post
        const postsCollection = await posts();
        const singlePost = await postsCollection.findOne({_id: ObjectId(postID)});
        if (!singlePost) {
            throw new Error(`Post with ${postID} ID not found!`);
        }

        return singlePost;
    }, 
    /** 
     * Returns all the posts with the same department ID as the provided one; throws error if wrong type/number of
     * arguments were provided or no post found with matching department ID.
     * 
     * @param deptID the department ID of the posts to be retrieved.
    */
    async getAllPostsByDeptID(deptID) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!deptID || typeof(deptID) != "string" || deptID.length == 0) {
            throw new Error("Invalid Department ID was provided");
        }
        //gets the post with matching department ID
        const postsCollection = await posts();
        const allPosts = await postsCollection.find({deptID: deptID}).toArray();
        if (!allPosts) {
            throw new Error(`Couldn't retrieve any post with department ID: ${deptID}`);
        }
        return allPosts;
    },
    /** 
     * Returns all the posts in the posts collection; throws error if wrong type/number of
     * arguments were provided.
    */
    async getAllPosts() {
        //validates number of arguments
        if (arguments.length != 0) {
            throw new Error("Wrong number of arguments");
        }
        //gets all the posts in the posts collection
        const postsCollection = await posts();
        const allPosts = await postsCollection.find({}).toArray();
        return allPosts;
    },

   // async addComment(postID, commentID)
   async addComment(cBody, uID, pID, time)
    {
        //userID has commented on postID
        //add comment to DB + update post DB

        if (arguments.length != 4) {
            throw new Error("Wrong number of arguments");
        }
        if (!cBody || typeof(cBody) != "string" || cBody.length == 0) {
            throw new Error("Invalid comment content was provided");
        }
        if (!uID || typeof(uID) != "string" || uID.length == 0) {
            throw new Error("Invalid user ID was provided");
        }
        if (!pID || typeof(pID) != "string" || pID.length == 0) {
            throw new Error("Invalid post ID was provided");
        }
        if (!time || typeof(time) != "string" || time.length == 0) {
            throw new Error("Invalid timestamp was provided");
        }

        const commentsCollection = await comments();

        let newComment = {
            body : cBody,
            userID: uID,
            postID: pID,
            timeStamp: time,
        };

        const insertComment = await commentsCollection.insertOne(newComment);
        //checks if comment was inserted correctly
        if (!insertComment || insertComment.insertedCount === 0) {
            throw new Error("Unable to add new comment!");
        }
        //gets the inserted comment and returns it
        const newId = insertComment.insertedId;
        const commentResult = await this.getComment(newId.toString()); 

        const reqPost = await this.getPost(pID);
        reqPost.comments.push(newId);
        
        return commentResult; 
    },

    async editComment(commentID, uID, newBody, newTime)
    {
        //uID is the ID of the user trying to make the edit
        if (arguments.length != 4) {
            throw new Error("Wrong number of arguments");
        }
        if (!commentID || typeof(commentID) != "string" || commentID.length == 0) {
            throw new Error("Invalid comment ID was provided");
        }
        if (!uID || typeof(uID) != "string" || uID.length == 0) {
            throw new Error("Invalid User ID was provided");
        }
        if (!newBody || typeof(newBody) != "string" || newBody.length == 0) {
            throw new Error("Invalid comment content was provided");
        }
        if (!newTime || typeof(newTime) != "string" || newTime.length == 0) {
            throw new Error("Invalid updated time stamp was provided");
        }

        const reqComment = await this.getComment(commentID);
        
        if(uID != reqComment.userID){
            throw new Error("Not authorized to edit comment");
        }

        const commentsCollection = await comments();
        commentsCollection.update({_id:commentID}, {$set: {body : newBody, timeStamp : newTime}});
        //updated the comment DB, there is no need to update post DB as it only stores commentID 
    },

    async deleteComment(commentID)
    {
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        if (!commentID || typeof(commentID) != "string" || commentID.length == 0) {
            throw new Error("Invalid comment ID was provided");
        }
        const commentsCollection = await comments();
        const postsCollection = await posts();

        let reqComment = await this.getComment(commentID);

        postsCollection.update({'_id': reqComment.postID}, { $pull: { comments : commentID} },false,true); //deleted comment from the post
        //next delete comment from commentsCollection
        const deletionInfo = await commentsCollection.removeOne({ _id: ObjectId(commentID) });
        if (deletionInfo.deletedCount === 0) { throw `Could not delete comment with id of ${commentID}`;}
    },

    async getComment(commentID)
    {
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        if (!commentID || typeof(commentID) != "string" || commentID.length == 0) {
            throw new Error("Invalid comment ID was provided");
        }

        const commentsCollection = await comments();
        const retComment = await commentsCollection.findOne({_id : ObjectId(commentID)});
        if (retComment === null) throw "No comment with that id";
        return retComment;
    }
};

module.exports = exportedMethods;