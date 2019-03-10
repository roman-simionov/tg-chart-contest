import Renderer from "./renderer";

class Handler {
    /**
     *
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.handlerWidth = 6;
        this.element = renderer.createElement("rect").setAttributes({
            width: this.handlerWidth
        }).renderTo(renderer.svg);
        this.element.element.classList.add("handler");
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
        } else if (x + this.handlerWidth / 2 > this.width) {
            x = this.width - this.handlerWidth * 2;
        }
        this.element.setAttributes({ x });
    }
}

export default class Selector {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        this.renderer = new Renderer(element);
        this.renderer.svg.element.classList.add("selector");
        this.r1 = this.renderer.createElement("rect").renderTo(this.renderer.svg);
        this.r1.element.classList.add("shutter");

        this.r2 = this.renderer.createElement("rect").renderTo(this.renderer.svg);
        this.r2.element.classList.add("shutter");

        this.r3 = this.renderer.path().renderTo(this.renderer.svg);
        this.r3.element.classList.add("handler");


        this.handlers = [new Handler(this.renderer), new Handler(this.renderer)];

    }

    drawRects() {
        const [x1, x2] = this.handlers.map(h => h.value()).sort((a, b) => a - b);


        this.r1.setAttributes({ width: x1 });
        this.r2.setAttributes({ x: x2, width: this.width - x2 });

        this.r3.setAttributes({
            d: `M${x1},0 L${x2},0 L${x2},2 L${x1},2 Z  M${x1},${this.height - 2} L${x2},${this.height - 2} L${x2},${this.height} L${x1},${this.height} Z`
        });

    }

    resize(width, height) {
        this.renderer.svg.setAttributes({ width, height });
        this.handlers.forEach(h => h.resize(width, height));
        this.handlers[0].value(125);
        this.handlers[1].value(width - 400);
        this.width = width;
        this.height = height;
        this.r1.setAttributes({
            height
        });
        this.r2.setAttributes({
            height
        });
        this.drawRects();
    }
}
