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
            return `<div class="legend-item" id="item-${i}">
                        <div class="svg-wrapper">
                            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle class="circle-border" cx="26" cy="26" r="22" stroke="${o.color}"/>
                                <circle class="circle" cx="26" cy="26" r="22" fill="${o.color}"/>
                                <path class="check" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                        <div class="legend-label">${o.name}</div>
                    </div>`;
        }).join("");

        this.changed = changed;

        this.attachEvents();
    }

    attachEvents() {
        this.div.addEventListener("click", (event) => {
            const item = event.target.closest(".legend-item");
            if (item) {
                const checkMark = item.querySelector(".checkmark");
                const id = item.getAttribute("id").split("-")[1];
                const options = this.options[id];
                if (options.visible) {
                    checkMark.classList.remove("checking");
                    checkMark.classList.add("unchecking");
                } else {
                    checkMark.classList.remove("unchecking");
                    checkMark.classList.add("checking");
                }
                options.visible = !options.visible;
                this.changed();
            }
        });
    }
}
