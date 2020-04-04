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
let modalDone = [];

const seeModal = (e) => {
    e = e || window.event;
    const pageX = e.target.getBoundingClientRect().x
    const pageY = e.target.getBoundingClientRect().y

    const modal = document.getElementById(e.currentTarget.title);
    if (modal) {
        modal.style.left = pageX + 'px';
        modal.style.top = pageY + 'px';
    }
};

const hideModal = (e) => {
    const modal = document.getElementById(e.currentTarget.title);
    if (modal) {
        modal.style.top = -100 + 'px';
    }
};

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
    if (modalDone.indexOf(url) != -1) return;
    const data = DATA[url];
    el.title = data;

    let modal = document.createElement('div');
    modal.id = url;
    modal.style.cssText = `
        position: absolute;
        background-color: lightgray;
        z-index: 1337;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        border-radius: 5px;
    `
    const rowCss = `
        height: auto;
        background-color: white;
        border-radius: 5px;
        margin: 5px;
        padding: 2px;
        outline: none;
    `
    let dats = data.split(';');
    for (i in dats) {
        let row = document.createElement('p');
        row.style.cssText = rowCss;
        row.innerHTML = dats[i];
        modal.append(row);
    }

    if (el.tagName.toLowerCase() == 'img') {
        el.parentNode.append(modal);
    } else {
        el.append(modal);
    }

    modalDone.push(url);
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
                    if (modalDone.indexOf(url) == -1) {
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
                        if (modalDone.indexOf(url) == -1) {
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

let start = setInterval(() => {
    document.dispatchEvent(picSearch);
    clearInterval(start);
}, 1000);
let timerId = setInterval(() => document.dispatchEvent(picSearch), 10000);