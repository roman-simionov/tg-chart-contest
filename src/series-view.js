import Series from "./series";
import { SvgWrapper } from "./renderer";

export default class SeriesView {

    constructor(container, options) {
        this.container = container.setAttributes({ "transform": "translate(0,0)" });
        this.scaleY = new SvgWrapper("g").renderTo(this.container).setAttributes({ "transform": "scale(1, 1)" });
        this.transformX = new SvgWrapper("g").renderTo(this.scaleY);
        this.transformX.element.classList.add("transform-x");
        /**
         * @type {Series}
         */
        this.series = options.map(o => {
            const series = new Series(o);
            series.path.renderTo(this.transformX);
            return series;
        });
    }

    getRange(range) {
        const ranges = this.series.reduce((r, s) => r.concat(s.getRange(range)), []);
        return [Math.min.apply(null, ranges), Math.max.apply(null, ranges)];
    }

    getPoints(x) {
        return this.series.map(s => s.getPoint(x))
            .filter(p => p)
            .filter((p, _, a) => p.a.valueOf() === a[0].a.valueOf());
    }

    setCommonScale(valueScale, argumentScale) {
        this.valueCommonScale = valueScale;
        this.argumentCommonScale = argumentScale;
    }

    transform(argumentDomain, valueDomain) {
        const range = valueDomain || this.getRange(argumentDomain);
        const newStart = this.valueCommonScale(range[1]);
        const newEnd = this.valueCommonScale(range[0]);

        const translateY = (this.height) * newStart / (newEnd - newStart);
        let scaleY = (translateY / newStart);
        if (isFinite(scaleY) || isFinite(translateY)) {
            this.container.move(0, -translateY);
            this.scaleY.scale(1, scaleY || 1);
        }

        if (argumentDomain) {
            const range = argumentDomain;
            const newStart = this.argumentCommonScale(range[0]);
            const newEnd = this.argumentCommonScale(range[1]);

            const translateX = (this.width) * newStart / (newEnd - newStart);
            let scaleX = this.width / (newEnd - newStart);
            if (isFinite(scaleX) || isFinite(translateX)) {
                this.transformX.setAttributes({ "transform": `translate(${-translateX} 0) scale(${scaleX}, 1)` });
            }
        }

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
    }

    resize(width, height) {
        this.height = height;
        this.width = width;
        this.series.forEach(s => s.resize(width, height));
    }
}
