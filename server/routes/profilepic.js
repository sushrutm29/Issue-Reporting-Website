const express = require("express");
const router = express.Router();
const randomstring = require("randomstring");
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const mongodb = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const mongoConnection = require('../config/mongoConnection');
const assert = require('assert');


router.use(fileUpload());

router.post('/', async (req, res) => {
    try {
        if (req.files === null || req.files === undefined) {
            throw new Error("No file uploaded!");
        }

        const uploadPath = __dirname + '/../../client/public/uploads';

        let files = fs.readdirSync(__dirname + '/../../client/public/uploads');

        files.forEach(function (file) {
            fs.unlink(path.join(uploadPath, file), err => {
                if (err) throw err;
            });
        })

        const profilePic = req.files.image;
        const profilePicName = req.files.image.name;

        await profilePic.mv(__dirname + '/../../client/public/uploads/' + profilePicName, err => {
            if (err) {
                throw new Error(err);
            }
        });

        return res.status(200).json({ "Filename": profilePicName, "Filepath": `/uploads/${profilePicName}` });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ "File Upload failed ": error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const filename = req.params.id;
        const connection = await mongoConnection();
        let bucket = new mongodb.GridFSBucket(connection, {
            bucketName: 'profilePics'
        });

        //Fetch pdf from database
        let file = await bucket.find({ filename: filename }).toArray();
        let imgName = randomstring.generate();
        const imagePath = __dirname+ '/../../client/public/uploads/'+ imgName +'.png';
        if (file.length !== 0) {
            await bucket.openDownloadStreamByName(filename).pipe(fs.createWriteStream(imagePath)).on("error", function (error) {
                assert.ifError(error);
            }).on('finish', function () {
                assert.ok("Done");
            });
        } else {
            throw "File not found";
        }
        return res.status(200).json({"path" : imgName +'.png'});

    } catch (error) {
        return res.status(400).json({ error: error })
    }
});

module.exports = router;