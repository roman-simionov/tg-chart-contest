import Chart from "./chart";

window.changeTheme = function() {
    document.body.classList.toggle("dark");
};

fetch("./data/5/overview.json").then(data => data.json()).then(d => {
    const container = document.querySelector(".charts");
    d = d instanceof Array ? d : [d];
    /**
     * @type {Chart[]}
     */
    const charts = d.map((settings, index) => {
            const x = settings.columns.find(c => c[0] == "x").slice(1);
            const chart = new Chart(container, {
                x,
                title: `Chart#${index}`,
                series: Object.keys(settings.names)
                    .map(s => {
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
});



