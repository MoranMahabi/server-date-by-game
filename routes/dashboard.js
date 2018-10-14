var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const Profile = require('../models/profile');
const TriviaGame = require('../models/triviaGame');
const ConcentrationGame = require('../models/concentrationGame');
const TruthLieGame = require('../models/truthLieGame');
const Chat = require('../models/chat');

var cors = require('cors')
router.use(cors())

const GAME_TYPE = {
    TRIVIA: 1,
    CONCENTRATION: 2,
    TRUTH_LIE: 3
}

router.get('/declinedGame/:id/:type', async function (req, res) {
    const id = req.params.id;
    const type = req.params.type;

    let game;

    if (type == GAME_TYPE.TRIVIA) {
        game = await TriviaGame.findOne({ _id: id });
    } else if (type == GAME_TYPE.CONCENTRATION) {
        game = await ConcentrationGame.findOne({ _id: id });
    } else if (type == GAME_TYPE.TRUTH_LIE) {
        game = await TruthLieGame.findOne({ _id: id });
    }

    game.gameStatus = 4;
    await game.save();
    res.sendStatus(200);
});

router.get('/approvedGame/:id/:type', async function (req, res) {
    const id = req.params.id;
    const type = req.params.type;

    let game;

    if (type == GAME_TYPE.TRIVIA) {
        game = await TriviaGame.findOne({ _id: id });
    } else if (type == GAME_TYPE.CONCENTRATION) {
        game = await ConcentrationGame.findOne({ _id: id });
    } else if (type == GAME_TYPE.TRUTH_LIE) {
        game = await TruthLieGame.findOne({ _id: id });
    }

    game.gameStatus = 2;
    await game.save();
    res.sendStatus(200);
});

router.get('/incomingGames/:uid', async function (req, res) {
    const uid = req.params.uid;
    const trivaGames = await TriviaGame.find({ gameStatus: 1, uidGuest: uid });
    const concentrationGames = await ConcentrationGame.find({ gameStatus: 1, uidGuest: uid });
    const truthLieGames = await TruthLieGame.find({ gameStatus: 1, uidGuest: uid });

    let games = [];
    games = games.concat(trivaGames.map((item) => { return { ...item._doc, type: GAME_TYPE.TRIVIA } }));
    games = games.concat(concentrationGames.map((item) => { return { ...item._doc, type: GAME_TYPE.CONCENTRATION } }));
    games = games.concat(truthLieGames.map((item) => { return { ...item._doc, type: GAME_TYPE.TRUTH_LIE } }));

    let result = [];

    for (let game of games) {
        const _id = game._id;
        const profileHost = await Profile.findOne({ uid: game.uidHost });
        const nameHost = profileHost.displayName;
        const imageHost = profileHost.imageMain;
        const ageHost = profileHost.age;
        const type = game.type;

        result.push({
            _id,
            nameHost,
            imageHost,
            ageHost,
            type
        })
    }

    res.json(result);
});

router.get('/activeGames/:uid', async function (req, res) {
    const uid = req.params.uid;
    const trivaGames = await TriviaGame.find({ gameStatus: 2, $or: [{ uidHost: uid }, { uidGuest: uid }] });
    const concentrationGames = await ConcentrationGame.find({ gameStatus: 2, $or: [{ uidHost: uid }, { uidGuest: uid }] });
    const truthLieGames = await TruthLieGame.find({ gameStatus: 2, $or: [{ uidHost: uid }, { uidGuest: uid }] });

    let games = [];
    games = games.concat(trivaGames.map((item) => { return { ...item._doc, type: GAME_TYPE.TRIVIA } }));
    games = games.concat(concentrationGames.map((item) => { return { ...item._doc, type: GAME_TYPE.CONCENTRATION } }));
    games = games.concat(truthLieGames.map((item) => { return { ...item._doc, type: GAME_TYPE.TRUTH_LIE } }));

    let result = [];

    for (let game of games) {
        const _id = game._id;

        let profile;
        if (game.uidHost == uid) {
            profile = await Profile.findOne({ uid: game.uidGuest });
        } else if (game.uidGuest == uid) {
            profile = await Profile.findOne({ uid: game.uidHost });
        }

        const name = profile.displayName;
        const image = profile.imageMain;
        const age = profile.age;
        const type = game.type;

        result.push({
            _id,
            name,
            image,
            age,
            type
        })
    }

    res.json(result);
});


router.get('/chats/:uid', async function (req, res) {
    const uid = req.params.uid;
    const chats = await Chat.find({ $or: [{ uid1: uid }, { uid2: uid }] });

    let result = [];

    for (let chat of chats) {
        const _id = chat._id;

        let profile;
        if (chat.uid1 == uid) {
            profile = await Profile.findOne({ uid: chat.uid2 });
        } else if (chat.uid2 == uid) {
            profile = await Profile.findOne({ uid: chat.uid1 });
        }

        const name = profile.displayName;
        const image = profile.imageMain;
        const age = profile.age;

        result.push({
            _id,
            name,
            image,
            age
        })
    }

    res.json(result);
});

module.exports = router;
