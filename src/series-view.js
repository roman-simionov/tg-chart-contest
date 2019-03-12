import Series from "./series";

export default class SeriesView {

    constructor(container, options) {
        /**
         * @type {Series}
         */
        this.series = options.map(o => {
            const series = new Series(o);
            series.path.renderTo(container);
            return series;
        });
    }

    getRange(range) {
        const ranges = this.series.reduce((r, s) => r.concat(s.getRange(range)), []);
        return [0, Math.max.apply(null, ranges)];
    }

    getPoints(x) {
        return this.series.map(s => s.getPoint(x))
            .filter(p => p)
            .filter((p, _, a) => p.a.valueOf() === a[0].a.valueOf());
    }

    /**
     *
     * @param {*} argumentDomain
     * @param {*} valueDomain
     * @param {boolean} animate
     */
    render(valueDomain, argumentDomain, animate) {
        this.series.forEach(s => s.render(valueDomain, argumentDomain, animate));
    }
}
