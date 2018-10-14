var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const moment = require('moment');

const Chat = require('../models/chat');
const Profile = require('../models/profile');


var cors = require('cors')
router.use(cors())

router.get('/getPartnerUID/:chatID/:uid', async function (req, res) {
    const chatID = req.params.chatID;
    const uid = req.params.uid;
    const chat = await Chat.findOne({ _id: chatID });

    let profile;

    if (chat.uid1 == uid) {
        profile = await Profile.findOne({ uid: chat.uid2 });
    } else if (chat.uid2 == uid) {
        profile = await Profile.findOne({ uid: chat.uid1 });
    }

    res.json({ partnerUID: profile.uid });
});


router.get('/getChatMessages/:chatID', async function (req, res) {
    const chatID = req.params.chatID;
    const chat = await Chat.findOne({ _id: chatID });
    const messages = chat.messages.map((item) => { return { message: item.message, name: item.name, date: moment(item.date).format('DD-MM-YYYY  h:mm:ss') } });
    res.json({ messages: messages });
});

router.post('/appendMessage/:chatID/:uid', async function (req, res) {
    const chatID = req.params.chatID;
    const uid = req.params.uid;
    const senderProfile = await Profile.findOne({ uid: uid });
    await Chat.update({ _id: chatID }, { $push: { messages: { ...req.body, name: senderProfile.displayName } } });
    res.sendStatus(200);
});


module.exports = router;