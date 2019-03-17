import Renderer from "./renderer";
import { ArgumentAxis, ValueAxis, createTicks, createDateTicks } from "./axis";
import Selector from "./selector";
import SeriesView from "./series-view";
import Legend from "./legend";
import Tooltip from "./tooltip";

export default class Chart {
    /**
     *
     * @param {Element} container
     * @param {ChartOptions} options
     */
    constructor(container, options) {
        this.options = options;

        this.container = container;

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
            this.renderAxis();
            this.seriesView.transform(this.argumentAxis.domain.domain, this.valueAxis.domain.domain);
        });

        const x = this.options.x;
        this.selector.setDomain([x[0], x[x.length - 1]]);
        this.selector.setSeries(this.options.series);

        const seriesGroup = this.renderer
            .createElement("g")
            .addClass("series")
            .renderTo(this.renderer.svg);

        this.seriesView = new SeriesView(seriesGroup, this.options.series, this.argumentAxis, this.valueAxis);

        this.legend = new Legend(this.element, options.series, () => {
            this.renderAxis();
            this.seriesView.transform(this.argumentAxis.domain.domain, this.valueAxis.domain.domain);
            this.selector.scaleSeries();
        });

        this.tooltip = new Tooltip(this.renderer, this.seriesView);


        new Promise(r => r()).then(() => {
            this.resize();
        });
    }

    resize() {
        const { x } = this.element.getBoundingClientRect();
        const { width, height } = this.container.getBoundingClientRect();
        const argumentsAxisMeasure = this.argumentAxis.measure();

        new Promise(r => r()).then(() => {
            if (width > 0) {
                const selectorHeight = this.options.selectorHeight || 115;
                const mainPlotHeight = (height && height - selectorHeight) || this.options.mainPlotHeight || 965;
                this.renderer.svg.setAttributes({ width, height: mainPlotHeight });
                this.argumentAxis.resize(width, argumentsAxisMeasure.height, argumentsAxisMeasure.lineHeight);
                this.valueAxis.resize(width, mainPlotHeight, argumentsAxisMeasure.lineHeight);
                this.selector.resize(width, selectorHeight);
                this.tooltip.resize(width, mainPlotHeight, x);
                this.seriesView.resize(width, mainPlotHeight);
                this.renderAxis();
                this.renderSeries();
            }
        });

    }

    renderSeries() {
        const valueScale = this.valueAxis.domain.scale;
        const argumentScale = this.argumentAxis.domain.scale;
        this.seriesView.render(valueScale, argumentScale);
        this.seriesView.setCommonScale(valueScale, argumentScale);
    }

    renderAxis() {
        const argumentTicks = createDateTicks(this.argumentAxis.domain.range, this.selector.value(), this.selector.domain[0]);
        this.argumentAxis.setDomain(this.selector.value());
        const valueDomain = this.seriesView.getRange(this.selector.value());
        const valueDomainSize = valueDomain[1] - valueDomain[0];
        if (isFinite(valueDomainSize) && valueDomainSize > 0) {
            const valueTicks = createTicks(this.valueAxis.domain.range, valueDomain);
            this.valueAxis.setDomain([valueTicks[0], valueTicks[valueTicks.length - 1]]);
            this.valueAxis.render(valueTicks);
        }

        this.argumentAxis.render(argumentTicks);
    }
}

/**
 * @typedef ChartOptions
 * @type {Object}
 *
 * @property {number} mainPlotHeight
 * @property {number} selectorHeight
 */
