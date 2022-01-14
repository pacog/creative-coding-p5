import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { pieces } from 'utils/Pieces';
import styles from './style.module.css';

interface PieceLayoutProps {
    children: React.ReactNode;
    id: number;
}

export default function PieceLayout({ children, id }: PieceLayoutProps) {
    const title = pieces[id].title;
    const description = pieces[id].description;

    return (
        <>
            <Head>
                <title>{pieces[1].title}</title>
                <meta name="description" content={pieces[1].description}></meta>
            </Head>
            <div className={styles.Container}>
                <div className={styles.Header}>
                    <Link href="/">
                        <a className={styles.HeaderLink}>
                            <div className={styles.HeaderLinkIcon}>
                                <Image
                                    src="/icons/arrow_back_icon.svg"
                                    height={32}
                                    width={32}
                                />
                            </div>
                        </a>
                    </Link>
                    <div className={styles.HeaderText}>
                        <div className={styles.HeaderTitle}>{title}</div>
                        <div className={styles.HeaderDescription}>
                            {description}
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </>
    );
}
