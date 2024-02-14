import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { pieces } from 'utils/Pieces';
import styles from './style.module.css';

interface PieceLayoutProps {
    children: React.ReactNode;
    id: number;
    tools?: React.ReactNode;
}

export default function PieceLayout({ children, id, tools }: PieceLayoutProps) {
    const title = pieces[id].title;
    const description = pieces[id].description;

    return (
        <>
            <Head>
                <title>{pieces[id].title}</title>
                <meta
                    name="description"
                    content={pieces[id].description}
                ></meta>
            </Head>
            <div className={styles.Container}>
                <div className={styles.Header}>
                    <div className={styles.HeaderNavigation}>
                        <Link href="/" className={styles.HeaderLink}>
                            <div className={styles.HeaderLinkIcon}>
                                <Image
                                    src="/icons/arrow_back_icon.svg"
                                    height={32}
                                    width={32}
                                    alt="Back"
                                />
                            </div>
                        </Link>
                        <div className={styles.HeaderText}>
                            <div className={styles.HeaderTitle}>{title}</div>
                            <div className={styles.HeaderDescription}>
                                {description}
                            </div>
                        </div>
                    </div>
                    º
                    {tools && <div className={styles.HeaderTools}>{tools}</div>}
                </div>
                {children}
            </div>
        </>
    );
}
