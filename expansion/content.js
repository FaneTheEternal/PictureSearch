let IS_ACTIVE = false;
const picSearch = new Event('picture_search');
const picSize = 80;
let DATA = {};
let counter = 0;

let MUTEX = false;

const clearUrl = (obj) => {
    console.log(obj);
    const url = obj.toString();
    let i = 0;
    if (url.indexOf('png') > -1) i = url.indexOf('png') + 3;
    else {
        if (url.indexOf('jpg') > -1) i = url.indexOf('jpg') + 3;
        else {
            if (url.indexOf('svg') > -1) i = url.indexOf('svg') + 3;
        }
    }
    return url.slice(0, i);
};


document.addEventListener('picture_search', () => {
    chrome.runtime.sendMessage({req: 'IS_ACTIVE'}, (response) => {
        IS_ACTIVE = response.IS_ACTIVE;

        void chrome.runtime.lastError;
    });

    if (IS_ACTIVE && !MUTEX) {
        let data = {};

        let count = 0;
        let needUpd = false;
        images = document.querySelectorAll('img');
        if (images) {
            images.forEach((value, index, theArray) => {
                const el = theArray[index];
                const src = el.src;
                let size = {w: 0, h: 0};

                { // Получаем размеры картинки
                    const width = el.style.width.toString();
                    if (width) size.w = width.slice(0, width.length - 2);
                    else size.w = el.getBoundingClientRect().width;

                    const height = el.style.height.toString();
                    if (height) size.w = height.slice(0, height.length - 2);
                    else size.w = el.getBoundingClientRect().height;
                }

                // size.w > picSize || size.h > picSize
                if (size.w > picSize || size.h > picSize) {
                    const url = clearUrl(el.src);
                    if (DATA[url]) {
                        el.title = DATA[url];
                        data[url] = DATA[url];
                    } else {
                        el.title = 'Load...' + counter;
                        data[url] = {};
                        needUpd = true;
                    }
                    count++;
                }
            });
        }
    
        const body = document.getElementsByTagName('body')[0];
        aImage = body.querySelectorAll('*');
        if (aImage) {
            aImage.forEach((value, index, theArray) => {
                const el = theArray[index];
                let bk = el.style.backgroundImage;
                if (bk.indexOf('url') != -1) {
                    bk = bk.slice(bk.indexOf('"') + 1, bk.lastIndexOf('"'));
                    let size = {w: 0, h: 0};

                    { // Получаем размеры элемента с картинкой
                        const width = el.style.width.toString();
                        if (width) size.w = width.slice(0, width.length - 2);
                        else size.w = el.getBoundingClientRect().width;

                        const height = el.style.height.toString();
                        if (height) size.w = height.slice(0, height.length - 2);
                        else size.w = el.getBoundingClientRect().height;
                    }

                    // size.w > picSize || size.h > picSize
                    if (size.w > picSize || size.h > picSize) {
                        const url = clearUrl(bk);
                        if (DATA[url]) {
                            el.title = DATA[url];
                            data[url] = DATA[url];
                        } else {
                            el.title = 'Load...' + counter;
                            data[url] = {};
                            needUpd = true;
                        }
                        count++;
                    }
                }
            });
        }
        console.log(`Count: ${count}`);
        if (needUpd) {
            MUTEX = true;
            chrome.runtime.sendMessage({req: 'GET_DATA', pictures: data}, (response) => {
                DATA = response.DATA;
                console.log(`GOT:`);
                console.log(DATA);
                MUTEX = false;
                void chrome.runtime.lastError;
            });
            counter++;
        }
    }
});

document.addEventListener('unload', () => {
    clearInterval(timerId);
})

let timerId = setInterval(() => document.dispatchEvent(picSearch), 10000);