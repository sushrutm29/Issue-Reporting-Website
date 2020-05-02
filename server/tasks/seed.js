const connection = require("../config//mongoConnection");
const users = require("../data/Seed-Data/users.json");
const departments = require("../data/Seed-Data/departments.json");
const posts = require("../data/Seed-Data/posts.json")
const userFunctions = require("../data/users");
const deptFunctions = require("../data/dept");
const postFunctions = require("../data/posts");

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
                await userFunctions.createUser(user.userName, user.userEmail, user.admin, user.profilePic);
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
                await deptFunctions.createDept(dept);
            } catch (error) {
                if (error.name == "MongoError" && error.code == 11000) { //Error message and code in case of duplicate insertion
                    index++; //Skip duplicate entry and continue
                }
            }
        }

        const allDepartments = await deptFunctions.getAllDept();
        //Set two users as post suthors
        const user1 = "sdeo";
        const user2 = "sushrutm";
        //Insert posts from posts.JSON into the database 
        for(index in posts) {
            let user;
            let post = posts[index];
            let departmentID = getDepartmentId(allDepartments, post.dept); //Get department ID for post department
            if(index%2==0) {
                user = user1;
            } else {
                user = user2;
            }
            await postFunctions.createPost(departmentID, post.title, post.body, user)
            index++;
        }


    } catch (error) {
        console.log(error.message);
    }

    const db = await connection();
    await db.serverConfig.close();
})();