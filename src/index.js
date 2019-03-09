import Renderer from "./renderer";

const renderer = new Renderer(document.getElementById("test"));

const text = renderer.text().setAttributes({
    x: 10,
    y: 10
}).value("text");

const path = renderer.path().value([[10, 10], [100, 100]]);

path.renderTo(renderer.svg);
text.renderTo(renderer.svg);
