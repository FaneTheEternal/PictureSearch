let IS_ACTIVE = false;


document.addEventListener("DOMContentLoaded", () => {
    const SWITCH = document.getElementById('check');

    let MUTEX = false;

    MUTEX = true;
    chrome.runtime.sendMessage({req: 'IS_ACTIVE'}, (response) => {
        IS_ACTIVE = response.IS_ACTIVE;
        SWITCH.checked = IS_ACTIVE

        MUTEX = false
        void chrome.runtime.lastError;
    });

    SWITCH.addEventListener('click', () => {
        if (MUTEX) return;
        MUTEX = true;

        chrome.runtime.sendMessage({req: 'SWITCH'}, (response) => {
            IS_ACTIVE = response.IS_ACTIVE;
            SWITCH.checked = IS_ACTIVE

            MUTEX = false;
            void chrome.runtime.lastError;
        });
    })
});