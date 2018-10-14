var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const ConcentrationGame = require('../models/concentrationGame');
const Chat = require('../models/chat');

var cors = require('cors')
router.use(cors())

router.post('/addApprovedChat/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const concentrationGame = await ConcentrationGame.findOne({ _id: gameID });
    concentrationGame.chatStatus++;

    if (concentrationGame.chatStatus == 3) {
        let existChat = await Chat.findOne({
            $or: [{ uid1: concentrationGame.uidHost, uid2: concentrationGame.uidGuest },
            { uid2: concentrationGame.uidHost, uid1: concentrationGame.uidGuest }]
        })

        if (!existChat) {
            chat = new Chat({
                _id: new mongoose.Types.ObjectId(),
                uid1: concentrationGame.uidHost,
                uid2: concentrationGame.uidGuest
            });
            await chat.save();
        }
    }

    await concentrationGame.save();
    res.sendStatus(200);
});

router.get('/finishGame/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const concentrationGame = await ConcentrationGame.findOne({ _id: gameID });
    const gameDetails = await concentrationGame.getGameDetails();
    res.json({ finishGame: concentrationGame.gameStatus == 3, players: gameDetails.players });
});


router.post('/cardClicked/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const concentrationGame = await ConcentrationGame.findOne({ _id: gameID });
    await concentrationGame.cardClicked(req.body.cardIndex);
    res.sendStatus(200);
});

router.get('/boardInfo/:gameID', async (req, res) => {
    const gameID = req.params.gameID;
    const concentrationGame = await ConcentrationGame.findOne({ _id: gameID });
    const gameDetails = await concentrationGame.getGameDetails();
    res.json(gameDetails);
});

router.post('/createGame', async function (req, res) {
    const newGame = await ConcentrationGame.create(req.body.uidHost, req.body.uidGuest);
    await newGame.save();
    res.sendStatus(200);
});

module.exports = router;
