import Renderer from "./renderer";

const renderer = new Renderer(document.getElementById("test"));

const text = renderer.text().setAttributes({
    x: 10,
    y: 10
}).value("text");


renderer.svg.setAttributes({ width: 1000, height: 1000 });



text.renderTo(renderer.svg);

const path = renderer.path();
path.renderTo(renderer.svg);

path.value([[10, 10], [100, 100]]);

setTimeout(() => {

    path.value([[10, 10], [100, 100]].reverse(), true);
}, 1000);
