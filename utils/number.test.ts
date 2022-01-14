import { keepNumberInside } from './number';

describe('keepNumberInside', () => {
    it('should work in the happy path', () => {
        expect(keepNumberInside(2, 0, 5)).toBe(2);
        expect(keepNumberInside(0, 0, 5)).toBe(0);
        expect(keepNumberInside(5, 0, 5)).toBe(5);
        expect(keepNumberInside(7, 0, 5)).toBe(2);
        expect(keepNumberInside(12, 0, 5)).toBe(2);
        expect(keepNumberInside(-1, 0, 5)).toBe(4);
        expect(keepNumberInside(-6, 0, 5)).toBe(4);
    });
});
