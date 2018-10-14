var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/user');
const Profile = require('../models/profile');

var cors = require('cors')
router.use(cors())

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find() // where for filter // limit
    .exec()
    .then(docs => {
      console.log(docs);
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err })
    })
  //res.send('respond with a resource');
});

router.post('/profilesDetails', async function (req, res, next) {

  const profilesUID = []
  const uid = req.params.uid;

  let city = req.body.city;
  let from = req.body.from;
  let to = req.body.to;

  let page = req.body.page;
  let pageSize = req.body.pageSize;

  let query = {};

  if (from != undefined && to != undefined) {
    query['age'] = { $gte: from, $lte: to }
  } else if (from != undefined) {
    query['age'] = { $gte: from }
  } else if (to != undefined) {
    query['age'] = { $lte: to }
  }

  if (city != undefined) {
    query['city'] = city;
  }

  query['uid'] = { $ne: req.body.uid }

  let myProfile = await Profile.findOne({ uid: req.body.uid });
  if (myProfile) {
    if (myProfile.seeking != '' && myProfile.seeking != null) {
      query['gender'] = myProfile.seeking;
    }
  }

  let profiles = await Profile.find(query);
  const total = profiles.length;

  profiles = await Profile.find(query).skip(pageSize * (page - 1)).limit(pageSize);

  for (let profile of profiles) {
    profilesUID.push({
      uid: profile.uid,
    });
  }

  res.status(200).json({ profilesUID: profilesUID, total: total });
});

router.post('/updateProfile/:uid', async function (req, res, next) {
  const uid = req.params.uid;
  await Profile.update({ uid: uid }, { $set: req.body });
  res.sendStatus(200);
});


router.get('/profileDetails/:uid', async function (req, res, next) {
  const uid = req.params.uid;
  const profile = await Profile.findOne({ uid });

  if (!profile) {
    res.status(200).json({ isProfileExist: false });
  } else {
    res.status(200).json({
      isProfileExist: true,
      uid: profile.uid,
      displayName: profile.displayName,
      gender: profile.gender,
      seeking: profile.seeking,
      age: profile.age,
      city: profile.city,
      imageList: profile.imageList,
      imageMain: profile.imageMain,
      isOnline: profile.isOnline
    });
  }
});

router.post('/logout', async function (req, res, next) {
  const uid = req.body.uid;

  let profile = await Profile.findOne({ uid });
  if (profile) {
    profile.isOnline = false;
  }

  await profile.save();

  res.sendStatus(200);
});

router.post('/login', async function (req, res, next) {
  const uid = req.body.uid;
  const displayName = req.body.displayName;

  let profile = await Profile.findOne({ uid });
  console.log(profile);
  if (!profile) {
    profile = new Profile({
      _id: new mongoose.Types.ObjectId(),
      displayName: displayName,
      uid: uid,
      isOnline: true,
      imageMain: 'uploads\\profile.png'
    });
  } else {
    profile.isOnline = true;
  }

  await profile.save();

  res.sendStatus(200);
});

router.post('/', function (req, res, next) {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    surename: req.body.surename,
  });

  user.save()
    .then(result => {
      res.status(201).json({ message: "succses", user: result });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      })
    });
});

router.get('/:id', function (req, res, next) {
  User.findById(req.params.id).exec()
    .then(result => {
      console.log(result);
      res.status(201).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete('/:id', (req, res, next) => {
  User.findByIdAndDelete(req.params.id).exec()
    .then(result => {
      console.log(result);
      res.status(200).json({ result });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    })
})

module.exports = router;
