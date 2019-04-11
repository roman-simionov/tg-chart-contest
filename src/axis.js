import Renderer, { SvgWrapper } from "./renderer";
import Domain, { numericScale } from "./domain";

export const FULL_MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH = FULL_MONTH.map(m => m.slice(0, 3));

const MULTIPLIERS = [1, 2, 5, 10, 50, 100];

const math = Math;

export function getSynchronizer(t1, t2) {
    const scale = numericScale([t1[0], t1[t1.length - 1]], [t2[t1.length - 1], t2[0]]);
    return ticks => {
        return ticks.map(t => scale(t));
    };
}

export function createTicks([s1, s2], [d1, d2], externalCount) {
    const domainRange = d2 - d1;
    const screenRange = s2 - s1;

    const count = externalCount || math.ceil(screenRange / 70);
    const interval = domainRange / count;

    const factor = math.pow(10, math.floor(math.log10(interval)));
    let adjustedInterval = factor;

    let m = 0;

    while (adjustedInterval < interval) {
        adjustedInterval = factor * MULTIPLIERS[m++];
        if (m >= MULTIPLIERS.length) {
            break;
        }
    }

    const startTick = math.floor(d1 / adjustedInterval) * adjustedInterval;
    const adjustedCount = math.ceil(domainRange / adjustedInterval) + 1;

    const ticks = new Array(adjustedCount).fill(0).map((_, i) => startTick + adjustedInterval * i);

    if (ticks[ticks.length - 1] < d2) {
        ticks.push(ticks[ticks.length - 1] + adjustedInterval);
    }

    while (ticks.length < externalCount) {
        ticks.push(ticks[ticks.length - 1] + adjustedInterval);
    }

    return ticks;
}

export function createDateTicks([s1, s2], [d1, d2], firstDate) {
    const domainRange = d2 - d1;
    const screenRange = s2 - s1;

    const count = math.ceil(screenRange / 150);
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
        this.gridGroup = this.renderer
            .createElement("g")
            .addClass("grid")
            .renderTo(this.renderer.svg);
    }

    labelX() {
        return 0;
    }

    /**
     *
     * @param {Number[]} tickValues
     */
    render(tickValues) {
        const ticks = this.ticks || [];

        if (this.min === tickValues[0] && this.max === tickValues[tickValues.length - 1]) {
            return;
        }

        this.min = tickValues[0];
        this.max = tickValues[tickValues.length - 1];

        this.ticks = tickValues.map((value, index) => {

            const y = this.domain.scale(value);

            const tick = ticks.find(t => !t.removing && t.value.valueOf() === value.valueOf());

            let tickObject;

            if (tick) {
                tick.updated = true;
                tick.label.animate("y", y);
                tick.grid
                    .animate("y1", y)
                    .animate("y2", y);

                tickObject = {
                    value,
                    label: tick.label,
                    grid: tick.grid
                };
            } else {
                const label = this.renderer.text()
                    .setAttributes({
                        y,
                        x: this.labelX()
                    })
                    .value(value)
                    .renderTo(this.group);

                const grid = new SvgWrapper("line").setAttributes({
                    x1: 0,
                    x2: this.width,
                    y1: y,
                    y2: y
                }).renderTo(this.gridGroup);

                if (ticks.length && this.oldScale) {
                    const from = this.oldScale(value);
                    label
                        .animate("y", y, { from })
                        .animate("opacity", 1, { from: "0" });
                    grid
                        .animate("y1", y, { from })
                        .animate("y2", y, { from })
                        .animate("opacity", 1, { from: "0" });
                }

                tickObject = {
                    value,
                    label,
                    grid
                };
            }

            if (index === 0) {
                tickObject.grid
                    .addClass("first");
            } else {
                tickObject.grid
                    .removeClass("first");
            }

            return tickObject;
        });

        ticks.forEach(t => {
            if (!t.updated) {
                const y = this.domain.scale(t.value);
                t.grid
                    .animate("y1", y)
                    .animate("y2", y);

                t.label
                    .animate("y", y);

                if (!t.removing) {
                    t.label.animate("opacity", 0);
                    t.grid.animate("opacity", 0);
                    t.removing = true;
                }

                this.ticks.push(t);
            }
        });

        this.ticks = this.ticks.filter(t => {
            if (t.removing && t.label.getAttribute("opacity") === "0") {
                t.label.remove();
                t.grid.remove();
                return false;
            }
            return true;
        });

        this.oldScale = this.domain.scale;
    }

    resize(width, height, lineHeight) {
        this.width = width;
        this.group.setAttributes({
            "transform": `translate(0, ${-lineHeight})`
        });
        this.domain.setRange([0, height]);

        (this.ticks || []).forEach(t => {
            t.grid.setAttributes({ x1: 0, x2: width });
            t.label.setAttributes({ x: this.labelX() });
        });

        this.min = null;
        this.max = null;
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
        this.renderer.svg.addClass("axis");
        this.testLabel = this.renderer.text()
            .addClass("test-label", "label")
            .value("test")
            .renderTo(this.renderer.svg);
    }

    measure() {
        const { y, height } = this.testLabel.element.getBBox();
        return { height: height, lineHeight: height + y };
    }
    /**
     *
     * @param {Date[]} tickValues
     */
    render(tickValues) {
        const ticks = this.ticks || [];

        this.ticks = tickValues.map((value, index) => {
            value = new Date(value);
            const x = this.domain.scale(value);

            const tick = ticks.find(t => !t.removing && t.value.valueOf() === value.valueOf());

            if (tick) {
                tick.updated = true;

                return {
                    value: tick.value,
                    label: tick.label.setAttributes({ x })
                };
            }

            const label = this.renderer.text()
                .setAttributes({ x })
                .value(`${MONTH[value.getMonth()]} ${value.getDate()}`)
                .renderTo(this.group);

            if (ticks.length && (index !== 0 && index !== tickValues.length - 1)) {
                label.animate("opacity", 1, { from: "0", dur: "0.2s" });
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
                    t.label.animate("opacity", 0, { dur: "0.2s" });
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


export class RightValueAxis extends ValueAxis {
    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        super(renderer);
        this.group.addClass("right-axis");
        this.gridGroup.remove();
    }

    labelX() {
        return this.width;
    }
}
