const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const mongoConnection = require('../config/mongoConnection');
const im = require('imagemagick');

async function getUserById(id) {
    if(!id || typeof id == "undefined"){
        throw new Error("Argument missing or invalid!");
    }
    const usersCollection = await users();
    const user = await usersCollection.findOne({_id: ObjectId(id)});
    if (!user) throw new Error('User not found!');
    return user;
}

async function createUser(userName, userEmail, userPassword, admin, posts, profilePic) {
    if(!userName || !userEmail || !userPassword || typeof admin == 'undefined' || !posts || typeof profilePic == 'undefined'){
        throw new Error("Argument missing or invalid!");
    }

    if(typeof userName != 'string' || typeof userEmail != 'string' || typeof userPassword != 'string' || typeof admin != 'boolean' || !Array.isArray(posts) || typeof profilePic !== 'boolean'){
        throw new Error("Argument of incorrect type!");
    }
    const usersCollection = await users();

    let newUser = {
        userName: userName,
        userEmail: userEmail,
        userPassword: userPassword,
        admin: admin,
        posts: posts
    };

    const newInsertInformation = await usersCollection.insertOne(newUser);
    if (!newInsertInformation || newInsertInformation.insertedCount === 0) throw new Error('Insert User failed!');

    const insertedUser =  await this.getuserById(newInsertInformation.insertedId + '');

    if(!profilePic){
        return insertedUser;
    }else{
        const connection = await mongoConnection();
        const bucket = new mongodb.GridFSBucket(connection, {
            bucketName: 'profilePics'
        });
        await fs.readdir('public/uploads/', (err, files) => {
            files.forEach(file => {
              if(file !== 'profilePic.png'){
                im.convert([file, 'profilePic.png'], 
                function(err, stdout){
                    if (err) throw err;
                    console.log('stdout:', stdout);
                });
              }
            });
        });
        await fs.createReadStream('public/uploads/profilePic.png').
            pipe(bucket.openUploadStream(insertedUser._id.toString())).
            on('error', function (error) {
                assert.ifError(error);
            }).
            on('finish', function () {
                assert.ok("Done");
            });
    }
}

module.exports = {getUserById, createUser};