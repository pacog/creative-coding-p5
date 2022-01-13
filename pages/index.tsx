import Link from 'next/link';

export default function Index() {
    return (
        <div>
            <h1>Creative coding p5</h1>
            <ul>
                <li>
                    <Link href="/pieces/1-a-bit-squared">1. A bit squared</Link>
                </li>
                <li>
                    <Link href="/pieces/2-random-fractals">
                        2. Random fractals
                    </Link>
                </li>
            </ul>
        </div>
    );
}
