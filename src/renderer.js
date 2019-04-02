function getComputedTransform(type, svgWrapper) {
    const matrix = getComputedStyle(svgWrapper.element).transform;
    if (matrix === "none") {
        return null;
    }
    const parse = matrix.split(/[,()\s]/).filter(v=>v !== "");
    return type === "translate" ? `${parse[5]} ${parse[6]}` : `${parse[1]} ${parse[4]}`;
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

    addClass(name) {
        this.element.classList.add(name);
        return this;
    }

    removeClass(name) {
        this.element.classList.remove(name);
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
        if (options.from) {
            this.setAttributes({ [animationField]: from });
        }

        const animation = new Animation((v) => {
            this.setAttributes({ [attributeName]: v });
        })
            .value(attributeName, from, value, options)
            .renderTo(this)
            .start();

        if (this[animationField]) {
            this[animationField].end();
            this[animationField].remove();
        }

        this[animationField] = animation;

        return this;
    }

    currentTransform(type, animation) {
        const calculatedValue = getComputedTransform(type, this);
        if (calculatedValue) {
            return calculatedValue;
        }
        if (animation) {
            return animation.value();
        }
        const transform = this.getAttribute("transform");
        if (transform) {
            const parse = transform.split(/[(,\s)]/).filter(v=>v !== "");
            if (parse[0] === type) {
                return `${parse[1]} ${parse[2]}`;
            }
        }
        return "1 1";
    }

    transform(type, x, y, options) {
        const animationField = `${type}Animation`;

        const from = this.currentTransform(type, this[animationField]);
        const to = `${x} ${y}`;
        const animation = new TransformAnimation((v) => {
            this.setAttributes({ "transform": `${type}(${v})` });
        })
            .value(type, from, to, options)
            .renderTo(this)
            .start();

        if (this[animationField]) {
            this[animationField].end();
            this[animationField].remove();
        }

        this[animationField] = animation;

        return this;
    }

    scale(x, y, options) {
        return this.transform("scale", x, y, options);
    }

    move(x, y, options) {
        return this.transform("translate", x, y, options);
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
    value(points) {
        this.element.setAttribute("d", `M${points.join("L")}`);
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

    attributeName() {
        return this.getAttribute("attributeName");
    }

    toValue() {
        return this.to;
    }

    start() {
        if (this.element.beginElement) {
            this.element.beginElement();
        } else {
            this.element.parentNode.setAttribute(this.attributeName(), this.toValue());
        }

        return this;
    }

    end() {
        try {
            this.element.endElement && this.element.endElement();
        } catch(e) {
            return this;
        }

        return this;
    }

    /**
     *
     * @param {string} attributeName
     * @param {Number} from
     * @param {Number} to
     * @param {*} options
     */
    value(attributeName, from, to, options = {}) {
        if (attributeName === undefined) {
            return this.calculateValue(parseFloat(this.from), parseFloat(this.to));
        }
        this.from = from;
        this.to = to;

        this.setAttributes(Object.assign({
            to,
            from,
            dur: "0.4s",
            attributeName,
            begin: "click",
            fill: "freeze"
        }, options));

        return this;
    }

    calculateValue(start, end) {
        const diff = end - start;
        const duration = parseFloat(this.getAttribute("dur"));

        let startTime;
        let time = duration;

        try {
            time = this.element.getCurrentTime() &&
            Math.min(this.element.getCurrentTime() - startTime, duration) ||
            duration;
            startTime = this.element.getStartTime();
        } catch (e) {
            time = duration;
        }

        return start + diff * Math.min(1, time / duration);
    }
}

class TransformAnimation extends Animation {
    constructor(onEnd) {
        super(onEnd, "animateTransform");
    }

    toValue() {
        return `${this.getAttribute("type")}(${this.to})`;
    }

    /**
     *
     * @param {string} type 'scale'|'translate'
     * @param {string} from 'x y'
     * @param {string} to 'x y'
     * @param {*} options
     */
    value(type, from, to, options = {}) {
        if (type === undefined) {
            const [xFrom, yFrom] = this.from.split(" ");
            const [xTo, yTo] = this.to.split(" ");
            const x = this.calculateValue(parseFloat(xFrom), parseFloat(xTo));
            const y = this.calculateValue(parseFloat(yFrom), parseFloat(yTo));
            return `${x} ${y}`;
        }

        return super.value("transform", from, to, Object.assign({ type }, options));
    }
 }
export default class Renderer {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        this.svg = new SvgWrapper("svg")
            .addClass("svg");
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
