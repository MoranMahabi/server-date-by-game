'use strict';

const mongoose = require('mongoose');
const Profile = require('./profile');
const uuidv4 = require('uuid/v4');
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

const NUMBER_CARDS = 7;

class ConcentrationGame {
    static async create(
        uidHost,
        uidGuest,
    ) {
        const gameConcentration = new this();

        gameConcentration._id = new mongoose.Types.ObjectId();

        gameConcentration.uidHost = uidHost;
        gameConcentration.uidGuest = uidGuest;

        let cards = [];

        const hostProfile = await Profile.findOne({ uid: uidHost });
        const guestProfile = await Profile.findOne({ uid: uidGuest });


        // const hostImageList = hostProfile.imageList;
        // const guestImageList = guestProfile.imageList;
        const hostImageList = this.shuffleArray(hostProfile.imageList);
        const guestImageList = this.shuffleArray(guestProfile.imageList);

        for (let i = 0; i < 3; i++) {
            let uuid = uuidv4();

            cards.push({
                imageURL: hostImageList[i],
                isFacingUP: false,
                id: uuid
            })
            cards.push({
                imageURL: hostImageList[i],
                isFacingUP: false,
                id: uuid
            })

            uuid = uuidv4();

            cards.push({
                imageURL: guestImageList[i],
                isFacingUP: false,
                id: uuid
            })

            cards.push({
                imageURL: guestImageList[i],
                isFacingUP: false,
                id: uuid
            })
        }

        //gameConcentration.cards = cards;
        gameConcentration.cards = this.shuffleArray(cards);
        gameConcentration.currentPlayerUID = uidHost;
        return gameConcentration;
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async cardClicked(cardIndex) {
        if (this.firstCardIndex == -1 && this.secondCardIndex == -1) {
            this.firstCardIndex = cardIndex;
            this.cards[cardIndex].isFacingUP = true;
            await this.save();
            return;
        }

        if (this.secondCardIndex == -1) {
            this.secondCardIndex = cardIndex;
            this.cards[cardIndex].isFacingUP = true;
            await this.save();
        }


        if (this.cards[this.firstCardIndex].id != this.cards[this.secondCardIndex].id) {
            await this.sleep(1500);
            this.cards[this.firstCardIndex].isFacingUP = false;
            this.cards[this.secondCardIndex].isFacingUP = false;
            this.currentPlayerUID = this.currentPlayerUID === this.uidHost ? this.uidGuest : this.uidHost;
        }

        this.firstCardIndex = -1;
        this.secondCardIndex = -1;

        let isFinish = true;
        for (let card of this.cards) {
            if (card.isFacingUP == false) {
                isFinish = false;
                break;
            }
        }

        if (isFinish) {
            this.gameStatus = GAME_STATUS.FINISH;
        }

        await this.save();
    }

    async getGameDetails() {
        const players = [];

        const hostProfile = await Profile.findOne({ uid: this.uidHost });
        const hostPlayer = {
            name: hostProfile.displayName,
            imageURL: hostProfile.imageMain,
            age: hostProfile.age,
            uid: hostProfile.uid
        }

        const guestProfile = await Profile.findOne({ uid: this.uidGuest });
        const guestPlayer = {
            name: guestProfile.displayName,
            imageURL: guestProfile.imageMain,
            age: guestProfile.age,
            uid: guestProfile.uid
        }

        players.push(hostPlayer);
        players.push(guestPlayer);

        const currentPlayerUID = this.currentPlayerUID;
        const cards = this.cards;

        return {
            players: players,
            currentPlayerUID: currentPlayerUID,
            cards: cards,
        }
    }
}

const Card = new Schema(
    {
        id: String,
        isFacingUP: { type: Boolean, default: false },
        imageURL: String
    },
    {
        _id: false,
        collection: null,
        versionKey: false,
    }
);

const concentrationGameSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        uidHost: String,
        uidGuest: String,
        gameStatus: { type: Number, default: GAME_STATUS.PENDING },
        chatStatus: { type: Number, default: CHAT_STATUS.NON_APPROVED },
        cards: { type: [Card], default: [] },
        currentPlayerUID: String,
        firstCardIndex: { type: Number, default: -1 },
        secondCardIndex: { type: Number, default: -1 }
    }, {
        collection: 'concentrationGame',
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        versionKey: false,
    }
);

concentrationGameSchema.loadClass(ConcentrationGame);

module.exports = mongoose.model('ConcentrationGame', concentrationGameSchema);









