export default class Legend {

    /**
     *
     * @param {Element} element
     * @param {*} options
     */
    constructor(element, options) {
        const div = document.createElement("div");
        div.classList.add("legend");
        element.appendChild(div);
        div.innerHTML = options.map(o => {
            o.visible = o.visible === undefined ? true : false;
            return `<div class="legend-item">
                        <div class="outer-circle" style="background-color: ${o.stroke}">
                            <div class="inner-circle"></div>
                        </div>
                        <span class="legend-label">${o.name}</span>
                    </div>`;
        }).join("");
    }
}
