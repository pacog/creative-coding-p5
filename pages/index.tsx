import Link from 'next/link';
import Head from 'next/head';

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
                            1. A bit squared
                        </Link>
                    </li>
                    <li>
                        <Link href="/pieces/2-random-fractals">
                            2. Random fractals
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
}
