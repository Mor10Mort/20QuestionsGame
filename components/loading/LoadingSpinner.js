import React from 'react';
import styles from './LoadingSpinner.module.css'; // Import the CSS module

const LoadingSpinner = () => {
    return (
        <div className={styles['loading-spinner']}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default LoadingSpinner;
