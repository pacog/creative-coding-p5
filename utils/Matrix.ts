export class Matrix<T> {
    // We access m[row][column], same as m[x_horizontal][y_vertical], starts at 0
    private m: T[][];
    private width: number;
    private height: number;

    constructor(width: number, height: number, defaultValue: T) {
        if (!width || !height) {
            throw new Error('Matrix should have size');
        }
        const columns = [];
        for (let i = 0; i < height; i++) {
            columns.push(new Array(width).fill(defaultValue));
        }
        this.width = width;
        this.height = height;
        this.m = columns;
    }

    getRaw() {
        return this.m;
    }

    setVal(row: number, column: number, val: T) {
        if (
            row < 0 ||
            row >= this.height ||
            column < 0 ||
            column >= this.width
        ) {
            throw new Error('Trying to set out of bounds');
        }
        this.m[row][column] = val;
    }

    getVal(row: number, column: number) {
        if (
            row < 0 ||
            row >= this.height ||
            column < 0 ||
            column >= this.width
        ) {
            throw new Error('Trying to get out of bounds');
        }
        return this.m[row][column];
    }

    get size() {
        return { height: this.height, width: this.width };
    }

    /**
     * Gets the value of a pixel of a matrix. If the pixel is out of the bounds, it will wrap around
     * For instance in a 3 x 3 Matrix getMatrixValueWrap(-1, 0) will return matrix[2, 0]
     */
    getValWrapped(row: number, column: number) {
        let rowWithin = wrapValue(row, this.height);
        let columnWithin = wrapValue(column, this.width);
        return this.getVal(rowWithin, columnWithin);
    }

    insertMatrix(otherMatrix: Matrix<T>, destinyRow, destinyColumn) {
        for (let row = 0; row < otherMatrix.size.height; row++) {
            for (let column = 0; column < otherMatrix.size.width; column++) {
                let rowWithin = wrapValue(destinyRow + row, this.height);
                let columnWithin = wrapValue(
                    destinyColumn + column,
                    this.width
                );

                this.setVal(
                    rowWithin,
                    columnWithin,
                    otherMatrix.getVal(row, column)
                );
            }
        }
    }
}

export function createFromValues<T>(values: T[][]) {
    const matrix = new Matrix<T>(values[0].length, values.length, undefined);
    const { width, height } = matrix.size;
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            matrix.setVal(row, column, values[row][column]);
        }
    }
    return matrix;
}

function wrapValue(value: number, max: number) {
    let wrapped = value % max;
    if (wrapped < 0) {
        wrapped += max;
    }
    return wrapped;
}
