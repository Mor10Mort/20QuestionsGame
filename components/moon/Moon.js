import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './Moon.module.css'; // Import the CSS module

const Moon = ({ question }) => {
    const [showQuestion, setShowQuestion] = useState(false);

    useEffect(() => {
        if (question) {
            setShowQuestion(false);
            // Wait for the fade-out animation to complete before updating the content
            const timeout1 = setTimeout(() => {
                setShowQuestion(true);
            }, 600);

            return () => clearTimeout(timeout1);
        }
    }, [question]);

    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative&display=swap" />
            </Head>
            <main className={styles.moon}>
                <div className={`${styles.moonTexture}`}></div>
                <div className={`${styles.moonShade} ${styles.moonShadeLeft}`}></div>
                <div className={`${showQuestion ? 'showQ' : ''}`}>
                    {showQuestion && (
                        <p className={styles.question}>
                            {question.content}
                        </p>
                    )}
                </div>
                <div className={`${styles.moonShade} ${styles.moonShadeRight}`}></div>
            </main>
        </>
    );
};

export default Moon;
