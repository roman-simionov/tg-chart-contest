import Renderer from "./renderer";
import Series from "./series";
import { numericScale, dateScale } from "./domain";

const renderer = new Renderer(document.getElementById("test"));

renderer.svg.setAttributes({ width: 500, height: 500 });

const data = new Array(100).fill(0).map((d, i) => new Date(i));

const series = new Series(data.map(d=>[d, Math.random() * 30]), {
    parent: renderer.svg,
    stroke: "red"
});

const series1 = new Series(data.map(d=>[d, Math.random() * 15]), {
    parent: renderer.svg,
    stroke: "blue"
});


const range = [0, Math.max.apply(null, [series, series1].map(s => s.getRange()))];
const valueDomain = numericScale(range, [0, 500]);
const dateDomain = dateScale([data[0], data[99]], [0, 500]);
series.render(valueDomain, dateDomain);
series1.render(valueDomain, dateDomain);

setTimeout(() => {
    const range = [0, Math.max.apply(null, [series1].map(s => s.getRange()))];
    const valueDomain = numericScale(range, [0, 500]);
    series.hide();
    series.render(valueDomain, dateDomain, true);
    series1.render(valueDomain, dateDomain, true);
}, 1000);


