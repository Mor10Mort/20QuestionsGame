import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const CrystallBall = ({ question }) => {
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
        <div className="flex justify-center contBall">
            <Head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative&display=swap" />
            </Head>
            <div className="crystal-ball">
                <div className={`crystall-content ${showQuestion ? 'showQ' : ''}`}>
                    {showQuestion && (
                        <p className={'question'}>
                            {question.content}
                        </p>
                    )}
                </div>
            </div>
            <style jsx>{`
            .crystall-content {
    font-family: 'Cinzel Decorative', sans-serif;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

                .showQ {
                    opacity: 0; /* Start with zero opacity */
                    filter: blur(20px); /* Apply initial blur */
                    transform: scale(0.5); /* Start with a smaller size */
                    animation: fog-in 1s ease-in-out forwards;
                }

                @keyframes fog-in {
                    0% {
                        opacity: 0;
                        filter: blur(20px);
                        transform: scale(0.5);
                    }
                    100% {
                        opacity: 1;
                        filter: blur(0); /* Remove blur */
                        transform: scale(1);
                    }
                }

                .question {
                   color: white;
                text-shadow:0 0 0.5em rgb(255 0 52);
                font-size: 7vw;
                text-align:center;
                }
            `}</style>
        </div>
    );
};

export default CrystallBall;
