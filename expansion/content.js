let IS_ACTIVE = false;
const picSearch = new Event('picture_search');
const picSize = 80;
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

const clearUrl = (obj) => {
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

const doMaGiK = (el, url) => {
    el.title = DATA[url];
};


document.addEventListener('picture_search', () => {
    try {
        chrome.runtime.sendMessage({req: 'IS_ACTIVE'}, (response) => {
            IS_ACTIVE = response.IS_ACTIVE;
    
            void chrome.runtime.lastError;
        });
    } catch (error) {
        console.log(error);
        // pass
    }

    if (IS_ACTIVE && !MUTEX.semafora) {
        let data = {};

        let count = 0;
        let needUpd = false;
        images = document.querySelectorAll('img');
        if (images) {
            images.forEach((value, index, theArray) => {
                const el = theArray[index];
                let size = {w: 0, h: 0};

                { // Получаем размеры картинки
                    const width = el.style.width.toString();
                    if (width) size.w = width.slice(0, width.length - 2);
                    else size.w = el.getBoundingClientRect().width;

                    const height = el.style.height.toString();
                    if (height) size.w = height.slice(0, height.length - 2);
                    else size.w = el.getBoundingClientRect().height;
                }

                if (size.w > picSize || size.h > picSize) {
                    const url = clearUrl(el.src);
                    if (DATA[url] && DATA[url] != 'Loading...') {
                        doMaGiK(el, url);
                    } else {
                        el.title = DATA[url] ? DATA[url] : 'Load'+ '.'.repeat(counter);
                        data[url] = null;
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

                    if (size.w > picSize || size.h > picSize) {
                        const url = clearUrl(bk);
                        if (DATA[url] && DATA[url] != 'Loading...') {
                            doMaGiK(el, url);
                        } else {
                            el.title = DATA[url] ? DATA[url] : 'Load'+ '.'.repeat(counter);
                            data[url] = null;
                            needUpd = true;
                        }
                        count++;
                    }
                }
            });
        }
        console.log(`Count: ${count}`);
        if (needUpd) {
            MUTEX.join();
            chrome.runtime.sendMessage({req: 'GET_DATA', pictures: data}, (response) => {
                DATA = response.DATA;
                console.log(`GOT: `, DATA);
                MUTEX.dispatch();
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