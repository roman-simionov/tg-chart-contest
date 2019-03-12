import Renderer from "./renderer";
import Domain from "./domain";

export const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MULTIPLIERS = [1, 2, 5];

export function createTicks([s1, s2], [d1, d2]) {
    const domainRange = d2 - d1;
    const screenRange = s2 - s1;

    const count = Math.ceil(screenRange / 35);
    const interval = domainRange / count;

    let adjustedInterval = 1;

    let multiplier = 0;
    while (adjustedInterval < interval) {
        adjustedInterval *= MULTIPLIERS[multiplier++];
        multiplier > MULTIPLIERS.length;
        multiplier = 1;
    }

    const startTick = Math.floor(d1 / interval) * interval;

    return new Array(Math.ceil(domainRange / adjustedInterval) + 1).fill(0).map((_, i) => startTick + adjustedInterval * i);
}

export function createDateTicks([s1, s2], [d1, d2], firstDate) {
    const domainRange = d2 - d1;
    const screenRange = s2 - s1;

    const count = Math.ceil(screenRange / 55);
    const interval = domainRange / count;

    let adjustedInterval = 1000 * 60 * 60 * 24;

    let days = 1;
    while (adjustedInterval < interval) {
        adjustedInterval *= 2;
    }

    days = Math.ceil(adjustedInterval / (1000 * 60 * 60 * 24));

    firstDate = new Date(firstDate);
    firstDate.setHours(0);
    firstDate.setMinutes(0);
    firstDate.setSeconds(0);

    const startTick = new Date(firstDate.getTime() + Math.floor((d1 - firstDate) / adjustedInterval) * adjustedInterval);

    return new Array(Math.ceil(domainRange / adjustedInterval) + 1)
        .fill(0).map((_, i) => {
            const s = new Date(startTick);
            return s.setDate(s.getDate() + days * i);
        });
}

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
        ticks.map(y => {
            y = Math.round(y);
            this.renderer.path().value([[0, y], [this.width, y]]).renderTo(this.gridGroup);
        });
    }

    /**
     *
     * @param {Number[]} tickValues
     */
    render(tickValues) {

        this.gridGroup.element.textContent = "";
        this.group.element.textContent = "";

        const ticks = tickValues.map(v => {
            const text = this.format(v);
            const label = this.renderer.text().value(text);
            const tick = this.domain.scale(v);

            label.setAttributes({
                y: tick
            });
            label.renderTo(this.group);

            return tick;
        });

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

    /**
     *
     * @param {Date[]} tickValues
     */
    render(tickValues) {

        this.group.element.textContent = "";

        tickValues.forEach(value => {
            value = new Date(value);
            const text = this.format(value);
            const label = this.renderer.text().value(text);

            label.setAttributes({
                x: this.domain.scale(value)
            });
            label.renderTo(this.group);
        });
    }

    resize(width, height, lineHeight) {
        this.renderer.svg.setAttributes({ width, height: height + lineHeight });
        this.group.setAttributes({
            "transform": `translate(0, ${height})`
        });
        this.domain.setRange([0, width]);
    }
}
