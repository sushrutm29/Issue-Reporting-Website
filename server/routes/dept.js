const express = require("express");
const router = express.Router();
const data = require("../data");
const deptData = data.dept;
const bluebird = require("bluebird");
const redis = require("redis");
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @author Sri Vallabhaneni, Lun-Wei Chang
 * @version 1.0
 * @date 04/08/2020
 */
router.post("/", async (req, res) => {
    try {
        if (!req.body) {
            throw "No request body was provided for createDept function!";
        }
        const newDept = await deptData.createDept(req.body);
        await client.hsetAsync("depts", `${newDept._id}`, JSON.stringify(newDept));
        res.status(200).json(newDept);
    } catch (error) {
        res.status(400).json({ error: `Could not create new department! ${error}` });
    }
});

router.get('/', async (req, res) => {
    try {
        let allDepts = await client.hvalsAsync("depts");
        if (allDepts !== undefined && allDepts !== null && allDepts.length !== 0) {   //depts exist in Redis cache
            let results = [];
            for (let i = 0; i < allDepts.length; i++) {
                results.push(JSON.parse(allDepts[i]));
            }
            allDepts = results;
        } else {    //no dept exists in Redis cache
            allDepts = await deptData.getAllDept();
            //loop through all the depts and add them to cache
            for (let i = 0; i < allDepts.length; i++) {
                await client.hsetAsync(["depts", `${allDepts[i]._id}`, JSON.stringify(allDepts[i])]);
            }
        }
        //sorts all departments' names alphabetically
        allDepts.sort(function(a, b) {
            var textA = a.deptName.toUpperCase();
            var textB = b.deptName.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        return res.status(200).json(allDepts);
    } catch (error) {
        return res.status(400).json({ error: `Could not get all the departments!  ${error}` });
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Department id was not provided for getDeptById method!";
        }
        const deptID = req.params.id;
        let currentDept = await client.hgetAsync("depts", deptID);
        if (currentDept) {  //found the dept in Redis cache
            currentDept = JSON.parse(currentDept);
        } else {    //did not find the dept in Redis cache
            currentDept = await deptData.getDeptById(deptID);
            await client.hsetAsync("depts", deptID, JSON.stringify(currentDept));
        }
        res.status(200).json(currentDept);
    } catch (error) {
        res.status(400).json({ error: `Could not get a specific department! ${error}` });
    }
});

router.get("/getDeptByName/:name", async (req, res) => {
    try {
        if (!req.params || !req.params.name) {
            throw "Department name was not provided for getDeptById method!";
        }
        const deptName = req.params.name;
        let currentDept;
        let allDepts = await client.hvalsAsync("depts");
        if (allDepts !== undefined && allDepts !== null && allDepts.length !== 0) {  //found the dept in Redis cache
            currentDept = JSON.parse(allDepts.find((dept) => JSON.parse(dept).deptName === deptName));
        } else {    //did not find the dept in Redis cache
            currentDept = await deptData.getDeptByName(deptName);
            let deptID = currentDept._id.toString();
            await client.hsetAsync("depts", deptID, JSON.stringify(currentDept));
        }
        res.status(200).json(currentDept);
    } catch (error) {
        res.status(400).json({ error: `Could not get a specific department! ${error}` });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        let deptID = req.params.id;
        const dept = await deptData.deleteDept(deptID);
        await client.hdelAsync("depts", deptID);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error: `Could not delete a specific department! ${error}` });
    }
});

router.patch("/addPost/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Department id was not provided for addPost function!";
        }
        if (!req.body) {
            throw "No request body was provided for addPost function!";
        }
        let deptID = req.params.id;
        const updatedDept = await deptData.addPost(deptID, req.body.postID);
        await client.hsetAsync("depts", deptID, JSON.stringify(updatedDept));
        res.status(200).json(updatedDept);
    } catch (error) {
        res.status(400).json({ error: `Could not add post to a specific department! ${error}` });
    }
});

router.patch("/removePost/:id", async (req, res) => {
    try {
        if (!req.params || !req.params.id) {
            throw "Department id was not provided for removePost function!";
        }
        if (!req.body) {
            throw "No request body was provided for removePost function!";
        }
        let deptID = req.params.id;
        const updatedDept = await deptData.removePost(deptID, req.body.postID);
        await client.hsetAsync("depts", deptID, JSON.stringify(updatedDept));
        res.status(200).json(updatedDept);
    } catch (error) {
        res.status(400).json({ error: `Could not remove a post from a specific department! ${error}` });
    }
});

module.exports = router;