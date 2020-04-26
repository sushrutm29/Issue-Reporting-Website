const express = require("express");
const router = express.Router();
const data = require("../data");

const deptData = data.dept;

router.post("/", async (req, res) => {
    try {
        const dept = await deptData.createDept(req.body);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.get('/', async (req, res) => {
    try {
        const allDepts = await deptData.getAllDept();
        return res.status(200).json(allDepts);
    } catch (error) {
        return res.status(400).json({ error: "Could not get all the departments!" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const dept = await deptData.getDeptById(req.params.id);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const dept = await deptData.deleteDept(req.params.id);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error: error });
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
        const updatedDept = await deptData.addPost(req.params.id, req.body.postID);
        res.status(200).json(updatedDept);
    } catch (error) {
        res.status(400).json({ error: error });
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
        const updatedDept = await deptData.removePost(req.params.id, req.body.postID);
        res.status(200).json(updatedDept);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

module.exports = router;