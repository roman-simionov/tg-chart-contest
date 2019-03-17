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
            opacity: 1,
            "vector-effect": "non-scaling-stroke"
        });
        this.pointArguments = [];
    }

    getRange(bounds) {
        if (!this.options.visible) {
            return [];
        }
        const x = this.options.x;
        const visibleData = bounds !== undefined ?
            this.options.y
                .filter((_, i) => x[i] >= bounds[0] && x[i] <= bounds[1])
            : this.options.y;

        return [Math.min.apply(null, visibleData), Math.max.apply(null, visibleData)];
    }

    render(valueScale, argumentScale) {
        const x = this.options.x;
        const y = this.options.y;

        if (isFinite(valueScale(y[0]))) {
            const points = y.map((v, i) => [argumentScale(x[i]), valueScale(v)]);
            this.path.value(points);
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

    getPoint(x, argumentScale, valueScale) {
        if (this.options.visible === false) {
            return null;
        }
        if (this.pointArguments.length === 0) {
            this.setupTracker(argumentScale);
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
            y: valueScale(v),
            a,
            x
        };
    }

    resetTracker() {
        this.pointArguments = [];
    }

    setupTracker(argumentScale) {
        const x = this.options.x;
        this.pointArguments = [];
        x.forEach((v, i) => {
            const x = Math.round(argumentScale(v));
            if (x >= 0 && x <= this.width) {
                this.pointArguments[x] = i;
            }
        });
    }

    hide() {
       this.path.animate("opacity", 0);
    }

    show() {
        this.path.animate("opacity", 1);
    }
}
