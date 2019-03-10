import Renderer from "./renderer";
import { numericScale } from "./domain";

class Handler {
    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer, changed) {
        this.renderer = renderer;
        this.handlerWidth = 6;
        this.element = renderer.createElement("rect").setAttributes({
            width: this.handlerWidth
        }).renderTo(renderer.svg);
        this.element.element.classList.add("handler");
        this.changed = changed;
        this.attachEvents();
    }

    attachEvents() {
        this.startEvent = null;
        this.element.element.addEventListener("pointerdown", (event) => {
            event.startValue = this.value();
            this.startEvent = event;
        });

        document.addEventListener("pointermove", (event) => {
            if (this.startEvent) {
                const offset = event.pageX - this.startEvent.pageX;
                this.value(this.startEvent.startValue + offset);
                this.changed();
            }
        });

        document.addEventListener("pointerup", () => {
            this.startEvent = null;
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
        } else if (x + this.handlerWidth / 2 >= this.width) {
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
        this.renderer = new Renderer(element);
        this.renderer.svg.element.classList.add("selector");
        this.background = this.renderer.createElement("rect").renderTo(this.renderer.svg);
        this.background.element.classList.add("background");

        this.r1 = this.renderer.createElement("rect").renderTo(this.renderer.svg);
        this.r1.element.classList.add("shutter");

        this.r2 = this.renderer.createElement("rect").renderTo(this.renderer.svg);
        this.r2.element.classList.add("shutter");

        this.r3 = this.renderer.path().renderTo(this.renderer.svg);
        this.r3.element.classList.add("handler");
        this.domain = [];

        this.changed = changed;


        this.handlerChanged = () => {
            this.drawRects();

            this.changed();
        };
        this.handlers = [new Handler(this.renderer, this.handlerChanged), new Handler(this.renderer, this.handlerChanged)];

        this.attachEvents();

    }

    attachEvents() {
        this.startEvent = null;
        this.background.element.addEventListener("pointerdown", (event) => {
            event.x1x2 = this.x1x2();
            this.startEvent = event;
        });

        document.addEventListener("pointermove", (event) => {
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
            }
        });

        document.addEventListener("pointerup", () => {
            this.startEvent = null;
        });
    }

    x1x2() {
        return this.handlers.map(h => h.value()).sort((a, b) => a - b);
    };

    drawRects() {
        const [x1, x2] = this.x1x2();


        this.r1.setAttributes({ width: x1 });
        this.r2.setAttributes({ x: x2, width: this.width - x2 });

        this.r3.setAttributes({
            d: `M${x1},0 L${x2},0 L${x2},2 L${x1},2 Z  M${x1},${this.height - 2} L${x2},${this.height - 2} L${x2},${this.height} L${x1},${this.height} Z`
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
            new Date(this.scale(x2 - this.width))
        ];
    }
}
