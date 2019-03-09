
class SvgWrapper {
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
    }

    remove() {
        const parent = this.element.parentNode;
        if (parent) {
            parent.removeChild(this.element);
        }
    }

    animate(attributeName, value) {
        const animation = new Animation(() => {
            this.setAttributes({ [attributeName]: value });
        }).setAttributes({
            to: value,
            dur: "1s",
            attributeName,
            begin: "click",
            fill: "freeze"
        });

        animation.renderTo(this);
        animation.element.beginElement();
    }
}

class TextElement extends SvgWrapper {
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

class Path extends SvgWrapper {
    constructor() {
        super("path");
    }

    /**
     *
     * @param {Array<number>} points
     */
    value(points, animate) {
        const d = `M ${points.join(" L ")}`;
        if (!animate) {
            this.setAttributes({ d });
        } else {
            this.animate("d", d);
        }

        return this;
    }
}

class Animation extends SvgWrapper {
    constructor(onEnd) {
        super("animate");
        this.element.onend = (e) => {
            onEnd && onEnd(e);
            this.remove();
        };
    }
}
export default class Renderer {
    /**
     *
     * @param {Element} element
     */
    constructor(element) {
        element.classList.add("chart");
        this.svg = new SvgWrapper("svg").setAttributes({
            fill: "black",
            stroke: "black"
        });
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
