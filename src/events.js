export const pointerStart = [];
export const pointerMove = [];
export const pointerUp = [];
export const longTap = [];

const events = {
    "mousedown": pointerStart,
    "touchstart": pointerStart,

    "mousemove": pointerMove,
    "touchmove": pointerMove,

    "mouseup": pointerUp,
    "touchend": pointerUp
};

Object.keys(events).forEach(k => {
    const handlers = events[k];
    document.addEventListener(k, (event) => {
        handlers.forEach((eventHandler) => {
            eventHandler(event);
        });
    }, { passive: handlers === pointerUp || handlers === pointerStart });
});

let timer = null;
const touchDuration = 250;

pointerStart.push((event) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        longTap.forEach((eventHandler) => {
            eventHandler(event);
        });
    }, touchDuration);
});

pointerUp.push(() => {
    if (timer) {
        clearTimeout(timer);
    }
});


export function getPageX(event) {
    return event.pageX === undefined ? event.touches[0].pageX : event.pageX;
}
