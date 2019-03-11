import { SvgWrapper } from "./renderer";

import { MONTH } from "./axis";

const DAYS = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"];


class ForeignObject extends SvgWrapper {
    constructor() {
        super("g");
        this.timeout = null;
    }

    /**
     *
     * @param {Date} date
     */
    value(date) {
        date = new Date(date);
        this.element.innerHTML = ` <foreignobject id="obj" x="0" y="0" width="300">
            <body xmlns="http://www.w3.org/1999/xhtml">
              <div id="tooltip">
              <div>${DAYS[date.getDay()]}, ${MONTH[date.getMonth()]} ${date.getDate()}</div>
              <div>${10}</div>
              </div>
           </body>
        </foreignobject>`;

        const object = this.element.querySelector("#obj");
        const div = this.element.querySelector("#tooltip");

        const { width, height } = div.getBoundingClientRect();

        this.width = width;
        object.setAttribute("width", width);
        object.setAttribute("height", height);

    }
}

export default class Tooltip {
    /**
     *
     * @param {Element} container
     * @param {Renderer} renderer
     */
    constructor(container, renderer) {
        this.group = renderer.createElement("g").renderTo(renderer.svg).setAttributes({ opacity: 0 });
        this.line = renderer.path().renderTo(this.group);
        this.line.element.classList.add("tooltip-line");
        this.tooltip = new ForeignObject().renderTo(this.group);

        this.attachEvents(renderer.svg.element);
    }

    /**
     *
     * @param {Element} element
     */
    attachEvents(element) {

        ["pointermove", "touchstart"].forEach(eventName => {
            element.addEventListener(eventName, (event) => {
                const x = event.pageX - this.offset;
                this.group.animate("opacity", 1);
                this.line.move(x, 0);
                this.tooltip.value(x);
                const tooltipX = x < (this.width - this.offset) / 2 ? x + 8 : x - this.tooltip.width - 8;
                this.tooltip.move(tooltipX, 0);
                event.stopPropagation();
            });

            document.addEventListener(eventName, () => {
                this.group.animate("opacity", 0);
            });
        });

    }

    resize(width, height, offset) {
        this.width = width;
        this.height = height;
        this.offset = offset;

        this.line.value([[0, 0], [0, height]]);
    }
}
