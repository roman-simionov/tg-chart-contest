const ANIMATION_DURATION = "0.2s";

function getScale(svgWrapper) {
    const matrix = getComputedStyle(svgWrapper.element).transform;

    if (matrix === "none") {
        return "1 1";
    }

    const parse = matrix.split(/[,()]/);
    return `${parse[1]} ${parse[4]}`;
}

function getTransform(svgWrapper) {
    const matrix = getComputedStyle(svgWrapper.element).transform;
    if (matrix === "nome") {
        return "0 0";
    }
    const parse = matrix.split(/[,()]/);
    return `${parse[5]} ${parse[6]}`;
}

export class SvgWrapper {
    /**
     *
     * @param {string} tagName
     */
    constructor(tagName) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    }

    setAttributes(attributes) {
        Object.keys(attributes).forEach(k => {
            const value = attributes[k];
            this.element.setAttribute(k, value);
        });
        return this;
    }

    /**
     *
     * @param {string} name
     */
    getAttribute(name) {
        return this.element.getAttribute(name);
    }

    setCss(styleSheet) {
        Object.keys(styleSheet).forEach(k => {
            const value = styleSheet[k];
            this.element.setAttribute(k, value);
        });
        return this;
    }

    /**
     *
     * @param {SvgWrapper} svgWrapper
     */
    append(svgWrapper) {
        this.element.appendChild(svgWrapper.element);
    }

    /**
     *
     * @param {SvgWrapper} svgWrapper
     */
    renderTo(svgWrapper) {
        svgWrapper.element.appendChild(this.element);
        return this;
    }

    remove() {
        const parent = this.element.parentNode;
        if (parent) {
            parent.removeChild(this.element);
        }
    }

    animate(attributeName, value, options = {}) {
        const animationField = `${attributeName}`;
        const from = options.from || this[animationField] && this[animationField].value() ||
            this.getAttribute(attributeName) ||
            getComputedStyle(this.element)[animationField];

        if (parseFloat(from) === value) {
            return this;
        }

        const animation = new Animation((v) => {
            this.setAttributes({ [attributeName]: v });
        })
            .value(attributeName, from, value, options)
            .renderTo(this)
            .start();

        animation.renderTo(this);
        animation.start();

        if (this[animationField]) {
            this[animationField].end();
            this[animationField].remove();
        }

        this[animationField] = animation;

        return this;
    }

    move(x, y, options) {
        const from = getTransform(this);
        this.setAttributes({ from: `translate(${from})` });
        const animation = new Animation(() => {
            this.setAttributes({ transform: `translate(${getTransform(this)})` });
        }, "animateTransform")
            .setAttributes(Object.assign({
                type: "translate",
                attributeName: "transform",
                from,
                to: `${x} ${y}`,
                dur: ANIMATION_DURATION,
                begin: "click",
                fill: "freeze"
            }, options));

        animation.renderTo(this);
        animation.start();

        if (this.moveAnimation) {
            this.moveAnimation.end();
            this.moveAnimation.remove();
        }
        this.moveAnimation = animation;
    }

    scale(x, y) {
        const animation = new Animation(() => {
            this.setAttributes({ transform: `scale(${getScale(this)})` });
        }, "animateTransform")
            .setAttributes({
                type: "scale",
                attributeName: "transform",
                from: getScale(this),
                to: `${x} ${y}`,
                dur: ANIMATION_DURATION,
                begin: "click",
                fill: "freeze"
            });
        animation.renderTo(this);
        animation.start();

        if (this.scaleAnimation) {
            this.scaleAnimation.remove();
        }

        this.scaleAnimation = animation;

    }
}

export class TextElement extends SvgWrapper {
    constructor() {
        super("text");
    }
    /**
     *
     * @param {string} text
     */
    value(text) {
        this.element.textContent = text;
        return this;
    }
}

export class Path extends SvgWrapper {
    constructor() {
        super("path");
    }
    /**
     *
     * @param {Array<number>} points
     */
    value(points, animate) {
        const d = `M${points.join("L")}`;
        if (!animate) {
            this.setAttributes({ d });
        } else {
            this.animate("d", d);
        }

        return this;
    }
}

class Animation extends SvgWrapper {
    constructor(onEnd, tagName) {
        super(tagName || "animate");
        this.element.addEventListener("endEvent", () => {
            onEnd && onEnd(this.value());
            this.remove();
        });
    }

    start() {
        this.element.beginElement();
        return this;
    }

    end() {
        this.element.endElement();
        return this;
    }

    value(attributeName, from, to, options = {}) {
        if (attributeName === undefined) {
            return this.calculateValue(this.from, this.to);
        }
        this.from = parseFloat(from);
        this.to = parseFloat(to);

        this.setAttributes(Object.assign({
            to,
            from,
            dur: ANIMATION_DURATION,
            attributeName,
            begin: "click",
            fill: "freeze"
        }, options));

        return this;
    }

    calculateValue(start, end) {
        const diff = end - start;
        const duration = parseFloat(this.getAttribute("dur"));
        const time = this.element.getCurrentTime() &&
            Math.min(this.element.getCurrentTime() - this.element.getStartTime(), duration) ||
            duration;
        return start + diff * Math.min(1, time / duration);
    }
}
export default class Renderer {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        this.svg = new SvgWrapper("svg");
        this.svg.element.classList.add("svg");
        element.appendChild(this.svg.element);
    }

    text() {
        return new TextElement();
    }

    path() {
        return new Path();
    }

    createElement(tagName) {
        return new SvgWrapper(tagName);
    }

};
