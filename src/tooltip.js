import { SvgWrapper } from "./renderer";
import { MONTH } from "./axis";

const DAYS = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"];

import { pointerStart, pointerMove, getPageX } from "./events";

class ForeignObject extends SvgWrapper {
    constructor() {
        super("g");
    }
    /**
     *
     * @param {Date} date
     */
    value(date, points, containerWidth, containerHeight) {
        date = new Date(date);
        this.element.innerHTML = ` <foreignobject id="obj" x="0" y="0" width="${containerWidth}" height="${containerHeight}">
            <body xmlns="http://www.w3.org/1999/xhtml">
              <div id="tooltip">
                <div class="column">
                    <div class="accent">${DAYS[date.getDay()]}, ${MONTH[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}</div>
                    
                    ${points.map(p => {
                        const options = p.series.options;
                        return `<div >${options.name}</div>`;
                    }).join("")}
                    

                </div>
                <div class="right column accent">
                    <div>&gt;</div>
                    
                    ${points.map(p => {
                        const options = p.series.options;
                        return `<div style="color: ${options.color}">${p.v}</div>`;
                    }).join("")}

                </div>
            </div>
           </body>
        </foreignobject>`;

        const div = this.element.querySelector("#tooltip");

        const { width } = div.getBoundingClientRect(true);

        this.width = width;
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
            opacity: 0
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
        let timeout = null;

        const pointerStartHandler = (event) => {
            if (event.target.closest(".svg") !== element) {
                if (this.x !== null && this.group) {
                    clearTimeout(timeout);
                    this.group.animate("opacity", 0);
                    seriesView.clearHover();
                    this.x = null;
                }
                return;
            }
            const position = getPageX(event) - this.offset;
            if (!this.group) {
                this.render(position);
            }
            const points = seriesView.getPoints(Math.round(position));
            if (points && points.length) {
                let { x, a } = points[0];
                if (x !== this.x) {
                    this.x = x;
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.group.animate("opacity", 1);
                        this.hoverGroup.element.textContent = "";
                        seriesView.clearHover();

                        points.forEach(({ x, y, series, index, }) => {
                            const circle = (new SvgWrapper("circle"))
                                .setAttributes({
                                    cx: x,
                                    cy: y,
                                    r: 10,
                                    stroke: series.options.color,
                                    opacity: 0
                                })
                                .renderTo(this.hoverGroup);
                            series.hover(index);
                            circle.animate("opacity", 1);
                        });
                        this.line.move(x, 0);
                        this.tooltip.value(a, points, this.width, this.height);
                        let tooltipX = x < (this.width - this.offset) / 2 ? x + 18 : x - this.tooltip.width - 18;
                        if (tooltipX < 0) {
                            tooltipX = 0;
                        }
                        if (tooltipX + this.tooltip.width > this.width - 10) {
                            tooltipX = this.width - this.tooltip.width - 10;
                        }
                        this.tooltipGroup.move(tooltipX, 0);
                    }, 50);
                }
            }
            event.stopPropagation();
        };

        pointerStart.push(pointerStartHandler);
        pointerMove.push(pointerStartHandler);
    }

    resize(width, height, offset) {
        this.width = width;
        this.height = height;
        this.offset = offset;
        if (this.line) {
            this.line.value([[0, 0], [0, this.height]]);
        }
    }
}
