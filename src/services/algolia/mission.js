const algoliasearch = require('algoliasearch');
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_API_KEY);
const index = client.initIndex('mission');

// ObjectID field required
const insertMission = async (req, res) => {
    const freelance = req.body;
    console.log("freelance =>", freelance);
    freelance.objectID = req.body._id.toString();
    freelance.url = "user/" + req.body._id;
    index.deleteObject(freelance.objectID, (err, content) => {
        console.log(err, content);
    });
    index
        .saveObjects([freelance])
        .then((object) => {
            console.log("SAVE id", object);
            if (res)
                res.status(200).send(object)
        })
        .catch(err => {
            console.log("SAVE error", err);
            if (res)
                res.status(400).send(err)
        });
}
const findMissionByCity = async (req, res) => {
    const {city} = req.body;
    index
        .search(city)
        .then(({hits}) => {
            console.log("HITS ", hits);
            res.status(200).send(hits)
        })
        .catch(err => {
            console.log("HITS error", err);
            res.status(400).send(err)
        });
}
const deleteMissionById = async (req, res) => {
    const {id} = req.body;
    index.deleteObjects([id], (err, content) => {
        if (err) {
            res.status(400).send(err)
            throw err;
        }
        console.log("REMOVE", content);
        res.status(200).send(content)
    });
}

module.exports = {
    insertMission,
    findMissionByCity,
    deleteMissionById
}