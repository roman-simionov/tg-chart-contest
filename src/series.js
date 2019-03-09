import { Path } from "./renderer";
export default class Series {
    /**
     *
     * @param {Array<number[]>} data
     * @param {{parent: SvgWrapper, fill: string}} options
     */
    constructor(data, options) {
        this.data = data;
        this.path = new Path();
        this.path.setAttributes({
            stroke: options.stroke
        });
        this.path.renderTo(options.parent);
    }

    getRange(bounds) {
        const visibleData = (bounds !== undefined ? this.data.filter(([a]) => a >= bounds[0] && a <= bounds[1]) : this.data).map(([_, v]) => v);

        return Math.max.apply(null, visibleData);
    }

    /**
     *
     * @param {*} argumentDomain
     * @param {*} valueDomain
     * @param {boolean} animate
     */
    render(valueDomain, argumentDomain, animate) {
        const points = this.data.map(([a, v]) => [argumentDomain(a), valueDomain(v)]);
        this.path.value(points, animate);
    }

    hide() {
        this.path.element.setAttribute("visibility", "hidden");
    }

    show() {
        this.path.element.removeAttribute("visibility");
    }
}
