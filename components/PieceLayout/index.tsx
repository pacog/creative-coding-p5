import Image from 'next/image';
import Link from 'next/link';
import styles from './style.module.css';

interface PieceLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function PieceLayout({
    children,
    title,
    description,
}: PieceLayoutProps) {
    return (
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
    );
}
