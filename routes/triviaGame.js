var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const TriviaGame = require('../models/triviaGame');

var cors = require('cors')
router.use(cors())


router.get('/finishGame/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const triviaGame = await TriviaGame.findOne({ _id: gameID });
    res.json({ finishGame: triviaGame.gameStatus == 3 });
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
