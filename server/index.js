const express = require('express')
const app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');
const { PerformanceObserver, performance } = require('perf_hooks');

let DATA = JSON.parse(fs.readFileSync('./data.json'));
let counter = 0;

let MUTEX = false;


// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');


// Получение информации из Cloud Vision API
const doAPI = async (url) => {
    console.log(`${url} <> ${url.indexOf('http')}`);
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
                    webDetection.webEntities.forEach(webEntity => {
                        if (i++ < 3) {
                            buff += `${webEntity.description} `;
                        }
                    });
                    DATA[url] = buff;
                    console.log(`[doAPI]${url} <> ${buff}`);
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
app.post('/', (req, res) => {
    // let time = performance.now();
    while(MUTEX) {}
    MUTEX = true;
    let time = performance.now();
    console.log(req.method + ' : ' + req.rawHeaders[1]);
    let resp = {};
    console.log(req.body);
    for (let el in req.body) {
        if (DATA[el]) {
            resp[el] = DATA[el];
        } else {
            DATA[el] = 'Loading...';
            doAPI(el);
        }
    }
    MUTEX = false;
    fs.writeFile('./data.json', JSON.stringify(DATA), err => console.log(`Errors: ${err}`));
    res.send(resp);
    time = performance.now() - time;
    console.log('Время выполнения = ', time);
});

const httpServer = http.createServer(app);
httpServer.listen(8080);
