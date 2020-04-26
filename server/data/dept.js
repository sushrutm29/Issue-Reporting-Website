const mongoCollections = require('../config/mongoCollections');
const dept = mongoCollections.dept;
const ObjectId = require('mongodb').ObjectId;

async function getDeptById(id) {
    if (!id || typeof id == "undefined") {
        throw "Invalid Id";
    }
    const deptCollection = await dept();
    const department = await deptCollection.findOne({ _id: ObjectId(id) });
    if (!department) {
        throw 'User not found';
    }
    return department;
}

async function createDept(reqbody) {
    console.log("enter createDept function");
    let deptName = reqbody.deptName;
    let posts = reqbody.posts;

    if (!deptName || !posts || !Array.isArray(posts) || typeof deptName != 'string') {
        throw "Argument of incorrect type";
    }

    if (!Array.isArray(posts) || typeof deptName != 'string') {
        throw "Argument of incorrect type";
    }

    const deptCollection = await dept();

    let newDept = {
        deptName: deptName,
        posts: posts
    };

    const newDeptInformation = await deptCollection.insertOne(newDept);

    if (!newDeptInformation || newDeptInformation.insertedCount === 0) throw new Error('Insert User failed!');

    let insertedDept = await getDeptById(newDeptInformation.insertedId);
    return insertedDept

}

async function deleteDept(deptId) {
    if (!deptId || typeof (deptId) != "string" || deptId.length == 0) {
        throw "Invalid Department ID";
    }
    let deletedDept = await getDeptById(deptId);
    const deptCollection = await dept();
    const removedDept = await deptCollection.removeOne({ _id: ObjectId(deptId) });

    if (!removedDept || removedDept.deletedCount == 0) {
        throw "Could not remove Department";
    }
    return deletedDept;

}

async function getAllDept() {
    //validates number of arguments
    if (arguments.length != 0) {
        throw new Error("Wrong number of arguments");
    }
    //gets all the departments in the dept collection
    const deptCollection = await dept();
    const allDepts = await deptCollection.find({}).toArray();
    console.log(`all Departments = ${JSON.stringify(allDepts)}`);
    return allDepts;
}

/** 
     * Appends the given post ID to a specific department posts list; 
     * throws error if wrong type/number of arguments were provided.
     * 
     * @param deptID the ID of the department to be updated.
     * @param postID the ID of the post to be appended.
    */
async function addPost(deptID, postID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptID || typeof (deptID) != "string" || deptID.length == 0) {
        throw new Error("Invalid department ID was provided");
    }
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    const deptCollection = await dept();
    const oldDept = await deptCollection.findOne({ _id: ObjectId(deptID) });
    let newPostList = oldDept.posts;
    newPostList.push(postID);
    const updatedDept = await deptCollection.updateOne({ _id: ObjectId(deptID) }, { $set: { "posts": newPostList } });
    if (!updatedDept || updatedDept.modifiedCount === 0) {
        throw new Error(`Unable to add post ${postID} to department ${deptID}!`);
    }
    return updatedDept;
}

/** 
     * Removes a given post ID from a specific department posts list; 
     * throws error if wrong type/number of arguments were provided.
     * 
     * @param deptID the ID of the department to be updated.
     * @param postID the ID of the post to be removed.
    */
async function removePost(deptID, postID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptID || typeof (deptID) != "string" || deptID.length == 0) {
        throw new Error("Invalid department ID was provided");
    }
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    const deptCollection = await dept();
    const updatedDept = await deptCollection.updateOne({ _id: ObjectId(deptID) }, {$pull: {posts: postID}});

    if (!updatedDept || updatedDept.updatedCount == 0) {
        throw new Error(`Unable to remove post ${postID} from department ${deptID}`);
    }
    return updatedDept;
}

//Redis function
// function storeDept(deptData) {

// }

module.exports = { getDeptById, createDept, deleteDept, getAllDept, addPost, removePost };