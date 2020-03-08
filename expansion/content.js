let IS_ACTIVE = false;
const picSearch = new Event('picture_search');
const doGoogleAPI = new Event('doGoogleAPI');
const picSize = 80;


chrome.runtime.sendMessage({req: 'IS_ACTIVE'}, (response) => {
    IS_ACTIVE = response.IS_ACTIVE;

    document.dispatchEvent(picSearch);
    void chrome.runtime.lastError;
});

const doAPI = (event) => {
    
};

document.addEventListener('picture_search', () => {
    if (IS_ACTIVE) {
        let count = 0;
        images = document.querySelectorAll('img');
        if (images) {
            images.forEach((value, index, theArray) => {
                const el = theArray[index];
                const src = el.src;
                let size = {w: 0, h: 0};

                if (el.style.width) size.w = el.style.width.toString();
                else size.w = el.parentNode.style.width.toString();
                size.w = size.w ? size.w.slice(0, length - 3) : 0;

                if (el.style.height) size.h = el.style.height.toString();
                else size.k = el.parentNode.style.height.toString();
                size.h = size.h ? size.h.slice(0, length - 3) : 0;

                // size.w > picSize && size.h > picSize
                if (size.w > picSize && size.h > picSize) {
                    theArray[index].title = `width: ${size.w} - height: ${size.h}`;
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
                if (bk) {
                    bk = bk.slice(bk.indexOf('"') + 1, bk.lastIndexOf('"'));
                    let size = {w: 0, h: 0};

                    if (el.style.width) size.w = el.style.width.toString().slice(0, length - 3);
                    else size.w = el.getBoundingClientRect().width;
                    
                    if (el.style.height) size.h = el.style.height.toString().slice(0, length - 3);
                    else size.h = el.getBoundingClientRect().height;

                    // size.w > picSize && size.h > picSize
                    if (size.w > picSize && size.h > picSize) {
                        theArray[index].title = `width: ${size.w} - height: ${size.h}`;
                        count++;
                    }
                }
            });
        }
        console.log(count);
    }
});
