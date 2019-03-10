/**
 *
 * @param {number[]} param0
 * @param {number[]} param1
 */
export function numericScale([d1, d2], [r1, r2]) {
    const range = r2 - r1;
    const domain = d2 - d1;
    return (v) => r1 + (d2 - v - d1) * (range / domain);
}

/**
 *
 * @param {Date} param0
 * @param {number[]} param1
 */
export function dateScale([d1, d2], [r1, r2]) {
    const range = r2 - r1;
    const domain = d2 - d1;

    const start = d1.getTime();
    return (v) => r1 + (new Date(v).getTime() - start) * (range / domain);
}

export default class Domain {
    constructor() {
        this.range = [];
        this.domain = [];
        this.update();
    }

    setRange(range) {
        this.range = range;
        this.update();
    }

    setDomain(domain) {
        this.domain = domain;
        this.update();
    }

    update() {
        if (this.domain[0] instanceof Date) {
            this.scale = dateScale(this.domain, this.range);
        } else {
            this.scale = numericScale(this.domain, this.range);
        }
    }
}
