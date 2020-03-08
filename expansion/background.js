let IS_ACTIVE = true;

let DATA = {};
let counter = 0;


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
            for (let el in request.pictures) {
                if (DATA[el]) {
                    resp[el] = DATA[el];
                } else {
                    DATA[el] = `${counter}/#/${el}`;
                }
            }
            counter++;
            sendResponse({DATA: resp});
            break;
        default:
            alert('unknow request in background');
            sendResponse({});
    }
});
