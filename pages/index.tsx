import React, { useState, useEffect } from 'react';
import CrystallBall from '../components/CrystallBall';
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinner from '../components/loading/LoadingSpinner';

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
    console.log('data', data);
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

  const gameController = async (answer) => {
    setIsLoading(true);

    try {
      let controller = 'playing';
      if (answer === 'correct') {
        controller = 'correct';
      }
      const response = await sendRequest(sessionId, controller, language, answer);
      if (response.step) {
        setMakingGuess(true);
      } else {
        setMakingGuess(false);
      }
      setResponse(response);
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
    <div>
      {!gameStarted && (
        <>
          <h2 className="text-center text-white">Choose language</h2>
          <div className="language-toggle">
            <button className="language-button" onClick={() => handleLanguageChange('english')}>
              English
            </button>
            <button className="language-button" onClick={() => handleLanguageChange('norwegian')}>
              Norwegian
            </button>
          </div>
        </>
      )}
      {gameStarted && (
        <main className="max-w-main mx-auto h-screen flex items-center justify-center flex-col">
          <section>
            <div className="flex flex-col items-center mt-3">
              {isLoading && <LoadingSpinner />}
              {!showSuccessMessage && (
                <div>
                  <CrystallBall question={question} />
                  <div className="overlay">
                    {!makingGuess ? (
                      <>
                        <button className="labelLeft label" onClick={() => gameController('yes')}>
                          &larr; YES
                        </button>
                        <button className="labelLeft label" onClick={() => gameController('maybe')}>
                          &larr; Maybe
                        </button>
                        <button className="labelRight label" onClick={() => gameController('no')}>
                          &rarr; NO
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="labelUp label" onClick={() => gameController('correct')}>
                          YOU GUESSED IT!
                        </button>
                        <button className="labelDown label" onClick={() => gameController('wrong')}>
                          NOOOOO!
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {showSuccessMessage && (
                <div className="flex flex-col items-center mt-3">
                  <p className="text-2xl mb-2">🧠 I KNEW IT 🧠</p>
                  <button onClick={() => { initializeGame(sessionId, language); setShowSuccessMessage(false); }} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                    Play Again
                  </button>
                </div>
              )}
              <div className="timeline">
                {[...Array(20)].map((_, index) => (
                  <div
                    key={index}
                    className={`timeline-dot ${index < questionNumber ? 'filled' : ''}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default Home;