import BarSeries from "./bar-series";

export default class StackedBar extends BarSeries {

    offset(i) {
        let offset = 0;
        if (this.stackSeries) {
            offset = this.stackSeries.value(i);

        }
        return offset;
    }

    value(i) {
        return super.value(i) + this.offset(i);
    }

    render(valueScale, argumentScale, animate) {
        const x = this.options.x;
        const y = this.options.y;

        if (!this.stackSeries) {
            super.render(valueScale, argumentScale, animate);
            return;
        }

        if (isFinite(valueScale(y[0]))) {
            const points =
                y.reduce((arr, v, i, y) => {
                    const yc = Math.round(valueScale(this.value(i)));
                    const xc = Math.round(argumentScale(x[i]));
                    const x0c = i === 0 ? 0 : Math.round(argumentScale(x[i - 1]));
                    const px_x = x0c + (xc - x0c) / 2;

                    arr.push(`H${px_x}V${yc}H${xc}`);

                    return arr;
                }, [`M0 ${Math.round(valueScale(this.offset(0)))}`]);

            //points.push(`V${Math.round(valueScale(this.offset(y.length - 1)))}`);

            const xr = x.slice().reverse();
            const bottom = y.slice().reverse().reduce((arr, v, i, y) => {
                const fi = y.length - 1 - i;
                const yc = Math.round(valueScale(this.offset(fi)));
                const xc = Math.round(argumentScale(xr[i]));
                const x0c = i === y.length - 1 ? 0 : Math.round(argumentScale(xr[i + 1]));
                const px_x = x0c + (xc - x0c) / 2;

                arr.push(`V${yc}H${px_x}`);

                return arr;
            }, points);

            this.drawPath(bottom, animate);

        }

        this.valueScale = valueScale;
        this.argumentScale = argumentScale;
    }

    applyVisibility() {
        super.applyVisibility();
        this.render(this.valueScale, this.argumentScale, true);
    }
}
