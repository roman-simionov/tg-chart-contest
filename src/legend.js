import { pointerUp, longTap } from "./events";

function getItem(target, div) {
    if (target.closest(".legend") !== div) {
        return;
    }
    return target.closest(".legend-item");
}
export default class Legend {

    /**
     *
     * @param {Element} element
     * @param {*} options
     */
    constructor(element, options, changed) {
        const div = this.div = document.createElement("div");
        div.classList.add("legend");
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

        this.attachEvents(div);
    }

    /**
     *
     * @param {Element} div
     */
    attachEvents(div) {
        let lockPointerUp = false;
        pointerUp.push(({ target, type }) => {
            const item = getItem(target, div);
            if (lockPointerUp) {
                lockPointerUp = false;
                return;
            }
            if (('ontouchstart' in window || navigator.maxTouchPoints) && type === "mouseup"
            ) {
                return;
            }
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

        longTap.push(event => {
            const item = getItem(event.target, div);
            if (item) {
                lockPointerUp = true;
                event.preventDefault();
                event.stopPropagation();

                const items = div.querySelectorAll(".legend-item") || [];

                items.forEach((i) => {
                    const id = i.getAttribute("id").split("-")[1];
                    const checkMark = i.querySelector(".checkmark");
                    const options = this.options[id];
                    if (i === item) {
                        options.visible = true;
                        if (checkMark.classList.contains("unchecking")) {
                            checkMark.classList.add("checking");
                            checkMark.classList.remove("unchecking");
                        }
                    } else {
                        options.visible = false;
                        checkMark.classList.remove("checking");
                        checkMark.classList.add("unchecking");
                    }
                });
                this.changed();
            }
        });

    }
}
