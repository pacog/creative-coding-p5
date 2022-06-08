import { Matrix, createFromValues } from './Matrix';

it('should allow creating matrix', () => {
    const m = new Matrix(2, 3, false);
    expect(m.getRaw()).toEqual([
        [false, false],
        [false, false],
        [false, false],
    ]);
    expect(m.size).toEqual({ width: 2, height: 3 });
});

it('should allow creating matrix from raw values', () => {
    const m = createFromValues([
        [1, 2],
        [3, 4],
        [5, 6],
    ]);
    expect(m.getRaw()).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
    ]);
    expect(m.size).toEqual({ width: 2, height: 3 });
});

it('should throw if no with or height', () => {
    expect(() => {
        new Matrix(0, 0, false);
    }).toThrow('Matrix should have size');
    expect(() => {
        new Matrix(0, 1, false);
    }).toThrow('Matrix should have size');
    expect(() => {
        new Matrix(1, 0, false);
    }).toThrow('Matrix should have size');
});

it('should allow creating matrix with other type', () => {
    const m = new Matrix(3, 2, 'a');
    expect(m.getRaw()).toEqual([
        ['a', 'a', 'a'],
        ['a', 'a', 'a'],
    ]);
    expect(m.size).toEqual({ width: 3, height: 2 });
});

it('should allow changing matrix values', () => {
    const m = new Matrix(3, 2, 1);
    expect(m.getRaw()).toEqual([
        [1, 1, 1],
        [1, 1, 1],
    ]);
    m.setVal(0, 1, 5);
    expect(m.getRaw()).toEqual([
        [1, 5, 1],
        [1, 1, 1],
    ]);
    expect(m.getVal(0, 0)).toBe(1);
    expect(m.getVal(0, 1)).toBe(5);
});

it('should throw when trying to set values out of matrix', () => {
    const m = new Matrix(3, 2, 1);
    expect(m.getRaw()).toEqual([
        [1, 1, 1],
        [1, 1, 1],
    ]);
    expect(() => {
        m.setVal(2, 1, 5);
    }).toThrow('Trying to set out of bounds');
    expect(() => {
        m.setVal(-1, 1, 5);
    }).toThrow('Trying to set out of bounds');
    expect(() => {
        m.setVal(0, 3, 5);
    }).toThrow('Trying to set out of bounds');
    expect(() => {
        m.setVal(0, -1, 5);
    }).toThrow('Trying to set out of bounds');
});

it('should throw when trying to get values out of matrix', () => {
    const m = new Matrix(3, 2, 1);
    expect(m.getRaw()).toEqual([
        [1, 1, 1],
        [1, 1, 1],
    ]);
    expect(() => {
        m.getVal(2, 1);
    }).toThrow('Trying to get out of bounds');
    expect(() => {
        m.getVal(-1, 5);
    }).toThrow('Trying to get out of bounds');
    expect(() => {
        m.getVal(0, 3);
    }).toThrow('Trying to get out of bounds');
    expect(() => {
        m.getVal(0, -1);
    }).toThrow('Trying to get out of bounds');
});

describe('getMatrixValueWrap', () => {
    const matrix = createFromValues([
        [0, 1, 2],
        [3, 4, 5],
    ]);
    it('should return normal values', () => {
        expect(matrix.getValWrapped(0, 0)).toBe(0);
        expect(matrix.getValWrapped(0, 1)).toBe(1);
        expect(matrix.getValWrapped(1, 0)).toBe(3);
    });
    it('should return positive wrapped values', () => {
        expect(matrix.getValWrapped(3, 1)).toBe(4);
        expect(matrix.getValWrapped(1, 3)).toBe(3);
        expect(matrix.getValWrapped(3, 3)).toBe(3);
    });
    it('should return negative wrapped values', () => {
        expect(matrix.getValWrapped(-1, 0)).toBe(3);
        expect(matrix.getValWrapped(0, -1)).toBe(2);
        expect(matrix.getValWrapped(-1, -1)).toBe(5);
    });
    it('should return high positive wrapped values', () => {
        expect(matrix.getValWrapped(23, 1)).toBe(4);
        expect(matrix.getValWrapped(1, 33)).toBe(3);
        expect(matrix.getValWrapped(23, 33)).toBe(3);
    });
    it('should return high negative wrapped values', () => {
        expect(matrix.getValWrapped(-21, 0)).toBe(3);
        expect(matrix.getValWrapped(0, -31)).toBe(2);
        expect(matrix.getValWrapped(-21, -31)).toBe(5);
    });
});

describe('insertrMatrix', () => {
    it('should insert without wrapping', () => {
        const matrix = createFromValues([
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
        ]);
        const matrix2 = createFromValues([
            [10, 11],
            [12, 13],
        ]);
        matrix.insertMatrix(matrix2, 0, 0);
        expect(matrix.getRaw()).toEqual([
            [10, 11, 2],
            [12, 13, 5],
            [6, 7, 8],
        ]);
    });
    it('should insert wrapping', () => {
        const matrix = createFromValues([
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
        ]);
        const matrix2 = createFromValues([
            [10, 11],
            [12, 13],
        ]);
        matrix.insertMatrix(matrix2, 2, 2);
        expect(matrix.getRaw()).toEqual([
            [13, 1, 12],
            [3, 4, 5],
            [11, 7, 10],
        ]);
    });
});
