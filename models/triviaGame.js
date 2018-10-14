'use strict';

const mongoose = require('mongoose');
const QuestionBank = require('./questionBank');
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

const CARD_OWNER = {
    NONE: 1,
    HOST: 2,
    GUEST: 3
}

const NUMBER_CARDS = 5;

class TriviaGame {
    static async create(
        uidHost,
        uidGuest,
    ) {
        const gameTrivia = new this();

        gameTrivia._id = new mongoose.Types.ObjectId();

        gameTrivia.uidHost = uidHost;
        gameTrivia.uidGuest = uidGuest;

        let questions = await QuestionBank.find({});

        let cards = this
            .shuffleArray(questions)
            .slice(questions.length - NUMBER_CARDS)
            .map((question, i) => {
                return {
                    question: question.question,
                    answer: "",
                    owner: CARD_OWNER.NONE
                }
            });

        gameTrivia.cards = cards;
        gameTrivia.currentPlayerUID = uidHost;
        return gameTrivia;
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
        this.cards[cardIndex].answer = answer;
        this.currentPlayerUID = this.currentPlayerUID === this.uidHost ? this.uidGuest : this.uidHost;
        let isFinish = true;
        for (let card of this.cards) {
            if (card.owner == CARD_OWNER.NONE) {
                isFinish = false;
                break;
            }
        }
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

const Card = new Schema(
    {
        question: String,
        answer: { type: String, default: "" },
        owner: { type: Number, default: CARD_OWNER.NONE },
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
        cards: { type: [Card], default: [] },
        currentPlayerUID: String,
        isCardClicked: { type: Boolean, default: false }
    }, {
        collection: 'triviaGame',
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        versionKey: false,
    }
);

triviaGameSchema.loadClass(TriviaGame);

module.exports = mongoose.model('TriviaGame', triviaGameSchema);









