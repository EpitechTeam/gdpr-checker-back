let Mission = require('./../../models/Mission');
const jwt = require('jsonwebtoken');

function getStatsModel(mission) {
    const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "October", "November", "December"];

    let data = [];
    mission.forEach((value) => {
        const us_date = value.date.split("/");
        const date = new Date(us_date[1] + "/" + us_date[0] + "/" + us_date[2]).getMonth();
        console.log(date, value.deal);
        data[date] = data[date] ? data[date] + parseFloat(value.deal) : parseFloat(value.deal);
    });

    for (let i = 0; i !== 12; i++) {
        if (!data[i]) {
            data[i] = 0;
        }
    }
    const result = {
        labels: labels,
        data: data
    };
    return result;
}

let getStats = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_KEY);
    try {
        const mission = await Mission.find({user_id: data._id});
        if (!mission) {
            throw new Error()
        }
        console.log("data=>", getStatsModel(mission));
        res.status(200).send(getStatsModel(mission))
    } catch (error) {
        res.status(401).send({error: error})
    }
}

let getCa = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_KEY);
    try {
        const mission = await Mission.find({user_id: data._id});
        if (!mission) {
            throw new Error()
        }
        let result = getStatsModel(mission);
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        let reponse = result.data.reduce(reducer);
        console.log("data=>", result);
        res.status(200).send({
            ca: reponse
        })
    } catch (error) {
        res.status(401).send({error: error})
    }
}

module.exports = {
    getStats,
    getCa
};