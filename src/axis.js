import Renderer from "./renderer";
import Domain from "./domain";
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MULTIPLIERS = [1, 2, 5];

class BaseAxis {
    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        this.renderer = renderer;

        this.group = this.renderer.createElement("g").renderTo(this.renderer.svg);

        this.group.element.classList.add("axis", "label");
        this.domain = new Domain();
    }

    setDomain(range) {
        this.domain.setDomain(range);
    }
}

export class ValueAxis extends BaseAxis {

    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        super(renderer);
        this.gridGroup = this.renderer.createElement("g").renderTo(this.renderer.svg);
        this.gridGroup.element.classList.add("grid");
    }

    /**
     *
     * @param {number} value
     */
    format(value) {
        return value;
    }

    renderGrid(ticks) {
        ticks.map(t => {
            const y = t - 0.5;
            this.renderer.path().value([[0, y], [this.width, y]]).renderTo(this.gridGroup);
        });
    }

    render() {

        this.gridGroup.element.textContent = "";
        this.group.element.textContent = "";

        const ticks = [];

        for (let i = this.domain.domain[0]; i < this.domain.domain[1]; i += 10) {
            const text = this.format(i);
            const label = this.renderer.text().value(text);
            const tick = this.domain.scale(i);
            ticks.push(tick);

            label.setAttributes({
                y: tick
            });
            label.renderTo(this.group);
        }

        this.renderGrid(ticks);
    }


    resize(width, height, lineHeight) {
        this.width = width;
        this.group.setAttributes({
            "transform": `translate(0, ${-lineHeight})`
        });
        this.domain.setRange([0, height]);
    }
}

export class ArgumentAxis extends BaseAxis {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        const renderer = new Renderer(element);
        super(renderer);
        this.renderer.svg.element.classList.add("axis");
        this.testLabel = this.renderer.text()
            .value("test")
            .renderTo(this.renderer.svg);
        this.testLabel.element.classList.add("test-label", "label");
    }

    measure() {
        const { y, height } = this.testLabel.element.getBBox();
        return { height: height, lineHeight: height + y };
    }

    /**
     *
     * @param {Date} value
     */
    format(value) {
        return `${MONTH[value.getMonth()]} ${value.getDate()}`;
    }

    render() {

        this.group.element.textContent = "";

        const addInterval = this.calculateInterval();

        const startValue = new Date(this.domain.domain[0].getTime());
        startValue.setHours(0);
        startValue.setMinutes(0);
        startValue.setSeconds(0);

        for (let i = startValue; i < this.domain.domain[1].getTime(); i = addInterval(i)) {
            const value = new Date(i);

            const text = this.format(value);
            const label = this.renderer.text().value(text);

            label.setAttributes({
                x: this.domain.scale(value)
            });
            label.renderTo(this.group);
        }
    }

    resize(width, height, lineHeight) {
        this.renderer.svg.setAttributes({ width, height: height + lineHeight });
        this.group.setAttributes({
            "transform": `translate(0, ${height})`
        });
        this.domain.setRange([0, width]);
    }

    calculateInterval() {
        const domainRange = this.domain.domain[1] - this.domain.domain[0];
        const screenRange = this.domain.range[1] - this.domain.range[0];

        const count = Math.ceil(screenRange / 50);
        const interval = domainRange / count;

        let adjustedInterval = 1000 * 60 * 60 * 24;

        let multiplier = 0;
        let days = 1;
        while (adjustedInterval < interval) {
            adjustedInterval *= MULTIPLIERS[multiplier];
            days *= MULTIPLIERS[multiplier++];
            multiplier > MULTIPLIERS.length;
            multiplier = 1;
        }

        return (v) => {
            const date = new Date(v);
            date.setDate(date.getDate() + days);
            return date;
        };
    }
}
