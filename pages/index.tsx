import React, { useState, useEffect } from 'react';
import Moon from '../components/moon/Moon';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../components/loading/LoadingSpinner';
import Head from 'next/head';
import Script from "next/script";

// Define the sendRequest function
async function sendRequest(sessionId, controller, language, answer = null) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        controller,
        answer,
        language,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

const Home: React.FC = () => {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [makingGuess, setMakingGuess] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [language, setLanguage] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const gameController = async (controller, answer) => {
    setIsLoading(true);
    //set heller at controller settes fra kanppene...playing, guess_correct, etc
    try {

      const response = await sendRequest(sessionId, controller, language, answer);
      if ((response.finalGuess == true) || (response.makingGuess == true)) {
        setMakingGuess(true);
      } else {
        setMakingGuess(false);
      }
      if (response.gameComplete == true) {
        setGameOver(true);
      } else {
        setGameOver(false);
      }
      setResponse(response);
      console.log(response);
      setQuestion(response);
      setIsLoading(false);
      setQuestionNumber((prevNumber) => prevNumber + 1);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const initializeGame = async (newSessionId, newLanguage) => {
    try {
      const startResponse = await sendRequest(newSessionId, 'start', newLanguage);
      setResponse(startResponse);
      setQuestion(startResponse);
      console.log(question);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Your code inside useEffect if needed
  }, []);

  const handleLanguageChange = (newLanguage) => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setLanguage(newLanguage);
    initializeGame(newSessionId, newLanguage);
    setGameStarted(true);
  };

  return (
    <>
      <Head>
        <title>The 20 Question Game with OpenAI</title>
      </Head>
      <div>
        <Script src="https://www.googletagmanager.com/gtag/js?id=GG-36J5Q6VZD7" />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-36J5Q6VZD7');
        `}
        </Script>
        {!gameStarted && (
          <div className='intro-container'>
            <h1 className='introTitle'>20 questions (game)</h1>
            <h2 className="introText">
              🧠 of something...<br />
              e.g. a squirrel, cake, airplane (keep it fairly general).<br />
              Open AI will attempt to guess it within 20 questions.
            </h2>
            <div className="language-toggle">
              <button className="language-button" onClick={() => handleLanguageChange('english')}>
                English <br />(seems to guess best in english)
              </button>
              <button className="language-button" onClick={() => handleLanguageChange('norwegian')}>
                Norwegian
              </button>
              <button className="language-button" onClick={() => handleLanguageChange('spanish')}>
                Spanish
              </button>
            </div>
          </div>
        )
        }
        {
          gameStarted && !gameOver && (
            <section>
              <div>
                <div className="timeline">
                  {[...Array(20)].map((_, index) => (
                    <div
                      key={index}
                      className={`timeline-dot ${index < questionNumber ? 'filled' : ''}`}
                      onClick={() => alert(`Index: ${index}`)}
                    >
                      {20 - index}
                    </div>
                  ))}
                </div>

                {isLoading && <LoadingSpinner />}
                {!showSuccessMessage && (
                  <div className='container'>
                    {!makingGuess ? (
                      <>
                        <div className="button-container">
                          <button className="label red" onClick={() => gameController('playing', 'no')}>
                            NO
                          </button>
                          <button className="label blue" onClick={() => gameController('playing', 'sometimes')}>
                            Sometimes
                          </button>
                          <button className="label green" onClick={() => gameController('playing', 'yes')}>
                            YES
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="button-container">
                        <button
                          className="label red"
                          onClick={() => {
                            gameController('respondToGuess', 'no');
                            // Track the event when the button is clicked
                            gtag('event', 'AI_guessed_wrong', {
                              event_category: 'Game Interaction',
                              event_label: 'Thats Not It Button',
                            });
                          }}
                        >
                          Thats not it!
                        </button>

                        <button
                          className="label green"
                          onClick={() => {
                            gameController('respondToGuess', 'yes');
                            // Track the event when the button is clicked
                            gtag('event', 'AI_guessed_correct', {
                              event_category: 'Game Interaction',
                              event_label: 'You Guessed It Button',
                            });
                          }}
                        >
                          YOU GUESSED IT!
                        </button>
                      </div>
                    )}
                    <Moon question={question} makingGuess={makingGuess} />
                  </div>
                )}
              </div>
            </section>

          )
        }
        {
          gameOver && (
            <section>
              <div className="resultOfGame">
                <p className='question'> {question.content}</p>
                <button onClick={() => {
                  initializeGame(sessionId, language);
                  setGameOver(false);
                  setShowSuccessMessage(false);
                  setQuestionNumber(1);
                  setQuestion({ content: "" });
                }} className="playAgain">
                  Play Again
                </button>
              </div>
            </section>
          )
        }
      </div >
    </>
  );
};

export default Home;