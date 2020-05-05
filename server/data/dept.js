const mongoCollections = require('../config/mongoCollections');
const dept = mongoCollections.dept;
const ObjectId = require('mongodb').ObjectId;

/**
 * @author Sri Vallabhaneni, Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
/**
 * Returns the department with matching id; throws error 
 * if wrong type/number of arguments were provided.
 * 
 * @param id ID of the department to be retrieved.
 */
async function getDeptById(deptID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptID || typeof deptID == "undefined" || typeof deptID != "string" || deptID.length == 0) {
        throw "Invalid department id is provided for getDeptById function";
    }
    const deptCollection = await dept();
    const department = await deptCollection.findOne({ _id: ObjectId(deptID) });
    if (!department) {
        throw `Department not found with ID ${deptID}`;
    }
    return department;
}

/**
 * Returns the department with matching name; throws error 
 * if wrong type/number of arguments were provided.
 * 
 * @param id ID of the department to be retrieved.
 */
async function getDeptByName(deptName) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptName || typeof deptName == "undefined" || typeof deptName != "string" || deptID.length == 0) {
        throw "Invalid department name is provided for getDeptByName function";
    }
    const deptCollection = await dept();
    const department = await deptCollection.findOne({ deptName: ObjectId(deptName) });
    if (!department) {
        throw `Department not found with name ${deptName}`;
    }
    return department;
}

/**
 * Inserts a new department with the provided information into the db; throws error 
 * if wrong type/number of arguments were provided.
 * 
 * @param deptInfo information needed to create a new department.
 */
async function createDept(deptInfo) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!deptInfo.deptName || typeof deptInfo.deptName != 'string' || deptInfo.deptName == 0) {
        throw "Invalid department name is provided";
    }
    if (!deptInfo.posts || !Array.isArray(deptInfo.posts)) {
        throw "Invalid posts are provided";
    }

    const deptCollection = await dept();
    deptCollection.createIndex({ "deptName": 1 }, { unique: true });
    let newDept = {
        deptName: deptInfo.deptName,
        posts: deptInfo.posts
    };

    const newDeptInformation = await deptCollection.insertOne(newDept);
    if (!newDeptInformation || newDeptInformation.insertedCount === 0) {
        throw new Error('Insert User failed!');
    }
    let newDeptID = newDeptInformation.insertedId.toString();
    let insertedDept = await getDeptById(newDeptID);
    return insertedDept;
}

/**
 * Deletes the department with matching ID; throws error 
 * if wrong type/number of arguments were provided.
 * @param deptId ID of the department to be deleted.
 */
async function deleteDept(deptId) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
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

/**
 * Retrieves all the department available; throws error 
 * if wrong type/number of arguments were provided. 
 */
async function getAllDept() {
    //validates number of arguments
    if (arguments.length != 0) {
        throw new Error("Wrong number of arguments");
    }
    //gets all the departments in the dept collection
    const deptCollection = await dept();
    const allDepts = await deptCollection.find({}).toArray();
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
    let newDept = await getDeptById(deptID);
    return newDept;
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
    const updatedDept = await deptCollection.updateOne({ _id: ObjectId(deptID) }, { $pull: { posts: postID } });

    if (!updatedDept || updatedDept.updatedCount == 0) {
        throw new Error(`Unable to remove post ${postID} from department ${deptID}`);
    }
    let newDept = await getDeptById(deptID);
    return newDept;
}

module.exports = {
    getDeptById,
    getDeptByName,
    createDept,
    deleteDept,
    getAllDept,
    addPost,
    removePost
};