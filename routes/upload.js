var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const User = require('../models/user');
const Profile = require('../models/profile');

const multer = require('multer');

const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname); // win
        //cb(null, new Date().toISOString() + file.originalname); // TODO: linux
    }
})
const upload = multer({ storage: uploadStorage });

var cors = require('cors');
router.use(cors());


router.post('/changeProfileImage', upload.single('image'), async function (req, res, next) {
    const uid = req.body.uid;
    const imgPath = req.file.path;

    await Profile.update({ uid: uid }, { imageMain: imgPath } )
        .then(doc => {
            if (!doc) { return res.status(404).end(); }
            return res.status(200).json(doc);
        })
        .catch(err => next(err))
});

router.post('/add', upload.single('image'), async function (req, res, next) {
    const uid = req.body.uid;
    const imgPath = req.file.path;

    await Profile.update({ uid: uid }, { $push: { imageList: imgPath } })
        .then(doc => {
            if (!doc) { return res.status(404).end(); }
            return res.status(200).json(doc);
        })
        .catch(err => next(err))
});

router.post('/remove', async function (req, res, next) {
    const uid = req.body.uid;
    const imgPath = req.body.image.replace('\\\\', /\\/g, );
    
    await Profile.update({ uid: uid }, { $pull: { imageList: imgPath } });
  
    res.sendStatus(200);
});

module.exports = router;
