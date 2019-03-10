import Renderer from "./renderer";
import { ArgumentAxis } from "./axis";

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

        this.resize();
    }

    resize() {
        const { width } = this.element.getClientRects()[0];
        const argumentsAxisMeasure = this.argumentAxis.measure();

        if (width > 0) {
            this.renderer.svg.setAttributes({ width, height: this.options.mainPlotHeight || 350 });
            this.argumentAxis.resize(width, argumentsAxisMeasure.height, argumentsAxisMeasure.lineHeight);
        }
        this.render();
    }

    render() {
        this.argumentAxis.setDomain([new Date(2019, 2, 1), new Date(2019, 2, 20)]);
        this.argumentAxis.render();
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
 */
