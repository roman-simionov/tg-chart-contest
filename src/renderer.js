
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
        return this;
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
            dur: "0.8s",
            attributeName,
            begin: "click",
            fill: "freeze"
        });

        animation.renderTo(this);
        animation.element.beginElement();
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
