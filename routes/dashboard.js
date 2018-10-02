var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const Profile = require('../models/profile');
const TriviaGame = require('../models/triviaGame');

var cors = require('cors')
router.use(cors())



router.get('/declinedGame/:id', async function (req, res) {
    const id = req.params.id;
    const trivaGame = await TriviaGame.findOne({ _id: id });
    trivaGame.gameStatus = 4;
    await trivaGame.save();
    res.sendStatus(200);
});

router.get('/approvedGame/:id', async function (req, res) {
    const id = req.params.id;
    const trivaGame = await TriviaGame.findOne({ _id: id });
    trivaGame.gameStatus = 2;
    await trivaGame.save();
    res.sendStatus(200);
});

router.get('/incomingGames/:uid', async function (req, res) {
    const uid = req.params.uid;
    const trivaGames = await TriviaGame.find({ gameStatus: 1, uidGuest: uid });

    let result = [];

    for (let game of trivaGames) {
        const _id = game._id;
        const profileHost = await Profile.findOne({ uid: game.uidHost });
        const nameHost = profileHost.displayName;
        const imageHost = profileHost.imageMain;
        const ageHost = profileHost.age;
        const nameGame = 'Trivia Game';

        result.push({
            _id,
            nameHost,
            imageHost,
            ageHost,
            nameGame
        })
    }

    res.json(result);
});

router.get('/activeGames/:uid', async function (req, res) {
    const uid = req.params.uid;
    const trivaGames = await TriviaGame.find({ gameStatus: 2, $or: [{ uidHost: uid }, { uidGuest: uid }] });

    let result = [];

    for (let game of trivaGames) {
        const _id = game._id;
        const profileHost = await Profile.findOne({ uid: game.uidHost });
        const nameHost = profileHost.displayName;
        const imageHost = profileHost.imageMain;
        const ageHost = profileHost.age;
        const nameGame = 'Trivia Game';

        result.push({
            _id,
            nameHost,
            imageHost,
            ageHost,
            nameGame
        })
    }

    res.json(result);
});

module.exports = router;
