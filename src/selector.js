import Renderer from "./renderer";
import { numericScale, dateScale } from "./domain";
import SeriesView from "./series-view";

const pointer_start = ["pointerdown", "touchstart"];
const pointer_move = ["pointermove", "touchmove"];
const pointer_up = ["pointerup", "touchend"];

class Handler {
    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer, changed) {
        this.renderer = renderer;
        this.handlerWidth = 8;
        this.element = renderer.createElement("rect")
            .addClass("handler")
            .setAttributes({
                width: this.handlerWidth
            }).renderTo(renderer.svg);
        this.changed = changed;
        this.attachEvents();
    }

    attachEvents() {
        this.startEvent = null;

        pointer_start.forEach(e => {
            this.element.element.addEventListener(e, (event) => {
                event.startValue = this.value();
                this.startEvent = event;
                event.preventDefault();
                return false;
            }, { passive: false });
        });

        pointer_move.forEach(e => {
            document.addEventListener(e, (event) => {
                if (this.startEvent) {
                    const offset = event.pageX - this.startEvent.pageX;
                    this.value(this.startEvent.startValue + offset);
                    this.changed();
                    event.preventDefault();
                    return false;
                }
            }, { passive: false });
        });

        pointer_up.forEach(e => {
            document.addEventListener(e, () => {
                this.startEvent = null;
            }, { passive: false });
        });
    }

    resize(width, height) {
        this.element.setAttributes({ height });
        this.width = width;
    }

    /**
     *
     * @param {number} v
     */
    value(x) {
        if (x === undefined) {
            return Number(this.element.element.getAttribute("x"));
        }
        if (x - this.handlerWidth / 2 < 0) {
            x = 0;
        } else if (x + this.handlerWidth >= this.width) {
            x = this.width - this.handlerWidth;
        }
        this.element.setAttributes({ x });
    }
}

export default class Selector {
    /**
     *
     * @param {Element} element
     */
    constructor(element, changed) {
        const renderer = this.renderer = new Renderer(element);
        const svg = renderer.svg.addClass("selector");

        this.seriesGroup = renderer.createElement("g")
            .addClass("series")
            .renderTo(svg);
        this.background = renderer.createElement("rect")
            .addClass("background")
            .renderTo(svg);

        this.r1 = renderer.createElement("rect")
            .addClass("shutter")
            .renderTo(svg);

        this.r2 = renderer
            .createElement("rect")
            .addClass("shutter")
            .renderTo(svg);

        this.r3 = renderer.path()
            .addClass("handler")
            .renderTo(svg);

        this.domain = [];

        this.changed = changed;

        this.handlerChanged = () => {
            this.drawRects();

            this.changed();
        };
        this.handlers = [new Handler(renderer, this.handlerChanged), new Handler(renderer, this.handlerChanged)];

        this.attachEvents();
    }

    attachEvents() {
        this.startEvent = null;

        pointer_start.forEach(e => {
            this.background.element.addEventListener(e, (event) => {
                event.x1x2 = this.x1x2();
                this.startEvent = event;
                event.stopPropagation();
            }, { passive: false });
        });

        pointer_move.forEach(e => {
            document.addEventListener(e, (event) => {
                if (this.startEvent) {
                    let offset = event.pageX - this.startEvent.pageX;
                    const [x1, x2] = this.startEvent.x1x2;
                    if (offset < 0) {
                        offset = x1 + offset < 0 ? 0 - x1 : offset;
                    }

                    if (offset > 0) {
                        offset = x2 + offset > this.width ? this.width - x2 : offset;
                    }

                    this.handlers[0].value(x1 + offset);
                    this.handlers[1].value(x2 + offset);
                    this.handlerChanged();
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            }, { passive: false });
        });

        pointer_up.forEach(e => {
            document.addEventListener(e, () => {
                this.startEvent = null;
            });
        }, { passive: false });
    }

    x1x2() {
        return this.handlers.map(h => h.value()).sort((a, b) => a - b);
    };

    drawRects() {
        const [x1, x2] = this.x1x2();


        this.r1.setAttributes({ width: x1 });
        this.r2.setAttributes({ x: x2, width: this.width - x2 });

        const handlerWidth = this.handlers[0].handlerWidth;
        this.r3.setAttributes({
            d: `M${x1 + handlerWidth},0 L${x2},0 L${x2},4 L${x1 + handlerWidth},4 Z  M${x1 + handlerWidth},${this.height - 4} L${x2},${this.height - 4} L${x2},${this.height} L${x1 + handlerWidth},${this.height} Z`
        });

    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.renderer.svg.setAttributes({ width, height });
        this.handlers.forEach(h => h.resize(width, height));
        this.handlers[0].value(0);
        this.handlers[1].value(this.width);
        this.background.setAttributes({ width, height });
        this.r1.setAttributes({
            height
        });
        this.r2.setAttributes({
            height
        });
        this.drawRects();
        this.updateScale();

        this.seriesView.resize(width, height);

        this.renderSeriesView();
    }

    setDomain(domain) {
        this.domain = domain.map(d => new Date(d).getTime());
        this.updateScale();
    }

    updateScale() {
        this.scale = numericScale([0, this.width], this.domain);
    }

    value() {
        const [x1, x2] = this.x1x2();

        return [
            new Date(this.scale(this.width - x1)),
            new Date(this.scale(this.width - x2))
        ];
    }

    renderSeriesView(animate) {
        const valueScale = numericScale(this.seriesView.getRange(), [0, this.height]);
        const argumentScale = dateScale(this.domain.map(d=>new Date(d)), [0, this.width]);
        this.seriesView.render(valueScale, argumentScale, animate);
        this.seriesView.setCommonScale(valueScale);
    }

    scaleSeries() {
        this.seriesView.transform();
    }

    setSeries(options) {
        this.seriesView = new SeriesView(this.seriesGroup, options);
     }
}
