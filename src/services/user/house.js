let House = require('./../../models/House');

let createHouse = async (req, res) => {
    try {
        let obj = req.body;
        obj.date = new Date();
        obj.user_id = req.user._id;
        delete obj._id;
        const house = new House(obj);
        await house.save();
        console.log("House => ",  house)
        res.status(201).send(house)
    } catch (error) {
        res.status(400).send(error)
    }
}

let getHouse = async (req, res) => {
    try {
        const house = await House.find({user_id: req.body._id});
        if (!house) {
            throw new Error()
        }
        res.status(200).send(house)
    } catch (error) {
        res.status(401).send({error: error})
    }
}


let editHouse = async (req, res) => {
    let obj = Object.create(req.body);
    console.log(req.body._id, obj);
    delete obj._id;
    try {
        const modified = await House.update({ _id: req.body._id }, { $set: obj });
        res.status(200).send(modified)
    } catch (error) {
        console.log(error);
        res.status(403).send({ 'error': 'Unprocessable entity', error })
    }
}

let deleteHouse = async (req, res) => {
    try {
        const modified = await House.remove({_id: req.body._id});
        res.status(200).send(modified)
    } catch (error) {
        console.log(error);
        res.status(400).send({'error': 'Unprocessable entity', error})
    }
}

module.exports = {
    deleteHouse,
    editHouse,
    createHouse,
    getHouse,
};