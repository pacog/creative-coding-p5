import Link from 'next/link';
import Head from 'next/head';
import { pieces } from 'utils/Pieces';

export default function Index() {
    return (
        <>
            <Head>
                <title>Creative coding with P5</title>
            </Head>
            <div>
                <h1>Creative coding p5</h1>
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
                </ul>
            </div>
        </>
    );
}
