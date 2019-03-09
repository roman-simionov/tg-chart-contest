/**
 *
 * @param {number[]} param0
 * @param {number[]} param1
 */
export function numericScale([d1, d2], [r1, r2]) {
    const range = r2 - r1;
    const domain = d2 - d1;
    return (v) => r1 + (d2 - v - d1) * (range / domain);
}

/**
 *
 * @param {Date} param0
 * @param {number[]} param1
 */
export function dateScale([d1, d2], [r1, r2]) {
    const range = r2 - r1;
    const domain = d2 - d1;

    const start = d1.getTime();
    return (v) => r1 + (v.getTime() - start) * (range / domain);
}
