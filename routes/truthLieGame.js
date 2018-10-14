var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const TruthLieGame = require('../models/truthLieGame');
const Chat = require('../models/chat');

var cors = require('cors')
router.use(cors())


router.post('/addApprovedChat/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const truthLieGame = await TruthLieGame.findOne({ _id: gameID });
    truthLieGame.chatStatus++;

    if (truthLieGame.chatStatus == 3) {
        let existChat = await Chat.findOne({
            $or: [{ uid1: truthLieGame.uidHost, uid2: truthLieGame.uidGuest },
            { uid2: truthLieGame.uidHost, uid1: truthLieGame.uidGuest }]
        })

        if (!existChat) {
            chat = new Chat({
                _id: new mongoose.Types.ObjectId(),
                uid1: truthLieGame.uidHost,
                uid2: truthLieGame.uidGuest
            });
            await chat.save();
        }
    }

    await truthLieGame.save();
    res.sendStatus(200);
});

router.get('/finishGame/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const truthLieGame = await TruthLieGame.findOne({ _id: gameID });
    const gameDetails = await truthLieGame.getGameDetails();
    res.json({ finishGame: truthLieGame.gameStatus == 3, players: gameDetails.players, score: gameDetails.guestScore });
});


router.get('/getPlayersUID/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const truthLieGame = await TruthLieGame.findOne({ _id: gameID });
    res.json({ uidHost: truthLieGame.uidHost, uidGuest: truthLieGame.uidGuest });
});


router.get('/boardInfo/:gameID', async (req, res) => {
    const gameID = req.params.gameID;
    const truthLieGame = await TruthLieGame.findOne({ _id: gameID });
    const gameDetails = await truthLieGame.getGameDetails();
    res.json(gameDetails);
});


router.post('/createGame', async function (req, res) {
    const newGame = await TruthLieGame.create(req.body.uidHost, req.body.uidGuest);
    await newGame.save();
    res.sendStatus(200);
});


router.post('/finishTurnHost/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const truthLieGame = await TruthLieGame.findOne({ _id: gameID });
    await truthLieGame.finishTurnHost(req.body.truthText, req.body.lieText);
    res.sendStatus(200);
});


router.post('/finishTurnGuest/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const truthLieGame = await TruthLieGame.findOne({ _id: gameID });
    await truthLieGame.finishTurnGuest(req.body.isTruth);
    res.sendStatus(200);
});




module.exports = router;
