import Series from "./series";

export default class SeriesView {

    constructor(renderer, options) {
        /**
         * @type {Series}
         */
        this.series = options.map(o => {
            const series = new Series(o);
            series.path.renderTo(renderer.svg);
            return series;
        });
    }

    getRange() {
        return Math.max.apply(null, this.series.map(s => s.getRange()));
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
