import Chart from "./chart";

fetch("./chart_data.json").then(data => data.json()).then(d => {
    const charts = d
       // .slice(0, 1)
        .map(settings => {
        const x = settings.columns.find(c => c[0] == "x").slice(1);
        const chart = new Chart(document.querySelector("body"), {
            x,
            series: Object.keys(settings.names)
                // .slice(0, 1)
                .map(s => {
                const name = settings.names[s];
                return {
                    name,
                    color: settings.colors[s],
                    type: settings.types[s],
                    x,
                    y: settings.columns.find(c => c[0] === s).slice(1)
                };
            })
        });

        return chart;
    });

    let timeout = null;
    window.onresize = function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            charts.forEach(c => {
                c.resize();
            });
        }, 30);
    };
});



