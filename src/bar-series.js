import Series from "./series";
import { Path } from "./renderer";


export default class BarSeries extends Series {
    constructor(options) {
        super(options);
        this.path.setAttributes({
            fill: options.color
        });
        this.path.addClass("bar");
    }
    getRange(bounds) {
        return [0, super.getRange(bounds)[1]];
    }

    render(valueScale, argumentScale) {
        const x = this.options.x;
        const y = this.options.y;

        if (isFinite(valueScale(y[0]))) {
            const points =
                y.reduce((arr, v, i, y) => {
                    const yc = Math.round(valueScale(v));
                    const xc = Math.round(argumentScale(x[i]));
                    const x0c = i === 0 ? 0 : Math.round(argumentScale(x[i - 1]));
                    const px_x = x0c + (xc - x0c) / 2;

                    arr.push(`H${px_x}V${yc}H${xc}`);

                    return arr;
                }, [`M0 ${this.height}`]);
            points.push(`V${this.height}Z`);

            this.path.element.setAttribute("d", points.join(""));
        }

        this.valueScale = valueScale;
        this.argumentScale = argumentScale;
    }

    hover(index) {
        const x = this.options.x;
        const y = this.options.y;

        const yc = Math.round(this.valueScale(y[index]));
        const xc = Math.round(this.argumentScale(x[index]));

        const x0c = index === 0 ? 0 : Math.round(this.argumentScale(x[index - 1]));
        const px_x = x0c + (xc - x0c) / 2;

        const x1c = index === x.length - 1 ? xc : Math.round(this.argumentScale(x[index + 1]));
        const px_x1 = xc + (x1c - xc) / 2;

        this.hoverElement = new Path().addClass("bar");
        this.hoverElement.setAttributes({
            fill: this.options.color
        });

        this.hoverElement.element.setAttribute("d", [`M${px_x} ${this.height}V${yc}H${px_x1}V${this.height}Z`]);
        this.path.element.parentNode.appendChild(this.hoverElement.element);
    }
}
