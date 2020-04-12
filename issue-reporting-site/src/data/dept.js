const mongoCollections = require('../config/mongoCollections');
const dept = mongoCollections.dept;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const mongoConnection = require('../config/mongoConnection');

async function getDeptById(id) {
    if(!id || typeof id == "undefined"){
        throw new Error("Invalid Id");
    }
    const deptCollection = await dept();
    const department = await deptCollection.findOne({_id: ObjectId(id)});
    if (!department) throw new Error('User not found');
    console.log(department);
    return department;
}

async function createDept(deptName, posts){
    if(!deptName || !posts || !Array.isArray(posts) || typeof deptName != 'string'){
        throw new Error("Argument of incorrect type");
    }

    if (!Array.isArray(posts) || typeof deptName != 'string'){
        throw new Error("Argument of incorrect type");
    }
    
    if(posts.length > 0 ) {
        for (const postId in posts) {
            // call getPostById() and 
        }
    }

    const deptCollection = await dept();

    let newDept = {
        deptName: deptName,
        posts: posts
    };

    const newDeptInformation = await deptCollection.insertOne(newDept);
    if (!newDeptInformation || newDeptInformation.insertedCount === 0) throw new Error('Insert User failed!');

}

async function deleteDept(deptId){

    if (!deptId || typeof(deptId) != "string" || deptId.length == 0) {
        throw new Error("Invalid Department ID");
    }
    const deptCollection = await dept();
    const removedDept = await deptCollection.removeOne({_id: ObjectId(deptId)});
    if (!removedDept || removedDept.deletedCount == 0) {
        throw new Error(`Could not remove Department with ${deptId} ID`);
    }
    console.log(removedDept);
    return removedDept;
}

module.exports = {getDeptById, createDept, deleteDept};

