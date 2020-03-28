let IS_ACTIVE = false;

let DATA = {};
let counter = 0;

import mutex from './mutex';
const MUTEX = new mutex();

class timeCounter {
    constructor() {
        this.time = performance.now();
        this.dispatch = () => {
            time = performance.now() - time;
            console.log('Время выполнения = ', time);
        }
    }
}

const record = (url) => {
    this.url = url;
    this.status = 0;
    this.value = null;
};

const records = () => {
    this.values = [];
    this.add = (value) => {
        if (values.length) {
            let i = 0;
            for (; i < values.length; i++) {
                if (values[i].url > value.url) break;
            }
            values.splice(i, 0, value);
        } else {
            values.push(value);
        }
    };
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.req) {
        case 'IS_ACTIVE':
            sendResponse({IS_ACTIVE: IS_ACTIVE});
            break;
        case 'SWITCH':
            IS_ACTIVE = !IS_ACTIVE;
            sendResponse({IS_ACTIVE: IS_ACTIVE});
            break;
        case 'GET_DATA':
            let resp = {};
            let newDATA = {};
            let needSyncro = false;
            MUTEX.take();
            for (let el in request.pictures) {
                if (DATA[el]) {
                    resp[el] = DATA[el];
                } else {
                    newDATA[el] = {};
                    needSyncro = true;
                }
            }
            MUTEX.dispatch();
            sendResponse({DATA: resp});
            if (needSyncro) {
                let time = new timeCounter();
                fetch('http://localhost:8080/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newDATA)})
                    .then(r => r.text())
                    .then(result => {
                        const data = JSON.parse(result);
                        MUTEX.take()
                        for (el in data) {
                            DATA[el] = data[el];
                        }
                        MUTEX.dispatch();
                        time.dispatch();
                    });
            }
            break;
        default:
            alert('unknow request in background');
            sendResponse({});
    }
});
