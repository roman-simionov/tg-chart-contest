import Renderer from "./renderer";
import Domain from "./domain";
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"];

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
        const { y, height } = this.testLabel.element.getBoundingClientRect();
        return { height: y, lineHeight: height };
    }

    /**
     *
     * @param {Date} value
     */
    format(value) {
        return `${MONTH[value.getMonth()]} ${value.getDate()}`;
    }

    render() {
        for (let i = this.domain.domain[0].getTime(); i < this.domain.domain[1].getTime(); i += 1000 * 60 * 60 * 24) {
            const text = this.format(new Date(i));
            const label = this.renderer.text().value(text);

            label.setAttributes({
                x: this.domain.scale(i)
            });
            label.renderTo(this.group);
        }
    }

    resize(width, height, lineHeight) {
        this.renderer.svg.setAttributes({ width, height });
        this.group.setAttributes({
            "transform": `translate(0, ${lineHeight})`
        });
        this.domain.setRange([0, width]);
    }
}
