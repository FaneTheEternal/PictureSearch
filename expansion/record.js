class Record {
    constructor(url) {
        this.url = url;
        this.status = 0;
        this.value = null;
        this.isDone = () => this.status == 3;
        this.setVal = (value) => {
            if (this.isDone()) return;
            if (value.indexOf('$Load') > -1) {
                this.status = 1;
            } else {
                if (value.indexOf('$Loading') > -1) {
                    this.status = 2;
                } else this.status = 3
            }
            this.value = value;
        }
    }
}

class ContentRecord extends Record {
    constructor(url, selector) {
        super(url)
        this.selector = selector;
        this.doVal = () => {
            this.selector.title = this.value;
        };
        this.setVal = (value) => {
            super.setVal(value);
            this.doVal();
        };
    }
}

class Records {
    constructor() {
        this.values = [];
        this.add = (value) => {
            let i = 0;
            for (; i < this.values.length; i++) if (this.values[i].url > value.url) break;
            this.values.splice(i, 0, value);
        };
        this.indexOf = (url) => {
            let a = 0;
            let b = this.values.length - 1;
            while(a < b) {
                let c = ((b - a) / 2) >> 0;
                if (this.values[c].url > url) {
                    b = c;
                } else {
                    a = c;
                }
            }
            if (a == b) return a;
            else return -1;
        };
    }
}