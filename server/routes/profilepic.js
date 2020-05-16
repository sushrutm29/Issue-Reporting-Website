const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');

router.use(fileUpload());

router.post('/', async (req, res) => {
    try {
        if(req.files === null || req.files === undefined){
            throw new Error("No file uploaded!");
        }

        const uploadPath = __dirname + '/../../client/public/uploads';

        let files = fs.readdirSync(__dirname + '/../../client/public/uploads');

        files.forEach(function(file) {
            fs.unlink(path.join(uploadPath, file), err => {
                if (err) throw err;
            });
        })

        const profilePic = req.files.image;
        const profilePicName = req.files.image.name;

        await profilePic.mv(__dirname + '/../../client/public/uploads/'+profilePicName, err => {
            if(err) {
                throw new Error(err);
            }
        });

        return res.status(200).json({"Filename": profilePicName, "Filepath": `/uploads/${profilePicName}`});
    } catch (error) {
        console.log(error);
        return res.status(400).json({"File Upload failed ": error});
    }
});

module.exports = router;