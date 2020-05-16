const express = require('express');
const http = require('http');
const puppeteer = require('puppeteer');
const {v4: uuidv4} = require('uuid');

const fileUpload = require('express-fileupload');
require('dotenv').config();
require('./src/db/db');

const compression = require('compression');
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const server = http.createServer(app);


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
    req.setTimeout(0); // no timeout
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
        await page.setDefaultNavigationTimeout(0);
        const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36";
        await page.setUserAgent(userAgent);
        await page.setRequestInterception(true);
        page.on('request', request => {
            const headers = request.headers();
            headers['Referer'] = 'https://app2.bankin.com/';
            request.continue({headers});
        });

        await page.goto(url);
        await page.waitFor('[name="site"]');
        await page.type('[name="site"]', site); // Types instantly
        await page.waitFor('[type="submit"]');
        await page.click('[type="submit"]'); // Types instantly
        await page.waitForResponse(response => {
            return response.request().url() === "https://2gdpr.com/static/report-partok.svg";
        });

        await page.evaluate(() => {
            $('a:not([rel="nofollow"])').hide();
        });
        console.log("crowling complete!")
        await page.waitFor(1000);

        const result = await page.evaluate(() => {
            try {
                let content = document.querySelector(".row > .content-block")

                content.style.backgroundColor = "white";

                var img = document.createElement("img");
                var text = document.createElement("h1");
                img.src = "https://gdpr-checker.willally.com/assets/logo.svg";
                text.innerText = "www.gdpr-checker.willally.com";

                content.appendChild(img);
                content.appendChild(text);

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

            } catch (e) {
                return {
                    info: {e},
                    tests: {}
                }

            }

        });

        const elementHandle = await page.$('.row > .content-block');

        const bounds = await elementHandle.boundingBox();
        const initial = page.viewport();

        console.log(bounds, initial);
        await page.setViewport({
            width: 800,
            height: 3198,
        });

        const name = await uuidv4();
        await page.waitFor(2000);
        const imageRes = await elementHandle.screenshot({path: __dirname + '/data/' + name + '.png'});
        await browser.close();
        res.status(200).send({result, url: process.env.UPLOAD_HOST + "/file/" + name + ".png"});
    } catch (e) {
        console.log("BOT ERROR: ", e);
        res.status(200).send({"ERROR_BOT": e.toString()});
        await browser.close();
    }
});


console.log(__dirname + "/" + process.env.UPLOAD_PATH);
app.use('/file', express.static(__dirname + "/" + process.env.UPLOAD_PATH + "/"));

app.get('/', (req, res) => {
    res.json("GDPR CHECKER V1.0")
})

const port = process.env.PORT

server.listen(port, () =>
    console.log(
        `Server Gdpr-checker started! Listening on port ${port}. Timestamp: ${Date.now()}`
    )
);

