var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const Chat = require('../models/chat');
const Profile = require('../models/profile');

var cors = require('cors')
router.use(cors())

router.get('/getPartnerProfile/:chatID/:uid', async function (req, res) {
    const chatID = req.params.chatID;
    const uid = req.params.uid;
    const chat = await Chat.findOne({ _id: chatID });

    let profile;

    if (chat.uid1 == uid) {
        profile = await Profile.findOne({ uid: chat.uid2 });
    } else if (chat.uid2 == uid) {
        profile = await Profile.findOne({ uid: chat.uid1 });
    }

    res.json({
        uid: profile.uid,
        displayName: profile.displayName,
        isOnline: profile.isOnline,
        age: profile.age,
        city: profile.city,
        gender: profile.gender,
        seeking: profile.seeking,
        imageMain: profile.imageMain
    });
});


router.get('/getChatMessages/:chatID', async function (req, res) {
    const chatID = req.params.chatID;
    const chat = await Chat.findOne({ _id: chatID });
    res.json({ messages: chat.messages });
});

router.post('/appendMessage/:chatID', async function (req, res) {
    console.log(req.body, "\n\n\n")
    const chatID = req.params.chatID;
    try {
    await Chat.update({ _id: chatID }, { $push: { messages: req.body } })
    } catch(e) {
        console.log("--------------------------------------")
        console.log(e)
    }
    res.sendStatus(200);
});


module.exports = router;