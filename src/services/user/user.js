let User = require('./../../models/User')
const ownerService = require('../algolia/owner')
const freelanceService = require('../algolia/freelance')
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')


let createUser = async (req, res) => {
    try {
        const user = new User({ payed: { status: false }, emailVerified: false, ...req.body });
        await user.save();
        const token = await user.generateAuthToken();
        if (req.body.type === "freelance")
            freelanceService.insertFreelance({ body: user }, undefined);
        else
            ownerService.insertOwner({ body: user }, undefined)
        console.log("laaa")
        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: "eip.v3.0@gmail.com", pass: "bonjoureipv3" }
        });
        var mailOptions = {
            to: user.email,
            from: "eip.v3.0@gmail.com",
            subject: "bonjoureipv3",
            text:
                "Please click on the following link, or paste this into your browser to valid your account\n\n" +
                "http://" +
                process.env.CONCIERGERIE +
                "/valid/" +
                user._id +
                "\n\n" +
                "If you did not request this, please ignore this email\n"
        };
        smtpTransport.sendMail(mailOptions, function (err, result) {
            if (!err) {
                console.log("in create user SUCESS");
                //res.status(200).send({sucess: "email send to " + email});
            } else {
                console.log("in create user ERR");
            }
        });
        res.status(201).send({ user, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
}

let validEmail = async (req, res) => {
    try {
        const user = await User.updateOne({ _id: req.body.user_id }, { $set: { emailVerified: true } });
        res.sendStatus(200)
    }
    catch (e) {
        console.log(e)
    }
}

let login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({ error: 'Votre email ou mot de passe est erroné.' })
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send({ error: "Votre email ou mot de passe est erroné.", info: error })
    }
}

let getUser = async (req, res) => {
    try {
        console.log("show: ", req.params);
        const user = await User.findOne({ _id: req.params._id });
        if (!user) {
            throw new Error()
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error })
    }
};


let getUsers = async (req, res) => {
    try {
        console.log("show: ", req.params);
        const user = await User.find({});
        console.log("getUsers: ", user.length);
        if (!user) {
            throw new Error()
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error })
    }
};


let me = async (req, res) => {
    // View logged in user profile
    res.send(req.user)
};

let logout = async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
}

let logoutall = async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
}

let modifyEmail = async (req, res) => {
    try {
        const modified = await User.updateOne({ "tokens.token": req.token }, { $set: { email: req.body.email } })
        res.status(200).send(modified)
    } catch (error) {
        console.log(error);
        res.status(403).send({ 'error': 'Unprocessable entity' })
    }
}

let modifyPhone = async (req, res) => {
    try {
        const modified = await User.updateOne({ "tokens.token": req.token }, { $set: { email: req.body.phone } })
        res.status(200).send(modified)
    } catch (error) {
        console.log(error)
        res.status(403).send({ 'error': 'Unprocessable entity' })
    }
}

let modifyPassword = async (req, res) => {
    try {
        let encodedPassword = await bcrypt.hash(req.body.password, 8)
        const modified = await User.updateOne({ "tokens.token": req.token }, { $set: { password: encodedPassword } })
        res.status(200).send(modified)
    }
    catch (error) {
        console.log(error)
        res.status(403).send({ 'error': 'Unprocessable entity' })
    }
}

let edit = async (req, res) => {
    let obj = Object.create(req.body);
    console.log(req.user._id, obj);
    delete obj._id;
    try {
        const modified = await User.findOneAndUpdate({ _id: req.user._id }, { $set: obj });
        if (req.user.type === "freelance")
            freelanceService.insertFreelance({ body: { ...req.user, ...obj } }, undefined);
        else
            ownerService.insertOwner({ body: { ...req.user, ...obj } }, undefined);
        res.status(200).send(modified)
    } catch (error) {
        console.log(error);
        res.status(403).send({ 'error': 'Unprocessable entity', error })
    }
}

let forgot = async (req, res) => {
    const email = req.body.email
    console.log(email)
    try {
        const actualUser = await User.findOne({ email: email });
        if (!actualUser) {
            res.status(403).send({ 'error': 'no one with that email in db' })
        }
        else {
            try {
                const passwordResetToken = await User.generatePasswordResetToken(email)
                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth: { user: "eip.v3.0@gmail.com", pass: "bonjoureipv3" }
                });
                var mailOptions = {
                    to: email,
                    from: "eip.v3.0@gmail.com",
                    subject: "bonjoureipv3",
                    text:
                        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                        "http://" +
                        process.env.CONCIERGERIE +
                        "/reset/" +
                        passwordResetToken +
                        "\n\n" +
                        "If you did not request this, please ignore this email and your password will remain unchanged.\n"
                };
                User.updateOne({ email: email }, { $set: { resetPasswordToken: passwordResetToken } }, async () => {
                    let newUser = await User.findOne({ email: email })
                    if (newUser) {
                        res.status(200).send({ newUser })
                        smtpTransport.sendMail(mailOptions, function (err, result) {
                            if (!err) {
                                console.log("in forgot SUCESS");
                                //res.status(200).send({sucess: "email send to " + email});
                            } else {
                                console.log("in forgot ERR");
                            }
                        });
                    }

                })
            } catch (err) {
                console.log("in catch")
            }
        }
    } catch (error) {
        console.log(error)
        res.status(403).send({ 'error': 'Unprocessable entity', error })
    }
}

let reset = async (req, res) => {
    const resetPasswordToken = req.body.resetPasswordToken
    const password = req.body.password
    try {
        let encodedPassword = await bcrypt.hash(password, 8)
        let decodedToken = jwt.verify(resetPasswordToken, process.env.JWT_KEY)
        let email = decodedToken.email
        const actualUser = await User.findOneAndUpdate({ email: email }, { $set: { password: encodedPassword } })
        if (actualUser) { res.status(200).send(actualUser) }
        else { console.log(actualUser) }
    } catch (err) {
        console.log(err)
        res.status(403).send({ 'error': 'Unprocessable entity', err })
    }
};

let changeDisponibilite = async (req, res) => {
    await User.updateOne({ "tokens.token": req.token }, { $set: { disponible: !req.body.disponible } })
    let user = await User.findOne({ "tokens.token": req.token })
    res.status(200).send(user)
}

let sendEmailVerification = async (req, res) => {
    let user = User.findOne({ "tokens.token": req.token })

    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: "eip.v3.0@gmail.com", pass: "bonjoureipv3" }
    });

    var mailOptions = {
        to: user.email,
        from: "eip.v3.0@gmail.com",
        subject: "Vérifier votre email",
        text:
            "Please click on the following link, or paste this into your browser to valid your account\n\n" +
            "http://" +
            process.env.CONCIERGERIE +
            "/valid/" +
            user._id +
            "\n\n" +
            "If you did not request this, please ignore this email.\n"
    };
    smtpTransport.sendMail(mailOptions, function (err, result) {
        if (!err) {
            console.log("in forgot SUCESS");
            //res.status(200).send({sucess: "email send to " + email});
        } else {
            console.log("in forgot ERR");
        }
    });
}

module.exports = {
    getUsers,
    forgot,
    reset,
    getUser,
    edit,
    createUser,
    login,
    me,
    logout,
    logoutall,
    modifyEmail,
    modifyPhone,
    modifyPassword,
    validEmail,
    sendEmailVerification,
    changeDisponibilite
};

