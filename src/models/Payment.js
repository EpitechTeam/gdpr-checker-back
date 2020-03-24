const mongoose = require('mongoose')


const exemple = {
    "detail": {
        "status": true,
        "price": 20.99,
        "title": "Basic"
    },
    date: "20/03/2020"
};


const paymentSchema = mongoose.Schema({
    "user_id": {
        type: String,
        trim: true
    },
    "detail": {
        type: Object,
    },
    "date": {
        type: String,
        trim: true
    },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;