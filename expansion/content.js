let IS_ACTIVE = false;
const picSearch = new Event('picture_search');


chrome.runtime.sendMessage({req: 'IS_ACTIVE'}, (response) => {
    IS_ACTIVE = response.IS_ACTIVE;

    document.dispatchEvent(picSearch);
    void chrome.runtime.lastError;
});

document.addEventListener('picture_search', () => {
    if (IS_ACTIVE) {
        images = document.querySelectorAll('img');
        if (images) {
            images.forEach((value, index, theArray) => {
                const src = theArray[index].src;
                theArray[index].title = src;
                // console.log(src);
            });
        }
    
        const body = document.getElementsByTagName('body')[0];
        aImage = body.querySelectorAll('*');
        if (aImage) {
            aImage.forEach((value, index, theArray) => {
                let bk = theArray[index].style.backgroundImage;
                if (bk) {
                    bk = bk.slice(bk.indexOf('"') + 1, bk.lastIndexOf('"'));
                    // console.log(bk);
                    theArray[index].title = bk;
                }
            });
        }
    }
});
