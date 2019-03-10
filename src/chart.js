import Renderer from "./renderer";
import { ArgumentAxis, ValueAxis } from "./axis";
import Selector from "./selector";
import SeriesView from "./series-view";

export default class Chart {
    /**
     *
     * @param {Element} container
     * @param {ChartOptions} options
     */
    constructor(container, options) {
        this.options = options;

        this.element = document.createElement("div");
        container.appendChild(this.element);
        this.element.classList.add("chart");


        if (options.title) {
            this.element.innerHTML = `<div class="title">${options.title}</div>`;
        }

        this.renderer = new Renderer(this.element);

        this.argumentAxis = new ArgumentAxis(this.element);
        this.valueAxis = new ValueAxis(this.renderer);
        this.selector = new Selector(this.element, () => {
            this.render();
        });

        const x = this.options.x;
        this.selector.setDomain([x[0], x[x.length - 1]]);
        this.selector.setSeries(this.options.series);

        const seriesGroup = this.renderer.createElement("g").renderTo(this.renderer.svg);
        seriesGroup.element.classList.add("series");

        this.seriesView = new SeriesView(seriesGroup, this.options.series);

        this.resize();
    }

    resize() {
        const { width } = this.element.getBoundingClientRect();
        const argumentsAxisMeasure = this.argumentAxis.measure();

        if (width > 0) {
            const height = this.options.mainPlotHeight || 350;
            this.renderer.svg.setAttributes({ width, height });
            this.argumentAxis.resize(width, argumentsAxisMeasure.height, argumentsAxisMeasure.lineHeight);
            this.valueAxis.resize(width, height, argumentsAxisMeasure.lineHeight);
            this.selector.resize(width, this.options.selectorHeight || 75);
        }
        this.render();
    }

    render() {
        this.argumentAxis.setDomain(this.selector.value());
        const valueDomain = [0, this.seriesView.getRange(this.selector.value())];

        this.valueAxis.setDomain(valueDomain);
        this.argumentAxis.render();
        this.valueAxis.render();

        this.seriesView.render(this.valueAxis.domain.scale, this.argumentAxis.domain.scale);
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
