export default class Legend {

    /**
     *
     * @param {Element} element
     * @param {*} options
     */
    constructor(element, options, changed) {
        const div = document.createElement("div");
        div.classList.add("legend");
        this.div = div;
        element.appendChild(div);
        this.options = options;
        div.innerHTML = options.map((o, i) => {
            o.visible = o.visible === undefined ? true : false;
            return `<div class="legend-item">
                        <div class="svg-wrapper">
                            <svg class="checkmark" id="item-${i}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle class="circle-border" cx="26" cy="26" r="22" stroke="${o.stroke}"/>
                                <circle class="circle" cx="26" cy="26" r="22" fill="${o.stroke}"/>
                                <path class="check" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                        <div class="legend-label">
                            <span>${o.name}<span>
                        </div>
                    </div>`;
        }).join("");

        this.changed = changed;

        this.attachEvents();
    }

    attachEvents() {
        this.div.addEventListener("click", (event) => {
            const parentNode = event.target.parentNode;
            if (parentNode.classList.contains("checkmark")) {
                const id = parentNode.getAttribute("id").split("-")[1];
                const options = this.options[id];
                if (options.visible) {
                    parentNode.classList.remove("checking");
                    parentNode.classList.add("unchecking");
                } else {
                    parentNode.classList.remove("unchecking");
                    parentNode.classList.add("checking");
                }
                options.visible = !options.visible;
                this.changed();
            }
        });
    }
}
