let IS_ACTIVE = false;
const picSearch = new Event('picture_search');
const doGoogleAPI = new Event('doGoogleAPI');
const picSize = 80;
let DATA = {};
let counter = 0;

let MUTEX = false;


document.addEventListener('picture_search', () => {
    chrome.runtime.sendMessage({req: 'IS_ACTIVE'}, (response) => {
        IS_ACTIVE = response.IS_ACTIVE;

        void chrome.runtime.lastError;
    });

    if (IS_ACTIVE && !MUTEX) {
        let data = {};

        let count = 0;
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
                    if (DATA[el.src]) {
                        el.title = DATA[el.src];
                        data[el.src] = DATA[el.src];
                    } else {
                        el.title = 'Load...' + counter;
                        data[el.src] = null;
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
                        if (DATA[bk]) {
                            el.title = DATA[bk];
                            data[bk] = DATA[bk];
                        } else {
                            el.title = 'Load...' + counter;
                            data[bk] = null;
                        }
                        count++;
                    }
                }
            });
        }
        console.log(count);
        // console.log(data);
        MUTEX = true;
        chrome.runtime.sendMessage({req: 'GET_DATA', pictures: data}, (response) => {
            DATA = response.DATA;
            console.log(DATA);
            MUTEX = false;
            void chrome.runtime.lastError;
        });
        counter++;
    }
});

let timerId = setInterval(() => document.dispatchEvent(picSearch), 3000);
setTimeout(() => { clearInterval(timerId); alert('stop'); }, 20000);