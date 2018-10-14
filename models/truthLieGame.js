'use strict';

const mongoose = require('mongoose');
const Profile = require('./profile');
const Schema = mongoose.Schema;

const GAME_STATUS = {
    PENDING: 1,
    ACTIVE: 2,
    FINISH: 3,
    DECLINED: 4
}

const CHAT_STATUS = {
    NON_APPROVED: 1,
    SINGLE_APPROVED: 2,
    BOTH_APPROVED: 3
}

const NUMBER_QUESTIONS = 3;

class TruthLieGame {
    static async create(
        uidHost,
        uidGuest,
    ) {
        const gameTruthLie = new this();

        gameTruthLie._id = new mongoose.Types.ObjectId();

        gameTruthLie.uidHost = uidHost;
        gameTruthLie.uidGuest = uidGuest;
        gameTruthLie.currentPlayerUID = uidHost;

        let texts = [];

        texts.push({ text: "Waiting for the end of the opponent's turn...", isTruth: true });
        texts.push({ text: "Waiting for the end of the opponent's turn...", isTruth: false });

        gameTruthLie.texts = texts;

        return gameTruthLie;
    }

    static shuffleArray(array) {
        for (var x = array.length - 1; x > 0; x--) {
            var i = Math.floor(Math.random() * (x + 1));
            var temp = array[x];
            array[x] = array[i];
            array[i] = temp;
        }
        return array;
    }

    async finishTurnHost(truthText, lieText) {
        let texts = [];

        texts[0] = {
            text: truthText,
            isTruth: true
        }

        texts[1] = {
            text: lieText,
            isTruth: false
        }

        this.texts = TruthLieGame.shuffleArray(texts);
        this.currentPlayerUID = this.currentPlayerUID === this.uidHost ? this.uidGuest : this.uidHost;

        await this.save();
    }

    async finishTurnGuest(isTrurh) {
        if (isTrurh) {
            this.guestScore++;
        }

        this.currentPlayerUID = this.currentPlayerUID === this.uidHost ? this.uidGuest : this.uidHost;

        if (this.numberOfTurn == NUMBER_QUESTIONS) {
            this.gameStatus = GAME_STATUS.FINISH;
        } else {
            this.numberOfTurn++
            let texts = [];
            texts.push({ text: "Waiting for the end of the opponent's turn...", isTruth: true });
            texts.push({ text: "Waiting for the end of the opponent's turn...", isTruth: false });
            this.texts = texts;
        };

        await this.save();
    }

    async getGameDetails() {
        const players = [];

        const hostProfile = await Profile.findOne({ uid: this.uidHost });
        const hostPlayer = {
            name: hostProfile.displayName,
            imageURL: hostProfile.imageMain,
            uid: hostProfile.uid,
            age: hostProfile.age
        }

        const guestProfile = await Profile.findOne({ uid: this.uidGuest });
        const guestPlayer = {
            name: guestProfile.displayName,
            imageURL: guestProfile.imageMain,
            uid: guestProfile.uid,
            age: guestProfile.age
        }

        players.push(hostPlayer);
        players.push(guestPlayer);

        const currentPlayerUID = this.currentPlayerUID;
        const cards = this.cards;
        const texts = this.texts;
        const numberOfTurn = this.numberOfTurn;
        const guestScore = this.guestScore;

        return {
            players: players,
            currentPlayerUID: currentPlayerUID,
            texts: texts,
            guestScore: guestScore,
            numberQuestions: NUMBER_QUESTIONS,
            numberOfTurn: numberOfTurn
        }
    }
}

const Text = new Schema(
    {
        text: String,
        isTruth: Boolean
    },
    {
        _id: false,
        collection: null,
        versionKey: false,
    }
);

const truthLieGameSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        uidHost: String,
        uidGuest: String,
        gameStatus: { type: Number, default: GAME_STATUS.PENDING },
        chatStatus: { type: Number, default: CHAT_STATUS.NON_APPROVED },
        texts: { type: [Text], default: [] },
        currentPlayerUID: String,
        numberOfTurn: { type: Number, default: 1 },
        guestScore: { type: Number, default: 0 }
    }, {
        collection: 'truthLieGame',
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        versionKey: false,
    }
);

truthLieGameSchema.loadClass(TruthLieGame);

module.exports = mongoose.model('TruthLieGame', truthLieGameSchema);









