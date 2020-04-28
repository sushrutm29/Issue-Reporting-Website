const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const mongoConnection = require('../config/mongoConnection');
const im = require('imagemagick');
const mongodb = require('mongodb');
const assert = require('assert');

async function getUserById(id) {
    if(!id || typeof id !== "string"){
        throw new Error("Argument missing or invalid!");
    }
    const usersCollection = await users();
    const userOne = await usersCollection.findOne({"_id": ObjectId(id)});
    if (userOne === null || userOne === undefined) throw new Error('User not found!');
    return userOne;
}

async function createUser(userName, userEmail, admin, profilePic) {
    if(!userName || !userEmail || typeof admin == 'undefined' || typeof profilePic == 'undefined'){
        throw new Error("Argument missing or invalid!");
    }

    if(typeof userName != 'string' || typeof userEmail != 'string' || typeof admin != 'boolean' || typeof profilePic !== 'boolean'){
        throw new Error("Argument of incorrect type!");
    }
    const usersCollection = await users();

    let newUser = {
        userName: userName,
        userEmail: userEmail,
        admin: admin,
        posts: []
    };

    const newInsertInformation = await usersCollection.insertOne(newUser);
    if (!newInsertInformation || newInsertInformation.insertedCount === 0) throw new Error('Insert User failed!');

    const insertId = newInsertInformation.insertedId;
    const insertedUser =  await getUserById(insertId+'');

    if(!profilePic){
        return insertedUser;
    }else{
        const uploadPath = __dirname+'/../../client/public/uploads';
        const connection = await mongoConnection();
        let bucket = new mongodb.GridFSBucket(connection, {
            bucketName: 'profilePics'
        });
        fs.readdir(uploadPath, (err, files)=>{
            if (err) {
                console.log('Unable to scan directory: ' + err);
            } 

            im.convert([uploadPath + '/' + files[0], uploadPath + '/profilePic.png'], function (err, stdout) {
                if (err)
                    throw err;
                fs.createReadStream(uploadPath+'/profilePic.png').
                    pipe(bucket.openUploadStream(insertedUser._id.toString())).
                    on('error', function (error) {
                        assert.ifError(error);
                    }).
                    on('finish', function () {
                        assert.ok("Done");
                    });
            });
        });
    }
    return insertedUser
}

module.exports = {getUserById, createUser};