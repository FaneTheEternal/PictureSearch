let IS_ACTIVE = false;

let DATA = {};
let counter = 0;

class mutex {
    constructor() {
        this.semafora = false;
        this.join = () => {
            while(this.semafora) {}
            this.semafora = true;
        };
        this.dispatch = () => this.semafora = false;
    }
}
const MUTEX = new mutex();

class timeCounter {
    constructor() {
        this.time = performance.now();
        this.dispatch = () => {
            this.time = performance.now() - this.time;
            console.log('Время выполнения = ', this.time);
        }
    }
}

const _ = (data) => {
    console.log('res', data);
    return data;
}

const SssserverSend = (req) => {
    const time = new timeCounter();
    fetch('http://localhost:8080/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(req)})
        .then(r => r.text())
        .then(result => {
            const data = JSON.parse(result);
            MUTEX.join()
            for (el in data) {
                DATA[el] = data[el];
            }
            MUTEX.dispatch();
            time.dispatch();
        });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    switch(request.req) {
        case 'IS_ACTIVE':
            sendResponse(_({IS_ACTIVE: IS_ACTIVE}));
            break;
        case 'SWITCH':
            IS_ACTIVE = !IS_ACTIVE;
            sendResponse(_({IS_ACTIVE: IS_ACTIVE}));
            break;
        case 'GET_DATA':
            let resp = {};
            let newDATA = [];
            let needSyncro = false;
            MUTEX.join();
            for (let el in request.pictures) {
                if (DATA[el] && DATA[el] != 'Loading...') {
                    resp[el] = DATA[el];
                } else {
                    resp[el] = 'Loading...'
                    newDATA.push(el);
                    needSyncro = true;
                }
            }
            MUTEX.dispatch();
            sendResponse(_({DATA: resp}));
            if (needSyncro) {
                let batch = [];
                for (i in newDATA) {
                    batch.push(newDATA[i]);
                    if (batch.length == 30) {
                        SssserverSend(batch.slice(0));
                        batch = [];
                    }
                }
                if (batch.length) SssserverSend(batch);
            }
            break;
        default:
            alert('unknow request in background');
            sendResponse({});
    }
});
