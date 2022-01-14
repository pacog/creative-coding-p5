/**
 * Returns a number that keeps n inside of some limits, but instead of clamping it will make it go round: for instance:
 * keepNumberInside(12, 0, 10) -> 2
 */
export function keepNumberInside(
    n: number,
    lowerLimit: number,
    upperLimit: number
) {
    const size = upperLimit - lowerLimit;
    let res = n;

    if (upperLimit <= lowerLimit) {
        throw new Error('lower limit is bigger than upper limit');
    }
    if (n > lowerLimit && n <= upperLimit) {
        return n;
    }
    while (res < lowerLimit) {
        res += size;
    }
    while (res > upperLimit) {
        res -= size;
    }
    return res;
}
