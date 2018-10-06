var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const ConcentrationGame = require('../models/concentrationGame');

var cors = require('cors')
router.use(cors())


router.get('/finishGame/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const concentrationGame = await ConcentrationGame.findOne({ _id: gameID });
    res.json({ finishGame: concentrationGame.gameStatus == 3 });
});


router.post('/cardClicked/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    const concentrationGame = await ConcentrationGame.findOne({ _id: gameID });
    concentrationGame.cardClicked(req.body.cardIndex);
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
