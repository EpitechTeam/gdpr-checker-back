const mongoose = require('mongoose')


const exemple = {
    "user_id": "5e23511fb2752b262a2f7082",
    "name": "Mission 2",
    "object": "Texte descriptif de la mission 2",
    "houseOwner": "Mme. Eloat",
    "status": "DONE",
    "statusNb": "2",
    "date": "08/11/2019",
    "city": "Paris",
    "img": "https://static.ferienhausmiete.de/pictures/22582/bilder_original/22582_59625499104451.jpg",
    "deal": "200"
}


const missionSchema = mongoose.Schema({
    "user_id": {
        type: String,
        trim: true
    },
    "name": {
        type: String,
        trim: true
    },
    "object": {
        type: String,
        trim: true
    },
    "houseOwner": {
        type: String,
        trim: true
    },
    "status": {
        type: String,
        trim: true
    },
    "statusNb": {
        type: String,
        trim: true
    },
    "date": {
        type: String,
        trim: true
    },
    "city": {
        type: String,
        trim: true
    },
    "img": {
        type: String,
        trim: true
    },
    "deal": {
        type: String,
        trim: true
    },
});

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission;