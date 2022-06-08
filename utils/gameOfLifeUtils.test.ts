import { shouldNextCellBeAlive } from './gameOfLifeUtils';
import { createFromValues } from './Matrix';

describe('shouldNextCellBeAlive', () => {
    it('Any live cell with fewer than two live neighbours dies, as if by underpopulation.', () => {
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [false, false, false],
                    [false, true, false],
                    [false, false, false],
                ]),
                1,
                1
            )
        ).toBe(false);
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, false, false],
                    [false, true, false],
                    [false, false, false],
                ]),
                1,
                1
            )
        ).toBe(false);
    });
    it('Any live cell with two or three live neighbours lives on to the next generation.', () => {
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, false, true],
                    [false, true, false],
                    [false, false, false],
                ]),
                1,
                1
            )
        ).toBe(true);
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, false, true],
                    [false, true, false],
                    [false, false, true],
                ]),
                1,
                1
            )
        ).toBe(true);
    });
    it('Any live cell with more than three live neighbours dies, as if by overpopulation.', () => {
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, true, true],
                    [false, true, false],
                    [false, false, true],
                ]),
                1,
                1
            )
        ).toBe(false);
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, true, true],
                    [true, true, true],
                    [true, false, true],
                ]),
                1,
                1
            )
        ).toBe(false);
    });
    it('Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.', () => {
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, false, true],
                    [false, false, false],
                    [false, false, true],
                ]),
                1,
                1
            )
        ).toBe(true);
    });
    it('Any dead cell with other number of cells keeps being dead', () => {
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [false, false, true],
                    [false, false, false],
                    [false, false, true],
                ]),
                1,
                1
            )
        ).toBe(false);
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, true, true],
                    [false, false, false],
                    [false, false, true],
                ]),
                1,
                1
            )
        ).toBe(false);
        expect(
            shouldNextCellBeAlive(
                createFromValues([
                    [true, true, true],
                    [true, false, false],
                    [true, true, true],
                ]),
                1,
                1
            )
        ).toBe(false);
    });
});
