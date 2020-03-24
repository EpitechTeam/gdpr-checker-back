let Mission = require('./../../models/Mission');
const missionService = require('../algolia/mission');
const jwt = require('jsonwebtoken');


let createMission = async (req, res) => {
    try {
        const mission = new Mission(req.body);
        await mission.save();
        missionService.insertMission({body : mission}, undefined);
        res.status(201).send(mission)
    } catch (error) {
        res.status(400).send(error)
    }
}

let getMission = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_KEY);
    console.log("data=>",data);
    try {
        const mission = await Mission.find({ user_id: data._id});
        if (!mission) {
            throw new Error()
        }
        res.status(200).send(mission)
    } catch (error) {
        res.status(401).send({ error: error})
    }
}


module.exports = {
    getMission,
    createMission,
};