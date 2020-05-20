
const mongoCollections = require("../config/mongoCollections");
const comments = mongoCollections.comments;
const ObjectId = require("mongodb").ObjectID;

/**
 * @author Saumya Shastri, Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
/**
 * Creates a new comment with the provided information; throws error if wrong type/number of
 * arguments were provided. Returns the newly created comment afterwards.
 * @param cBody comment content.
 * @param uID ID of the user who wrote the comment.
 * @param time creation time of the comment.
 */
async function addComment(cBody, uID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!cBody || typeof (cBody) != "string" || cBody.length == 0) {
        throw new Error("Invalid comment content was provided");
    }
    if (!uID || typeof (uID) != "string" || uID.length == 0) {
        throw new Error("Invalid user ID was provided");
    }
    var currentdate = new Date();
    let creationTime = currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate();

    const commentsCollection = await comments();
    let newComment = {
        body: cBody,
        userID: uID,
        timeStamp: creationTime,
    };

    const insertComment = await commentsCollection.insertOne(newComment);
    //checks if comment was inserted correctly
    if (!insertComment || insertComment.insertedCount === 0) {
        throw new Error("Unable to add new comment!");
    }

    //gets the inserted comment and returns it
    const newId = insertComment.insertedId;
    const commentResult = await this.getComment(newId.toString());

    return commentResult;
}
/**
 * Updates a specific comment with the provided information; throws error if wrong type/number of
 * arguments were provided.
 * 
 * @param commentID the ID of the comment to be updated.
 * @param uID the ID of the user who wrote the comment.
 * @param newBody comment content.
 * @param newTime creation time of the comment.
 */
async function editComment(commentID, uID, newBody, newTime) {
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

    //checks if the current user is the owner of the comment
    const reqComment = await this.getComment(commentID);
    if (uID != reqComment.userID) {
        throw new Error(`User ${uID} Not authorized to edit comment`);
    }

    const commentsCollection = await comments();
    //updates only the comment DB, there is no need to update post DB as it only stores commentID 
    let updatedComment = await commentsCollection.updateOne({ _id: ObjectId(commentID) }, { $set: { "body": newBody, "timeStamp": newTime } });
    if (!updatedComment || updatedComment.modifiedCount === 0) {
        throw new Error("Unable to update comment!");
    }
    let resultComment = await this.getComment(commentID);
    return resultComment;
}
/**
 * Deletes a specific comment from the comment and post collections; throws error 
 * if wrong type/number of arguments were provided.
 * 
 * @param commentID the ID of the comment to be deleted.
 */
async function deleteComment(commentID, uID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
        throw new Error("Invalid comment ID was provided");
    }
    if (!uID || typeof (uID) != "string" || uID.length == 0) {
        throw new Error("Invalid user ID was provided");
    }
    const commentsCollection = await comments();
    const deletedComment = await this.getComment(commentID);
    if (uID != deletedComment.userID) {
        throw new Error(`User ${uID} Not authorized to delete comment`);
    }
    //deletes comment from commentsCollection
    const deletionInfo = await commentsCollection.removeOne({ _id: ObjectId(commentID) });
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete comment with id ${commentID}`;
    }
    return deletedComment;
}
/**
 * Retrieves a specific comment with the given ID; throws error 
 * if wrong type/number of arguments were provided.
 * 
 * @param commentID the ID of the comment to be retrieved.
 */
async function getComment(commentID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!commentID || typeof (commentID) != "string" || commentID.length == 0) {
        throw new Error("Invalid comment ID was provided");
    }

    const commentsCollection = await comments();
    const singleComment = await commentsCollection.findOne({ _id: ObjectId(commentID) });
    if (!singleComment) {
        throw `No comment found with id ${commentID}`;
    }
    return singleComment;
}

module.exports = {
    addComment,
    editComment,
    deleteComment,
    getComment
};