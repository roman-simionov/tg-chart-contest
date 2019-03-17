import Series from "./series";
import { SvgWrapper } from "./renderer";

function calculateTransform(domain, scale, size) {
    const newStart = scale(domain[0]);
    const newEnd = scale(domain[1]);

    const translateValue = size * newStart / (newEnd - newStart);
    const scaleValue = size / (newEnd - newStart);

    if (isFinite(translateValue) && isFinite(scaleValue)) {
        return [-translateValue, scaleValue || 1];
    }
    return null;
}

export default class SeriesView {
    /**
     *
     * @param {container} container
     * @param {*} options
     */
    constructor(container, options, argumentAxis, valueAxis) {
        this.argumentAxis = argumentAxis;
        this.valueAxis = valueAxis;

        this.container = container;
        this.scaleY = new SvgWrapper("g").renderTo(this.container);
        this.transformX = new SvgWrapper("g")
            .addClass("transform-x")
            .renderTo(this.scaleY);
        /**
         * @type {Series}
         */
        this.series = options.map(o => {
            const series = new Series(o);
            series.path.renderTo(this.transformX);
            return series;
        });
    }

    /**
     *
     * @param {Date[]} range
     */
    getRange(range) {
        const ranges = this.series.reduce((r, s) => r.concat(s.getRange(range)), []);
        return [Math.min.apply(null, ranges), Math.max.apply(null, ranges)];
    }

    /**
     *
     * @param {number} x
     */
    getPoints(x) {
        return this.series.map(s => s.getPoint(x, this.argumentAxis.domain.scale, this.valueAxis.domain.scale))
            .filter(p => p)
            .filter((p, _, a) => p.a.valueOf() === a[0].a.valueOf());
    }

    setCommonScale(valueScale, argumentScale) {
        this.valueCommonScale = valueScale;
        this.argumentCommonScale = argumentScale;
    }

    transform(argumentDomain, valueDomain) {
        valueDomain = (valueDomain || this.getRange(argumentDomain)).slice().reverse();
        const transformY = calculateTransform(valueDomain, this.valueCommonScale, this.height);
        if (transformY) {
            this.container.move(0, transformY[0]);
            this.scaleY.scale(1, transformY[1]);
        }

        if (argumentDomain) {
            const transformX = calculateTransform(argumentDomain, this.argumentCommonScale, this.width);
            if (transformX) {
                this.transformX.setAttributes({ "transform": `translate(${transformX[0]} 0) scale(${transformX[1]}, 1)` });
            }
        }

        this.series.forEach(s => s.resetTracker());
        return this;
    }

    applyVisibility() {
        this.series.forEach(s => s.applyVisibility());
    }

    /**
     *
     * @param {*} argumentDomain
     * @param {*} valueDomain
     * @param {boolean} animate
     */
    render(valueDomain, argumentDomain, animate) {
        this.series.forEach(s => s.render(valueDomain, argumentDomain, animate));
        this.transformX.setAttributes({ "transform": `translate(0 0) scale(1 1)` });
        this.container.setAttributes({ "transform": "translate(0 0)" });
        this.scaleY.setAttributes({ "transform": "scale(1 1)" });
    }

    /**
     *
     * @param {number} width
     * @param {number} height
     */
    resize(width, height) {
        this.height = height;
        this.width = width;

        this.series.forEach(s => s.resize(width, height));
    }
}
