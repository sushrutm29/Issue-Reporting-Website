const connection = require("../config//mongoConnection");
const users = require("../data/Seed-Data/users.json");
const departments = require("../data/Seed-Data/departments.json");
const posts = require("../data/Seed-Data/posts.json")
const userFunctions = require("../data/users");
const deptFunctions = require("../data/dept");
const postFunctions = require("../data/posts");
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();
const flatten = require("flat");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @author Shiwani Deo
 * @version 1.0
 * @date 05/03/2020
 */
function getDepartmentId(depts, deptName) {
    for(index in depts) {
        if(depts[index].deptName == deptName) {
            return depts[index]._id.toString();
        }
    }
}

(async () => {
    try {
        let index;
        //Insert initial user(s) from users.JSON into the database
        for (index in users) {
            try {
                let user = users[index];
                email = user.userEmail.toLowerCase();
                let newUser = await userFunctions.createUser(user.userName, user.userEmail, user.admin, user.profilePic);
                //adds the new user into the Redis cache
                await client.hsetAsync("users", `${newUser._id}`, JSON.stringify(newUser));
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }
        
        //Insert departments from departments.JSON into the database 
        for(index in departments) {
            try {
                let dept = departments[index];
                let newDept = await deptFunctions.createDept(dept);
                //adds the new department into the Redis cache
                await client.hsetAsync("depts", `${newDept._id}`, JSON.stringify(newDept));
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        const allDepartments = await deptFunctions.getAllDept();
        //Set two users as post authors
        const user1 = "sdeo";
        const user2 = "sushrutm";
        //Insert posts from posts.JSON into the database 
        for(index in posts) {
            try {
                let user;
                let post = posts[index];
                let departmentID = getDepartmentId(allDepartments, post.dept); //Get department ID for post department
                if(index % 2 == 0) {
                    user = user1;
                } else {
                    user = user2;
                }
                let newPost = await postFunctions.createPost(departmentID, post.title, post.body, user)
                //adds the new post into the Redis cache
                await client.hsetAsync("posts", `${newPost._id}`, JSON.stringify(newPost));
                index++;
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }


    } catch (error) {
        console.log(error.message);
    }
    const db = await connection();
    await db.serverConfig.close();
    process.exit(0);
})();