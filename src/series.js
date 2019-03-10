import { Path } from "./renderer";
export default class Series {
    /**
     *
     * @param {Array<number[]>} data
     * @param {{parent: SvgWrapper, fill: string}} options
     */
    constructor(options) {
        this.options = options;
        this.path = new Path();
        this.path.setAttributes({
            stroke: options.stroke
        });
    }

    getRange(bounds) {
        const x = this.options.x;
        const visibleData = bounds !== undefined ? this.options.y.filter((_, i) => x[i] >= bounds[0] && x[i] <= bounds[1]) : this.options.y;

        return Math.max.apply(null, visibleData);
    }

    /**
     *
     * @param {*} argumentDomain
     * @param {*} valueDomain
     * @param {boolean} animate
     */
    render(valueDomain, argumentDomain, animate) {
        const x = this.options.x;
        const points = this.options.y.map((v, i) => [argumentDomain(x[i]), valueDomain(v)]);
        this.path.value(points, animate);
    }

    hide() {
        this.path.element.setAttribute("visibility", "hidden");
    }

    show() {
        this.path.element.removeAttribute("visibility");
    }
}
