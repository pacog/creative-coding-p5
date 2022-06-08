import { Matrix } from './Matrix';

export function shouldNextCellBeAlive<T>(
    matrix: Matrix<T>,
    row: number,
    column: number
) {
    let liveCellsAround = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (j !== 0 || i !== 0) {
                if (matrix.getValWrapped(row + i, column + j)) {
                    liveCellsAround += 1;
                }
            }
        }
    }

    const liveCell = matrix.getValWrapped(row, column);
    if (liveCell) {
        // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        // Any live cell with two or three live neighbours lives on to the next generation.
        // Any live cell with more than three live neighbours dies, as if by overpopulation.
        if (liveCellsAround === 2 || liveCellsAround === 3) {
            return true;
        }
        return false;
    }

    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    if (liveCellsAround === 3) {
        return true;
    }
    return false;
}
