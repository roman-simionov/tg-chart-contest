
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
    value(points) {
        const d = `M${points.join("L")}`;
        this.setAttributes({ d });
        return this;
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
