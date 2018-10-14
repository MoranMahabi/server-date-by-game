var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const TriviaGame = require('../models/triviaGame');
const Chat = require('../models/chat');

var cors = require('cors')
router.use(cors())

router.post('/addApprovedChat/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const triviaGame = await TriviaGame.findOne({ _id: gameID });
    triviaGame.chatStatus++;

    if (triviaGame.chatStatus == 3) {

        let existChat = await Chat.findOne({
            $or: [{ uid1: triviaGame.uidHost, uid2: triviaGame.uidGuest },
            { uid2: triviaGame.uidHost, uid1: triviaGame.uidGuest }]
        })

        if (!existChat) {
            chat = new Chat({
                _id: new mongoose.Types.ObjectId(),
                uid1: triviaGame.uidHost,
                uid2: triviaGame.uidGuest
            });
            await chat.save();
        }
    }

    await triviaGame.save();
    res.sendStatus(200);
});


router.get('/finishGame/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const triviaGame = await TriviaGame.findOne({ _id: gameID });
    const gameDetails = await triviaGame.getGameDetails();
    res.json({ finishGame: triviaGame.gameStatus == 3, cards: gameDetails.cards, players: gameDetails.players });
});

router.post('/finishTurn/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const triviaGame = await TriviaGame.findOne({ _id: gameID });
    await triviaGame.finishTurn(req.body.answer, req.body.cardIndex);
    res.sendStatus(200);
});

router.post('/cardClicked/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const triviaGame = await TriviaGame.findOne({ _id: gameID });
    triviaGame.cardClicked(req.body.cardIndex);
    res.sendStatus(200);
});

router.get('/boardInfo/:gameID', async (req, res) => {
    const gameID = req.params.gameID;
    const triviaGame = await TriviaGame.findOne({ _id: gameID });
    const gameDetails = await triviaGame.getGameDetails();
    res.json(gameDetails);
});

router.post('/createGame', async function (req, res) {
    const newGame = await TriviaGame.create(req.body.uidHost, req.body.uidGuest);
    await newGame.save();
    res.sendStatus(200);
});

module.exports = router;
