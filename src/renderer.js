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

        const animation = new Animation(() => {
             this.setAttributes({ [attributeName]: getComputedStyle(this.element)[animationField] });
        }).setAttributes(Object.assign({
            to: value,
            from: getComputedStyle(this.element)[animationField],
            dur: ANIMATION_DURATION,
            attributeName,
            begin: "click",
            fill: "freeze"
        }, options));

        animation.renderTo(this);
        animation.start();

        if (this[animationField]) {
            this[animationField].remove();
        }

        this[animationField] = animation;
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
        this.element.addEventListener("endEvent", (e) => {
            onEnd && onEnd(e);
            this.remove();
        });
    }

    start() {
        this.element.beginElement();
    }

    end() {
        this.element.endElement();
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
