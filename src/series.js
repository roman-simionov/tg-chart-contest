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
            stroke: options.color,
            opacity: 1
        });
    }

    getRange(bounds) {
        if (!this.options.visible) {
            return [];
        }
        const x = this.options.x;
        const visibleData = bounds !== undefined ? this.options.y.filter((_, i) => x[i + 1] >= bounds[0] && x[i - 1] <= bounds[1]) : this.options.y;

        return [Math.min.apply(null, visibleData), Math.max.apply(null, visibleData)];
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
        this.pointArguments = [];
        this.valueDomain = valueDomain;
        if (isFinite(valueDomain(y[0]))) {
            const points = y.map((v, i) => {
                const _x = argumentDomain(x[i]);
                if (_x > 0) {
                    this.pointArguments[Math.floor(_x)] = i;
                }

                return [_x, valueDomain(v)];
            });
            this.path.value(points, animate);
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    applyVisibility() {
        if (this.options.visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    getPoint(x) {
        if (this.options.visible === false) {
            return null;
        }
        let i = x;
        let j = x;
        let v;
        let a;
        const check = (c) => {
            const index = this.pointArguments[c];
            if (index !== undefined) {
                a = this.options.x[index];
                v = this.options.y[index];
                x = c;
                return true;
            }
        };
        while (i < this.pointArguments.length || j >= 0) {
            if (check(i++)) break;
            if (check(j--)) break;
        }
        if (a === undefined) {
            return null;
        }
        return {
            series: this,
            v,
            y: this.valueDomain(v),
            a,
            x
        };
    }

    hide() {
       this.path.animate("opacity", 0);
    }

    show() {
        this.path.animate("opacity", 1);
    }
}
