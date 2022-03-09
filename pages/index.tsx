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
                </ul>
            </div>
        </>
    );
}
