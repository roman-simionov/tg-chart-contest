export const pointerStart = [];
export const pointerMove = [];
export const pointerUp = [];

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
    }, { passive: handlers === pointerUp });
});


export function getPageX(event) {
    return event.pageX === undefined ? event.touches[0].pageX : event.pageX;
}
