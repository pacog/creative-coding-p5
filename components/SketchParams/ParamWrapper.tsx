import React from 'react';
import styles from './ParamWrapper.module.css';

export default function ParamWrapper({
    label,
    input,
    value,
}: {
    label: React.ReactNode;
    input: React.ReactNode;
    value: React.ReactNode;
}) {
    return (
        <div className={styles.Param}>
            <div className={styles.ParamLabel}>{label}</div>
            <div className={styles.ParamInput}>{input}</div>
            <div className={styles.ParamValue}>{value}</div>
        </div>
    );
}
