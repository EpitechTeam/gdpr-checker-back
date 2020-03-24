const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const exemple = {
    "email": "test@test.test",
    "payed": false,
    "password": "test",
    "firstname": "castor",
    "lastname": "dev",
    "caption": "Freelance Montpellier",
    "img": "https://assurewealth.com.au/wp-content/uploads/2016/08/bwlionroar-350x350.jpg",
    "city": "Montpellier",
    "location": "Montpellier, France",
    "company": "SFR",
    "phone": "+33 6 287 87 98 77",
    "siret": "345678908076546",
    "skills": ["Accueil", "Animation", "Piscine", "Courses", "Jardinage"],
    "missions": [
        { "label": "Déplacement", "description": "Déplacement sur lieux de propriétés dans toute la France métropole" },
        { "label": "Compétences", "description": "Recherche des missions en gîtes" },
        { "label": "Durée de mission", "description": "Recherche des missions ~3-6 mois" }
    ],
    "bio": "Expérience dans l'hôtellrie ainsi que la gestion de multiple propriétés, c'est ma passion !"
}


const userSchema = mongoose.Schema({
    payed: {
        type: Object,
        trim: true
    },
    type: {
        required: true,
        type: String,
        trim: true
    },
    emailVerified: {
        required: true,
        type: Boolean
    },
    disponible: {
        type: Boolean
    },
    caption: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    siret: {
        type: String,
        trim: true
    },
    stats: {
        type: Object,
    },
    skills: {
        type: Array,
    },
    missions: {
        type: Array,
    },
    bio: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    img: {
        type: String,
        trim: true
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    stripe: {
        type: Object
    },
    resetPasswordToken: {
        type: String,
        required: true,
        default: " "
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
    }],
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.generatePasswordResetToken = async function (email) {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ email: email }, process.env.JWT_KEY)
    //user.tokens = user.tokens.concat({ resetPasswordtoken })
    //await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User