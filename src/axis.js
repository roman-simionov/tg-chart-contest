import Renderer from "./renderer";
import Domain from "./domain";
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"];

export class ArgumentAxis {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        this.renderer = new Renderer(element);
        this.renderer.svg.element.classList.add("axis", "horizontal");
        this.testLabel = this.renderer.text()
            .value("test")
            .renderTo(this.renderer.svg);
        this.testLabel.element.classList.add("test-label", "label");
        this.group = this.renderer.createElement("g").renderTo(this.renderer.svg);

        this.group.element.classList.add("label");
        this.domain = new Domain();
    }

    measure() {
        const { y, height } = this.testLabel.element.getBoundingClientRect();
        return { height: y, lineHeight: height };
    }

    setDomain(range) {
        this.domain.setDomain(range);
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
