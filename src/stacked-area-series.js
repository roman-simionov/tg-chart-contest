import StackedSeries from "./stacked-bar-series";

export default class StackedAres extends StackedSeries {
    getRange() {
        return [0, 100];
    }

    percentValue(i) {
        const value = this.value(i);
        const result = (value / this.options.seriesView.getSeriesSum(i)) * 100;
        return result;
    }

    percentOffset(i) {
        const value = this.offset(i);
        const result = (value / this.options.seriesView.getSeriesSum(i)) * 100;
        return result;
    }

    render(valueScale, argumentScale, animate) {
        const x = this.options.x;
        const y = this.options.y;

        if (isFinite(valueScale(y[0]))) {
            const points =
                y.reduce((arr, _, i) => {
                    const yc = Math.round(valueScale(this.percentValue(i)));
                    const xc = Math.round(argumentScale(x[i]));

                    arr.push(`L${xc} ${yc}`);

                    return arr;
                }, [`M0 ${Math.round(this.height)}`]);

            let bottom;

            if (this.stackSeries) {
                const xr = x.slice().reverse();
                bottom = y.slice().reverse().reduce((arr, v, i, y) => {
                    const fi = y.length - 1 - i;
                    const yc = Math.round(valueScale(this.percentOffset(fi)));
                    const xc = Math.round(argumentScale(xr[i]));

                    arr.push(`L${xc} ${yc}`);

                    return arr;
                }, points);
            } else {
                bottom = points.concat([`V${this.height}Z`]);
            }

            this.drawPath(bottom, animate);
        }

        this.valueScale = valueScale;
        this.argumentScale = argumentScale;
    }

    hover() { }
}
