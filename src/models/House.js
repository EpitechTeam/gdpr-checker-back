const mongoose = require('mongoose')


const exemple = {
    "user_id": "5e23511fb2752b262a2f7082",
    "name": "Maison 2",
    "title": "Maison 2 - T2 Centre ville",
    "description": "Texte descriptif de la maison 2",
    "house_owner": "Mme. Eloat",
    "available_date": ["01/01/2020-01/06/2020", "05/09/2020-20/12/2020"],
    "city": "Paris",
    "img": "https://static.ferienhausmiete.de/pictures/22582/bilder_original/22582_59625499104451.jpg",
    "deal": "200"
};


const houseSchema = mongoose.Schema({
    "user_id": {
        type: String,
        trim: true
    },
    "name": {
        type: String,
        trim: true
    },
    "title": {
        type: String,
        trim: true
    },
    "description": {
        type: String,
        trim: true
    },
    "house_owner": {
        type: String,
        trim: true
    },
    "available_date": {
        type: Array,
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

const House = mongoose.model('House', houseSchema);

module.exports = House;