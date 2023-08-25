import React from 'react';
import styles from './LoadingSpinner.module.css'; // Import the CSS module

const LoadingSpinner = () => {
    return (
        <div className={styles['psychic-loading-spinner']}>
            <div className={styles['brain-icon']}>🧠</div>
        </div>
    );
};

export default LoadingSpinner;
