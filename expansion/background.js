let IS_ACTIVE = true;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.req) {
        case 'IS_ACTIVE':
            sendResponse({IS_ACTIVE: IS_ACTIVE});
            break;
        case 'SWITCH':
            IS_ACTIVE = !IS_ACTIVE;
            sendResponse({IS_ACTIVE: IS_ACTIVE});
            break;
        default:
            alert('unknow request in background');
            sendResponse({});
    }
});