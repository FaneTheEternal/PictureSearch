let IS_ACTIVE = true;

let DATA = {};
let counter = 0;

let MUTEX = false;


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
            let time = performance.now();
            let resp = {};
            let newDATA = {};
            let needSyncro = false;
            while(MUTEX) {}
            MUTEX = true;
            for (let el in request.pictures) {
                if (DATA[el]) {
                    resp[el] = DATA[el];
                } else {
                    newDATA[el] = {};
                    needSyncro = true;
                }
            }
            MUTEX = false
            sendResponse({DATA: resp});
            if (needSyncro) {
                fetch('http://localhost:8080/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newDATA)})
                    .then(r => r.text())
                    .then(result => {
                        const data = JSON.parse(result);
                        while(MUTEX) {}
                        MUTEX = true;
                        for (el in data) {
                            DATA[el] = data[el];
                        }
                        MUTEX = false;
                        time = performance.now() - time;
                        console.log('Время выполнения = ', time);
                    });
            }
            break;
        default:
            alert('unknow request in background');
            sendResponse({});
    }
});
