import Renderer from "./renderer";
import { ArgumentAxis, ValueAxis } from "./axis";
import Selector from "./selector";

export default class Chart {
    /**
     *
     * @param {Element} element
     * @param {ChartOptions} options
     */
    constructor(element, options) {
        this.options = options;
        this.element = element;
        element.classList.add("chart");
        element.innerHTML = `<div class="title">${options.title}</div>`;

        this.renderer = new Renderer(element);

        this.argumentAxis = new ArgumentAxis(element);
        this.valueAxis = new ValueAxis(this.renderer);
        this.selector = new Selector(element, () => {
            this.render();
        });

        this.selector.setDomain([new Date(2019, 2, 1), new Date(2019, 2, 20)]);

        this.resize();
    }

    resize() {
        const { width } = this.element.getClientRects()[0];
        const argumentsAxisMeasure = this.argumentAxis.measure();

        if (width > 0) {
            const height = this.options.mainPlotHeight || 350;
            this.renderer.svg.setAttributes({ width, height });
            this.argumentAxis.resize(width, argumentsAxisMeasure.height, argumentsAxisMeasure.lineHeight);
            this.valueAxis.resize(width, height, argumentsAxisMeasure.height - argumentsAxisMeasure.lineHeight);
            this.selector.resize(width, this.options.selectorHeight || 75);
        }
        this.render();
    }

    render() {
        this.argumentAxis.setDomain(this.selector.value());
        this.valueAxis.setDomain([0, 100]);
        this.argumentAxis.render();
        this.valueAxis.render();
    }

    width() {
        return this.renderer.svg.getAttribute("width");
    }
}

/**
 * @typedef ChartOptions
 * @type {Object}
 *
 * @property {number} mainPlotHeight
 * @property {number} selectorHeight
 */
