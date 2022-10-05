import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { sortBy } from 'lodash';
import { piecesArray, IPiece } from 'utils/Pieces';
import styles from './index.module.css';

const orderedPieces = sortBy(piecesArray, (piece) => -piece.id);

export default function Index() {
    return (
        <>
            <Head>
                <title>Creative coding with P5 - pacog</title>
            </Head>
            <div className={styles.root}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Creative coding experiments
                    </h1>
                    <p className={styles.intro}>
                        Made with <a href="https://p5js.org/">p5js</a> during
                        2022 by{' '}
                        <a href="https://pacog.github.io/portfolio/">pacog</a>.{' '}
                        <a href="https://github.com/pacog/creative-coding-p5">
                            See the code
                        </a>
                        .{' '}
                    </p>
                    <ul className={styles.piecesList}>
                        {orderedPieces.map((piece) => (
                            <li key={`${piece.id}__${piece.url}`}>
                                <PieceLink piece={piece} />
                            </li>
                        ))}
                    </ul>

                    <p className={styles.footer}>
                        <a href="https://pacog.github.io/portfolio/">pacog</a>{' '}
                        2022
                    </p>
                </div>
            </div>
        </>
    );
}

interface PieceLinkProps {
    piece: IPiece;
}

function PieceLink({ piece }: PieceLinkProps) {
    return (
        <Link href={piece.url}>
            <a className={styles.piece}>
                <div className={styles.pieceBG}>
                    <Image
                        layout="fill"
                        objectFit="cover"
                        src={piece.previewImg}
                        alt=""
                        priority={true}
                    />
                </div>

                <div className={styles.pieceText}>
                    <div className={styles.pieceTitle}>
                        [{piece.id}] {piece.title}
                    </div>
                    <div className={styles.pieceDescription}>
                        {piece.description}
                    </div>
                </div>
            </a>
        </Link>
    );
}
