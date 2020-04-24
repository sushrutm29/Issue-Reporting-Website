const mongoCollections = require('../config/mongoCollections');
const dept = mongoCollections.dept;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const mongoConnection = require('../config/mongoConnection');

async function getDeptById(id) {
    if(!id || typeof id == "undefined"){
        throw "Invalid Id";
    }
    const deptCollection = await dept();
    const department = await deptCollection.findOne({_id: ObjectId(id)});
    if (!department) {
        throw 'User not found';
    }
    return department;
}

async function createDept(reqbody){
    
    let deptName = reqbody.deptName;
    let posts = reqbody.posts;

    if(!deptName || !posts || !Array.isArray(posts) || typeof deptName != 'string'){
        throw "Argument of incorrect type";
    }

    if (!Array.isArray(posts) || typeof deptName != 'string'){
        throw "Argument of incorrect type";
    }

    // if(posts.length > 0 ) {
    //     for (const postId in posts) {
    //         // call getPostById() and 
    //     }
    // }

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

async function deleteDept(deptId){
    if (!deptId || typeof(deptId) != "string" || deptId.length == 0) {
        throw "Invalid Department ID";
    }
    let deletedDept = await getDeptById(deptId);
    const deptCollection = await dept();
    const removedDept = await deptCollection.removeOne({_id: ObjectId(deptId)});

    if (!removedDept || removedDept.deletedCount == 0) {
        throw "Could not remove Department";
    }
    return deletedDept;

}

module.exports = {getDeptById, createDept, deleteDept};