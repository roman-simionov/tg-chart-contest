import { Path, SvgWrapper } from "../renderer";
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

    value(i) {
        return this.options.visible === false ? 0 : this.options.y[i];
    }

    getRange(bounds) {
        if (!this.options.visible) {
            return [];
        }
        const x = this.options.x;
        const visibleData = (bounds !== undefined ?
            this.options.y
                .reduce((data, _, i) => {
                    if ((x[i - 1] >= bounds[0] || x[i] >= bounds[0]) && (x[i + 1] <= bounds[1] || x[i] <= bounds[1])) {
                        data.push(this.value(i));
                    }
                    return data;
                }, [])
            : this.options.y.map((_, i)=>this.value(i)));

        return [Math.min.apply(null, visibleData), Math.max.apply(null, visibleData)];
    }

    render(valueScale, argumentScale) {
        const x = this.options.x;
        const y = this.options.y;

        if (isFinite(valueScale(y[0]))) {
            this.path.value(y.map((v, i) => `${Math.round(argumentScale(x[i]))} ${Math.round(valueScale(v))}`));
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
        let pIndex;
        const check = (c) => {
            const index = this.pointArguments[c];
            if (index !== undefined) {
                a = this.options.x[index];
                v = this.options.y[index];
                x = c;
                pIndex = index;
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
            x,
            index: pIndex
        };
    }

    resetTracker() {
        this.pointArguments = [];
    }

    setupTracker(argumentScale) {
        const x = this.options.x;
        this.pointArguments = [];
        x.some((v, i) => {
            const x = Math.round(argumentScale(v));
            if (x >= 0 && x <= this.width + 1) {
                this.pointArguments[x] = i;
            } else if (x > 0) {
                return true;
            }
        });
    }

    hide() {
       this.path.animate("opacity", 0);
    }

    show() {
        this.path.animate("opacity", 1);
    }

    hover({ x, y, series }) {
        return new SvgWrapper("circle")
            .setAttributes({
                cx: x,
                cy: y,
                r: 10,
                stroke: series.options.color,
                opacity: 0
            });
    }

    clearHover() {
    }

    lineVisibility() {
        return true;
    }
}
