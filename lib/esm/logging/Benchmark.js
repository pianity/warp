export class Benchmark {
    constructor() {
        this.start = Date.now();
        this.end = null;
        // noop
    }
    static measure() {
        return new Benchmark();
    }
    reset() {
        this.start = Date.now();
        this.end = null;
    }
    stop() {
        this.end = Date.now();
    }
    elapsed(rawValue = false) {
        if (this.end === null) {
            this.end = Date.now();
        }
        const result = this.end - this.start;
        return rawValue ? result : `${(this.end - this.start).toFixed(0)}ms`;
    }
}
//# sourceMappingURL=Benchmark.js.map