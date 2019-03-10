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
            stroke: options.color
        });
    }

    getRange(bounds) {
        if (!this.options.visible) {
            return 0;
        }
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
        const y = this.options.y;
        if (isFinite(valueDomain(y[0]))) {
            const points = y.map((v, i) => [argumentDomain(x[i]), valueDomain(v)]);
            this.path.value(points, animate);
        }
        if (this.options.visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    hide() {
        this.path.element.setAttribute("visibility", "hidden");
    }

    show() {
        this.path.element.removeAttribute("visibility");
    }
}
