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
        return Math.max.apply(null, this.series.map(s => s.getRange(range)));
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
