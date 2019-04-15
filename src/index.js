import Chart from "./chart";
import d1 from "./data/1/overview.json";
import d2 from "./data/2/overview.json";
import d3 from "./data/3/overview.json";
import d4 from "./data/4/overview.json";
import d5 from "./data/5/overview.json";

window.changeTheme = function() {
    document.body.classList.toggle("dark");
};

const container = document.querySelector(".charts");
/**
 * @type {Chart[]}
 */
const charts = [d1, d2, d3, d4, d5].map((settings, index) => {
    const x = settings.columns.find(c => c[0] == "x").slice(1);
    const chart = new Chart(container, {
        x,
        title: `Chart#${index}`,
        y_scaled: settings.y_scaled,
        series: Object.keys(settings.names)
            .map((s) => {
                const name = settings.names[s];
                let typePrefix = "";
                if (settings.stacked) {
                    typePrefix = "stacked";
                }

                if (settings.percentage) {
                    typePrefix = "percentage";
                }
                return {
                    name,
                    color: settings.colors[s],
                    type: `${typePrefix}${settings.types[s]}`,
                    x,
                    y: settings.columns.find(c => c[0] === s).slice(1)
                };
            })
    });

    return chart;
});
container.appendChild(document.querySelector("#theme-switcher-placeholder"));
let timeout = null;

window.onresize = function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        charts.forEach(c => {
            c.resize();
        });
    }, 30);
};
