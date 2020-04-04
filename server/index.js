// Express
const express = require('express')
const app = express();
// -End-

// Base server
const http = require('http');
const https = require('https');
// -End-

// Utils
const fs = require('fs');
const { PerformanceObserver, performance } = require('perf_hooks');
// -End-

// Redis
const redis = require("redis");
const redisClient = redis.createClient();
const { promisify } = require("util");

redisClient.on("error", function(error) {
  console.error(error);
});
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
// -End-

let DATA = JSON.parse(fs.readFileSync('./data.json'));
let counter = 0;

let MUTEX = false;


// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');


// Получение информации из Cloud Vision API
const doAPI = async (url) => {
    if (url.indexOf('http') == -1) return 'None';
    console.log(`[doAPI]<GET>: ${url}`);
    const fileName = `./CACHE/${counter++}.${url.slice(-3)}`;
    const file = fs.createWriteStream(fileName);
    https.get(url, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(async () => {
                // Creates a client
                const client = new vision.ImageAnnotatorClient();
                // Performs label detection on the image file
                const [result] = await client.webDetection(fileName);
                const webDetection = result.webDetection;
                if (webDetection.webEntities.length) {
                    let i = 0;
                    let buff = '';
                    if (webDetection) {
                        webDetection.webEntities.forEach(webEntity => {
                        if (i++ < 3) {
                            const got = webEntity.description;
                            if (got) {
                                buff += `;${got}`;
                            }
                        }
                    });
                    }
                    setAsync(url, buff.slice(1));
                    console.log(`[doAPI]<END>(*SUCCESS*): ${url}`);
                } else {
                    console.log(`[doAPI]<END>(*FAIL*): ${url}`);
                }
                fs.unlinkSync(fileName);
            });
        });
    });  
}

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Access the parse results as request.body
app.post('/', async (req, res) => {
    while(MUTEX) {}
    MUTEX = true;
    let time = performance.now();
    console.log(req.method + ' : ' + req.rawHeaders[1]);
    let resp = {};
    const body = req.body
    for (let i in body) {
        const el = body[i];
        const value = await getAsync(el)
        if (value) {
            resp[el] = value
        } else {
            resp[el] = 'Loading...';
            doAPI(el);
        }
    }
    MUTEX = false;
    res.send(resp);
    time = performance.now() - time;
    console.log('Время выполнения = ', time);
});

const httpServer = http.createServer(app);
httpServer.listen(8080);
