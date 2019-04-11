import Renderer from "./renderer";
import { ArgumentAxis, ValueAxis, createTicks, createDateTicks, RightValueAxis, FULL_MONTH, getSynchronizer } from "./axis";
import Selector from "./selector";
import SeriesView from "./series-view";
import Legend from "./legend";
import Tooltip from "./tooltip";

/**
 *
 * @param {Date} date
 */
function formatDateValue(date) {
    date = new Date(date);
    return `${date.getDate()} ${FULL_MONTH[date.getMonth()]} ${date.getFullYear()}`;
}

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
            this.element.innerHTML = `
                <span class="title">${options.title}</span>
                <span class="selected-range"></span>
            `;

            this.selectedRangeText = this.element.querySelector(".selected-range");
        }

        this.renderer = new Renderer(this.element);

        this.argumentAxis = new ArgumentAxis(this.element);
        this.valueAxis = new ValueAxis(this.renderer);
        this.rightAxis = new RightValueAxis(this.renderer);
        this.selector = new Selector(this.element, () => {
            this.renderAxis();
            this.seriesView.forEach(seriesView => seriesView.transform(seriesView.argumentAxis.domain.domain, seriesView.valueAxis.domain.domain));
        });

        const x = this.options.x;
        this.selector.setDomain([x[0], x[x.length - 1]]);

        const seriesOptions = [
            options.series.filter((_, i) => !options.y_scaled || i % 2 === 0),
            options.series.filter((_, i) => options.y_scaled && i % 2 === 1)
        ];

        this.selector.setSeries(seriesOptions);

        this.seriesView = seriesOptions.map((options, index) => {
            const seriesGroup = this.renderer
                .createElement("g")
                .addClass("series")
                .renderTo(this.renderer.svg);
            return new SeriesView(seriesGroup, options, this.argumentAxis, index % 2 === 0 ? this.valueAxis : this.rightAxis);
        });

        this.legend = new Legend(this.element, options.series, () => {
            this.renderAxis();
            this.seriesView.forEach(seriesView => {
                seriesView.transform(seriesView.argumentAxis.domain.domain, seriesView.valueAxis.domain.domain)
                .applyVisibility();
            });

            this.selector.scaleSeries();
        });

        this.tooltip = new Tooltip(this.renderer, this.seriesView);


        new Promise(r => r()).then(() => {
            this.resize();
        });
    }

    resize() {
        const { x, left, width, height } = this.element.getBoundingClientRect();
        const argumentsAxisMeasure = this.argumentAxis.measure();
        const legendHeight = this.legend.div.getBoundingClientRect().height;

        new Promise(r => r()).then(() => {
            if (width > 0) {
                const selectorHeight = this.options.selectorHeight || 115;
                let mainPlotHeight = (height && height - selectorHeight - legendHeight - argumentsAxisMeasure.height - argumentsAxisMeasure.lineHeight - 30) || this.options.mainPlotHeight || 965;
                if (mainPlotHeight < 10) {
                    mainPlotHeight = 10;
                }
                this.renderer.svg.setAttributes({ width, height: mainPlotHeight });
                this.argumentAxis.resize(width, argumentsAxisMeasure.height, argumentsAxisMeasure.lineHeight);
                this.valueAxis.resize(width, mainPlotHeight, argumentsAxisMeasure.lineHeight);
                this.rightAxis.resize(width, mainPlotHeight, argumentsAxisMeasure.lineHeight);
                this.selector.resize(width, selectorHeight);
                this.tooltip.resize(width, mainPlotHeight, x || left || 0);
                this.seriesView.forEach(s => s.resize(width, mainPlotHeight));
                this.renderAxis();
                this.renderSeries();
            }
        });
    }

    renderSeries() {
        const argumentScale = this.argumentAxis.domain.scale;
        this.seriesView.forEach(seriesView => {
            const valueScale = seriesView.valueAxis.domain.scale;
            seriesView.render(valueScale, argumentScale);
            seriesView.setCommonScale(valueScale, argumentScale);
        });

    }

    renderAxis() {
        const argumentDomain = this.selector.value();
        if (Math.abs(argumentDomain[1] - argumentDomain[0]) <= 0) {
            return;
        }
        this.argumentAxis.setDomain(argumentDomain);

        if (this.selectedRangeText) {
            this.selectedRangeText.innerHTML = `${formatDateValue(argumentDomain[0])} - ${formatDateValue(argumentDomain[1])}`;
        }

        let valueTicks = [];
        this.seriesView.forEach(seriesView => {
            const valueAxis = seriesView.valueAxis;
            const valueDomain = seriesView.getRange(argumentDomain);
            const valueDomainSize = valueDomain[1] - valueDomain[0];

            if (isFinite(valueDomainSize) && Math.abs(valueDomainSize) > 0) {
                let ticks;

                if (valueTicks.length > 0 && valueAxis.synchronizer) {
                    ticks = valueAxis.synchronizer(valueTicks);
                } else if (valueTicks.length > 0) {
                    ticks = createTicks(valueAxis.domain.range, valueDomain, valueTicks.length);
                    valueAxis.synchronizer = getSynchronizer(valueTicks, ticks);
                } else {
                    ticks = createTicks(valueAxis.domain.range, valueDomain, valueTicks.length);
                }

                valueAxis.setDomain([ticks[0], ticks[ticks.length - 1]]);
                valueAxis.render(ticks);
                valueTicks = ticks;

            }

        });

        this.argumentAxis.render(createDateTicks(this.argumentAxis.domain.range, argumentDomain, this.selector.domain[0]));
    }
}

/**
 * @typedef ChartOptions
 * @type {Object}
 *
 * @property {number} mainPlotHeight
 * @property {number} selectorHeight
 */
