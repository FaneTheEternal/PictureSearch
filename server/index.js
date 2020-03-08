const express = require('express')
const app = express();
const http = require('http');
const fs = require('fs');
const { PerformanceObserver, performance } = require('perf_hooks');

let DATA = JSON.parse(fs.readFileSync('./data.json'));
let counter = 0;

let MUTEX = false;


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
            DATA[el] = `${counter}/#/${el}`;
        }
    }
    counter++;
    MUTEX = false;
    fs.writeFile('./data.json', JSON.stringify(DATA), err => console.log(`Errors: ${err}`));
    res.send(resp);
    time = performance.now() - time;
    console.log('Время выполнения = ', time);
});

const httpServer = http.createServer(app);
httpServer.listen(8080);