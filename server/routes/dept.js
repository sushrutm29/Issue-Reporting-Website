const express = require("express");
const router = express.Router();
const data = require("../data");

const deptData = data.dept;

router.post("/", async (req, res) => {
    try {
        
        const dept = await deptData.createDept(req.body);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error : error });
    } 
});

router.get("/:id", async (req, res) => {
    try {
        
        const dept = await deptData.getDeptById(req.params.id);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error : error });
    } 
});

router.delete("/:id", async (req, res) => {
    try {
        const dept = await deptData.deleteDept(req.params.id);
        res.status(200).json(dept);
    } catch (error) {
        res.status(400).json({ error : error });
    } 
});


module.exports = router;
