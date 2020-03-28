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