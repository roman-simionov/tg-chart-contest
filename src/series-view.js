import LineSeries from "./series/line";
import BarSeries from "./series/bar";
import StackedBar from "./series/stacked-bar";
import PercentArea from "./series/percent-area";

const Series = {
    line: LineSeries,
    bar: BarSeries,
    stackedBar: StackedBar,
    percentArea: PercentArea
};

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
            o.seriesView = this;
            const series = new Series[o.type](o);
            series.path.renderTo(this.transformX);
            return series;
        }).map((s, i, arr) => {
            if (arr[i - 1]) {
                s.stackSeries = arr[i - 1];
            }
            return s;
        });

        this.yTransformation = [];
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
        if (transformY && (this.yTransformation[0] !== transformY[0] || this.yTransformation[1] !== transformY[1])) {
            this.yTransformation = transformY;
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
        this.yTransformation = [];
    }

    clearHover() {
        this.series.forEach(s => s.clearHover());
    }

    getSeriesSum(index) {
        return this.series.reduce((sum, { options }) => {
            if (options.visible !== false) {
                sum += options.y[index];
            }
            return sum;
        }, 0);
    }
}
