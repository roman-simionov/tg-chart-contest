import Chart from "./chart";

fetch("./chart_data.json").then(data => data.json()).then(d => {
    d.forEach(settings => {
        const x = settings.columns.find(c => c[0] == "x");
        new Chart(document.querySelector("body"), {
            series: Object.keys(settings.names).map(s => {
                const name = settings.names[s];

                return {
                    name,
                    stroke: settings.colors[s],
                    type: settings.types[s],
                    x,
                    y: settings.columns.find(c => c[0] === name)
                };
            })
        });
    });
});



