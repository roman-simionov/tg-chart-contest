import Chart from "./chart";

fetch("./chart_data.json").then(data => data.json()).then(d => {
    d.forEach(settings => {
        const x = settings.columns.find(c => c[0] == "x").slice(1);
        new Chart(document.querySelector("body"), {
            x,
            series: Object.keys(settings.names).map(s => {
                const name = settings.names[s];
                return {
                    name,
                    stroke: settings.colors[s],
                    type: settings.types[s],
                    x,
                    y: settings.columns.find(c => c[0] === s).slice(1)
                };
            })
        });
    });
});



