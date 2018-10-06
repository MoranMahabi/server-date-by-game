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


    async finishTurn(answer, cardIndex) {



        console.log(answer)
        console.log(cardIndex)
        this.cards[cardIndex].answer = answer;
        this.currentPlayerUID = this.currentPlayerUID === this.uidHost ? this.uidGuest : this.uidHost;
        let isFinish = true;
        for (let card of this.cards) {
            console.log(card.owner)
            console.log(CARD_OWNER.NONE)
            if (card.owner == CARD_OWNER.NONE) {
                isFinish = false;
                break;
            }
        }

        console.log(isFinish)
        if (isFinish) {
            this.gameStatus = GAME_STATUS.FINISH;
        }

        this.isCardClicked = false;
        await this.save();
    }

    async cardClicked(cardIndex) {
        this.cards[cardIndex].owner = this.currentPlayerUID === this.uidHost ? CARD_OWNER.HOST : CARD_OWNER.GUEST;
        this.isCardClicked = true;
        await this.save();
    }

    async getGameDetails() {
        const players = [];

        const hostProfile = await Profile.findOne({ uid: this.uidHost });
        const hostPlayer = {
            name: hostProfile.displayName,
            imageURL: hostProfile.imageMain,
            uid: hostProfile.uid
        }

        const guestProfile = await Profile.findOne({ uid: this.uidGuest });
        const guestPlayer = {
            name: guestProfile.displayName,
            imageURL: guestProfile.imageMain,
            uid: guestProfile.uid
        }

        players.push(hostPlayer);
        players.push(guestPlayer);

        const currentPlayerUID = this.currentPlayerUID;
        const cards = this.cards;
        const isCardClicked = this.isCardClicked;

        return {
            players: players,
            currentPlayerUID: currentPlayerUID,
            cards: cards,
            isCardClicked: isCardClicked
        }
    }
}

const Text = new Schema(
    {
        text: String,
        isTrurh: Boolean,
    },
    {
        _id: false,
        collection: null,
        versionKey: false,
    }
);

const triviaGameSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        uidHost: String,
        uidGuest: String,
        gameStatus: { type: Number, default: GAME_STATUS.PENDING },
        chatStatus: { type: Number, default: CHAT_STATUS.NON_APPROVED },
        texts: { type: [Text], default: [] },
        currentPlayerUID: String,
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









