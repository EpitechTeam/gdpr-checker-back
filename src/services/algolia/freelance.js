const algoliasearch = require('algoliasearch');
const client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_API_KEY);
const index = client.initIndex('freelancer');

// ObjectID field required
const insertFreelance = async (req, res) => {
    let freelance = req.body._doc ? req.body._doc : req.body;
    freelance.objectID = freelance._id.toString();
    freelance.url = "user/" + freelance._id;
    index.deleteObject(freelance.objectID, (err, content) => {
        console.log(err, content);
        index.saveObjects([freelance])
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
    });
}
const findFreelanceByCity = async (req, res) => {
    const {city} = req.body;
    index
        .search(city)
        .then(({hits}) => {
            res.status(200).send(hits)
        })
        .catch(err => {
            console.log("HITS error", err);
            res.status(400).send(err)
        });
}
const deleteFreelanceById = async (req, res) => {
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
    insertFreelance,
    findFreelanceByCity,
    deleteFreelanceById
}