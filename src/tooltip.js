import { SvgWrapper } from "./renderer";
import { MONTH } from "./axis";

const DAYS = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"];

class ForeignObject extends SvgWrapper {
    constructor() {
        super("g");
    }
    /**
     *
     * @param {Date} date
     */
    value(date, points, startWidth) {
        date = new Date(date);
        this.element.innerHTML = ` <foreignobject id="obj" x="0" y="0" width="${startWidth}">
            <body xmlns="http://www.w3.org/1999/xhtml">
              <div id="tooltip">
              <div class="date">${DAYS[date.getDay()]}, ${MONTH[date.getMonth()]} ${date.getDate()}</div>
                ${points.map(p => {
                    const options = p.series.options;
                    return `<div class="series-data" style="color:${options.color}">
                                <span class="value">${p.v}</span><br/>
                                <span class="name">${options.name}</span>
                            </div>`;
                }).join("")}
              </div>
           </body>
        </foreignobject>`;

        const object = this.element.querySelector("#obj");
        const div = this.element.querySelector("#tooltip");

        const { width, height } = div.getBoundingClientRect(true);

        this.width = width;
        object.setAttribute("width", width);
        object.setAttribute("height", height);
    }
}

export default class Tooltip {
    /**
     *
     * @param {Renderer} renderer
     * @param {SeriesView} seriesView
     */
    constructor(renderer, seriesView) {
        this.x = null;
        this.renderer = renderer;
        this.attachEvents(renderer.svg.element, seriesView);
    }

    render(x = 0) {
        const renderer = this.renderer;
        this.group = renderer.createElement("g").renderTo(renderer.svg).setAttributes({
            opacity: 0,
            "pointer-events": "none"
        });
        this.line = renderer.path()
            .addClass("tooltip-line")
            .setAttributes({ "transform": `translate(${x} 0)` })
            .value([[0, 0], [0, this.height]])
            .renderTo(this.group);

        this.tooltipGroup = renderer.createElement("g")
            .setAttributes({ "transform": `translate(${x} 0)` })
            .renderTo(this.group);

        this.tooltip = new ForeignObject().renderTo(this.tooltipGroup);
        this.hoverGroup = renderer.createElement("g")
            .addClass("hover-group")
            .renderTo(this.group);
    }
    /**
     *
     * @param {Element} element
     */
    attachEvents(element, seriesView) {
        ["pointermove", "touchstart", "touchmove"].forEach(eventName => {
            element.addEventListener(eventName, (event) => {
                const position = event.pageX - this.offset;
                if (!this.group) {
                    this.render(position);
                }
                const points = seriesView.getPoints(Math.round(position));
                if (points && points.length) {
                    let { x, a } = points[0];
                    if (x !== this.x) {
                        this.x = x;
                        this.group.animate("opacity", 1);
                        this.hoverGroup.element.textContent = "";
                        points.forEach(({ x, y, series }) => {
                            const circle = (new SvgWrapper("circle"))
                                .setAttributes({
                                    cx: x,
                                    cy: y,
                                    r: 6,
                                    stroke: series.options.color,
                                    opacity: 0
                                })
                                .renderTo(this.hoverGroup);
                            circle.animate("opacity", 1);
                        });
                        this.line.move(x, 0, { dur: "0.2s" });
                        this.tooltip.value(a, points, this.width / 2 - this.offset);
                        const tooltipX = x < (this.width - this.offset) / 2 ? x + 8 : x - this.tooltip.width - 8;
                        this.tooltipGroup.move(tooltipX, 0, { dur: "0.2s" });
                    }
                }
                event.stopPropagation();
            }, { passive: false });

            document.addEventListener(eventName, () => {
                if (this.x !== null && this.group) {
                    this.group.animate("opacity", 0);
                    this.x = null;
                }
            });
        });
    }

    resize(width, height, offset) {
        this.width = width;
        this.height = height;
        this.offset = offset;
    }
}
