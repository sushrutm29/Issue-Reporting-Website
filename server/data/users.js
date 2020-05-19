const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const mongoConnection = require('../config/mongoConnection');
const im = require('imagemagick');
const mongodb = require('mongodb');
const assert = require('assert');

/**
 * @author Sushrut Madhavi, Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
/**
 * Returns a user with matching ID as the provided one; throws error if wrong type/number of
 * arguments were provided. 
 * @param userID the ID of the user to be retrieved.
 */
async function getUserById(userID) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!userID || typeof userID !== "string" || userID.length == 0) {
        throw new Error("Argument missing or invalid!");
    }
    const usersCollection = await users();
    const userOne = await usersCollection.findOne({ _id: ObjectId(userID) });
    if (userOne === null || userOne === undefined) {
        throw new Error('User not found!');
    }
    return userOne;
}

/**
 * Returns a user with matching user name as the provided one; throws error if wrong type/number of
 * arguments were provided. 
 * @param userName the name of the user to be retrieved.
 */
async function getUserByName(userName) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!userName || typeof userName != "string" || userName.length == 0) {
        throw "Invalid user name is provided for getUserByName function";
    }
    const usersCollection = await users();
    const user = await usersCollection.findOne({ userName: userName });
    if (!user) {
        throw `User not found with name ${userName}`;
    }
    return user;
}

/**
 * Returns a user with matching user email as the provided one; throws error if wrong type/number of
 * arguments were provided. 
 * @param email the email of the user to be retrieved.
 */
async function getUserByEmail(email) {
    //validates number of arguments
    if (arguments.length != 1) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!email || typeof email != "string" || email.length == 0) {
        throw "Invalid email is provided for getUserByName function";
    }
    const usersCollection = await users();
    const user = await usersCollection.findOne({ userEmail: email });
    if (!user) {
        throw `User not found with email ${email}`;
    }
    
    return user;
}

/**
 * Creates a new user with the provided information; throws error if wrong type/number of
 * arguments were provided. 
 * 
 * @param userName name of the new user.
 * @param userEmail email of the new user.
 * @param admin specifies whether the new user is admin or not.
 * @param profilePic specifies whether user uploaded profile picture or not
 */
async function createUser(userName, userEmail, admin, profilePic) {
    //validates number of arguments
    if (arguments.length != 4) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!userName || !userEmail || typeof admin == 'undefined' || typeof profilePic == 'undefined') {
        throw new Error("Argument missing or invalid!");
    }

    if (typeof userName != 'string' || typeof userEmail != 'string' || typeof admin != 'boolean' || typeof profilePic !== 'boolean') {
        throw new Error("Argument of incorrect type!");
    }

    if (userName.length == 0 || userEmail.length == 0) {
        throw new Error("Empty user name or user email was provided!");
    }
    const usersCollection = await users();
    //prevents duplicated post object to be inserted into the database
    usersCollection.createIndex({ "userName": 1, "userEmail": 1 }, { unique: true });
    let newUser = {
        userName: userName,
        userEmail: userEmail.toLowerCase(),
        admin: admin,
        posts: [],
        profilePic: profilePic
    };

    const newInsertInformation = await usersCollection.insertOne(newUser);
    if (!newInsertInformation || newInsertInformation.insertedCount === 0) throw new Error('Insert User failed!');

    const insertId = newInsertInformation.insertedId;
    const insertedUser = await getUserById(insertId + '');

    if (!profilePic) {
        return insertedUser;
    } else {
        const uploadPath = __dirname + '/../../client/public/uploads';
        const connection = await mongoConnection();
        let bucket = new mongodb.GridFSBucket(connection, {
            bucketName: 'profilePics'
        });
        fs.readdir(uploadPath, (err, files) => {
            if (err) {
                console.log('Unable to scan directory: ' + err);
            }

            im.convert([uploadPath + '/' + files[0], uploadPath + '/profilePic.png'], function (err, stdout) {
                if (err)
                    throw err;
                fs.createReadStream(uploadPath + '/profilePic.png').
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

/**
 * Updates the user information with the provided information; throws error if wrong type/number of
 * arguments were provided. 
 * 
 * @param userID the ID of the user to be updated.
 * @param userInfo the information used to update the user.
 */
async function updateUser(userID, userInfo) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!userID || typeof (userID) != "string" || userID.length == 0) {
        throw new Error("Invalid user ID was provided");
    }
    if (!userInfo) {
        throw new Error("No user information is provided for updateUser function");
    }
    if (!userInfo.userName || typeof (userInfo.userName) != "string" || userInfo.userName.length == 0) {
        throw new Error("Invalid user name was provided");
    }
    if (!userInfo.userEmail || typeof (userInfo.userEmail) != "string" || userInfo.userEmail.length == 0) {
        throw new Error("Invalid user email was provided");
    }
    if (userInfo.admin == undefined || userInfo.admin == null || typeof userInfo.admin != "boolean") {
        throw new Error("Invalid admin status was provided");
    }
    if (userInfo.profilePic == undefined || userInfo.profilePic == null || typeof userInfo.profilePic != "boolean") {
        throw new Error("Invalid user profile picture indicator was provided");
    }

    const usersCollection = await users();
    const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userID) }, {
        $set: {
            "userName": userInfo.userName, "userEmail": userInfo.userEmail, 
            "admin": userInfo.admin, "profilePic": userInfo.profilePic
        }
    });
    if (!updatedUser || updatedUser.modifiedCount === 0) {
        throw new Error("Unable to update user!");
    }
    let newUser = await getUserById(userID);
    return newUser;
}

/**
 * Adds the provided post ID into a specific user; throws error if wrong type/number of
 * arguments were provided. 
 * 
 * @param userID ID of the user to add post to.
 * @param postID ID of the post to be added.
 */
async function addPostToUser(userID, postID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!userID || typeof (userID) != "string" || userID.length == 0) {
        throw new Error("Invalid user ID was provided");
    }
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    const usersCollection = await users();
    const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userID) }, { $addToSet: { "posts": postID } });
    if (!updatedUser || updatedUser.modifiedCount === 0) {
        throw new Error(`Unable to add post ID to user ${userID}!`);
    }
    let newUser = await getUserById(userID);
    return newUser;
}

/**
 * Removes a post from a specific user; throws error if wrong type/number of
 * arguments were provided. 
 * 
 * @param userID ID of the user to have post removed from.
 * @param postID ID of the post to be removed.
 */
async function removePostFromUser(userID, postID) {
    //validates number of arguments
    if (arguments.length != 2) {
        throw new Error("Wrong number of arguments");
    }
    //validates arguments type
    if (!userID || typeof (userID) != "string" || userID.length == 0) {
        throw new Error("Invalid user ID was provided");
    }
    if (!postID || typeof (postID) != "string" || postID.length == 0) {
        throw new Error("Invalid post ID was provided");
    }
    const usersCollection = await users();
    const updatedUser = await usersCollection.updateOne({ _id: ObjectId(userID) }, { $pull: { "posts": postID } });
    if (!updatedUser || updatedUser.modifiedCount === 0) {
        throw new Error(`Unable to add post ID to user ${userID}!`);
    }
    let newUser = await getUserById(userID);
    return newUser;
}

module.exports = { 
    getUserById, 
    createUser, 
    updateUser, 
    addPostToUser, 
    removePostFromUser,
    getUserByName,
    getUserByEmail
 };