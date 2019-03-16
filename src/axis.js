import Renderer from "./renderer";
import Domain from "./domain";

export const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MULTIPLIERS = [1, 2, 5, 10];
const LABEL_ANIMATION_SETTINGS = { dur: "0.2s" };

const math = Math;

export function createTicks([s1, s2], [d1, d2]) {
    const domainRange = d2 - d1;
    const screenRange = s2 - s1;

    const count = math.ceil(screenRange / 30);
    const interval = domainRange / count;

    const factor = math.pow(10, math.floor(math.log10(interval)));
    let adjustedInterval = factor;

    let m = 0;

    while (adjustedInterval < interval) {
        adjustedInterval = factor * MULTIPLIERS[m++];
        if (m > MULTIPLIERS.length) {
            break;
        }
    }

    const startTick = math.floor(d1 / adjustedInterval) * adjustedInterval;

    return new Array(math.ceil(domainRange / adjustedInterval) + 1).fill(0).map((_, i) => startTick + adjustedInterval * i);
}

export function createDateTicks([s1, s2], [d1, d2], firstDate) {
    const domainRange = d2 - d1;
    const screenRange = s2 - s1;

    const count = math.ceil(screenRange / 55);
    const interval = domainRange / count;

    let adjustedInterval = 1000 * 60 * 60 * 24;

    let days = 1;
    while (adjustedInterval < interval) {
        adjustedInterval *= 2;
    }

    days = math.ceil(adjustedInterval / (1000 * 60 * 60 * 24));

    firstDate = new Date(firstDate);
    firstDate.setHours(0);
    firstDate.setMinutes(0);
    firstDate.setSeconds(0);

    const startTick = new Date(firstDate.getTime() + math.floor((d1 - firstDate) / adjustedInterval) * adjustedInterval);

    return new Array(math.ceil(domainRange / adjustedInterval) + 1)
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
            y = math.round(y);
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
        const ticks = this.ticks || [];

        this.ticks = tickValues.map((value, index) => {
            value = new Date(value);
            const text = this.format(value);
            const x = this.domain.scale(value);

            const tick = ticks.find(t => !t.removing && t.value.valueOf() === value.valueOf());

            if (tick) {
                tick.updated = true;

                return {
                    value: tick.value,
                    label: tick.label.setAttributes({ x })
                };
            }

            const label = this.renderer.text().value(text);

            label.setAttributes({ x });
            label.renderTo(this.group);
            if (ticks.length && index !== 0) {
                label.setAttributes({ opacity: 0 });
                label.animate("opacity", 1, LABEL_ANIMATION_SETTINGS);
            }

            return {
                value,
                label
            };
        });

        ticks.forEach(t => {
            if (!t.updated) {
                t.label
                    .setAttributes({ x: this.domain.scale(t.value) });
                if (!t.removing) {
                    t.label.animate("opacity", 0, LABEL_ANIMATION_SETTINGS);
                    t.removing = true;
                }

                this.ticks.push(t);
            }
        });

        this.ticks = this.ticks.filter(t => {
            if (t.removing && t.label.getAttribute("opacity") === "0") {
                t.label.remove();
                return false;
            }
            return true;
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
