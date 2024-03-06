import type { StaticImageData } from 'next/image';

import preview1 from './previewPieces/1.png';
import preview2 from './previewPieces/2.png';
import preview3 from './previewPieces/3.png';
import preview4 from './previewPieces/4.png';
import preview5 from './previewPieces/5.png';
import preview6 from './previewPieces/6.png';
import preview7 from './previewPieces/7.png';
import preview8 from './previewPieces/8.png';
import preview9 from './previewPieces/9.png';

export interface IPiece {
    id: number;
    title: string;
    description: string;
    url: string;
    previewImg: StaticImageData;
}

export const piecesArray: IPiece[] = [
    {
        title: 'A bit squared',
        description: 'Playing around with particles and the loop.',
        url: '/pieces/1-a-bit-squared',
        previewImg: preview1,
    },
    {
        title: 'El Yin y el Ñam',
        description: 'Fractal recursive circles.',
        url: '/pieces/2-yin-y-nam',
        previewImg: preview2,
    },
    {
        title: 'On spirals',
        description: 'Spirals drawn using the Fibonacci sequence.',
        url: '/pieces/3-on-spirals',
        previewImg: preview3,
    },
    {
        title: 'Aproxigraphy',
        description: 'Aproximating a photo with shapes.',
        url: '/pieces/4-aproxigraphy',
        previewImg: preview4,
    },
    {
        title: 'Lines? Lines!',
        description: 'Playing with lines and palettes.',
        url: '/pieces/5-lines-lines',
        previewImg: preview5,
    },
    {
        title: 'Game of Life',
        description: "Yet another Conway's Game of Life.",
        url: '/pieces/6-game-of-life',
        previewImg: preview6,
    },
    {
        title: 'Spirofan',
        description: 'Spirograph in your browser.',
        url: '/pieces/7-spirofan',
        previewImg: preview7,
    },
    {
        title: 'Blanket',
        description: 'Experimenting with 3D and sines.',
        url: '/pieces/8-blanket',
        previewImg: preview8,
    },
    {
        title: 'Sand',
        description: 'Falling sand quick experiment.',
        url: '/pieces/9-sand',
        previewImg: preview9,
    },
    {
        title: 'Shady shaders',
        description: 'Learning shaders.',
        url: '/pieces/10-shaders',
        previewImg: preview9,
    },
].map((piece, index) => ({ ...piece, id: index + 1 }));

export const pieces: { [key: number]: IPiece } = piecesArray.reduce(
    (acc, piece) => {
        return {
            ...acc,
            [piece.id]: piece,
        };
    },
    {},
);
