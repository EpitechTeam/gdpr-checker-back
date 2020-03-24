const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,/*"mongodb+srv://AdminEIPv3:kGvBd684sdv9cuEC@cluster0-bligr.gcp.mongodb.net/test?retryWrites=true&w=majority",*/ { useNewUrlParser: true })
