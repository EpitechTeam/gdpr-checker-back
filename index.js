const express = require('express')
const http = require('http');
const socketIO = require('socket.io');
const puppeteer = require('puppeteer');


const userRouter = require('./src/routers/user')
const freelanceRouter = require('./src/routers/freelance')
const missionRouter = require('./src/routers/mission')
const ownerRouter = require('./src/routers/owner')
const stripeRouter = require('./src/routers/stripe')
const houseRouter = require('./src/routers/house')
const fileUpload = require('express-fileupload');
require('dotenv').config();
require('./src/db/db');
const compression = require('compression')
const bodyParser = require("body-parser")
const morgan = require("morgan")
const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(
    bodyParser.json({
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        }
    })
);
app.use(express.json())
app.use(compression())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(morgan("tiny"))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
    next()
});

app.use("/", userRouter);
app.use("/", freelanceRouter);
app.use("/", missionRouter);
app.use("/", ownerRouter);
app.use("/", stripeRouter);
app.use("/", houseRouter);

// default options
app.use(fileUpload());
app.post('/upload', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files[Object.keys(req.files)[0]];
    // Use the mv() method to place the file somewhere on your server
    file.mv(process.env.UPLOAD_PATH + "/" + file.name, function (err) {
        if (err)
            return res.status(500).send(err);
        res.status(200).send({status: 'File uploaded!', url: process.env.UPLOAD_HOST + "/file/" + file.name});
    });
});

app.post('/checksite', async function (req, res) {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: true,
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-logging', '--v=1',
            `--window-size=1920,1080`]
    });
    let url = "https://2gdpr.com/";
    let site = req.body.site;


    try {

        const page = (await browser.pages())[0];
        const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36";
        await page.setUserAgent(userAgent);
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (['image', 'font'].indexOf(request.resourceType()) !== -1) {
                request.abort();
                return;
            }
            if (!request.isNavigationRequest()) {
                request.continue();
                return;
            }
            const headers = request.headers();
            headers['Referer'] = 'https://app2.bankin.com/';
            request.continue({headers});
        });

        await page.goto(url);
        await page.waitFor(5000);
        await page.type('[name="site"]', site); // Types instantly
        await page.click('[type="submit"]'); // Types instantly
        await page.waitFor(10000);

        const result = await page.evaluate(() => {
            let tests_object = {};
            let tests = document.querySelectorAll("#results > .info-block > .info");
            for (let index = 0; tests.length !== index; index++) {
                console.log(index);
                let key = tests[index].querySelector("h3").textContent;
                let block = tests[index].querySelector("div:not(.icon)");
                if (block.textContent.indexOf("process") === -1)
                    tests_object[key] = {
                        status: "OK",
                        message: block.textContent
                    };
                else {
                    let selector = `#Vshowbutton${index}`;
                    console.log(selector);
                    $(selector).click();
                    let advice_list = block.querySelectorAll("p");
                    let proof_list = block.querySelectorAll("div");

                    let advice = [];
                    let proof = [];
                    advice_list.forEach(e => advice.push(e.textContent));
                    proof_list.forEach(e => proof.push(e.textContent));
                    tests_object[key] = {
                        status: "KO",
                        message: "Error",
                        info: {
                            advice,
                            proof
                        }
                    };
                }

            }
            return {
                info: document.querySelector("#statusscan").textContent,
                tests: tests_object
            };
        });
        await page.waitFor(5000);
        await browser.close();
        res.status(200).send({result});
    } catch (e) {
        console.log("BOT ERROR: ", e);
        res.status(400).send(e);
        await browser.close();
    }
});


console.log(__dirname + "/" + process.env.UPLOAD_PATH);
app.use('/file', express.static(__dirname + "/" + process.env.UPLOAD_PATH + "/"));

app.get('/', (req, res) => {
    res.json("EIP API V1.0")
})

const port = process.env.PORT

server.listen(port, () =>
    console.log(
        `Server EIP-V3 started! Listening on port ${port}. Timestamp: ${Date.now()}`
    )
);

const {
    addUser,
    deleteUser,
    getUser,
    getUsersInRoom,
} = require('./src/services/socket/socket');

var users = [];

io.on('connection', socket => {

    console.log(
        `A new client is connected to chat server! Socket is: ${socket.id}.`,
        Date.now()
    );

    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room}, users);

        if (error) {
            return callback(error);
        }

        socket.emit('message', {
            user: 'Team conciergerie online',
            text: `Bonjour, ${user.name} !`,
        });
        socket.broadcast.to(user.room).emit('message', {
            user: 'Team conciergerie online',
            text: `${user.name} est connecté.`,
        });

        socket.join(user.room);
    });

    socket.on('sendMessage', (message, callback) => {
        console.log(users);
        let result = getUser(socket.id, users);
        console.log(result)
        const user = result.user;
        users = result.users;
        io.to(user.room).emit('message', {user: user.name, text: message});

        callback();
    });

    socket.on('disconnect', () => {
        console.log(`User on socket ${socket.id} had disconnected from the server`);
        const result = deleteUser(socket.id, users);
        console.log(result);
        const user = result.user;
        users = result.users;

        if (user) {
            io.to(user.room).emit('message', {
                user: 'Team conciergerie online',
                text: `${user.name} quitte le chat.`,
            });
        }
    });
});

process.on('uncaughtException', err => {
    console.log(err)
})

