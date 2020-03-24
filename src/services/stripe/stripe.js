const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
let User = require('./../../models/User');
let Payment = require('./../../models/Payment');

let publicKey = (req, res) => {
    res.send({publicKey: process.env.STRIPE_PUBLISHABLE_KEY});
};

const calculateOrderAmount = items => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1999;
};

let paymentIntents = async (req, res) => {
    let {currency, items} = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency
        });
        return res.status(200).json(paymentIntent);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

// A webhook to receive events sent from Stripe
// You can listen for specific events
// This webhook endpoint is listening for a payment_intent.succeeded event
let webHook = async (req, res) => {
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
        console.log("💰Your user provided payment details!");
        // Fulfill any orders or e-mail receipts
        res.sendStatus(200);
    }
};
let payed = async (req, res) => {
    let obj = Object.create(req.body);
    console.log(req.user._id, obj)
    delete obj._id;
    try {
        const modified = await User.findOneAndUpdate({_id: req.user._id}, {$set: obj});
        obj.date = new Date();
        obj.user_id = req.user._id;
        obj.detail = req.body.detail
        const payment = new Payment(obj);
        await payment.save();
        console.log("House => ", payment);
        res.status(201).send(payment)

    } catch (error) {
        console.log(error)
        res.status(403).send({'error': 'Unprocessable entity', error})
    }
}


let getPayed = async (req, res) => {
    try {
        const payment = await Payment.find({user_id: req.body._id});
        if (!payment) {
            throw new Error()
        }
        res.status(200).send(payment)
    } catch (error) {
        res.status(401).send({error: error})
    }
};


let subscription = async (req, res) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require('stripe')(process.env.STRIPE_PUBLISHABLE_KEY);

    // This creates a new Customer and attaches the PaymentMethod in one API call.
    const customer = await stripe.customers.create({
        payment_method: req.body.payment_method,
        email: req.body.email,
        invoice_settings: {
            default_payment_method: req.body.payment_method,
        },
    });

    let customer_id = customer.id

    await User.updateOne({"tokens.token": req.token}, {$set: {"stripe.customer_id": customer_id}})

    await stripe.subscriptions.create({
        customer: customer_id,
        items: [{plan: req.body.plan}],
        expand: ["latest_invoice.payment_intent"]
    });

    res.sendStatus(200)
}

module.exports = {
    getPayed,
    payed,
    publicKey,
    paymentIntents,
    webHook,
    subscription
};