
const mongoCollections = require("../config/mongoCollections");
const posts = mongoCollections.posts;
const comments = mongoCollections.comments;
const ObjectId = require("mongodb").ObjectID;

/**
 * @author Saumya Shastri, Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
let exportedMethods = {
    /**
     * Creates a new comment with the provided information; throws error if wrong type/number of
     * arguments were provided. Returns the newly created comment afterwards.
     * @param cBody comment content.
     * @param uID ID of the user who wrote the comment.
     * @param pID the ID of the post this comment belongs to.
     * @param time creation time of the comment.
     */
    async addComment(cBody, uID, pID, time) {
        //validates number of arguments
        if (arguments.length != 4) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!cBody || typeof (cBody) != "string" || cBody.length == 0) {
            throw new Error("Invalid comment content was provided");
        }
        if (!uID || typeof (uID) != "string" || uID.length == 0) {
            throw new Error("Invalid user ID was provided");
        }
        if (!pID || typeof (pID) != "string" || pID.length == 0) {
            throw new Error("Invalid post ID was provided");
        }
        if (!time || typeof (time) != "string" || time.length == 0) {
            throw new Error("Invalid timestamp was provided");
        }

        const commentsCollection = await comments();
        let newComment = {
            body: cBody,
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
        //adds the newly created commet ID into post collection
        await posts.addCommentToPost(pID, newId);

        return commentResult;
    },
    /**
     * Updates a specific comment with the provided information; throws error if wrong type/number of
     * arguments were provided.
     * 
     * @param commentID the ID of the comment to be updated.
     * @param uID the ID of the user who wrote the comment.
     * @param newBody comment content.
     * @param newTime creation time of the comment.
     */
    async editComment(commentID, uID, newBody, newTime) {
        //uID is the ID of the user trying to make the edit
        //validates number of arguments
        if (arguments.length != 4) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
            throw new Error("Invalid comment ID was provided");
        }
        if (!uID || typeof (uID) != "string" || uID.length == 0) {
            throw new Error("Invalid User ID was provided");
        }
        if (!newBody || typeof (newBody) != "string" || newBody.length == 0) {
            throw new Error("Invalid comment content was provided");
        }
        if (!newTime || typeof (newTime) != "string" || newTime.length == 0) {
            throw new Error("Invalid updated time stamp was provided");
        }

        const reqComment = await this.getComment(commentID);

        if (uID != reqComment.userID) {
            throw new Error("Not authorized to edit comment");
        }

        const commentsCollection = await comments();
        //updates only the comment DB, there is no need to update post DB as it only stores commentID 
        await commentsCollection.updateOne({ _id: ObjectId(commentID) }, { $set: { "body": newBody, "timeStamp": newTime } });
    },
    /**
     * Deletes a specific comment from the comment and post collections; throws error 
     * if wrong type/number of arguments were provided.
     * 
     * @param commentID the ID of the comment to be deleted.
     */
    async deleteComment(commentID) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
            throw new Error("Invalid comment ID was provided");
        }
        const commentsCollection = await comments();
        const postsCollection = await posts();

        let reqComment = await this.getComment(commentID);
        //removes the comment from the post collection
        posts.removeCommentToPost(reqComment.postID, commentID);
        //deletes comment from commentsCollection
        const deletionInfo = await commentsCollection.removeOne({ _id: ObjectId(commentID) });
        if (deletionInfo.deletedCount === 0) {
            throw `Could not delete comment with id of ${commentID}`;
        }
    },
    /**
     * Retrieves a specific comment with the given ID; throws error 
     * if wrong type/number of arguments were provided.
     * 
     * @param commentID the ID of the comment to be retrieved.
     */
    async getComment(commentID) {
        //validates number of arguments
        if (arguments.length != 1) {
            throw new Error("Wrong number of arguments");
        }
        //validates arguments type
        if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
            throw new Error("Invalid comment ID was provided");
        }

        const commentsCollection = await comments();
        const retComment = await commentsCollection.findOne({ _id: ObjectId(commentID) });
        if (retComment === null) throw "No comment with that id";
        return retComment;
    }
};

module.exports = exportedMethods;