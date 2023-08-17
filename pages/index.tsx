import React, { useState, useEffect } from 'react';
import Head from 'next/head';
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
        language
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
  const [questionNumber, setQuestionNumber] = useState(1); // Add question number state
  const [language, setLanguage] = useState(null); // Set initial language to null
  const [gameStarted, setGameStarted] = useState(false);

  const gameController = async (answer) => {
    setIsLoading(true);

    try {
      let controller = 'playing';
      if (answer === 'correct') {
        controller = 'correct';
        /* setShowSuccessMessage(true);*/
      }
      const response = await sendRequest(sessionId, controller, language, answer); // Pass sessionId
      if (response.step) {
        setMakingGuess(true);
      } else {
        setMakingGuess(false);
      }
      setResponse(response);
      setQuestion(response);
      setIsLoading(false);
      setQuestionNumber((prevNumber) => prevNumber + 1); // Increment question number

    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const initializeGame = async (shesID, language) => {
    console.log('languagehei', language);
    try {
      const startResponse = await sendRequest(shesID, 'start', language); // Pass sessionId
      setResponse(startResponse);
      setQuestion(startResponse);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {

  }, []);


  const handleLanguageChange = (newLanguage) => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setLanguage(newLanguage);
    initializeGame(newSessionId, newLanguage);

    setGameStarted(true); // Start the game once a language is selected
    // Generate a new sessionId and store it in the state

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
                    {!makingGuess && (
                      <>
                        <button className="labelLeft label" onClick={() => gameController('yes')}>
                          &larr; YES
                        </button>
                        <button className="labelRight label" onClick={() => gameController('no')}>
                          &rarr; NO
                        </button>
                      </>
                    )}
                    {makingGuess && (
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
                  <button onClick={() => { initializeGame(); setShowSuccessMessage(false); }} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                    Play Again
                  </button>
                </div>
              )}
              <div className="timeline">
                {/* Display the timeline here */}
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
