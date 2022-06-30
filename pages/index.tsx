import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { sortBy } from 'lodash';
import { pieces } from 'utils/Pieces';
import styles from './index.module.css';

const piecesArray = Object.entries(pieces).map(([id, entry]) => ({
    ...entry,
    id,
}));

const orderedPieces = sortBy(piecesArray, (piece) => -parseInt(piece.id, 10));

export default function Index() {
    return (
        <>
            <Head>
                <title>Creative coding with P5 - pacog</title>
            </Head>
            <div className={styles.root}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        <span>Creative</span>
                        <span>Coding</span>
                        <span>p5js</span>
                    </h1>
                    <ul className={styles.piecesList}>
                        {orderedPieces.map((piece) => (
                            <li key={`${piece.id}__${piece.url}`}>
                                <Link href={piece.url}>
                                    <a className={styles.piece}>
                                        <div className={styles.pieceBG}>
                                            <Image
                                                layout="fill"
                                                src={piece.previewImg}
                                                alt=""
                                            />
                                        </div>

                                        <div className={styles.pieceNumber}>
                                            {piece.id}
                                        </div>

                                        <div className={styles.pieceTitle}>
                                            {piece.title}
                                        </div>
                                    </a>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
