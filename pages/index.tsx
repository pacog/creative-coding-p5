import Link from 'next/link';
import Head from 'next/head';
import { pieces } from 'utils/Pieces';
import styles from './index.module.css';

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
                    <ul>
                        <li>
                            <Link href="/pieces/1-a-bit-squared">
                                <a>1. {pieces[1].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/2-random-fractals">
                                <a>2. {pieces[2].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/3-spiraling">
                                <a>3. {pieces[3].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/4-aproxigraphy">
                                <a>4. {pieces[4].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/5-lines-lines">
                                <a>5. {pieces[5].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/6-game-of-life">
                                <a>6. {pieces[6].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/7-spirofan">
                                <a>7. {pieces[7].title}</a>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pieces/8-blanket">
                                <a>8. {pieces[8].title}</a>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
