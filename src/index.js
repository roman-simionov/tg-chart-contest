import Chart from "./chart";

window.changeTheme = function() {
    document.body.classList.toggle("dark");
};

fetch("./chart_data.json").then(data => data.json()).then(d => {
    const container = document.querySelector(".charts");
    const charts = d
        .map(settings => {
            const x = settings.columns.find(c => c[0] == "x").slice(1);
            const chart = new Chart(container, {
                x,
                series: Object.keys(settings.names)
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



